const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const timeHelper = require('../../../common/lib/util/time-helper');
const common = require('./common');

/** garages with shareReviews: true and still plugged */
const sharedReviewsGarages = async function (req, res) {
  const appId = req.query.appId;
  let country = null;
  if (req.query.localeCode) country = req.query.localeCode.split(',');
  try {
    const garages = await gsAPI.sharedReviewsGarages(appId, country)
    res.json(garages);
  } catch (err) {
    common.apiError(res, errAPI);
    console.error(errAPI);
    return;
  }


};

/** reviews to delete because their garage don't share theirs reviews anymore */
const sharedReviewsAllGarageReviewsToDelete = async function (req, res) {
  const appId = req.query.appId;
  const minDayNumber = req.query.minDayNumber;
  const maxDayNumber = req.query.maxDayNumber;
  const minDate = timeHelper.dayNumberToDate(minDayNumber);
  const maxDate = timeHelper.dayNumberToDate(maxDayNumber);
  let country = null;
  if (req.query.localeCode) country = req.query.localeCode.split(',');
  if (!minDayNumber || !maxDayNumber) {
    res.status(400).json({ error: 'No daynumber' });
    return;
  }
  try {
    const data = await gsAPI.sharedReviewsAllGarageReviewsToDelete(appId, minDate, maxDate, country)
    res.json(data);
  } catch (e) {
    common.apiError(res, errAPI);
    console.error(errAPI);
    return;
  }

};

/** Reviews to delete which have been moderated */
const sharedReviewsModeratedReviewsToDelete = async function (req, res) {
  const appId = req.query.appId;
  const minDayNumber = req.query.minDayNumber;
  const maxDayNumber = req.query.maxDayNumber;
  if (!minDayNumber || !maxDayNumber) {
    res.status(400).json({ error: 'No daynumber' });
    return;
  }
  const minDate = timeHelper.dayNumberToDate(minDayNumber);
  const maxDate = timeHelper.dayNumberToDate(maxDayNumber);
  try {
    const data = await gsAPI.sharedReviewsModeratedReviewsToDelete(appId, minDate, maxDate);
    res.json(data);
  } catch (err) {
    common.apiError(res, errAPI);
    console.error(errAPI);
  }
};

module.exports = {
  sharedReviewsGarages,
  sharedReviewsAllGarageReviewsToDelete,
  sharedReviewsModeratedReviewsToDelete,
};
