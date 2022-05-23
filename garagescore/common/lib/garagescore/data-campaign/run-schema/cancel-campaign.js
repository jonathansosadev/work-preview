const campaignStatus = require('../../../../models/data/type/campaign-status');
const ensure = require('../run/ensure-data-model-instance-valid-to-cancel');
const cancelNextContact = require('../run/cancel-next-contact');
const closeSurveys = require('../run/close-surveys');
const updateStatus = require('../run/update-data-model-instance-status');
const updateShouldSurfaceInStatistics = require('../run/update-data-model-instance-shouldSurfaceInStatistics');
const cancelAutomaticReplyJob = require('../run/cancel-automatic-reply-job');

const async = require('async');

module.exports = (data, callback) => {
  const context = { dataId: data.getId().toString(), modelInstances: { data } };
  async.series(
    [
      ensure.bind(context),
      cancelNextContact.bind(context),
      closeSurveys.bind(context),
      updateStatus.bind(context, campaignStatus.CANCELLED),
      updateShouldSurfaceInStatistics.bind(context, false),
      cancelAutomaticReplyJob.bind(context),
    ],
    (err) => {
      const e = err ? new Error(err.message) : null;
      callback(e);
    }
  );
};
