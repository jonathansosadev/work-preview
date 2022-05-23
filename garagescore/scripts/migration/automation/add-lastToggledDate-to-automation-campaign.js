const app = require('../../../server/server');
const { dayNumberToDate } = require('../../../common/lib/util/time-helper');

// Script oneshoot, add a date when user toogle the campaign, delete this when #5820 is merge with master
const getAutomationCampaign = async () => {
  return app.models.AutomationCampaign.getMongoConnector()
    .find({})
    .project({
      _id: true,
      firstRunDayNumber: true,
    })
    .toArray();
};

const updateCampaign = async (campaignId, firstRunDayNumber) => {
  return app.models.AutomationCampaign.getMongoConnector().updateOne(
    { _id: campaignId },
    { $set: { lastToggledDate: dayNumberToDate(firstRunDayNumber) } }
  );
};

app.on('booted', async () => {
  try {
    console.time('execution_time');
    const campaigns = await getAutomationCampaign();
    let count = 0;

    for (const campaign of campaigns) {
      await updateCampaign(campaign._id, campaign.firstRunDayNumber);
      console.log(`-----process ${++count}/${campaigns.length} campaigns`);
    }

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
