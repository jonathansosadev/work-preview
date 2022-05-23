const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const { GaragesTest, AutomationCampaignsEventsType } = require('../../../frontend/utils/enumV2');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

// Script oneshoot for remove duplicate data, delete me when #4578 is merge with master
let countLead = 0;
let countDuplicateEventLead = 0;
let countDuplicateDocuments = 0;
const getEvents = async () => {
  return app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          type: AutomationCampaignsEventsType.LEAD,
        },
      },
      {
        $project: {
          campaignId: 1,
          'samples.customerId': 1,
          eventDay: 1,
          campaignRunDay: 1,
        },
      },
    ])
    .toArray();
};

const updateCustomer = async (customerId, campaignId) => {
  const customer = await app.models.Customer.getMongoConnector().findOne({
    _id: customerId,
  });

  customer.automationCampaignsEvents = customer.automationCampaignsEvents.filter((event) => {
    return !(
      event.campaignId.toString() === campaignId.toString() && event.type === AutomationCampaignsEventsType.LEAD
    );
  });

  await app.models.Customer.getMongoConnector().updateOne(
    { _id: customer._id },
    { $set: { automationCampaignsEvents: customer.automationCampaignsEvents } }
  );
};

const updateCampaignEvent = async (customerId) => {
  const event = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
    'samples.customerId': customerId,
    type: AutomationCampaignsEventsType.LEAD,
  });
  // delete document if the samples contains only 1 customer
  if (event.samples.length === 1) {
    await app.models.AutomationCampaignsEvents.getMongoConnector().deleteOne({ _id: event._id });
    return;
  }
  // remove customer and update document
  event.samples = event.samples.filter((sample) => {
    return sample.customerId.toString() !== customerId.toString();
  });

  const sampleType = event.nsamplesMobile ? 'nsamplesMobile' : 'nsamplesDesktop';
  event[sampleType] = event.nsamples.length;
  event.nsamples = event.nsamples.length;

  await app.models.AutomationCampaignsEvents.getMongoConnector().updateOne(
    { _id: event._id },
    { $set: { nsamples: event.nsamples, samples: event.samples, [sampleType]: event[sampleType] } }
  );
};

const findOrphanLead = async (campaignId, customerId, campaignRunDay) => {
  const dataLead = await app.models.DatasAsyncviewLeadTicket.getMongoConnector().findOne(
    {
      'automation.campaignId': campaignId,
      'automation.customerId': customerId,
      'automation.campaignRunDay': campaignRunDay,
    },
    { projection: { _id: true } }
  );
  if (!dataLead) {
    ++countLead;
    await updateCampaignEvent(customerId);
    await updateCustomer(customerId, campaignId);
  }
};
// fixed duplicate customerId in collection automationCampaignsEvents
const updateDuplicateCustomerId = async (evenId) => {
  const event = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne({
    _id: evenId,
  });
  // remove duplicate object in array
  event.samples = event.samples.filter(function ({ customerId }) {
    const key = `${customerId}`;
    return !this.has(key) && this.add(key);
  }, new Set());
  const sampleType = event.nsamplesMobile ? 'nsamplesMobile' : 'nsamplesDesktop';

  await app.models.AutomationCampaignsEvents.getMongoConnector().updateOne(
    { _id: evenId },
    {
      $set: {
        nsamples: event.samples.length,
        samples: event.samples,
        [sampleType]: event.samples.length,
      },
    }
  );
};

const findDuplicateCustomerId = async (eventId) => {
  const event = await app.models.AutomationCampaignsEvents.getMongoConnector().findOne(
    { _id: eventId },
    { projection: { nsamples: 1, samples: 1 } }
  );
  let customerIds = event.samples.map((sample) => sample.customerId.toString());
  customerIds = [...new Set(customerIds)];

  if (event.nsamples !== customerIds.length) {
    ++countDuplicateEventLead;
    await updateDuplicateCustomerId(eventId);
  }
};

// keep the first document and remove the last
const cleanDuplicateDocument = async (events) => {
  const lastDoc = events[events.length - 1];
  await app.models.AutomationCampaignsEvents.getMongoConnector().deleteOne({ _id: lastDoc._id });
};

const duplicateDocumentAutomationEvents = async (events) => {
  // remove duplicate object in array
  const eventsFilter = events.filter(function ({ campaignId, campaignRunDay, eventDay, nsamples }) {
    const key = `${campaignId}_${campaignRunDay}_${eventDay}_${nsamples}`;
    return !this.has(key) && this.add(key);
  }, new Set());

  const eventsFilterId = eventsFilter.map((e) => e._id.toString());
  const duplicateDocuments = events.filter((event) => {
    return !eventsFilterId.includes(event._id.toString());
  });

  for (const doc of duplicateDocuments) {
    for (const sample of doc.samples) {
      const results = await app.models.AutomationCampaignsEvents.getMongoConnector()
        .find({
          campaignId: doc.campaignId,
          'samples.customerId': sample.customerId,
          type: AutomationCampaignsEventsType.LEAD,
          campaignRunDay: doc.campaignRunDay,
        })
        .toArray();

      if (results.length > 1) {
        ++countDuplicateDocuments;
        await cleanDuplicateDocument(results);
      }
    }
  }
};

app.on('booted', async () => {
  try {
    console.time('execution_time');

    const events = await getEvents();
    let promises = [];
    // find and fixe orphan LEAD
    for (const event of events) {
      const toExecuted = event.samples.map((sample) => {
        return () => findOrphanLead(event.campaignId, sample.customerId, event.campaignRunDay);
      });
      promises = [...promises, ...toExecuted];
    }
    // find and fixe duplicate event LEAD
    promises = [...promises, ...events.map((event) => () => findDuplicateCustomerId(event._id))];
    await concurrentpromiseAll(promises, 500, true);
    // remove duplicate documents
    await duplicateDocumentAutomationEvents(events);

    console.log('======count orphan lead', countLead); // expect 42
    console.log('======count duplicate lead', countDuplicateEventLead); // expect 5
    console.log('======count duplicate documents', countDuplicateDocuments); // expect 8

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
