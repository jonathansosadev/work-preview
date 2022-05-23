/**
 * Send a unsatisfied followup
 */

const app = require('../../../server/server');

module.exports = async (job) => {
  const dataId = job.payload && job.payload.dataId;
  if (!dataId) {
    throw new Error(`send-lead-followup :: no dataId in ${JSON.stringify(job)}`);
  }
  const data = await app.models.Data.findById(dataId);
  if (!data) {
    throw new Error(`send-lead-followup :: no data with id ${dataId} in ${JSON.stringify(job)}`);
  }
  await data.leadTicket_sendFollowup();
};
