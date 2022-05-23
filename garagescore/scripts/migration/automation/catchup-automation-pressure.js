const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const { dayNumberToDate } = require('../../../common/lib/util/time-helper');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler');
const { JobTypes, AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

// Script oneshoot for add gender to customer, delete me when #5868 is merge with master
const START_DATE_NUMBER = 19053; // 2 mars 2022
const END_DATE_NUMBER = 19088; // 6 april 2022

const getPressureCustomers = async () => {
  return app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          campaignRunDay: { $gte: START_DATE_NUMBER, $lte: END_DATE_NUMBER }, // 2 mars 2022 -> 6 april 2022
          type: AutomationCampaignsEventsType.PRESSURE_BLOCKED,
        },
      },
      { $unwind: '$samples' },
      {
        $group: {
          _id: 'type',
          customerIds: { $addToSet: '$samples.customerId' },
        },
      },
    ])
    .toArray();
};

const getCustomersPressureBlocked = async (customerIds) => {
  const results = await app.models.Customer.getMongoConnector()
    .aggregate([
      {
        $match: {
          _id: { $in: customerIds },
          $or: [
            { 'hasRecentlyBeenContacted.AUTOMATION_VEHICLE_SALE': { $gte: dayNumberToDate(START_DATE_NUMBER) } },
            { 'hasRecentlyBeenContacted.AUTOMATION_MAINTENANCE': { $gte: dayNumberToDate(START_DATE_NUMBER) } },
          ],
        },
      },
      {
        $project: {
          _id: true,
        },
      },
    ])
    .toArray();

  if (Array.isArray(results)) {
    return results.map((result) => result._id.toString());
  }
  return [];
};

const insertJob = async (customerId, event) => {
  const sendDate = new Date();
  const constraints = {
    noWeekEnd: true,
    workingHours: true,
  };

  await Scheduler.upsertJob(
    JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
    {
      customerId: customerId.toString(),
      campaignId: event.campaignId.toString(),
      campaignType: event.campaignType,
      garageId: event.garageId.toString(),
      contactType: event.nsamplesDesktop ? 'EMAIL' : 'MOBILE',
      target: event.target,
      email: event.email,
      phone: event.phone,
      campaignRunDay: event.campaignRunDay,
    },
    sendDate,
    constraints
  );
};

const findEvent = async (customerId) => {
  return app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
    campaignRunDay: { $gte: START_DATE_NUMBER, $lte: END_DATE_NUMBER },
    type: AutomationCampaignsEventsType.PRESSURE_BLOCKED,
    'samples.customerId': ObjectId(customerId.toString()),
  });
};

const updateAutomationEvent = async (customerId, event) => {
  if (event.nsamples === 1) {
    // delete document if bucket size has only 1 customer
    return app.models.AutomationCampaignsEvents.getMongoConnector().deleteOne({
      _id: ObjectId(event._id.toString()),
    });
  }
  // otherwise, update document
  const samples = event.samples.filter((sample) => sample.customerId.toString() !== customerId.toString());
  const sampleTypes = event.nsamplesMobile ? 'nsamplesMobile' : 'nsamplesDesktop';
  return app.models.AutomationCampaignsEvents.getMongoConnector().updateOne(
    {
      _id: ObjectId(event._id.toString()),
    },
    {
      $set: {
        nsamples: samples.length,
        [sampleTypes]: samples.length,
        samples,
      },
    }
  );
};

const updateCustomer = async (customerId, campaignId) => {
  const customer = await app.models.Customer.getMongoConnector().findOne(
    { _id: ObjectId(customerId.toString()) },
    { $projection: { automationCampaignsEvents: true } }
  );

  customer.automationCampaignsEvents = customer.automationCampaignsEvents.filter((event) => {
    // exclude the campaignId and event PRESSURE_BLOCKED
    return !(
      event.campaignId.toString() === campaignId.toString() &&
      event.type === AutomationCampaignsEventsType.PRESSURE_BLOCKED
    );
  });

  return app.models.Customer.getMongoConnector().updateOne(
    { _id: ObjectId(customerId.toString()) },
    { $set: { automationCampaignsEvents: customer.automationCampaignsEvents, fixes: { 5868: true } } }
  );
};

const catchup = async (customerId) => {
  const event = await findEvent(customerId);
  // 3. recreate job type AUTOMATION_SEND_CONTACT_TO_CUSTOMER
  await insertJob(customerId, event);
  // 4. update or delete events PRESSURE_BLOCKED
  await updateAutomationEvent(customerId, event);
  // 5. remove event PRESSURE_BLOCKED in customer automationCampaignsEvents
  await updateCustomer(customerId, event.campaignId);
};

const _parseArgs = (args) => {
  let limit = 500;
  if (args.includes('--limit')) {
    limit = parseInt(args[process.argv.indexOf('--limit') + 1]);
  }
  return { limit };
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    /**
     * 1. get all customers under pressure_blocked
     * 2. exclude legit customer pressure_blocked
     * 3. recreate job type AUTOMATION_SEND_CONTACT_TO_CUSTOMER
     * 4. update or delete events AUTOMATION_SEND_CONTACT_TO_CUSTOMER
     * 5. remove event PRESSURE_BLOCKED in customer automationCampaignsEvents
     */
    const { limit } = _parseArgs(process.argv);
    // 1. get all customers under pressure_blocked
    const [result] = await getPressureCustomers();
    const customersPressureBlocked = await getCustomersPressureBlocked(result.customerIds);
    // 2. exclude legit customer pressure_blocked
    const retargetCustomers = result.customerIds.filter((customerId) => {
      return !customersPressureBlocked.includes(customerId.toString());
    });

    console.log('----retarget customers: ', retargetCustomers.length);
    const promises = retargetCustomers.map((customerId) => () => catchup(customerId));
    console.log('----catchup pressure_blocked ongoing...');
    await concurrentpromiseAll(promises, limit, true);

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
