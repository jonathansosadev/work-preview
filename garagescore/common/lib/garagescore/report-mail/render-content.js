/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const ReportConfigs = require('../../../../common/lib/garagescore/report/configuration');
const nunjucksReportTools = require('../../../../common/lib/garagescore/report/nunjucks-tools');
const gsIDEncryption = require('../../../../common/lib/util/public-link-encrypted-id');
const app = require('../../../../server/server');

const getReportPayload = async function getReportPayload(contact) {
  if (!contact || !contact.payload || !contact.payload.reportId) return {};
  const report = await app.models.Report.findById(contact.payload.reportId.toString());
  let locale = null;
  let timezone = null;
  let firstGarageDisplayName = null;
  const garageIds = report.garageIds || [];
  if (Array.isArray(garageIds) && garageIds[0]) {
    const firstGarage = await app.models.Garage.findById(garageIds[0].toString(), {
      projection: { locale: true, timezone: true, publicDisplayName: true },
    });
    locale = (firstGarage && firstGarage.locale) || null;
    timezone = (firstGarage && firstGarage.timezone) || null;
    firstGarageDisplayName = (firstGarage && firstGarage.publicDisplayName) || null;
  }
  report.reportPublicToken = gsIDEncryption.encrypt(report.getId());
  return {
    report,
    reportConfig: ReportConfigs.get(report.reportConfigId),
    getDisplayablePeriod: nunjucksReportTools.getDisplayablePeriod,
    locale,
    timezone,
    firstGarageDisplayName,
  };
};

module.exports = {
  getReportPayload,
};
