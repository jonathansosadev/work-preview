/** A template to create new job processors
 * Check worker/server.js to add job processor
 */
const app = require('../../../server/server');

const { FED, log } = require('../../../common/lib/util/log');
const DataTypes = require('../../../common/models/data/type/data-types.js');
const timeHelper = require('../../../common/lib/util/time-helper');

module.exports = async (job) => {
  const Scheduler = require('../../../common/lib/garagescore/scheduler/scheduler.js');
  const { JobTypes } = require('../../../frontend/utils/enumV2');
  const commonTicket = require('../../../common/models/data/_common-ticket');

  const { type, stage, dataId, nextStageDelay, alertedUser } = job.payload;
  if (!dataId) {
    log.error(FED, `escalate no dataId in ${JSON.stringify(job)}`);
    return true;
  }

  const data = await app.models.Data.findById(dataId);
  if (!data) {
    log.error(FED, `escalate no data with id ${dataId}`);
    return true;
  }

  const garage = await app.models.Garage.findOne({
    where: { id: data.garageId },
    fields: { subscriptions: 1, googlePlace: 1, timezone: 1 },
  });

  const mustEscalate = ![DataTypes.MANUAL_LEAD, DataTypes.MANUAL_UNSATISFIED, DataTypes.EXOGENOUS_REVIEW].includes(
    data.get('type')
  );
  if (mustEscalate) {
    if (commonTicket.checkEscalationConditions(data, type)) {
      await commonTicket.sendToAlertEscalationList(data, type, stage, alertedUser);
      if (nextStageDelay) {
        const hoursPerDay = 9;
        const delayInDays = Math.round(nextStageDelay / hoursPerDay); // db store the delay in hours (9 per day)
        const targetedDate = timeHelper.addDays(new Date(), delayInDays);
        await Scheduler.upsertJob(
          JobTypes.ESCALATE,
          {
            dataId: data.getId().toString(),
            type,
            stage: stage + 1,
            nextStageDelay: null,
            alertedUser,
          },
          targetedDate,
          {
            noWeekEnd: true,
            saturdayOk: type === 'lead',
            planJobAfterXHoursOfOpeningHours: {
              googleOpeningHours: (garage.googlePlace && garage.googlePlace.openingHours) || null,
              timezone: garage.timezone,
              minimumScheduledHour: 9,
            },
          }
        );
      }
    } else {
      // Data not fit anymore, skip alert
      log.info(FED, `escalate Data isn't successful anymore : ${JSON.stringify(job)}`);
    }
  } else {
    log.info(FED, `No escalation for manual datas : ${JSON.stringify(job)}`);
  }

  return true;
};
