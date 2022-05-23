/**
 * Start waiting jobs
 * Create new rabbitmq messages for each waiting jobs in databasewith a scheduled date < now
 */
require('dotenv').config({ silent: true });
const scheduler = require('../common/lib/garagescore/scheduler/scheduler');
const { log, JS } = require('../common/lib/util/log');
const startBeats = require('../common/lib/workerbeats/start-beats');
const app = require('../server/server');

function _millisecondsLeftUntilNextMinute() {
  return 60000 - (Date.now() % 60000);
}
// infinite loop
async function loop() {
  let jobsStillRemaining = false;
  try {
    jobsStillRemaining = await scheduler.startWaitingJobs(100);
  } catch (e) {
    console.error(JS, e);
  }
  if (jobsStillRemaining) {
    setTimeout(loop, 0);
  } else {
    setTimeout(loop, _millisecondsLeftUntilNextMinute());
  }
}
// main function
async function main() {
  log.info(JS, 'Starting main loop of job scheduler');
  app.on('booted', loop);
  await startBeats('scheduler');
}
if (require.main === module) {
  main();
} else {
  module.exports = main;
}
