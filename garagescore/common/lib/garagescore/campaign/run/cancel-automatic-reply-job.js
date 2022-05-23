const { cancelAutomaticReplyJob } = require('../../../../models/data/data-methods');
const { ANASS, log } = require('../../../util/log');

/*
 * Complete all Automatic reply job for datas of a given campaign
 * Perfomance-wise it would be more opti to perform it at the same time as cancel-datas
 * But, we won't cancel campaigns often, so for the sake of clarity, separate file
 */
function cancelAutomaticReplyJob_(callback) {
  this.modelInstances.campaign.datas(async (e, datas) => {
    if (e) {
      log.warn(ANASS, e);
      callback();
      return;
    }
    if (datas.length === 0) {
      log.warn(ANASS, 'No datas to cancel');
      callback();
      return;
    }
    await Promise.allSettled(datas.map(cancelAutomaticReplyJob));
    callback();
  });
}

module.exports = cancelAutomaticReplyJob_;
