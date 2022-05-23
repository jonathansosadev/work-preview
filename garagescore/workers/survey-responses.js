const app = require('../server/server');
const responsesQueue = require('../common/lib/garagescore/survey/responses-queue');
const startBeats = require('../common/lib/workerbeats/start-beats');
/**
 * Parse the survey responses
 * Done in a rush, todo: survey responses should be handled in a "worker way"
 */
async function main() {
  console.log('survey');
  app.on('booted', async () => {
    await responsesQueue.startListening(app);
    await startBeats('surveyresponses');
  });
}
if (require.main === module) {
  main();
} else {
  module.exports = main;
}
