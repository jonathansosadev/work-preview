/** A template to create new job processors
 * Check worker/server.js to add job processor
 */
const app = require('../../../server/server');
const { FED, log } = require('../../../common/lib/util/log');

module.exports = async (job) => {
  const commonTicket = require('../../../common/models/data/_common-ticket');
  // {"_id":3, "payload": {"dataId": "5ce46cbf94a7009632396f81", "type": "lead/unsatisfied"}}
  const dataId = job.payload.dataId;
  const type = job.payload.type;
  if (!dataId) {
    log.error(FED, `possible-success-alert no dataId in ${JSON.stringify(job)}`);
    return true;
  }
  const data = await app.models.Data.findById(dataId);
  if (!data) {
    log.error(FED, `possible-success-alert no data with id ${dataId}`);
    return true;
  }
  // New
  if (await commonTicket.checkSuccessConditions(data, type)) {
    // Data still in successful condition, since we can send the alert only once, tagging it so we can't send it twice.
    if (type === 'lead') {
      await app.models.Data.findByIdAndUpdateAttributes(data.getId(), { 'leadTicket.alertSuccessSent': true });
    } else {
      await app.models.Data.findByIdAndUpdateAttributes(data.getId(), { 'unsatisfiedTicket.alertSuccessSent': true });
    }
    // Data still in successful condition, the contact should be sent
    await commonTicket.sendToAlertSuccessList(data, type);
  } else {
    // Data not fit anymore, skip alert
    log.info(FED, `possible-success-alert Data isn't successful anymore : ${JSON.stringify(job)}`);
  }
  return true;
};
