/**
 * Background workers
 * Use the scheduler to process jobs
 * Using one worker per scheduler job type would use too much ressources
 * One worker can thus handle various job types at the same time
 * By convention, workers have asteroids names, so one 'asteroid' handle a list of job types
 * https://en.wikipedia.org/wiki/List_of_exceptional_asteroids
 * In heroku: workers must be defined in Procfile
 * > ceres: node workers/job-runner.js ceres
 * > vesta: node workers/job-runner.js vesta
 * You can then scale the number of dyno per worker
 * heroku ps:scale web=1 ceres=2 vesta=1
 */
require('dotenv').config({ silent: true });

const { printFormattedHeapSizeLimit } = require('../common/lib/garagescore/v8/heap-size-info');
const startBeats = require('../common/lib/workerbeats/start-beats');

printFormattedHeapSizeLimit();

const workerType = require('./job-runner/worker-type');
const { JobTypes } = require('../frontend/utils/enumV2');
const { JS, log } = require('../common/lib/util/log');
const jobsConfiguration = require('./jobs/jobs-configurations');
const jobsScripts = require('./jobs/jobs-scripts');
const Consumer = require('../common/lib/mq/workers/consumer');
const jobHandler = require('./jobs/job-handler');
const nuxtRender = require('../common/lib/garagescore/contact/render');

// define job per workers and their script
const jobsPerWorker = {};

// Ceres is the all purpose job runner
jobsPerWorker[workerType.CERES] = [
  JobTypes.TEST_RATING_UPDATED,
  // Datas
  JobTypes.SEND_AUTOMATIC_REPLY,
  // Lead & unsatisfied tickets
  JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET,
  JobTypes.CLOSE_EXPIRED_LEAD_TICKET,
  JobTypes.SEND_UNSATISFIED_FOLLOWUP,
  JobTypes.POSSIBLE_SUCCESS_ALERT,
  JobTypes.SEND_LEAD_FOLLOWUP,
  JobTypes.ESCALATE,
  JobTypes.UPDATE_UNSATISFIED_DELAY_STATUS,
  // XLeads
  JobTypes.CROSS_LEADS_INCOMING_CALL,
  JobTypes.CROSS_LEADS_INCOMING_EMAIL,
  JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER,
  // Automation
  JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER,
  JobTypes.AUTOMATION_CREATE_TICKET,
  JobTypes.AUTOMATION_RESET_PRESSURE,
  JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
  JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION,
  JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER,
  // Misc
  JobTypes.SHORT_URL_REFRESH,
  JobTypes.CLEAN_EXPORT,
  JobTypes.EXTERNAL_API,
];

// Vesta is specialized in contacts
jobsPerWorker[workerType.VESTA] = [
  JobTypes.MAILGUN_EVENT,
  JobTypes.SEND_CONTACT_HIGH_PRIORITY,
  JobTypes.SEND_CONTACT_MEDIUM_PRIORITY,
  JobTypes.SEND_CONTACT_LOW_PRIORITY,
];

// Pallas manages the exports
jobsPerWorker[workerType.PALLAS] = [JobTypes.START_EXPORT];

// start listening to a queue and consume message
const startListening = async (queueName, script, type, requestsPerMinute = 60) => {
  log.info(JS, `Start listening ${queueName} at ${requestsPerMinute} mpm`);
  const consumer = new Consumer(queueName, requestsPerMinute);
  const handler = await jobHandler(queueName, script, `${type} WORKER`);
  await consumer.start(handler);
};

// main function
async function main(type) {
  if (!workerType.hasValue(type)) {
    console.log(`worker type argument (${type}) invalid or missing (${workerType.keys()})`);
    process.exit(1);
  }
  await startBeats(type);
  if (type === workerType.VESTA) {
    // We want to render contacts with VESTA
    await nuxtRender.setWorkersMode();
  }
  // start a job processor
  const startProcessing = async function (job) {
    const { queue, requestsPerMinute } = jobsConfiguration(job);
    const script = jobsScripts(job);
    await startListening(queue, script, type, requestsPerMinute);
  };
  const jobsWaiting = jobsPerWorker[type];
  for (const job of jobsWaiting) {
    try {
      log.info(JS, `Started runner ${job}`);
      await startProcessing(job);
    } catch (e) {
      log.error(JS, `startProcessing(${job}) error`, e);
      process.exit();
    }
  }
}
if (require.main === module) {
  main(process.argv && process.argv.length > 2 && process.argv[2]);
} else {
  module.exports = main;
}
