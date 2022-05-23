/** Wrap a job with common code */
const scheduler = require('../../common/lib/garagescore/scheduler/scheduler');
const { JS, log } = require('../../common/lib/util/log');

const GsSupervisor = require('../../common/lib/garagescore/supervisor/service');
const SupervisorMessageType = require('../../common/models/supervisor-message.type');
const ping = require('../../common/lib/workerbeats/ping');

module.exports = (queueName, script, processedBy = 'Unknown') => async (msg, ackMessage) => {
  const startedAt = Date.now();
  let error = null;
  let job = null;
  let jobId = null;
  try {
    job = JSON.parse(msg);
    jobId = job.jobId;
    await script(job);
  } catch (e) {
    error = e;
  }
  const timeSpent = Date.now() - startedAt;
  log.debug(JS, `${queueName} - Job #${jobId} processed in ${timeSpent}ms - ${msg}`);
  if (jobId) {
    await scheduler.jobDone(jobId, timeSpent, processedBy, error);
  }
  ackMessage();
  if (error) {
    log.error(JS, `${queueName} - Job #${jobId} processed with error`, error);
    await ping(`JobsInError_${queueName}`);
  } else {
    await ping(`JobsDone_${queueName}`);
  }
};
