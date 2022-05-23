var async = require('async');

module.exports = function deleteCampaign(campaignId, callback) {
  var context = { modelInstances: {}, campaignId: campaignId.toString() };
  async.series(
    [
      require('../run/get-campaign-model-instance').bind(context),
      require('../run/ensure-campaign-model-instance-valid-to-delete').bind(context),
      require('../run/delete-datas').bind(context),
      require('../run/delete-campaign-model-instance').bind(context),
    ],
    function (err) {
      var e = err ? new Error(err.message) : null;
      callback(e);
    }
  );
};
