const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

// script oneshoot, delete me when issue #4040 is merge with master
const addTargetToAutomationCampaignsEvents = async (campaignId, target) => {
  const automationCampaignsEventsMongo = app.models.AutomationCampaignsEvents.getMongoConnector();
  await automationCampaignsEventsMongo.updateMany(
    { campaignId: ObjectId(campaignId.toString()) },
    { $set: { target: target } }
  );
};

app.on('booted', async () => {
  try {
    console.log('--> Start to add target in automationCampaignsEvents...');
    console.time('execution_time');

    const automationCampaignMongo = app.models.AutomationCampaign.getMongoConnector();
    const allCmapaign = await automationCampaignMongo.find({}).project({ _id: 1, target: 1 }).toArray();
    const promises = [];

    for (const campaign of allCmapaign) {
      promises.push(() => addTargetToAutomationCampaignsEvents(campaign._id, campaign.target));
    }
    await concurrentpromiseAll(promises, 500, true);

    console.timeEnd('execution_time');
    console.log('--> add target in automationCampaignsEvents done ✓');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
