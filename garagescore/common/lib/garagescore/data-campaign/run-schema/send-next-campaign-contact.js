const emitEvent = require('../run/emit-data-model-event');
const ensure = require('../run/ensure-data-model-instance-valid-to-send-next-campaign-contact');
const sendNextContact = require('../run/send-next-contact');
const async = require('async');

/** Send the current contact in nextCampaignContact */
module.exports = (data, callback) => {
  const context = { modelInstances: { data }, dataId: data.getId().toString() };
  async.series([ensure.bind(context), sendNextContact.bind(context)], (err) => {
    if (!err) {
      callback();
      return;
    }
    const e = new Error(err.message);
    console.log(err.message);
    if (!context.modelInstances.data) {
      callback(e);
    } else {
      emitEvent.bind(context)('sendnextcontact.failure', { error: err.message }, callback.bind(null, e));
    }
  });
};
