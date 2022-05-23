const { ExternalApi } = require('../../../frontend/utils/enumV2');
const { sendLeadToSalesforce } = require('./export-leads-to-salesforce');
const { exportLeadToSelectup } = require('./export-leads-to-selectup');
const { sendLeadByEmail } = require('./export-leads-to-mbparis');

module.exports = async (job) => {
  switch (job.payload.externalApi) {
    case ExternalApi.SALESFORCE:
      await sendLeadToSalesforce(job);
      break;
    case ExternalApi.SELECTUP:
      await exportLeadToSelectup(job);
      break;
    case ExternalApi.DAIMLER:
      await sendLeadByEmail(job);
      break;
    default:
      throw new Error(`EXTERNAL API :: ${job.payload.externalApi} is invalid, check: _id: "${job._id}"`);
  }
};
