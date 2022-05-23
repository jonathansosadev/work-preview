const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');
const intro = '[4308-add-e-to-prvia.js] : ';
//

app.on('booted', async () => {
  try {
    const directMongoGarage = app.models.Garage.getMongoConnector();
    const directMongoAutomationCampaign = app.models.AutomationCampaign.getMongoConnector();
    let garageIds = await directMongoGarage
      .aggregate([
        { $match: { locale: 'ca_ES', 'subscriptions.Automation.enabled': true } },
        { $group: { _id: null, idList: { $push: '$_id' } } },
      ])
      .toArray();
    garageIds = garageIds[0].idList;
    log.info(FED, `${intro} ${garageIds.length} garages to process.`);
    let allCampaigns = await directMongoAutomationCampaign
      .find(
        {
          garageId: { $in: garageIds },
        },
        { projection: { displayName: true } }
      )
      .toArray();
    log.info(FED, `${intro} ${allCampaigns.length} campaigns to process.`);
    const bulkWrite = [];
    let campaignsModified = 0;
    for (const campaign of allCampaigns) {
      if (campaign.displayName.includes('prvia')) {
        campaignsModified++;
        bulkWrite.push({
          updateOne: {
            filter: {
              _id: campaign._id,
            },
            update: {
              $set: {
                displayName: campaign.displayName.replace(/prvia/g, 'previa'),
              },
            },
          },
        });
      }
    }
    await directMongoAutomationCampaign.bulkWrite(bulkWrite);
    log.info(FED, `${intro} ${campaignsModified} campaigns modified. Good.`);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
