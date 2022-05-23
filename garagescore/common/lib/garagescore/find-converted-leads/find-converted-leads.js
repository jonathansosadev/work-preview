/* eslint-disable no-restricted-syntax */
const ObjectId = require('mongodb').ObjectId;
const dataTypes = require('../../../models/data/type/data-types');
const leadTradInTypes = require('../../../models/data/type/lead-trade-in-types');
const SourceTypes = require('../../../models/data/type/source-types');
const timeHelper = require('../../util/time-helper');
const leadTypes = require('../../../models/data/type/lead-types');
const garageTypes = require('../../../models/garage.type');

const KpiPeriods = require('../kpi/KpiPeriods');
const KpiTypes = require('../../../models/kpi-type');
const KpiDictionary = require('../kpi/KpiDictionary');
const { GaragesTest } = require('../../../../frontend/utils/enumV2');
const { CLOSED_WITH_SALE } = require('../../../models/data/type/lead-ticket-status');
const { incrementKPIs, resetKpis, saveKPIs } = require('./manage-kpis');

/**
 * Check our sales and leads history to see if we have any leads related to a sale
 * If:
 * - lead.info === sale.info (info can be email, customerId etc.)  => convertedSale
 * - sale.plate === lead.plate  => convertedTradeIn
 */

function normFullName(text) {
  return text && text.split('').sort().join('').replace(/ /, '');
}
function normAddress(street, city) {
  if (!street) {
    return null;
  }
  const text = `${street} ${city || ''}`;
  return (
    text &&
    text
      .replace(/[-,]+/g, ' ')
      .toLowerCase()
      .replace('boulevard ', 'bd ')
      .replace('bld ', 'bd ')
      .replace('chemin ', 'ch ')
      .replace('avenue ', 'av ')
      .replace('avn ', 'av ')
      .replace('ave ', 'av ')
      .replace('route ', 'rte ')
  );
}

function personalData(data) {
  const fullName = normFullName(data.customer && data.customer.fullName && data.customer.fullName.value);
  let phone =
    data.customer &&
    data.customer.contact &&
    data.customer.contact.mobilePhone &&
    data.customer.contact.mobilePhone.value;
  if (phone) phone = phone.replace(/ /g, '');
  const email =
    data.customer && data.customer.contact && data.customer.contact.email && data.customer.contact.email.value;
  const address = normAddress(
    data.customer && data.customer.street && data.customer.street.value,
    data.customer && data.customer.city && data.customer.city.value
  );
  const customerId = data.service && data.service.frontDeskCustomerId;
  const plate = data.vehicle && data.vehicle.plate && data.vehicle.plate.value;
  return { fullName, phone, email, address, customerId, plate };
}

// get every data with leads
async function getLeads(app, dataId) {
  const leadsCursor = !dataId
    ? await app.models.Data.getMongoConnector().find(
        {
          'lead.potentialSale': true,
          'source.type': {
            $in: [
              SourceTypes.DATAFILE,
              SourceTypes.AGENT,
              SourceTypes.MANUAL_LEAD,
              ...SourceTypes.supportedCrossLeadsSources(),
            ],
          },
        },
        { customer: 1, vehicle: 1, lead: 1, 'service.frontDeskCustomerId': 1, garageId: 1, 'leadTicket.manager': 1 }
      )
    : await app.models.Data.getMongoConnector().find({ _id: ObjectId(dataId) });
  const leads = {};
  while (await leadsCursor.hasNext()) {
    const data = await leadsCursor.next();
    const id = data._id.toString();
    const garageId = data.garageId;
    const isTradeIn = (data.lead.tradeIn && data.lead.tradeIn === leadTradInTypes.YES) || false;
    try {
      leads[id] = Object.assign(
        { id: data._id.toString(), garageId, time: data.lead.reportedAt.getTime(), isTradeIn },
        personalData(data)
      );
    } catch (e) {
      console.error('Error on data:', data._id && data._id.toString());
      console.error(e);
    }
  }
  return leads;
}

