/**

 */
const { decodePhone } = require('../lib/garagescore/cross-leads/util.js');
const { ObjectID } = require('mongodb');
const { dayNumber } = require('../lib/util/time-helper');
const { AutomationCampaignsEventsType, AutomationCampaignTargets } = require('../../frontend/utils/enumV2');
const AutomationCampaignsCampaignTypes = require('../models/automation-campaign.type');
const DataTypes = require('../models/data/type/data-types');
const LeadSaleTypes = require('../models/data/type/lead-sale-types');
const SourceTypes = require('../models/data/type/source-types');
const { FED, log } = require('../../common/lib/util/log');
const gsEmail = require('../lib/util/email');
const slackClient = require('../lib/slack/client');
const { concurrentpromiseAll } = require('../lib/util/concurrentpromiseAll');
const app = require('../../server/server');
const aws = require('aws-sdk');
const { isGarageScoreUserByEmail } = require('../lib/garagescore/custeed-users');

function getDeepFieldValue(srcObject, fieldName) {
  let result = srcObject;
  const fieldParts = fieldName.split('.');
  for (const fieldPart of fieldParts) {
    if (typeof result === 'undefined') {
      return '';
    }
    result = result[fieldPart];
  }
  return result;
}

const snakeToCamel = (value) => {
  return value.toLowerCase().replace(/([-_][a-z])/g, (group) => group.toUpperCase().replace('-', '').replace('_', ''));
};

const sendSlackMessage = async (message) => {
  const channel = process.env.APP_URL.includes('app.custeed.com') ? 'çavapastrop' : 'test';
  return new Promise((resolve, reject) => {
    slackClient.postMessage(
      {
        text: message,
        channel: `#${channel}`,
        username: 'Boby Automation',
      },
      (slackError) => {
        if (slackError) reject(slackError);
        resolve({ status: 'OK' });
      }
    );
  });
};

const _saveOnDatabase = async (
  dataId,
  validCustomers,
  garageId,
  email,
  phone,
  commonValues,
  valuesFindOnValidCustomers,
  motifs
) => {
  try {
    await app.models.DataToAddToCustomers.getMongoConnector().insertOne({
      _id: dataId,
      validCustomers: validCustomers.map((vc) => vc.id),
      garageId,
      email,
      phone,
      commonValues,
      valuesFindOnValidCustomers,
      motifs,
      isCsvCreated: false,
      createdAt: new Date(),
    });
  } catch (err) {
    // document already created
  }
};

const fuseCustomers = async (customers) => {
  customers = customers.sort((a, b) => a.createdAt - b.createdAt);
  const customerToBeSaved = customers[0];
  customers.shift();
  customerToBeSaved.fusedCustomerIds = customerToBeSaved.fusedCustomerIds || [];
  for (const customer of customers) {
    customerToBeSaved.garageId = customer.garageId || customerToBeSaved.garageId;
    customerToBeSaved.email = customer.email || customerToBeSaved.email || undefined;
    customerToBeSaved.phone = customer.phone || customerToBeSaved.phone || undefined;
    if (customer.unsubscribed) customerToBeSaved.unsubscribed = true;
    if (customer.email)
      customerToBeSaved.emailList = [...new Set([...customerToBeSaved.emailList, ...customer.emailList])];
    if (customer.phone)
      customerToBeSaved.phoneList = [...new Set([...customerToBeSaved.phoneList, ...customer.phoneList])];
    customerToBeSaved.fullName = customer.fullName || customerToBeSaved.fullName || undefined;
    customerToBeSaved.city = customer.city || customerToBeSaved.city || undefined;
    customerToBeSaved.plate = customer.plate || customerToBeSaved.plate || undefined;
    customerToBeSaved.dataIds = customer.dataIds
      ? [...new Set([...customerToBeSaved.dataIds, ...customer.dataIds])]
      : customerToBeSaved.dataIds;
    if (customer.history) {
      customerToBeSaved.history = customerToBeSaved.history
        ? [...new Set([...customerToBeSaved.history, ...customer.history])]
        : customer.history;
      customerToBeSaved.leads = customerToBeSaved.leads
        ? [...new Set([...customerToBeSaved.leads, ...customer.leads])]
        : customer.leads;
    }
    customerToBeSaved.fusedCustomerIds = customer.fusedCustomerIds
      ? [...new Set([...customerToBeSaved.fusedCustomerIds, ...customer.fusedCustomerIds])]
      : customerToBeSaved.fusedCustomerIds;
    customerToBeSaved.fusedCustomerIds.push(customer.getId());
  }
  return { customerToBeSaved, customersToDestroy: customers };
};

