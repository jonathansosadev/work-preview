const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const AutomationCampaignChannels = require('../../../common/models/automation-campaign-channel.type');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

// Script oneshoot, delete me when #5897 is merge with master
// the script remove duplicate automation campaign and events from duplicate campaign
// and keep the campaign with the most events
// 1. clean duplicate campaign
// 2. clean event
// 3. clean customer
// 4. regenerate KPI
const getAutomationCAmpaign = async (contactType) => {
  return app.models.AutomationCampaign.getMongoConnector()
    .aggregate([
      {
        $match: {
          //garageId: ObjectId('59c528198c1a2b1b00e2cc33'), // use for quick test
          contactType: contactType,
        },
      },
      {
        $group: {
          _id: { garageId: '$garageId', target: '$target' },
          count: { $sum: 1 },
          campaignIds: { $push: '$_id' },
        },
      },
      {
        $match: {
          count: { $gte: 2 },
        },
      },
    ])
    .toArray();
};

const deleteCampaign = async (campaignId) => {
  return app.models.AutomationCampaign.getMongoConnector().deleteOne({ _id: ObjectId(campaignId.toString()) });
};

const deleteCampaignEvents = async (campaignId) => {
  return app.models.AutomationCampaignsEvents.getMongoConnector().deleteOne({
    campaignId: ObjectId(campaignId.toString()),
  });
};
/** return result like this, delete the campaign with the lowest result:
 * { "_id" : ObjectId("61a4fa896b4a77000300a3e2"), "count" : 254.0 }
 * { "_id" : ObjectId("61a4fa896b4a77000300a3e1"), "count" : 325.0 }
 */
const compareEvents = async (campaignIds) => {
  const events = await app.models.AutomationCampaignsEvents.getMongoConnector()
    .aggregate([
      {
        $match: {
          campaignId: { $in: campaignIds },
        },
      },
      {
        $group: {
          _id: '$campaignId',
          count: { $sum: 1 },
          customerIds: { $push: '$samples.customerId' },
        },
      },
    ])
    .toArray();
  const [first, second] = events;
  // no events find for this campaigns, keep the oldest campaigns
  if (!events || events.length === 0) {
    return { _id: campaignIds[1] };
  }
  // return the less result
  return first.count < second.count ? first : second;
};

const updateCustomer = async (customerId, campaignId) => {
  const customer = await app.models.Customer.getMongoConnector().findOne({
    _id: ObjectId(customerId.toString()),
    'automationCampaigns.campaignId': ObjectId(campaignId.toString()),
  });
  if (!customer) {
    return;
  }
  // remove deleted campaignId
  customer.automationCampaigns = customer.automationCampaigns.filter((campaign) => {
    return campaign.campaignId.toString() !== campaignId.toString();
  });
  customer.automationCampaignsEvents = customer.automationCampaignsEvents.filter((event) => {
    return event.campaignId.toString() !== campaignId.toString();
  });

  await app.models.Customer.getMongoConnector().updateOne(
    {
      _id: ObjectId(customerId.toString()),
    },
    {
      $set: {
        automationCampaigns: customer.automationCampaigns,
        automationCampaignsEvents: customer.automationCampaignsEvents,
      },
    }
  );
};
// recette check with this customerId: ObjectId("5f04d2d8ce876400039d7be1"), the duplicate campaignId 61b36764ba1ee60003ec061e should be deleted
const cleanCustomers = async (customerIds, campaignId) => {
  if (!customerIds) {
    return;
  }
  const customerIdsFlat = customerIds.flat(1);
  const promises = customerIdsFlat.map((customerId) => () => updateCustomer(customerId, campaignId));
  await concurrentpromiseAll(promises, 100, true);
};

const processedCampaigns = async (campaigns, campaignName) => {
  let totaldeleted = 0;
  for (const campaign of campaigns) {
    const result = await compareEvents(campaign.campaignIds);
    await deleteCampaign(result._id);
    await deleteCampaignEvents(result._id);
    await cleanCustomers(result.customerIds, result._id);
    console.log(`--------total campaign ${campaignName} deleted: ${++totaldeleted}/${campaigns.length}`);
  }
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    // process campaign emails
    const campaignsEmails = await getAutomationCAmpaign(AutomationCampaignChannels.EMAIL);
    await processedCampaigns(campaignsEmails, AutomationCampaignChannels.EMAIL);
    // process campaign mobile
    const campaignsMobiles = await getAutomationCAmpaign(AutomationCampaignChannels.MOBILE);
    await processedCampaigns(campaignsMobiles, AutomationCampaignChannels.MOBILE);
    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