async function getLead2sale(app, leads) {
  const availableLeadsPerGarageId = [];
  const availableTradeInsPerGarageId = [];
  Object.values(leads).forEach((lead) => {
    const id = lead.id;
    const garageId = lead.garageId;
    if (!availableLeadsPerGarageId[garageId]) {
      availableLeadsPerGarageId[garageId] = [];
    }
    availableLeadsPerGarageId[garageId].push(id);
    // if (lead.isTradeIn) {
    if (!availableTradeInsPerGarageId[garageId]) {
      availableTradeInsPerGarageId[garageId] = [];
    }
    availableTradeInsPerGarageId[garageId].push(id);
  });
  const salesCursor = await app.models.Data.getMongoConnector().find(
    { $or: [{ type: dataTypes.NEW_VEHICLE_SALE }, { type: dataTypes.USED_VEHICLE_SALE }] },
    { type: 1, customer: 1, vehicle: 1, 'service.providedAt': 1, garageId: 1, shouldSurfaceInStatistics: 1 }
  );
  const lead2sale = {};
  const tradeIn2sale = {};
  const saleTypes = {};
  const saleDates = {};
  const managerIds = {};
  const plateAlreadySoldThisDay = {}; // avoid import problem when we have 2 sales the same day with the same plate
  const TWENTYFOUR_MONTHS = 1000 * 60 * 60 * 24 * 365 * 2;
  while (await salesCursor.hasNext()) {
    const data = await salesCursor.next();
    const garageId = data.garageId;
    const plate = (data.vehicle && data.vehicle.plate && data.vehicle.plate.value) || Math.random(100000);
    const plateAndDay = `${plate}-${timeHelper.dayNumber(new Date(data.service && data.service.providedAt))}`;
    if (data.shouldSurfaceInStatistics !== false && plateAlreadySoldThisDay[plateAndDay]) {
      const date = data.service && data.service.providedAt;
      const customer = data.customer && data.customer.fullName && data.customer.fullName.value;
      console.log(
        `Duplicate plate ${plate} sold ${date}, please check garage ${data.garageId} - customer: ${customer}, data: ${data._id}`
      );
    }
    if (data.service && data.service.providedAt && !plateAlreadySoldThisDay[plateAndDay]) {
      if (availableLeadsPerGarageId[garageId]) {
        const sale = Object.assign(
          { id: data._id.toString(), type: data.type, garageId, time: data.service.providedAt.getTime() },
          personalData(data)
        );
        // lead => sale
        let converted = null;
        let convertedI = null;
        for (let i = 0; i < availableLeadsPerGarageId[garageId].length; i++) {
          const leadId = availableLeadsPerGarageId[garageId][i];
          const lead = leads[leadId];
          const diff = sale.time - lead.time;
          if (diff > 0 && diff < TWENTYFOUR_MONTHS) {
            if (lead.email && lead.email === sale.email) {
              converted = leadId;
              convertedI = i;
              break;
            }
            if (lead.phone && lead.phone === sale.phone) {
              converted = leadId;
              convertedI = i;
              break;
            }
            if (lead.customerId && lead.customerId === sale.customerId) {
              converted = leadId;
              convertedI = i;
              break;
            }
            if (lead.address && lead.address === sale.address) {
              converted = leadId;
              convertedI = i;
              break;
            }
          }
        }
        if (converted) {
          plateAlreadySoldThisDay[plateAndDay] = true;
          lead2sale[leads[converted].id] = sale.id;
          saleTypes[sale.id] = sale.type;
          availableLeadsPerGarageId[garageId].splice(convertedI, 1);
          saleDates[sale.id] = new Date(sale.time);
          managerIds[leads[converted].id] = leads[converted].leadTicket && leads[converted].leadTicket.manager;
        }

        // tradein => sale
        if (sale.type === dataTypes.USED_VEHICLE_SALE && availableTradeInsPerGarageId[garageId]) {
          let tradedIn = null;
          let tradedInI = null;
          for (let i = 0; i < availableTradeInsPerGarageId[garageId].length; i++) {
            const leadId = availableTradeInsPerGarageId[garageId][i];
            const lead = leads[leadId];
            const diff = sale.time - lead.time;
            if (diff > 0 && diff < TWENTYFOUR_MONTHS) {
              if (lead.plate && lead.plate === sale.plate) {
                tradedIn = leadId;
                tradedInI = i;
                break;
              }
            }
          }
          if (tradedIn) {
            plateAlreadySoldThisDay[plateAndDay] = true;
            tradeIn2sale[leads[tradedIn].id] = sale.id;
            saleDates[sale.id] = new Date(sale.time);
            managerIds[leads[tradedIn].id] = leads[tradedIn].leadTicket && leads[tradedIn].leadTicket.manager;
            availableTradeInsPerGarageId[garageId].splice(tradedInI, 1);
          }
        }
      }
    }
  }
  return [lead2sale, saleTypes, tradeIn2sale, saleDates, managerIds];
}

