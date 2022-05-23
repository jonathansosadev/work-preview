var debug = require('debug')('garagescore:common:lib:garagescore:campaign:run:delete-datas'); // eslint-disable-line max-len,no-unused-vars
const app = require('../../../../../server/server.js');

/*
 * delete all Campaign datas
 */
function deleteData(callback) {
  this.modelInstances.campaign.datas(async function (e, datas) {
    if (e) {
      debug(e);
      callback();
      return;
    }
    if (datas.length === 0) {
      debug('No datas to delete');
      callback();
      return;
    }
    for (const data of datas) {
      try {
        await data.destroy();
      } catch (e) {
        console.error('Error deleting data: ' + data.getId().toString() + ' ' + e.message);
      }
    }
    await app.models.Customer.removeDatas(datas.map((d) => d.getId()));
    callback();
  });
}

module.exports = deleteData;
