
/** Run this if you want to try a script */
const app = require('../../../server/server');

const jobId = 'UPDATE_UNSATISFIED_DELAY_STATUS_c2bb6efbecd9df7c4c8f1752164db06da0f0ce05';

app.on('booted', async () => {
  try {
    
    const j = await app.models.Job.getMongoConnector().findOne({ _id: jobId });
    if (!j) {
      throw new Error(jobId + ' unknown');
    }
    const job = new app.models.Job(j);
    const script = require('./update-unsatisfied-delay-status');
    await script(job);
    console.log(job);
  } catch (e) {
    console.error(e);
  }
  process.exit();
});