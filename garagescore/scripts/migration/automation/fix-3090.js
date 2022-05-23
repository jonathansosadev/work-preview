const app = require('../../../server/server');
const automationAddDatasToCustomer = require('../../../workers/jobs/scripts/automation-add-datas-to-customer');

app.on('booted', async () => {
  try {
    const datas = app.models.Data.getDataSource().connector.collection(app.models.Data.modelName);
    const clusters = await datas
      .aggregate([
        {
          $match: {
            shouldSurfaceInStatistics: false,
            'campaign.automationOnly': true,
          },
        },
        {
          $group: {
            _id: '$garageId',
            dataIds: { $push: '$_id' },
          },
        },
      ])
      .toArray();
    console.log(`${clusters.length} garages to process`);
    for (let cluster of clusters) {
      console.log(`${new Date()} -- Processing garageId: ${cluster._id}, datas count: ${cluster.dataIds.length}`);
      await automationAddDatasToCustomer({ payload: cluster });
    }
  } catch (e) {
    console.error(e);
  }
  console.log('bye');
  process.exit();
});
