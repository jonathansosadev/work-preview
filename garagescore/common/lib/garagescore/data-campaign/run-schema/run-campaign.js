const campaignStatus = require('../../../../models/data/type/campaign-status');
const ensure = require('../run/ensure-data-model-instance-valid-to-run');
const updateStatus = require('../run/update-data-model-instance-status');
const emitEvent = require('../run/emit-data-model-event');
const createSurvey = require('../run/create-survey');
const runEvents = require('../run/run-events');
const setCurrentRunEvent = require('../run/set-current-run-event');
const handleCurrentRunEvent = require('../run/handle-current-run-event');
const setRecontactDate = require('../run/set-recontact-date');
const async = require('async');

let garageCached = null;
let garageCachedId = null;
function injectGarageInContext(callback) {
  const cacheKey = this.modelInstances.data.get('garageId').toString();
  if (garageCachedId && garageCachedId === cacheKey) {
    this.modelInstances.garage = garageCached;
    callback();
  } else {
    this.modelInstances.data.garage((err, garage) => {
      this.modelInstances.garage = garage;
      garageCached = garage;
      garageCachedId = garage && garage.id.toString();
      callback(err);
    });
  }
}

module.exports = (campaign, data, options, done) => {
  const context = { dataId: data.getId().toString(), modelInstances: { data, campaign } };
  context.retry = done && options.retry;
  const callback = done || options; // 2 or 3 args given
  async.series(
    [
      ensure.bind(context),
      updateStatus.bind(context, campaignStatus.RUNNING),
      emitEvent.bind(context, 'run', {}),
      injectGarageInContext.bind(context),
      createSurvey.bind(context),
      setRecontactDate.bind(context),
      emitEvent.bind(context, 'survey.created', {}),
      setCurrentRunEvent.bind(context, runEvents.CAMPAIGN_STARTED),
      handleCurrentRunEvent.bind(context),
    ],
    (err) => {
      if (!err) {
        callback();
        return;
      }
      const e = new Error(err.message);
      if (!context.modelInstances.data) {
        callback(e);
      } else {
        emitEvent.bind(context)('run.failure', { error: err.message }, callback.bind(null, e));
      }
    }
  );
};
