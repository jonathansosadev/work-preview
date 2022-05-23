/** Run this if you want to try a script */
const app = require('../../../server/server');

const jobId =
  (process.argv.length > 2 && process.argv[2]) || 'SEND_CONTACT_HIGH_PRIORITY_076da6f12bae8ab5061dfacf925c372d4ca06e26';
const scriptFile = (process.argv.length > 3 && process.argv[3]) || 'send-contact';
app.on('booted', async () => {
  try {
    const j = await app.models.Job.getMongoConnector().findOne({ _id: jobId });
    if (!j) {
      throw new Error(jobId + ' unknown');
    }
    const job = new app.models.Job(j);
    const script = require('./' + scriptFile);
    await script(job);
    console.log(job);
  } catch (e) {
    console.error(e);
  }
  process.exit();
});
