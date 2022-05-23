const app = require('../../server/server');
const startExport = require('../../workers/jobs/scripts/start-export');

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

app.on('booted', async () => {
  const args = process.argv.slice(2);
  const jobID = args[0];

  if (!jobID) {
    console.log('\x1b[31m', `missing required argument jobID`, '\x1b[0m');
    process.exit(1);
  }

  console.log('\x1b[33m', `[INFO] : jobID "${jobID}"`, '\x1b[0m');
  await sleep(5000);
  const mongoConnector = app.models.Job.getMongoConnector();
  try {
    const job = await mongoConnector.findOne({ _id: jobID });
    if (!job) {
      throw Error('Job not found');
    }
    console.log('\x1b[33m', `[INFO] : Job found`, '\x1b[0m');
    const workbook = await startExport(job, false);
    await workbook.csv.writeFile(`${jobID}.csv`);
    console.log('\x1b[32m', `[SUCCESS] : Done`, '\x1b[0m');
  } catch (error) {
    console.log('\x1b[31m', `[ERROR] : ${error}`, '\x1b[0m');
    process.exit(1);
  }
  process.exit(0);
});
