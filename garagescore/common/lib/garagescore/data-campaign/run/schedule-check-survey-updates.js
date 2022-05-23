/**
Schedule for later a check of the survey updates */

const timeHelper = require('../../../util/time-helper');

function scheduleCheckSurveyUpdates(callback) {
  const data = this.modelInstances.data;
  const nextDate = timeHelper.decaMinutesAfterNow(3); // TODO temporary must be set to +4
  data.set('campaign.contactScenario.nextCheckSurveyUpdatesDecaminute', nextDate);
  data.save(callback);
}
module.exports = scheduleCheckSurveyUpdates;
