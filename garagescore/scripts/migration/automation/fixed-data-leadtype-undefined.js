const app = require('../../../server/server');
const dataTypes = require('../../../common/models/data/type/data-types');

// Script oneshoot for remove duplicate data, delete me when #5069 is merge with master
const getAutomationDatas = async () => {
  return app.models.Data.getMongoConnector()
    .find({
      type: 'AutomationCampaign',
      'lead.saleType': { $exists: false },
      'leadTicket.saleType': { $exists: false },
    })
    .project({ _id: true })
    .toArray();
};

const setSaleType = async (dataIds) => {
  return app.models.Data.getMongoConnector().updateMany(
    { _id: { $in: dataIds } },
    { $set: { 'lead.saleType': dataTypes.NEW_VEHICLE_SALE, 'leadTicket.saleType': dataTypes.NEW_VEHICLE_SALE } }
  );
};
// 2226
app.on('booted', async () => {
  try {
    console.time('execution_time');

    const datas = await getAutomationDatas();
    const dataIds = datas.map((data) => data._id);
    const results = await setSaleType(dataIds);
    console.log('=====total datas retrieve: ', datas.length);
    console.log('=====total datas updated: ', results.modifiedCount);

    console.timeEnd('execution_time');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
});
