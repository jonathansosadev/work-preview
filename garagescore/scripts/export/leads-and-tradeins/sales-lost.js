const config = require('config');
const MongoClient = require('mongodb').MongoClient;
const DataTypes = require('../../../common/models/data/type/data-types');
const LeadTradeInTypes = require('../../../common/models/data/type/lead-trade-in-types');
const timeHelper = require('../../../common/lib/util/time-helper');
const moment = require('moment');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

/**
 * Check our sales and leads history to see if we have any leads related to a sale, where the lead and the sale are from a different garage
 * If:
 * - lead.info === sale.info (info can be email, customerId etc.)  => convertedSale
 * - sale.plate === lead.plate  => convertedTradeIn
 */

process.on('unhandledRejection', (error) => {
  console.error('unhandledRejection', error);
  process.exit();
});
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

// get every data with not converted leads
async function getLostLeads(db) {
  const leadsCursor = await db
    .collection('datas')
    .find(
      { 'lead.potentialSale': true },
      { customer: 1, vehicle: 1, lead: 1, 'service.frontDeskCustomerId': 1, garageId: 1 }
    );
  const leads = {};
  while (await leadsCursor.hasNext()) {
    const data = await leadsCursor.next();
    const id = data._id.toString();
    const garageId = data.garageId;
    const isTradeIn = (data.lead.tradeIn && data.lead.tradeIn === LeadTradeInTypes.YES) || false;
    if (!data.isConverted) {
      // false or empty
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
  }
  return leads;
}
// get garages infos
async function getGarages(db) {
  const garages = { name: {}, group: {} };
  const cursor = await db.collection('garages').find({});
  while (await cursor.hasNext()) {
    const garage = await cursor.next();
    const id = garage._id.toString();
    garages.name[id] = garage.publicDisplayName;
    garages.group[id] = garage.group || '-';
  }
  return garages;
}
async function findLostSales(db, leads, garages) {
  const availableLeads = Object.values(leads);
  const salesCursor = await db
    .collection('datas')
    .find(
      { $or: [{ type: DataTypes.NEW_VEHICLE_SALE }, { type: DataTypes.USED_VEHICLE_SALE }] },
      { type: 1, customer: 1, vehicle: 1, 'service.providedAt': 1, garageId: 1, shouldSurfaceInStatistics: 1 }
    );
  const addLost = (isLost, lead, sale, reason) => {
    const dateLead = moment(new Date(lead.time));
    const dateSale = moment(new Date(sale.time));
    console.log(`${isLost ? 'Oui' : 'Non'};${garages.name[lead.garageId]};${
      garages.group[lead.garageId]
    };${dateLead.format('DD/MM/YYYY')};\
${garages.name[sale.garageId]};${garages.group[sale.garageId]};${dateSale.format('DD/MM/YYYY')};\
${garages.group[lead.garageId] === garages.group[sale.garageId] ? 'Non' : 'Oui'};${
      1 + dateSale.diff(dateLead, 'days')
    };\
${process.env.APP_URL}/cockpit/contacts/?periodId=ALL_HISTORY&dataId=${lead.id};${
      process.env.APP_URL
    }/cockpit/contacts/?periodId=ALL_HISTORY&dataId=${sale.id}\
;${reason}`);
  };
  const plateAlreadySoldThisDay = {}; // avoid import problem when we have 2 sales the same day with the same plate
  const TWENTYFOUR_MONTHS = 1000 * 60 * 60 * 24 * 365 * 2;
  while (await salesCursor.hasNext()) {
    const data = await salesCursor.next();
    const garageId = data.garageId;
    const plate = (data.vehicle && data.vehicle.plate && data.vehicle.plate.value) || Math.random(100000);
    const plateAndDay = `${plate}-${timeHelper.dayNumber(new Date(data.service && data.service.providedAt))}`;
    if (
      !GaragesTest.hasValue(garageId) &&
      data.service &&
      data.service.providedAt &&
      data.shouldSurfaceInStatistics !== false &&
      !plateAlreadySoldThisDay[plateAndDay]
    ) {
      const sale = Object.assign(
        { id: data._id.toString(), type: data.type, garageId, time: data.service.providedAt.getTime() },
        personalData(data)
      );
      // lead => sale
      let i = availableLeads.length;
      while (i--) {
        const lead = availableLeads[i];
        const diff = sale.time - lead.time;
        if (diff > 0 && diff < TWENTYFOUR_MONTHS && lead.garageId !== sale.garageId) {
          if (lead.email && lead.email === sale.email) {
            addLost(true, lead, sale, 'même email');
            availableLeads.splice(i, 1);
            break;
          }
          if (lead.phone && lead.phone === sale.phone) {
            addLost(true, lead, sale, 'même téléphone');
            availableLeads.splice(i, 1);
            break;
          }
          if (lead.address && lead.address === sale.address) {
            addLost(true, lead, sale, 'même adresse');
            availableLeads.splice(i, 1);
            break;
          }
        }
        if (diff > 0 && diff < TWENTYFOUR_MONTHS && lead.garageId === sale.garageId) {
          if (lead.email && lead.email === sale.email) {
            addLost(false, lead, sale, 'même email');
            availableLeads.splice(i, 1);
            break;
          }
          if (lead.phone && lead.phone === sale.phone) {
            addLost(false, lead, sale, 'même téléphone');
            availableLeads.splice(i, 1);
            break;
          }
          if (lead.address && lead.address === sale.address) {
            addLost(false, lead, sale, 'même adresse');
            availableLeads.splice(i, 1);
            break;
          }
        }
      }
    }
  }
  return [];
}

(async () => {
  const db = await MongoClient.connect(config.get('mongo.uri').replace('::', ','));
  const garages = await getGarages(db);
  const leads = await getLostLeads(db);
  console.log(`${Object.keys(leads).length} leads not transformed`);
  console.log(
    'Vente perdue;Garage Lead;Groupe Lead;Date Lead;Garage Vente;Groupe Vente;Date Vente;Vente dans un autre groupe;Nombre de jours lead->vente;Enquête Lead;Enquête Vente;Croisement'
  ); // eslint-disable-line max-len
  await findLostSales(db, leads, garages);
  console.log('bye');
  process.exit();
})();
