const app = require('../../../../server/server');
const reportConfigs = require('./configuration');

const generateReportsData = async (user, reportId, referenceDate) => {
  if (
    !user.reportConfigs ||
    !user.reportConfigs[reportId] ||
    !user.reportConfigs[reportId].enable ||
    !reportConfigs.get(reportId)
  ) {
    throw new Error(`User ${user.id} is not configured to receive ${reportId} report or report not found`);
  }
  const reportConfig = reportConfigs.get(reportId);

  const { garageIds } = user;
  if (!garageIds.length) {
    throw new Error("Coudn't send an empty report (the report have no associated garage)");
  }
  const garageHistories = await Promise.all(
    garageIds.map((gId) =>
      app.models.GarageHistory.generateForPeriod(
        reportConfig.tokenDate(referenceDate),
        gId,
        false,
        true,
        false,
        'ALL_USERS',
        true
      )
    )
  );

  if (!garageHistories) {
    throw new Error('No garageHistories found !');
  }

  const overallHistory = app.models.GarageHistory.aggregate(garageHistories);
  if (!overallHistory.countShouldReceiveSurveys) {
    throw new Error("The report is empty and its data coudn't be generated (the subscribed garages has no history)");
  }
  return garageHistories;
};

module.exports = {
  generateReportsData,
};
