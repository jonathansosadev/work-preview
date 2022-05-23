/**
 * That's going to be hell of a migration
 * We have to migrate all datas with a lead or unsatisfiedTicket
 * Of course we can't do them all
 * My strategy : => limit to periods available on cockpit to this day and excluding data from the 500th page
 * That gives us max: 5000 docs to migrate per period
 */
const app = require('../../../server/server');
const timeHelper = require('../../../common/lib/util/time-helper');
const GarageHistoryPeriod = require('../../../common/models/garage-history.period');
const { setReferenceDateForPeriod } = require('./set-tickets-referenceDate');
const { ANASS, time, timeEnd, log } = require('../../../common/lib/util/log');

app.on('booted', async () => {
  // Get available periods in cockpit
  const BATCH_SIZE = 5000;
  const availablePeriods = GarageHistoryPeriod.getCockpitAvailablePeriods(new Date(0)).filter(
    ({ id }) => id === 'ALL_HISTORY'
  );
  // .filter(({ id }) => !['ALL_HISTORY', 'CURRENT_YEAR', '2020', '2020-quarter4'].includes(id));
  // For each period, pray & launch
  try {
    for (const { id, minDate, maxDate } of availablePeriods) {
      time(ANASS, `Migrate ticket referenceDate for period: ${id}`);
      const minDay = timeHelper.dayNumber(minDate);
      const maxDay = timeHelper.dayNumber(maxDate);
      const options = { minDay, maxDay, batchSize: BATCH_SIZE };
      const { nLeadTicketsModified, nUnsatisfiedTicketsModified } = await setReferenceDateForPeriod(app, options);

      const loggedInfo = `Modified ${nLeadTicketsModified} leadTickets and ${nUnsatisfiedTicketsModified} unsatisfiedTickets`;
      log.info(ANASS, loggedInfo);
      timeEnd(ANASS, `Migrate ticket referenceDate for period: ${id}`);
    }
  } catch (err) {
    log.error(ANASS, err);
    process.exit(500);
  }
  log.info(ANASS, "Thank god reactor n°4 didn't explode today");
  process.exit(0);
});
