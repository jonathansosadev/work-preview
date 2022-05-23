const {initDirectMongoConnectors} = require('../../server/webservers-standalones/api/_common/monthlySummary/index');
const gqlScript = require('../../server/webservers-standalones/api/_common/monthlySummary/helpers/util');

const app = require('../../server/server');

app.on('booted', async () => {
  initDirectMongoConnectors({ app });
  const garageList = await gqlScript.getGargagesListFromReportId({ app }, '5c628ea3338a30e92f054016');
  console.log('Got list of garages');
  const reportYearMonth = await gqlScript.getPeriodFromReportId({ app }, '5c628ea3338a30e92f054016');
  const periods = gqlScript.getPeriods(...reportYearMonth);
  console.log('Got periods');
  const data = await gqlScript.calculateKpiForGivenPeriod(garageList, periods);
  console.log(JSON.stringify(data, null, 2));
});
