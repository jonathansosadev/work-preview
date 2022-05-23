var debug = require('debug')('garagescore:common:lib:garagescore:campaign:complete:complete-datas'); // eslint-disable-line max-len,no-unused-vars
var async = require('async');

/*
 * Complete all Campaigns datas
 */
function completeData(callback) {
  this.modelInstances.campaign.datas(function (e, datas) {
    if (e) {
      debug(e);
      callback();
      return;
    }
    if (datas.length === 0) {
      debug('No datas to complete');
      callback();
      return;
    }
    async.eachSeries(
      datas,
      function (data, next) {
        data.campaign_complete(function (errorComplete) {
          if (errorComplete) {
            console.error('Error complete data: ' + data.getId().toString() + ' ' + errorComplete.message);
          }
          // we continue anyways
          next();
        });
      },
      callback
    );
  });
}

module.exports = completeData;
