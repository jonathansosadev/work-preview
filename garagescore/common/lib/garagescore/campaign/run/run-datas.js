var debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:run-datas'); // eslint-disable-line max-len,no-unused-vars
var async = require('async');

/*
 * Run all Campaigns datas
 */
function runData(callback) {
  var campaign = this.modelInstances.campaign;
  campaign.datas(function (e, datas) {
    if (e) {
      console.error(e);
      callback();
      return;
    }
    if (datas.length === 0) {
      console.error('No datas to run');
      callback();
      return;
    }
    async.eachSeries(
      datas,
      function (data, next) {
        data.campaign_run(campaign, false, function (errorRun) {
          if (errorRun) {
            console.error('Error run data: ' + data.getId().toString() + ' ' + errorRun.message);
          }
          // we continue anyways
          next();
        });
      },
      callback
    );
  });
}

module.exports = runData;
