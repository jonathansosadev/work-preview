var app = require('../../server/server');
var StreamWrapper = require('../../common/lib/stream/stream-wrapper');
var scanf = require('../../node_modules/scanf');

console.log('[export-mail-campaignItems] Process ' + Date.now());
console.log('[export-mail-campaignItems] Starting ');

/**
 export mail of 2017 from campaignItems
*/

/**
 * [getStats get the stats of the daynumber and show them]
 * @param  {[int]}   dayNumber [daynumber of the stat]
 * @param  {Function} callback  [next stat]
 * @return {[type]}             [description]
 */

/**
 * [mergeStats and show result]
 * @param  {[type]} stats [array of stats]
 * @return {[type]}       [void]
 */
function handleCampaignItem(campainItem, callback) {
  if (campainItem.addressee && campainItem.addressee.contactChannel) {
    var contactChannel = campainItem.addressee.contactChannel;
    if (contactChannel.email && contactChannel.email.address) {
      console.log(contactChannel.email.address);
    }
  }
  callback();
}

function convertArrayToDate(arr) {
  return new Date(arr[2], arr[1] - 1, arr[0], 0, 0, 0, 0);
}

/**
 * Get mail in campaignItem created in 2017
 */
function getMails(callback) {
  console.log('Entrez la date de début (jj/mm/aaaa) : ');
  var startDate = convertArrayToDate(scanf('%d/%d/%d'));

  console.log('Entrez la date de fin (jj/mm/aaaa) : ');
  var endDate = convertArrayToDate(scanf('%d/%d/%d'));

  const searchObject = {
    where: {
      and: [{ createdAt: { gte: startDate } }, { createdAt: { lte: endDate } }],
    },
  };

  console.log('__________________________________________');
  console.log('GETTING CAMPAIGN ITEMS MAILS');
  console.log('FROM : ' + startDate.toString());
  console.log('TO : ' + endDate.toString());
  console.log('__________________________________________');

  var optionsFind = {
    model: app.models.CampaignItem,

    onWrite: (result, enc, next) => {
      handleCampaignItem(result, next);
    },
    onErr: (err) => {
      console.log(err);
      callback();
    },
    onFinish: () => {
      callback();
    },
  };

  var streamWrapper = new StreamWrapper(optionsFind);
  streamWrapper.find(searchObject);
}

/**
 * [endScript quit the script...]
 * @return {[type]} [description]
 */
function endScript() {
  process.exit(0);
}

app.on('booted', () => {
  getMails(endScript);
});
