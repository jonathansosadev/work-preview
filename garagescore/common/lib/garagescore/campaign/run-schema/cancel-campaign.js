var gsCampaignStatus = require('../../../../models/campaign.status');
var async = require('async');
var setCompletedAt = require('../run/set-completed-at');

module.exports = function cancelCampaign(campaignId, callback) {
  var context = { modelInstances: {}, campaignId: campaignId.toString() };
  async.series(
    [
      require('../run/get-campaign-model-instance').bind(context),
      require('../run/ensure-campaign-model-instance-valid-to-cancel').bind(context),
      require('../run/cancel-datas').bind(context),
      require('../run/update-campaign-model-instance-status').bind(context, gsCampaignStatus.CANCELLED),
      require('../run/update-campaign-model-instance-shouldSurfaceInStatistics').bind(context, false),
      require('../run/cancel-automatic-reply-job').bind(context),
      setCompletedAt.bind(context, new Date()),
    ],
    function (err) {
      var e = err ? new Error(err.message) : null;
      callback(e);
    }
  );
};
