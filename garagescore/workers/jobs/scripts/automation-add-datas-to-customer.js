const app = require('../../../server/server');

module.exports = async (job) => {
  for (const dataId of job.payload.dataIds) {
    if (!dataId) {
      throw new Error(`automation-add-datas-to-customer :: no dataId in ${JSON.stringify(job)}`);
    }
    const data = await app.models.Data.findById(dataId);
    if (!data) {
      throw new Error(`automation-add-datas-to-customer :: no data with id ${dataId} in ${JSON.stringify(job)}`);
    }
    await app.models.Customer.addData(data);
  }
};
