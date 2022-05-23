/*
 * Update shouldSurfaceInStatistics of Campaign
 */
const { cancelAutomaticReplyJob } = require('../../../../models/data/data-methods');

function cancelAutomaticReplyJob_(callback) {
  const data = this.modelInstances.data;
  cancelAutomaticReplyJob(data).then(callback);
}

module.exports = cancelAutomaticReplyJob_;
