/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const app = require('../../../../server/server');
const garageStatuses = require('../../../models/garage.status');
const { getUserGarages } = require('../../../models/user/user-mongo');
const gsClient = require('../client');

const getMonthlySummarySmsPayload = async (contact) => {
  let report;
  try {
    // time(ANASS, 'Generate MonthlySummaryEmail');
    if (contact.payload.reportId === 'TEST_MONTHLY') {
      // For DarkBO's preview, we'll take any available monthly summary
      report = await app.models.Report.findOne({ where: { reportConfigId: 'monthlySummary' } });
    } else {
      report = await app.models.Report.findById(contact.payload.reportId);
    }
    const garagesWhere = { status: { $in: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL] } };
    const garagesFields = { locale: true, timezone: true, status: true };
    const reportUser = await app.models.User.findById(report.userId);
    const garageList = await getUserGarages(app, reportUser.getId(), garagesFields, [{ $match: garagesWhere }]);
    const reportLink = `${gsClient.appUrl()}${gsClient.url.getShortUrl('MONTLHY_SUMMARY')}/${contact.payload.reportId}`;
    let shortUrl = await app.models.ShortUrl.findOne({ where: { redirectLocation: reportLink } });
    if (!shortUrl) shortUrl = await app.models.ShortUrl.getShortUrl(reportLink, 90);

    return {
      month: report.month,
      year: report.year,
      firstName: reportUser.firstName,
      nGarages: garageList.length,
      shortUrl: (shortUrl && shortUrl.url) || reportLink, // Using the summary's "long" url so as not to let the user without solution
      locale: contact.payload.locale || (garageList && garageList[0] && garageList[0].locale) || null,
      timezone: contact.payload.timezone || (garageList && garageList[0] && garageList[0].timezone) || null,
    };
  } catch (e) {
    return null;
  }
};

module.exports = {
  getMonthlySummarySmsPayload,
};
