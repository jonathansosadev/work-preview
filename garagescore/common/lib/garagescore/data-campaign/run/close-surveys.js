const { JobTypes } = require('../../../../../frontend/utils/enumV2');
const Scheduler = require('../../scheduler/scheduler.js');

/** Close surveys when a campaign is complete or canceled */
async function closeSurveys(callback) {
  const data = this.modelInstances.data;
  await Scheduler.upsertJob(
    JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION,
    { dataId: data.getId().toString() },
    new Date()
  );
  data.set('survey.acceptNewResponses', false);
  data.set('surveyFollowupUnsatisfied.acceptNewResponses', false);
  data.set('surveyFollowupLead.acceptNewResponses', false);
  data.save(callback);
}

module.exports = closeSurveys;
