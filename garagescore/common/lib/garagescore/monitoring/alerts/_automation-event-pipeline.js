/** Used to count an eventType during the last days */
const timeHelper = require('../../../util/time-helper');
const today = timeHelper.todayDayNumber();
module.exports = (daysCount, eventType) => {
  const $match = { type: eventType, eventDay: { $gte: today - daysCount } };
  return [
    { $match },
    {
      $group: {
        _id: null,
        count: { $sum: '$nsamples' },
        countDesktop: { $sum: '$nsamplesDesktop' },
        countMobile: { $sum: '$nsamplesMobile' },
      },
    },
  ];
};
