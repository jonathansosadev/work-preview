// Test if a a report should have been sent
const configurations = require('../../../common/lib/garagescore/report/configuration');

const args = process.argv.slice(2);
if (args.length !== 3) {
  console.log('Usage: test-reports.js userEmail reportConfigId date(DD/MM/YYYY)');
  console.log('date must be written as DD/MM/YYYY');
  console.log('reportConfigId must be one of the following:');
  console.log(configurations.keys());
  process.exit();
}
const app = require('../../../server/server');
const userEmail = args[0];
const reportConfigId = args[1];
const date = args[0];
app.on('booted', async () => {
  app.models.Report.testReport(userEmail, reportConfigId, date, (err, res) => {
    if (err) {
      console.error(err);
      process.exit();
    }
    console.log(res);
    process.exit();
  });
});
