const app = require('../../../server/server');

module.exports = async (job) => {
  const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
  const { JobTypes } = require('../../../frontend/utils/enumV2');

  const dataId = job.payload.dataId;
  if (!dataId) {
    throw new Error(`automation-check-contact-modification :: no dataId in ${JSON.stringify(job)}`);
  }
  const data = await app.models.Data.findById(dataId);
  if (!data) {
    throw new Error(`automation-check-contact-modification :: no data with id ${dataId} in ${JSON.stringify(job)}`);
  }
  if (data.get('customer.isRevised')) {
    await Scheduler.upsertJob(
      JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER,
      { dataIds: [data.getId().toString()] },
      new Date()
    );
  }
};
