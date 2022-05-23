var gsCampaignStatus = require('../../../../models/campaign.status');
var async = require('async');
var emitEvent = require('../run/emit-campaign-model-event');
var updateStatus = require('../run/update-campaign-model-instance-status');
var setCompleteScheduledAt = require('../run/set-complete-scheduled-at');
var setCompletedAt = require('../run/set-completed-at');

module.exports = function runCampaign(campaignId, callback) {
  var context = { modelInstances: {}, campaignId: campaignId.toString() };
  async.series(
    [
      require('../run/get-campaign-model-instance').bind(context),
      require('../run/ensure-campaign-model-instance-valid-to-run').bind(context),
      updateStatus.bind(context, gsCampaignStatus.STARTING),
      emitEvent.bind(context, 'start', {}),
      setCompleteScheduledAt.bind(context),
      setCompletedAt.bind(context, null),
      require('../run/run-datas').bind(context),
      updateStatus.bind(context, gsCampaignStatus.RUNNING),
      emitEvent.bind(context, 'run', {}),
    ],
    function (err) {
      if (!err) {
        callback();
        return;
      }
      var e = new Error(err.message);
      if (!context.modelInstances.campaign) {
        callback(e);
      } else {
        emitEvent.bind(context)('run.failure', { error: err.message }, callback.bind(null, e));
      }
    }
  );
};
