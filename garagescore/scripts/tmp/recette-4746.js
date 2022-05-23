const app = require('../../server/server');
const { ObjectId } = require('mongodb');
const { AutomationCampaignTargets, GaragesTest } = require('../../frontend/utils/enumV2');
const timeHelper = require('../../common/lib/util/time-helper');

/**
 * this script is only use for recette Automation campaign ticket #4746
 * how to use:
 * --email -> customer email
 * --target -> mean which campaign like M_M
 * --when -> two values: before/after/equal. to set the date before or after the date of purchase of the vehicle for the test
 * --event -> boolean if we want to test when user has event lastConvertedAt/lastLeadAt
 *
 * node scripts/tmp/recette-4746.js --email moule_frite@belge.com --target M_M --when before --event true
 */

const dateToInterval = (dateToScout, monthsBefore = 11) => {
  const date = new Date(dateToScout);
  date.setMonth(dateToScout.getMonth() - monthsBefore);
  const gte = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  let daysToAdd = 1;
  const year = gte.getFullYear();
  if (gte.getMonth() === 1 && gte.getDate() === 28 && ((year % 4 === 0 && year % 100 !== 0) || year % 400 === 0)) {
    daysToAdd = 2;
  }
  let lt = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  lt = lt.setDate(lt.getDate() + daysToAdd);
  return { gte: new Date(gte), lt: new Date(lt) };
};

const getDateProvidedAt = (target, when) => {
  const historicNeededInMonth = AutomationCampaignTargets.getProperty(target, 'historicNeededInMonth');
  let monthsBefore = null;
  let providedAt = null;
  let dateGte = null;

  if (historicNeededInMonth) {
    let [, historicInMonth] = AutomationCampaignTargets.getProperty(target, 'historicNeededInMonth');
    monthsBefore = historicInMonth;
  }
  const { gte } = dateToInterval(new Date(), monthsBefore);
  providedAt = gte;
  dateGte = gte;

  if (target === AutomationCampaignTargets.VS_M_11) {
    const dateToScout = new Date();
    dateToScout.setDate(dateToScout.getDate() - 90);
    const { gte } = dateToInterval(dateToScout, 0);
    providedAt = gte;
    dateGte = gte;
  }
  if (/after/i.test(when)) {
    const providedAtDayNumber = timeHelper.dayNumber(providedAt);
    providedAt = timeHelper.dayNumberToDate(providedAtDayNumber - 30);
  }
  if (/before/i.test(when)) {
    const providedAtDayNumber = timeHelper.dayNumber(providedAt);
    providedAt = timeHelper.dayNumberToDate(providedAtDayNumber + 30);
  }
  if (/equal/i.test(when)) {
    const providedAtDayNumber = timeHelper.dayNumber(providedAt);
    providedAt = timeHelper.dayNumberToDate(providedAtDayNumber);
    providedAt = new Date(providedAt.getTime() + 22 * 3600 * 1000); /*22 hrs in ms*/
  }

  return { providedAt, dateGte };
};

const updateCustomerDateForTarget = async (email, target, gte) => {
  let dataType = 'lastMaintenanceAt';
  if (/NVS/.test(target)) dataType = 'lastNewVehicleSaleAt';
  if (/UVS/.test(target)) dataType = 'lastUsedVehicleSaleAt';

  const customer = await app.models.Customer.getMongoConnector().findOne({ email: email });
  customer.index = customer.index.map((i) => {
    if (i.k === dataType) i.v = gte;
    return i;
  });

  await app.models.Customer.getMongoConnector().updateOne({ email: email }, { $set: { index: customer.index } });
};

// campaign Vn/Vo, consolidate will update VehicleSaleAt with the most recent date
const updateLastVehiculeSale = async (email, providedAt, dataType) => {
  const customer = await app.models.Customer.findOne({ where: { email: email } });

  customer.history = customer.history.map((h) => {
    if (h.serviceType !== dataType) h.serviceType = dataType;
    if (h.serviceProvidedAt) h.serviceProvidedAt = new Date(0);
    return h;
  });

  customer.history.push({
    serviceProvidedAt: providedAt,
    dataId: '5fcb3fb93521e400038c4105',
    plate: 'EQ-796-WM',
    serviceType: dataType,
  });

  await customer.consolidateAndUpdate();
};

