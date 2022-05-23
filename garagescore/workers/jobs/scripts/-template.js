/** A template to create new job processors
 * To make it work, you will also need to add a new configuration in workers/jobs/jobs-configurations
 */
// const app = require('../../../server/server'); // Uncomment if you need app

module.exports = async (job) => {
  const { arg1, arg2 } = job.payload;
  console.log(`Processing ${JSON.stringify(job)}`);
  // returning an exception will set the process as failed
};
