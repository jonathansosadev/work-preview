var gsCampaignStatus = require('../../../../models/campaign.status');
var async = require('async');
var emitEvent = require('../run/emit-campaign-model-event');
var setCompletedAt = require('../run/set-completed-at');

module.exports = function completeCampaign(campaignId, callback) {
  var context = { modelInstances: {}, campaignId: campaignId.toString() };
  async.series(
    [
      require('../run/get-campaign-model-instance').bind(context),
      require('../run/ensure-campaign-model-instance-valid-to-complete').bind(context),
      require('../run/complete-datas').bind(context),
      require('../run/update-campaign-model-instance-status').bind(context, gsCampaignStatus.COMPLETE),
      setCompletedAt.bind(context, new Date()),
      emitEvent.bind(context, 'complete', {}),
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
        emitEvent.bind(context)('complete.failure', { error: err.message }, callback.bind(null, e));
      }
    }
  );
};
