const app = require('../../../server/server');
const { BANG, log } = require('../../../common/lib/util/log');
const { ObjectId } = require('mongodb');
const { AutomationCampaignTargets } = require('../../../frontend/utils/enumV2');
const timeHelper = require('../../../common/lib/util/time-helper');
/*
[
  '5f89b92e4925780003817d16',
  '5f89b92e4925780003817d15',
  '5f7c1b57d9d326000377a510',
  '5f7c1b57d9d326000377a50f',
  '5efe19dd9633ed0003873dbe',
  '5efe19e39633ed00038748a7',
  '5efe19dd9633ed0003873e22',
  '5efe19dd9633ed0003873ea4',
  '5efe19db9633ed0003873c20',
  '5efe19dd9633ed0003873dd2',
  '5efe19e49633ed00038748ea',
  '5efe19db9633ed0003873bbc',
  '5efe19dd9633ed0003873dc8',
  '5efe19dd9633ed0003873e18',
  '5efe19e39633ed0003874784',
  '5efe19df9633ed00038740d8',
  '5efe19e29633ed0003874656',
  '5efe19de9633ed0003873f8c',
  '5efe19e39633ed00038748a6',
  '5efe19e09633ed00038742f2',
  '5efe19e49633ed0003874a14',
  '5efe19e39633ed00038746f8',
  '5efe19e39633ed00038748a6',
  '5efe19e99633ed0003875204',
  '5efe19e49633ed00038748ba',
  '5efe19e39633ed00038746c6',
  '5efe19dd9633ed0003873da0',
];
Ca c'est les IDs de campagnes COVID manquantes
SCRIPT oneShoot, create 24/05/2021, delete me when this script was execute
*/

app.on('booted', async () => {
  try {
    console.time('execution_time');
    const campaignCovidNames = AutomationCampaignTargets.getPropertyFromValue('COVID', 'campaignNames');
    const mongoCampaignEvents = await app.models.AutomationCampaignsEvents.getMongoConnector();

    log.info(BANG, '--> Retrieve AutomationCampaignsEvents without target...');
    const missingCampaigns = await mongoCampaignEvents
      .aggregate([
        {
          $match: {
            target: { $exists: false },
          },
        },
        {
          $group: {
            _id: '$campaignId',
            campaignType: { $first: '$campaignType' },
            campaignId: { $first: '$campaignId' },
            nsamplesDesktop: { $first: '$nsamplesDesktop' },
            garageId: { $first: '$garageId' },
            campaignRunDay: { $first: '$campaignRunDay' },
          },
        },
        {
          $lookup: {
            from: 'garages',
            localField: 'garageId',
            foreignField: '_id',
            as: 'garage',
          },
        },
        {
          $unwind: '$garage',
        },
        {
          $project: {
            campaignId: '$campaignId',
            campaignType: '$campaignType',
            nsamplesDesktop: '$nsamplesDesktop',
            garageId: '$garageId',
            campaignRunDay: '$campaignRunDay',
            langage: '$garage.locale',
          },
        },
      ])
      .toArray();
    log.info(BANG, `--> Retrieve ${missingCampaigns.length} campaigns, start to create missing campaign on going...`);
    for (const event of missingCampaigns) {
      // create missing COVID campaign
      await app.models.AutomationCampaign.getMongoConnector().insertOne({
        _id: ObjectId(event.campaignId),
        displayName: campaignCovidNames[event.langage], //-> à get selon la langue du garage via l'enum automation targets
        type: event.campaignType,
        contactType: event.nsamplesDesktop && event.nsamplesDesktop > 0 ? 'EMAIL' : 'MOBILE',
        garageId: ObjectId(event.garageId), //-> via event
        status: 'COMPLETE',
        frequency: 'ONESHOT',
        runDayNumber: 18736,
        target: 'COVID',
        createdAt: new Date('2020-07-02T17:31:07.997Z'),
        updatedAt: new Date('2021-03-11T10:03:59.097Z'),
        hidden: false,
        firstRunDayNumber: event.campaignRunDay, //-> via event, campaignRunDay
        lastRunDayNumber: event.campaignRunDay, //-> via event, campaignRunDay (le même)
        deletedByMistake: true,
      });
    }

    log.info(BANG, '--> Add target in automationCampaignEvents...');
    const result = await app.models.AutomationCampaignsEvents.getMongoConnector().updateMany(
      {
        campaignId: { $in: missingCampaigns.map((event) => ObjectId(event.campaignId.toString())) },
      },
      {
        $set: { target: 'COVID' },
      }
    );

    log.info(
      BANG,
      `--> Script executed without error: ${missingCampaigns.length} campaigns created, add target in ${result.modifiedCount} documents`
    );

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
