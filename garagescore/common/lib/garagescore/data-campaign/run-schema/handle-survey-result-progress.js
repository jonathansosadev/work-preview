const emitEvent = require('../run/emit-data-model-event');
const scheduleCheckSurveyUpdates = require('../run/schedule-check-survey-updates');
const async = require('async');
/**
At every update we wait a litlle bit to see if the user still change the results and then we handle the update
*/
module.exports = (data, callback) => {
  const context = { modelInstances: { data }, dataId: data.getId().toString() };
  async.series([scheduleCheckSurveyUpdates.bind(context)], (err) => {
    if (!err) {
      callback();
      return;
    }
    const e = new Error(err.message);
    if (!context.modelInstances.data) {
      callback(e);
    } else {
      emitEvent.bind(context)('handlesurveyprogress.failure', { error: err.message }, callback.bind(null, e));
    }
  });
};
