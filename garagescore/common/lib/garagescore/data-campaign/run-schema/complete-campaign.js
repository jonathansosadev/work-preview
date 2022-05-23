const campaignStatus = require('../../../../models/data/type/campaign-status');
const ensure = require('../run/ensure-data-model-instance-valid-to-complete');
const updateStatus = require('../run/update-data-model-instance-status');
const emitEvent = require('../run/emit-data-model-event');
const cancelNextContact = require('../run/cancel-next-contact');
const closeSurveys = require('../run/close-surveys');
const async = require('async');

module.exports = (data, callback) => {
  const context = { dataId: data.getId().toString(), modelInstances: { data } };
  async.series(
    [
      ensure.bind(context),
      cancelNextContact.bind(context),
      closeSurveys.bind(context),
      updateStatus.bind(context, campaignStatus.COMPLETE),
      emitEvent.bind(context, 'complete', {}),
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
        emitEvent.bind(context)('cancel.failure', { error: err.message }, callback.bind(null, e));
      }
    }
  );
};
