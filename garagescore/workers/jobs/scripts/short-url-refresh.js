const app = require('../../../server/server');
const { JobTypes } = require('../../../frontend/utils/enumV2');
const timeHelper = require('../../../common/lib/util/time-helper');
const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');

/**
 * Refresh short urls
 */
module.exports = async (job) => {
  try {
    const dayNumberTommorow = timeHelper.dayNumber(new Date()) + 1;
    const dayAndHourTommorow = timeHelper.dayNumberToDate(dayNumberTommorow);
    dayAndHourTommorow.setHours(6);
    await Scheduler.upsertJob(JobTypes.SHORT_URL_REFRESH, { dayNumber: dayNumberTommorow }, dayAndHourTommorow);
    await app.models.ShortUrl.refill();
    await app.models.ShortUrl.clean(dayNumberTommorow - 1);
  } catch (e) {
    throw e;
  }
};