// add noMaintenanceSinceUsedVehicleSale for campaign M_UVS or M_NVS
const addNoMaintenanceSinceUsedVehicleSale = async (email, target) => {
  let kValue = 'noMaintenanceSinceUsedVehicleSale';
  if (/NVS/i.test(target)) kValue = 'noMaintenanceSinceNewVehicleSale';
  const customer = await app.models.Customer.getMongoConnector().findOne({ email: email });
  const isExist = customer.index.find(({ k }) => k === kValue);
  if (isExist) {
    return;
  } else {
    await app.models.Customer.getMongoConnector().updateOne(
      { email: email },
      { $push: { index: { k: kValue, v: true } } }
    );
  }
};

const updateCustomerLastVehiculeSale = async (email, target, providedAt, gte) => {
  let dataType = 'Maintenance';
  if (/NVS/.test(target)) dataType = 'NewVehicleSale';
  if (/UVS/.test(target)) dataType = 'UsedVehicleSale';

  if (/NVS|UVS/i.test(target)) {
    // update by loopback
    await updateLastVehiculeSale(email, providedAt, dataType);
    await addNoMaintenanceSinceUsedVehicleSale(email, target);
    return;
  }
  // update by directMongo
  const customer = await app.models.Customer.getMongoConnector().findOne({ email: email });
  const isExist = customer.index.find(({ k }) => k === 'lastVehicleSaleAt');
  if (isExist) {
    customer.index = customer.index.map((i) => {
      if (i.k === 'lastVehicleSaleAt') {
        i.v = providedAt;
      }
      return i;
    });
    await app.models.Customer.getMongoConnector().updateOne({ email: email }, { $set: { index: customer.index } });
  } else {
    await app.models.Customer.getMongoConnector().updateOne(
      { email: email },
      { $push: { index: { k: 'lastVehicleSaleAt', v: providedAt } } }
    );
  }
};
/**
 * add event like lastLeadAt or lastConvertedAt in customer index
 */
const addCustomerEvent = async (email, target, when) => {
  const checkLastEvent = AutomationCampaignTargets.getProperty(target, 'checkLastEvent');
  const customer = await app.models.Customer.getMongoConnector().findOne({ email: email });
  const isExist = customer.index.find(({ k }) => k === checkLastEvent.name);
  let dayNumberBefore = timeHelper.todayDayNumber() - checkLastEvent.delay;
  if (/before/i.test(when)) {
    dayNumberBefore--;
  }
  if (/after/i.test(when)) {
    dayNumberBefore++;
  }
  if (isExist) {
    customer.index = customer.index.map((i) => {
      if (i.k === checkLastEvent.name) {
        i.v = dayNumberBefore;
      }
      return i;
    });
    await app.models.Customer.getMongoConnector().updateOne({ email: email }, { $set: { index: customer.index } });
  } else {
    await app.models.Customer.getMongoConnector().updateOne(
      { email: email },
      { $push: { index: { k: checkLastEvent.name, v: dayNumberBefore } } }
    );
  }
};
/**
 * set the campaign for running today by the cron
 * @param {String} target
 */
const updateAutomationCampaign = async (target) => {
  const runDayNumber = timeHelper.todayDayNumber();

  await app.models.AutomationCampaign.getMongoConnector().updateMany(
    { garageId: ObjectId(GaragesTest.GARAGE_DUPONT), target },
    { $set: { runDayNumber: runDayNumber } }
  );
};

const updateCronScript = async () => {
  const collectinoName = 'cronInformations';
  const cronInformationMongo = app.models.Data.dataSource.connector.db.collection(collectinoName);
  const todayNumber = timeHelper.todayDayNumber();

  return cronInformationMongo.updateOne(
    { path: 'scripts/cron/automation/run-campaigns.js' },
    { $set: { lastExecutedStepNumber: todayNumber - 1 } }
  );
};

const _parseArgs = (args) => {
  let email = null;
  let target = null;
  let when = null;
  let event = null;

  if (args.includes('--email')) {
    email = args[args.indexOf('--email') + 1];
  }
  if (args.includes('--target')) {
    target = args[args.indexOf('--target') + 1];
  }
  if (args.includes('--when')) {
    when = args[args.indexOf('--when') + 1];
  }
  if (args.includes('--event')) {
    event = args[args.indexOf('--event') + 1];
  }

  return { email, target, when, event };
};

app.on('booted', async () => {
  try {
    const { email, target, when, event } = _parseArgs(process.argv);
    const { providedAt, dateGte } = getDateProvidedAt(target, when);

    await updateCustomerDateForTarget(email, target, dateGte);
    await updateCustomerLastVehiculeSale(email, target, providedAt, dateGte);
    await updateAutomationCampaign(target);
    if (event) await addCustomerEvent(email, target, when);
    await updateCronScript();
    console.log(`----> update customer ${email} done`);
  } catch (e) {
    console.error('there was an error', e);
  }

  process.exit(0);
});