// count and display common values beewten customers
const commonValueOnValidCustomers = (email, phone, validCustomers) => {
  let countEmail = 0;
  let countPhone = 0;
  for (const customer of validCustomers) {
    if (email && customer.email === email) countEmail++;
    if (phone && customer.phone === phone) countPhone++;
  }
  return [
    { name: email, count: countEmail, isFind: countEmail > 0 },
    { name: phone, count: countPhone, isFind: countPhone > 0 },
  ];
};

module.exports = function CustomerDefinition(Customer) {
  Customer._CustomerCache = null; // eslint-disable-line no-param-reassign
  Customer.mongoFind = async (where, fields, skip, limit) => {
    const directMongoCustomer = Customer.getMongoConnector();
    return await directMongoCustomer
      .find(where, fields)
      .limit((!isNaN(limit) && limit) || 0)
      .skip(skip || 0)
      .toArray();
  };
  Customer.CROSSED_DELAY_APV = 45;
  Customer.CROSSED_DELAY_SALE = 365;
  // Always use this when searching a customer by Id, so you don't miss fused ones
  Customer.mongoFindByIds = async (ids, fields, skip, limit) => {
    const directMongoCustomer = Customer.getMongoConnector();
    return await directMongoCustomer
      .find({ $or: [{ _id: { $in: ids } }, { fusedCustomerIds: { $in: ids } }] }, fields)
      .limit((!isNaN(limit) && limit) || 0)
      .skip(skip || 0)
      .toArray();
  };
  Customer.unsubscribe = async (customerId) => {
    const searchCustomerId = new ObjectID(customerId.toString());
    const directMongoCustomer = Customer.getMongoConnector();
    return await directMongoCustomer.updateOne(
      { $or: [{ _id: searchCustomerId }, { fusedCustomerIds: searchCustomerId }] },
      { $set: { unsubscribed: true } }
    );
  };
  Customer.removeDatas = async (dataIds) => {
    const customerConnector = Customer.getMongoConnector();
    const dataConnector = app.models.Data.getMongoConnector();

    // First, we get all the customers we will modify with this operation
    const customersToModify = await customerConnector
      .find(
        {
          dataIds: { $in: dataIds.map((dId) => new ObjectID(dId.toString())) },
        },
        {
          projection: {
            _id: true,
            garageId: true,
            unsubscribed: true,
            dataIds: true,
            createdAt: true,
            hasReceivedGDPRContactAt: true,
            hasRecentlyBeenContacted: true,
          },
        }
      )
      .toArray();

    // Then we remove datas from each of them
    const bulkOperations = [];
    for (const customer of customersToModify) {
      // First, we clean its dataIds, removing the ones we have to remove
      customer.dataIds = customer.dataIds.filter((dId) => !dataIds.find((id) => id.toString() === dId.toString()));
      if (customer.dataIds.length > 0) {
        // Then we get all the datas from the customer dataIds
        const datas = await dataConnector.find({ _id: { $in: customer.dataIds } }).toArray();
        const addData = Customer.addData.bind(customer);
        for (const data of datas) {
          // And we process them one per one without consolidating or saving except if it's the last data we add
          await addData(data, { noConsolidate: true, noSave: true });
        }
        await Customer.consolidate(customer);
        bulkOperations.push({
          updateOne: {
            filter: {
              _id: customer._id,
            },
            update: {
              $set: {
                ...customer,
              },
            },
          },
        });
      } else {
        // Then we delete the now useless customer
        bulkOperations.push({
          deleteOne: {
            filter: {
              _id: customer._id,
            },
          },
        });
      }
    }
    if (bulkOperations.length) {
      await customerConnector.bulkWrite(bulkOperations);
    }
  };
  Customer.getCustomerQueryFieldsFromData = (data) => {
    // Testing data on required fields, abort pairing if data isn't exploitable
    let email = getDeepFieldValue(data, 'customer.contact.email.value') || undefined;
    if (getDeepFieldValue(data, 'customer.contact.email.isNC')) email = undefined;
    if (!gsEmail.regexp.test(email) || (/null/i.test(email) && isGarageScoreUserByEmail(email))) email = undefined;
    let phone = getDeepFieldValue(data, 'customer.contact.mobilePhone.value');
    try {
      phone = decodePhone(phone) ? decodePhone(phone) : undefined;
    } catch (e) {
      phone = undefined;
    }
    const shouldBeIgnored = !email && !phone;
    return { email, phone, shouldBeIgnored };
  };
  // save errors file on S3
  Customer.createCsvReport = async () => {
    const dataToAddToCustomersMongo = app.models.DataToAddToCustomers.getMongoConnector();
    const csvFileName = `rapport_${new Date().getTime()}.csv`;
    const errors = await dataToAddToCustomersMongo.find({ isCsvCreated: false }).toArray();
    aws.config.region = 'eu-central-1';
    const awsS3Bucket = new aws.S3({ params: { Bucket: 'humanupload' } });
    await new Promise((res) => awsS3Bucket.createBucket(() => res()));
    let csv =
      'garageId;dataId;customersImpliquésDansLaFusion;email;phone;valeursChoisiPourLeAddData;motifs;valeurs en commun avec le customer;phoneList;emailList;dataIds\n';
    const promises = [];
    for (const error of errors) {
      let commonValues = '';
      const valuesFindOnValidCustomers =
        error && error.valuesFindOnValidCustomers ? error.valuesFindOnValidCustomers.join(', ') : '';
      if (error && error.commonValues) {
        commonValues = error.commonValues
          .filter(({ count }) => count > 1)
          .map((cv) => `${cv.name}: ${cv.count}`)
          .join(', ');
      }
      const motifs = error.motifs
        .filter(({ valid }) => valid)
        .map((m) => `${m.name}: ${m.count}`)
        .join(', ');
      const [phoneList] = error.motifs.filter((m) => m.name === 'phoneList').map((m) => `${m.name}: ${m.count}`);
      const [emailList] = error.motifs.filter((m) => m.name === 'emailList').map((m) => `${m.name}: ${m.count}`);
      const [dataIds] = error.motifs.filter((m) => m.name === 'dataIds').map((m) => `${m.name}: ${m.count}`);
      for (const customerId of error.validCustomers) {
        csv += `${error.garageId};${error._id};${customerId};${error.email};${error.phone};${valuesFindOnValidCustomers};${motifs};${commonValues};${phoneList};${emailList};${dataIds}\n`;
      }
      // set document isCsvCreated = true
      promises.push(() => {
        app.models.DataToAddToCustomers.getMongoConnector().updateOne(
          { _id: ObjectID(error._id.toString()) },
          { $set: { isCsvCreated: true } }
        );
      });
    }
    await concurrentpromiseAll(promises, 500);
    const uploadParameters = {
      Key: `addData/${csvFileName}`,
      ACL: 'private',
      ContentType: 'text/txt',
      Body: csv,
    };
    await new Promise((res, rej) => awsS3Bucket.upload(uploadParameters, (e) => (e ? rej(e) : res())));
    // send slack notification
    if (errors.length) {
      const message = `Clients finaux : Ajout des datas aux Clients finaux : Nb datas non-importés dans les clients finaux : ${errors.length}, rapport disponible sur S3 /humanupload/addData/${csvFileName}`;
      await sendSlackMessage(message);
    }
  };

  Customer.addData = async function addData(data, { noConsolidate, noSave } = {}) {
    if (data.shouldSurfaceInStatistics || (data.campaign && data.campaign.automationOnly)) {
      // First we get the informations from the data that we want to parse in the customer
      const { email, phone, shouldBeIgnored } = Customer.getCustomerQueryFieldsFromData(data);
      // If the data has no informations to link it with a customer, we ignore it
      if (!shouldBeIgnored) {
        const customerHistoryTypeField = `${data.type || 'ALL'}`;
        const dataId = data._id || data.getId();
        let customer = new Customer();
        // If this is a dataModification, we need to get the current customer associated to it. Either from the server or from the caller.
        let validCustomers =
          this && (this._id || this.id) ? [this] : await Customer.find({ where: { dataIds: dataId } });
        let customersToDestroy = [];
        // if the customer doesn't exist / is not given, we need to create/find it
        if (!validCustomers.length) {
          const where = { or: [] };
          if (email) where.or.push({ emailList: email });
          if (phone) where.or.push({ phoneList: phone });
          where.garageId = new ObjectID(data.garageId);
          validCustomers = await Customer.find({ where });
        }
        // If many customers are found, we need to fuse them, they are the same customer and the new data links them.
        if (validCustomers.length > 1) {
          const fuseResult = await fuseCustomers(validCustomers);
          // We destroy the now useless customers, those that are not the product of the fusion
          customersToDestroy = fuseResult.customersToDestroy;
          customer = fuseResult.customerToBeSaved;
        } else if (validCustomers.length === 1) {
          customer = validCustomers[0];
        }
        // Time to add informations to the customer. The new data put his informations on top of the customer.
        customer.emailList = customer.emailList || [];
        customer.phoneList = customer.phoneList || [];
        customer.unsubscribed = !!customer.unsubscribed;
        customer.garageId = customer.garageId || new ObjectID(data.garageId);
        customer.email = email || customer.email || undefined;
        customer.phone = phone || customer.phone || undefined;
        if (customer.email) customer.emailList = [...new Set([...customer.emailList, customer.email])];
        if (customer.phone) customer.phoneList = [...new Set([...customer.phoneList, customer.phone])];
        customer.fullName = getDeepFieldValue(data, 'customer.fullName.value') || customer.fullName || undefined;
        customer.city = getDeepFieldValue(data, 'customer.city.value') || customer.city || undefined;
        customer.gender = getDeepFieldValue(data, 'customer.gender.value') || customer.gender || undefined;
        customer.plate = getDeepFieldValue(data, 'vehicle.plate.value') || customer.plate || undefined;
        customer.history = customer.history || [];
        customer.leads = customer.leads || [];
        customer.dataIds = customer.dataIds || [];
        if (customer.phoneList.length > 5 || customer.emailList.length > 5 || customer.dataIds.length > 1500) {
          const commonValues = commonValueOnValidCustomers(email, phone, validCustomers);
          const valuesFindOnValidCustomers = commonValues.filter(({ isFind }) => isFind).map((cv) => cv.name);
          const motifs = [
            { name: 'phoneList', count: customer.phoneList.length, valid: customer.phoneList.length > 5 },
            { name: 'emailList', count: customer.emailList.length, valid: customer.emailList.length > 5 },
            { name: 'dataIds', count: customer.dataIds.length, valid: customer.dataIds.length > 1500 },
          ].filter((m) => m);
          await _saveOnDatabase(
            dataId,
            validCustomers,
            customer.garageId,
            email,
            phone,
            commonValues,
            valuesFindOnValidCustomers,
            motifs
          );
          return;
        }
        // If the data has a service providedAt, we want to register some more informations for quick access
        const isFindInDatas = customer.dataIds.find((e) => e.toString() === dataId.toString());
        const isFindInHistory = customer.history.find((h) => h.dataId.toString() === dataId.toString());
        if (!isFindInDatas || !isFindInHistory) {
          customer.dataIds.push(new ObjectID(dataId.toString()));
          customer.dataIds = [...new Set(customer.dataIds.map((d) => d.toString()))].map((d) => ObjectID(d));
          if (getDeepFieldValue(data, 'service.providedAt')) {
            customer.history.push({
              serviceProvidedAt: getDeepFieldValue(data, 'service.providedAt'),
              dataId: new ObjectID(dataId.toString()),
              plate: getDeepFieldValue(data, 'vehicle.plate.value'),
              serviceType: customerHistoryTypeField,
            });
            customer.history.sort(
              (a, b) => new Date(a.serviceProvidedAt).getTime() - new Date(b.serviceProvidedAt).getTime()
            );
          }
        }
        // If the data has a lead ticket, we get some infos here too
        if (
          data.leadTicket &&
          !customer.leads.find((e) => e.dataId.toString() === new ObjectID(dataId.toString()).toString())
        ) {
          const ticket = data.leadTicket;
          customer.leads.push({
            leadType: ticket.saleType || LeadSaleTypes.NEW_VEHICLE_SALE,
            declaredAt: getDeepFieldValue(data, 'lead.reportedAt') || ticket.createdAt || null,
            source: getDeepFieldValue(data, 'source.type') || SourceTypes.DATAFILE,
            dataId: new ObjectID(dataId.toString()),
            plate: getDeepFieldValue(data, 'vehicle.plate.value'),
          });
          customer.leads.sort((a, b) => new Date(a.declaredAt).getTime() - new Date(b.declaredAt).getTime());
        }
        if (!noConsolidate) {
          await Customer.consolidate(customer);
        }
        if (!noSave) {
          customer.createdAt = customer.createdAt || new Date();
          await customer.save();
        }
        // Destruction of the now useless customers found above
        for (const c of customersToDestroy) {
          await c.destroy();
        }
      }
    }
  };
  Customer.prototype.addData = Customer.addData.bind(this);
  Customer.resetPressure = async (campaignType, customerId) => {
    const key = `hasRecentlyBeenContacted.${campaignType}`;
    await Customer.findByIdAndUpdateAttributes(customerId, { [key]: false });
  };
  Customer.setCampaignStatusInIndex = (customer, events) => {
    if (!customer.index) {
      customer.index = [];
    }
    const eventsSort = events.sort((a, b) => a.eventDay - b.eventDay);
    // insert in index object like { k="lastLeadAt", v=18789 }
    eventsSort.forEach(({ type, eventDay }) => {
      if (type === AutomationCampaignsEventsType.LEAD) {
        customer.index.push({ k: 'lastLeadAt', v: eventDay });
      }
      if (type === AutomationCampaignsEventsType.CONVERTED) {
        customer.index.push({ k: 'lastConvertedAt', v: eventDay });
      }
    });
  };
  Customer.setConsolidatedCustomerInformationsInIndex = (customer) => {
    let lastNewVehicleSaleAt = null;
    let lastUsedVehicleSaleAt = null;
    let lastVehicleSaleAt = null;
    let lastMaintenanceAt = null;

    customer.index = [];
    customer.index.push({ k: 'garageId', v: customer.garageId });
    if (customer.email) customer.index.push({ k: 'email', v: customer.email });
    if (customer.email) customer.index.push({ k: 'hasEmail', v: true });
    if (customer.phone) customer.index.push({ k: 'phone', v: customer.phone });
    if (customer.phone) customer.index.push({ k: 'hasPhone', v: true });
    if (customer.fullName) customer.index.push({ k: 'fullName', v: customer.fullName });
    if (customer.history) {
      customer.history.forEach((e) => {
        const d = e.serviceProvidedAt;
        if (e.serviceType === 'Maintenance') {
          if (!lastMaintenanceAt || lastMaintenanceAt < d) {
            lastMaintenanceAt = d;
          }
        }
        if (e.serviceType === 'UsedVehicleSale') {
          if (!lastUsedVehicleSaleAt || lastUsedVehicleSaleAt < d) {
            lastUsedVehicleSaleAt = d;
          }
        }
        if (e.serviceType === 'NewVehicleSale') {
          if (!lastNewVehicleSaleAt || lastNewVehicleSaleAt < d) {
            lastNewVehicleSaleAt = d;
          }
        }
      });
      lastVehicleSaleAt = lastNewVehicleSaleAt || lastUsedVehicleSaleAt;
      if (lastNewVehicleSaleAt && lastNewVehicleSaleAt < lastUsedVehicleSaleAt) {
        lastVehicleSaleAt = lastUsedVehicleSaleAt;
      }
      if (lastMaintenanceAt) {
        customer.index.push({ k: 'lastMaintenanceAt', v: lastMaintenanceAt });
      }
      if (lastNewVehicleSaleAt) {
        customer.index.push({ k: 'lastNewVehicleSaleAt', v: lastNewVehicleSaleAt });
        if (!lastMaintenanceAt || lastNewVehicleSaleAt > lastMaintenanceAt) {
          customer.index.push({ k: 'noMaintenanceSinceNewVehicleSale', v: true });
        }
      }
      if (lastUsedVehicleSaleAt) {
        customer.index.push({ k: 'lastUsedVehicleSaleAt', v: lastUsedVehicleSaleAt });
        if (!lastMaintenanceAt || lastUsedVehicleSaleAt > lastMaintenanceAt) {
          customer.index.push({ k: 'noMaintenanceSinceUsedVehicleSale', v: true });
        }
      }
      if (lastVehicleSaleAt) {
        customer.index.push({ k: 'lastVehicleSaleAt', v: lastVehicleSaleAt });
        if (!lastMaintenanceAt || lastVehicleSaleAt > lastMaintenanceAt) {
          customer.index.push({ k: 'noMaintenanceSinceVehicleSale', v: true });
        }
      }
    }
    if (customer.dataIds) {
      customer.dataIds.forEach((d) => {
        customer.index.push({ k: `d${d.toString()}`, v: true });
      });
    }
    // remove duplicate object
    customer.index = customer.index.filter(function ({ k, v }) {
      const key = `${k}_${v}`;
      return !this.has(key) && this.add(key);
    }, new Set());
  };
  Customer.getFormattedAutomationCampaignsEventsForConsolidation = async ({ customerId, garageId }) => {
    const aceConnector = app.models.AutomationCampaignsEvents.getMongoConnector();
    const $match = {};
    let $unset = [];
    let samples = null;
    if (customerId) {
      $match['samples.customerId'] = customerId;
      $unset = ['samples', 'customerId'];
      samples = {
        $filter: {
          input: '$samples',
          as: 'sample',
          cond: { $eq: ['$$sample.customerId', customerId] },
        },
      };
    } else if (garageId) {
      $match.garageId = garageId;
      $unset = ['samples'];
      samples = 1;
    } else {
      // It means we just created the customer with an addData, he has not been yet saved and so we don't have to worry about the events
      return [];
    }
    // We get all events linked to the customer
    return aceConnector
      .aggregate([
        {
          $match,
        },
        {
          $project: {
            campaignId: 1,
            campaignType: 1,
            eventDay: 1,
            campaignRunDay: 1,
            type: 1,
            garageId: 1,
            target: 1,
            customContentId: 1,
            samples,
          },
        },
        {
          $unwind: { path: '$samples' },
        },
        {
          $replaceRoot: { newRoot: { $mergeObjects: ['$$ROOT', '$samples'] } },
        },
        {
          $unset,
        },
      ])
      .toArray();
  };

  Customer.setConsolidatedEventsDelays = (info, startingPointEventType) => {
    const setSingleValue = (info, valueA, valueB) => {
      if (Number.isInteger(info[valueA]) && Number.isInteger(info[valueB])) {
        // We capitalize the first letter of the second value, in case snakeToCamel has been used to make it
        const capitalize = (str) => `${str[0].toUpperCase()}${str.slice(1)}`;
        info[`${valueA}To${capitalize(valueB)}`] = info[valueB] - info[valueA];
      }
    };
    setSingleValue(info, `${snakeToCamel(startingPointEventType)}Day`, 'billingDay');
  };

  Customer.consolidateAndUpdate = async (customer) => {
    const customerConnector = app.models.Customer.getMongoConnector();
    const { modifications } = await Customer.consolidate(customer);
    await customerConnector.updateOne(
      { _id: customer._id || customer.getId() },
      {
        $set: modifications,
      }
    );
  };

  Customer.consolidate = async (customer, preloadedEvents) => {
    /*
     First, we set the indexes, which are just reconsolidated informations from the customer itself
     */
    Customer.setConsolidatedCustomerInformationsInIndex(customer);

    /*
     Then, we aggregate the customer's events and campaign datas
     */

    const eventsPerCampaigns = {};
    const campaignTypes = {};
    const consolidatedCampaignsInformation = [];
    const usedDatas = {};

    // Gathering the events of the customer
    const events =
      preloadedEvents ||
      (customer.history
        ? await Customer.getFormattedAutomationCampaignsEventsForConsolidation({
            customerId: customer._id || customer.getId(),
          })
        : []);

    // We regroup the events following their duo campaignId/campaignRunDay
    events.forEach((e) => {
      if (!eventsPerCampaigns[`${e.campaignId.toString()}+${e.campaignRunDay}`])
        eventsPerCampaigns[`${e.campaignId.toString()}+${e.campaignRunDay}`] = [];
      eventsPerCampaigns[`${e.campaignId.toString()}+${e.campaignRunDay}`].push(e);
      campaignTypes[e.campaignId.toString()] = e.campaignType;
    });
    const campaignsOccurences = Object.keys(eventsPerCampaigns);

    // We sort the regrouped events by their open eventDay, from the oldest to the youngest, to get the older campaigns first
    campaignsOccurences.sort((c1, c2) => {
      let openc1 = eventsPerCampaigns[c1].find(
        (ev) => ev.type === AutomationCampaignsEventsType.OPENED && ev.campaignType.indexOf('AUTOMATION') === 0
      );
      openc1 = openc1 ? openc1.eventDay : -1;
      let openc2 = eventsPerCampaigns[c2].find(
        (ev) => ev.type === AutomationCampaignsEventsType.OPENED && ev.campaignType.indexOf('AUTOMATION') === 0
      );
      openc2 = openc2 ? openc2.eventDay : -1;
      return openc2 - openc1;
    });

    // Since we want to keep informations about crossing we did in the past, we block datas that have already created a cross before
    if (customer.automationCampaigns) {
      customer.automationCampaigns.forEach((campaignData) => {
        if (campaignData.billingDataId && campaignData.crossed) {
          usedDatas[campaignData.billingDataId.toString()] = true;
        }
      });
    }

    // We consolidate the informations for each group campaignRunDay/campaignId
    campaignsOccurences.map((campaignOccurence) => {
      const occurenceEvents = eventsPerCampaigns[campaignOccurence];
      const info = {
        campaignId: occurenceEvents[0].campaignId,
        campaignType: campaignTypes[occurenceEvents[0].campaignId.toString()],
        campaignRunDay: occurenceEvents[0].campaignRunDay,
        garageId: occurenceEvents[0].garageId,
        isMobile: !!occurenceEvents[0].isMobile,
        target: occurenceEvents[0].target,
        customContentId: occurenceEvents[0].customContentId,
      };
      // We store each event and its eventDay
      for (const event of occurenceEvents) {
        info[`${snakeToCamel(event.type)}Day`] = parseInt(event.eventDay);
      }

      // We search for a crossing, if it has not been found earlier
      const crossedAlreadyFound =
        customer.automationCampaigns &&
        customer.automationCampaigns.find(
          (campaignData) =>
            campaignData.campaignRunDay === info.campaignRunDay &&
            campaignData.campaignId.toString() === info.campaignId.toString() &&
            campaignData.crossed
        );

      // Since we cross with the open event for maintenance and lead event for sales, we need to have it to be able to cross
      const startingPointEventType =
        info.campaignType === AutomationCampaignsCampaignTypes.AUTOMATION_MAINTENANCE
          ? AutomationCampaignsEventsType.OPENED
          : AutomationCampaignsEventsType.LEAD;
      const startingPointEvent =
        occurenceEvents &&
        occurenceEvents.find((ev) => ev.type === startingPointEventType && ev.campaignRunDay === info.campaignRunDay);

      if (crossedAlreadyFound) {
        info.billingDay = crossedAlreadyFound.billingDay;
        info.billingDataId = crossedAlreadyFound.billingDataId;
        info.crossed = crossedAlreadyFound.crossed;
      } else if (startingPointEvent) {
        const { campaignType } = startingPointEvent;
        // We reverse the history to cross from the most recent data to the oldest
        if (customer.history) {
          [...customer.history].reverse().forEach((h) => {
            // If we havent found a crossing already, if the data isn't blocked,
            // if the campaign type fits with the data type and if the lead happened before the data and with the delay limit we give,
            // we consider it as a potential cross
            const campaignTypeShort =
              campaignType === AutomationCampaignsCampaignTypes.AUTOMATION_MAINTENANCE ? 'APV' : 'SALE';
            const serviceTypeShort = h.serviceType === DataTypes.MAINTENANCE ? 'APV' : 'SALE';
            if (
              !info.billingDay &&
              !usedDatas[h.dataId.toString()] &&
              campaignTypeShort === serviceTypeShort &&
              dayNumber(h.serviceProvidedAt) - info[`${snakeToCamel(startingPointEventType)}Day`] >= 0 &&
              dayNumber(h.serviceProvidedAt) - info[`${snakeToCamel(startingPointEventType)}Day`] <=
                (campaignTypeShort === 'APV' ? Customer.CROSSED_DELAY_APV : Customer.CROSSED_DELAY_SALE)
            ) {
              info.billingDay = dayNumber(h.serviceProvidedAt);
              info.billingDataId = h.dataId;
              usedDatas[h.dataId.toString()] = true;
              info.crossed = !!occurenceEvents.find((ev) => ev.type === AutomationCampaignsEventsType.CROSSED);
            }
          });
        }
      }
      // insert in index last CONVERTED or last LEAD
      const eventsMatch = events.filter((event) => {
        const checkLastEvent = event.target
          ? AutomationCampaignTargets.getProperty(event.target, 'checkLastEvent')
          : 'unknown';
        return (
          AutomationCampaignsEventsType.CONVERTED === event.type ||
          (AutomationCampaignsEventsType.LEAD && checkLastEvent.name === 'lastLeadAt') // #4400 exclude lead J+90
        );
      });
      if (eventsMatch) {
        Customer.setCampaignStatusInIndex(customer, eventsMatch);
      }
      // We write the delays between actions from the events in the campaignInformations
      Customer.setConsolidatedEventsDelays(info, startingPointEventType);
      consolidatedCampaignsInformation.push(info);
    });

    /*
     We are done with the consolidate, we return the customer and the modifications without touching the bdd (See consolidateAndUpdate for that)
    */
    customer.automationCampaignsEvents = events;
    customer.automationCampaigns = consolidatedCampaignsInformation;
    const modifications = {
      index: customer.index,
      automationCampaignsEvents: customer.automationCampaignsEvents,
      automationCampaigns: customer.automationCampaigns,
    };
    // Client Apv : J+Y après la 2ème occurrence en Apv avec la même immat pour un même customer
    // Client Apv : J+Y après la 2ème occurrence en Apv avec la même immat pour un même customer ET si le client n'a pas généré de lead à l'enq. Essai
    return { customer, modifications };
  };
  Customer._getDataIdsFromSource = async (dataFilePath, garageId, type, from, to, vehicleMake, frontDeskGarageId) => {
    const directMongoData = app.models.Data.getMongoConnector();
    const where = {};

    if (dataFilePath) {
      const directMongoDataFile = app.models.DataFile.getMongoConnector();
      const dataFile = await directMongoDataFile.findOne(
        { filePath: dataFilePath },
        { projection: { datasCreatedIds: true } }
      );
      if (!dataFile) {
        throw new Error(`Customer.getDataIdsFromSource: dataFile ${dataFilePath} not found`);
      }
      if (!dataFile.datasCreatedIds || !dataFile.datasCreatedIds.length) {
        throw new Error(`Customer.getDataIdsFromSource: dataFile ${dataFilePath} has no dataIds`);
      }
      where._id = {
        $in: dataFile.datasCreatedIds,
      };
    }
    if (garageId) {
      where.garageId = garageId.toString();
    }
    if (type) {
      where.type = type;
    }
    if (from || to) {
      where['service.providedAt'] = {};
      if (from && !isNaN(from.getTime())) {
        where['service.providedAt'].$gte = from;
      }
      if (to && !isNaN(to.getTime())) {
        where['service.providedAt'].$lt = to;
      }
    }
    if (vehicleMake) {
      where['vehicle.make.value'] = vehicleMake;
    }
    if (frontDeskGarageId) {
      where['service.frontDeskGarageId'] = frontDeskGarageId;
    }
    const dataIds = await directMongoData.find(where, { projection: { _id: true } }).toArray();
    return dataIds.map((e) => e._id);
  };
  Customer.deleteOrMigrateDatasToAnotherGarage = async ({
    dataFilePath,
    garageId,
    from,
    to,
    type,
    vehicleMake,
    migrationGarageId,
    migrationManagerId,
    frontDeskGarageId,
  }) => {
    log.info(FED, `Getting dataIds from dataFile ${dataFilePath}`);
    const dataIds = await Customer._getDataIdsFromSource(
      dataFilePath,
      garageId,
      type,
      from,
      to,
      vehicleMake,
      frontDeskGarageId
    );
    if (!dataIds || !dataIds.length) {
      log.info(FED, `No dataIds for dataFile ${dataFilePath}. Aborting`);
      return false;
    }
    if (migrationGarageId) {
      log.info(FED, `Garage provided : ${migrationGarageId}. The found datas will be migrated`);
    }

    log.info(FED, `${dataIds.length} datas will be ${migrationGarageId ? 'migrated to garage' : 'deleted'}.`);
    const limit = 100;
    let skip = 0;

    // First, we remove the datas from customers
    log.info(FED, `Removing datas from customers.`);
    while (skip < dataIds.length) {
      await app.models.Customer.removeDatas(dataIds.slice(skip, skip + limit));
      skip += limit;
    }
    log.info(FED, `${dataIds.length} datas removed from customers.`);

    // Then we delete/migrate datas on the garage
    const directMongoData = app.models.Data.getMongoConnector();
    if (migrationGarageId) {
      log.info(FED, `Migrating ${dataIds.length} datas.`);
      // Migration
      const { ticketsConfiguration } = await app.models.Garage.findOne({
        _id: new ObjectID(migrationGarageId.toString()),
      });
      let datas = await directMongoData
        .find({ _id: { $in: dataIds.map((dId) => new ObjectID(dId)) } }, { projection: { type: true } })
        .toArray();
      const dataTypes = {};
      datas.map((d) => {
        if (!dataTypes[d.type]) {
          dataTypes[d.type] = [];
        }
        dataTypes[d.type].push(d._id);
      });
      // Updating ticket manager while migrating
      for (const key in dataTypes) {
        await directMongoData.updateMany(
          { _id: { $in: dataTypes[key] } },
          { $set: { garageId: migrationGarageId.toString() } }
        );
        await directMongoData.updateMany(
          {
            _id: { $in: dataTypes[key] },
            'unsatisfiedTicket.createdAt': { $gte: new Date(0) },
          },
          {
            $set: {
              'unsatisfiedTicket.manager': migrationManagerId
                ? new ObjectID(migrationManagerId.toString())
                : ticketsConfiguration[`Unsatisfied_${key}`],
            },
          }
        );
        await directMongoData.updateMany(
          {
            _id: { $in: dataTypes[key] },
            'leadTicket.createdAt': { $gte: new Date(0) },
          },
          {
            $set: {
              'leadTicket.manager': migrationManagerId
                ? new ObjectID(migrationManagerId.toString())
                : ticketsConfiguration[`Lead_${key}`],
            },
          }
        );
      }
      datas = await directMongoData.find({ _id: { $in: dataIds.map((dId) => new ObjectID(dId)) } }).toArray();
      for (const data of datas) {
        await app.models.Customer.addData(data);
      }
    } else {
      log.info(FED, `Deleting ${dataIds.length} datas.`);
      await directMongoData.deleteMany({ _id: { $in: dataIds.map((dId) => new ObjectID(dId)) } });
    }
    log.info(FED, `Operation complete.`);
  };
  Customer.prototype.consolidate = async function consolidate() {
    return Customer.consolidate(this);
  };
  Customer.prototype.consolidateAndUpdate = async function consolidateAndUpdate() {
    return Customer.consolidateAndUpdate(this);
  };
};
