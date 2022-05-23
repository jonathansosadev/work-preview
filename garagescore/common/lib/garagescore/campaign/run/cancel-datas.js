var debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:cancel-datas'); // eslint-disable-line max-len,no-unused-vars
const app = require('../../../../../server/server.js');

/*
 * Complete all Campaigns datas
 */
function cancelData(callback) {
  this.modelInstances.campaign.datas(async function (e, datas) {
    if (e) {
      debug(e);
      callback();
      return;
    }
    if (datas.length === 0) {
      debug('No datas to cancel');
      callback();
      return;
    }
    for (const data of datas) {
      try {
        await data.campaign_cancel();
      } catch (e) {
        console.error('Error cancel data: ' + data.getId().toString() + ' ' + e.message);
      }
    }
    await app.models.Customer.removeDatas(datas.map((d) => d.getId()));
    callback();
  });
}

module.exports = cancelData;
