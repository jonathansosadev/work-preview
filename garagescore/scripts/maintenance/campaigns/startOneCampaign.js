'use strict';

/**
Run only one waiting campaign(s)
If no args is provided the first campaign with 'New' status will be run
else with the status = first arg
the second arg allow to specify the campaignId, wihtout it a random campaign is run
*/

var app = require('../../../server/server');
var Campaign = app.models.Campaign;
var gsCampaignStatus = require('../../../common/models/campaign.status');
var status = process.argv.length >= 3 ? process.argv[2] : gsCampaignStatus.NEW;
var query = { status: status };
if (process.argv.length >= 4) {
  query.id = process.argv[3];
}
Campaign.count(query, function (countErr, count) {
  if (countErr) {
    console.error(countErr);
  }
  console.log('[Campaign start] ' + count + ' waiting campaign(s)');
  if (count === 0) {
    process.exit();
    return;
  }
  console.log('[Campaign start] Start 1 campaign ' + (query.id || ''));
  var task = '[Campaign start] Time to start 1 campaign';
  console.time(task);
  var f = function (cb) {
    if (query.id) {
      Campaign.startOne(status, query.id, cb);
    } else {
      Campaign.startOne(status, cb);
    }
  };
  f(function (err) {
    console.timeEnd(task);
    if (err) {
      console.error('[Campaign start] Error');
      console.error(err);
    }
    console.log('[Campaign start] Done');
    process.exit();
  });
});
