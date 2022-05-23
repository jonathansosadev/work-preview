'use strict';
/** Sometimes (for example when SG fails), some campaign stays in a Waiting state
  Excecute this script to check every Waiting campaigns if run them again if possible
*/
var app = require('../../../server/server');
var Campaign = app.models.Campaign;
var gsCampaignStatus = require('../../../common/models/campaign.status');
var status = gsCampaignStatus.STARTING;

Campaign.count({ status: status }, function (countErr, count) {
  if (countErr) {
    console.error(countErr);
  }
  console.log('[Campaigns fix Waiting] Start (' + count + " campaign(s) with status = '" + status + "')");
  var task = '[Campaigns fix Waiting] Time to start ' + count + ' campaign(s)';
  console.time(task);
  Campaign.updateToNewAndRestartAll(status, function (err, ok, ko) {
    console.timeEnd(task);
    if (err) {
      console.error('[Campaigns fix Waiting] Error');
      console.error(err);
    }
    console.log('[Campaigns fix Waiting] Done');
    console.log('[Campaigns fix Waiting] Campaigns OK ' + ok);
    console.log('[Campaigns fix Waiting] Campaigns KO ' + ko);
    process.exit();
  });
});