async function findConvertedLeads(options, callback, app, dataId) {
  const kpis = {
    byPeriod: {},
    byUser: {},
  };
  console.time('getLeads');
  const leads = await getLeads(app, dataId);
  console.timeEnd('getLeads');
  console.log(`${Object.keys(leads).length} leads`);
  console.time('getLead2sale');
  const [lead2sale, saleTypes, tradeIn2sale, saleDates, managerIds] = await getLead2sale(app, leads);
  console.timeEnd('getLead2sale');
  console.log(`${Object.keys(lead2sale).length} lead2sale`);

  console.time('reset KPIs');
  await resetKpis(app);
  console.timeEnd('reset KPIs');

  console.time('updateDB');
  // const bulk = db.collection('kpiByPeriod').initializeUnorderedBulkOp();
  const dataToUpdate = {};
  Object.keys(lead2sale).forEach((id) => {
    dataToUpdate[id] = {
      dataId: id,
      convertedSaleDataId: lead2sale[id],
      convertedSaleType: saleTypes[lead2sale[id]],
      convertedSaleManagerId: managerIds[lead2sale[id]],
    };
  });
  Object.keys(tradeIn2sale).forEach((id) => {
    dataToUpdate[id] = dataToUpdate[id] || {
      dataId: id,
    };
    dataToUpdate[id].convertedTradeInDataId = tradeIn2sale[id];
    dataToUpdate[id].convertedTradeInManagerId = managerIds[tradeIn2sale[id]];
  });

  // we are going to update various data of the same garages
  // we dont want to trigger, for each data update, a kpi refresh right now,
  // so we schedule the refresh in one hour
  const delayNextRefreshAt = new Date();
  delayNextRefreshAt.setHours(delayNextRefreshAt.getHours() + 1);
  const refreshKpi = {
    delayNextRefreshAt,
  };

  const conversions = Object.values(dataToUpdate);
  console.log(`${conversions.length} conversions found`);
  console.log(
    `With ${Object.keys(lead2sale).length} transformed leads and ${Object.keys(tradeIn2sale).length} tradeins`
  );
  let nt = 0;
  let saleFromLead = 0;
  let saleFromTradeIn = 0;
  for (let i = 0; i < conversions.length; i++) {
    const maintenance = conversions[i];
    const data = await app.models.Data.getMongoConnector().findOne({ _id: ObjectId(maintenance.dataId) }); // eslint-disable-line
    const lead = data.lead;
    let convertedSaleDataId = null;
    let convertedTradeInDataId = null;
    if (maintenance.convertedSaleDataId) {
      lead.isConverted = true;
      lead.isConvertedToSale = true;
      lead.convertedSaleDataId = maintenance.convertedSaleDataId;
      lead.convertedSaleType = maintenance.convertedSaleType;
      lead.convertedToSaleAt = saleDates[maintenance.convertedSaleDataId];
      convertedSaleDataId = maintenance.convertedSaleDataId;
    }
    if (maintenance.convertedTradeInDataId) {
      lead.isConverted = true;
      lead.isConvertedToTradeIn = true;
      lead.convertedTradeInDataId = maintenance.convertedTradeInDataId;
      lead.convertedToTradeInAt = saleDates[maintenance.convertedTradeInDataId];
      convertedTradeInDataId = maintenance.convertedTradeInDataId;
      if (!maintenance.convertedSaleDataId) {
        nt++;
      }
    }
    await app.models.Data.getMongoConnector().updateOne(
      { _id: ObjectId(maintenance.dataId) }, // eslint-disable-line
      {
        $set: {
          lead,
          updatedAt: new Date(),
          refreshKpi,
        },
      }
    );
    // update sales
    if (convertedSaleDataId) {
      saleFromLead++;
      const sale = await app.models.Data.getMongoConnector().findOne({ _id: ObjectId(convertedSaleDataId) }); // eslint-disable-line
      const conversion = sale.conversion || {};
      conversion.isConvertedFromLead = true;
      conversion.leadSourceProvidedAt = lead.reportedAt;
      conversion.leadSourceDataId = maintenance.dataId;
      conversion.leadSourceType = lead.type;
      conversion.leadSourceManagerId = sale.service && sale.service.frontDeskUserName; // data.leadTicket && data.leadTicket.manager;
      /*
      bulk.find({_id: ObjectId(convertedSaleDataId)}).updateOne({ $set: update });
      */
      await app.models.Data.getMongoConnector().updateOne(
        { _id: ObjectId(convertedSaleDataId) }, // eslint-disable-line
        {
          $set: {
            conversion,
            updatedAt: new Date(),
            refreshKpi,
          },
        }
      );
      // Here we increment KPIs
      incrementKPIs(kpis, sale, conversion, false);
    }
    if (convertedTradeInDataId) {
      saleFromTradeIn++;
      const sale = await app.models.Data.getMongoConnector().findOne({ _id: ObjectId(convertedTradeInDataId) }); // eslint-disable-line
      const conversion = sale.conversion || {};
      conversion.isConvertedFromTradeIn = true;
      conversion.tradeInSourceProvidedAt = lead.reportedAt;
      conversion.tradeInSourceDataId = maintenance.dataId;
      conversion.tradeInSourceType = leadTypes.INTERESTED;
      conversion.tradeInSourceManagerId = sale.service && sale.service.frontDeskUserName; // data.leadTicket && data.leadTicket.manager;
      /*
        bulk.find({_id: ObjectId(convertedSaleDataId)}).updateOne({ $set: update });
      */
      await app.models.Data.getMongoConnector().updateOne(
        { _id: ObjectId(convertedTradeInDataId) }, // eslint-disable-line
        {
          $set: {
            conversion,
            updatedAt: new Date(),
            refreshKpi,
          },
        }
      );
      // Here we increment KPIs
      incrementKPIs(kpis, sale, conversion, true);
    }
  }
  // bulk.execute();

  console.log(`${nt} tradeins without a converted sale`);
  console.log(`${saleFromLead} leads converted to sale`);
  console.log(`${saleFromTradeIn} leads converted to tradein`);

  console.timeEnd('updateDB');

  console.time('updateKpis');
  await saveKPIs(app, kpis.byPeriod, kpis.byUser);
  console.timeEnd('updateKpis');
  console.log('bye');
}

module.exports = {
  findConvertedLeads,
};
