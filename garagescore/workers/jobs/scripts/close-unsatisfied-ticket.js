/**
 * Just close a ticket...
 */
const app = require('../../../server/server');

module.exports = async (job) => {
  const dataId = job.payload && job.payload.dataId;
  if (!dataId) {
    throw new Error(`close-unsatisfied-ticket :: no dataId in ${JSON.stringify(job)}`);
  }
  const data = await app.models.Data.findById(dataId);
  if (!data) {
    throw new Error(`close-unsatisfied-ticket :: no data with id ${dataId} in ${JSON.stringify(job)}`);
  }
  await data.unsatisfiedTicket_closeTicket();
};
