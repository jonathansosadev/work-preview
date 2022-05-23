const app = require('../../server/server');

app.on('booted', async () => {
  try {
    console.log('[2894 FIX CAMPAIGNS] STARTING... PLEASE WAIT...');

    const directMongoData = app.models.Data.getMongoConnector();
    const directMongoCampaign = app.models.Campaign.getMongoConnector();
    const $match = {
      $and: [
        { createdAt: { $gte: new Date('2020-05-25T00:00:00.000Z') } },
        { createdAt: { $lte: new Date('2020-05-30T00:00:00.000Z') } },
      ],
      survey: { $exists: false },
      'campaign.status': 'Running',
      'campaign.contactStatus.status': 'Scheduled',
      'campaign.contactScenario.firstContactByEmailDay': { $lte: 18412 },
    };
    const $project = { 'campaign.campaignId': true };
    const $group = { _id: '$campaign.campaignId' };

    // 1. Fetch all the concerned campaigns via aggregate
    const dataAggregateResult = await directMongoData.aggregate([{ $match }, { $project }, { $group }]).toArray();

    // 2. Transform that to an array of campaign ids
    const campaignIds = dataAggregateResult.map((obj) => obj._id);

    console.log(`[2894 FIX CAMPAIGNS] FOUND ${campaignIds.length} CAMPAIGNS TO PROCESS`);

    // 3. Update datas and campaigns
    const result = await Promise.all([
      directMongoData.updateMany($match, { $set: { 'campaign.status': 'New', 'fixes.2894': true } }),
      directMongoCampaign.updateMany(
        {
          _id: { $in: [...campaignIds] },
          status: 'Running',
          $and: [
            { createdAt: { $gte: new Date('2020-05-25T00:00:00.000Z') } },
            { createdAt: { $lte: new Date('2020-05-30T00:00:00.000Z') } },
          ],
        },
        { $set: { status: 'New', 'fixes.2894': true } }
      ),
    ]);

    console.log(
      `[2894 FIX CAMPAIGNS] DONE! ${result.pop().result.nModified} CAMPAIGNS UPDATED, ${
        result.pop().result.nModified
      } DATA UPDATED`
    );
  } catch (e) {
    console.error(JSON.stringify(e));
  }

  process.exit(0);
});
