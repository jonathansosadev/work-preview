/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const nunjucks = require('nunjucks');
const path = require('path');
const juice = require('juice');
const ContactTypes = require('../../../../common/models/contact.type.js');

const moment = require('moment');

require('moment-timezone');
const gsClient = require('../client.js');
const stringUtil = require('../../string/util');
const app = require('../../../../server/server');
const { getXLeadsStats } = require('../../../../common/lib/garagescore/cross-leads/sources-stats.js');

const nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../../../../common/')), {
  autoescape: true,
  watch: false,
});
const formatDates = function formatDates(date, format) {
  if (!date || !moment(date).isValid()) {
    return '--';
  }
  return moment.tz(date, 'Europe/Paris').format(format || 'DD MMMM YYYY');
};
nunjucksEnv.addFilter('addPreposition', stringUtil.addPreposition);
nunjucksEnv.addFilter('encodeUrl', encodeURI);
nunjucksEnv.addGlobal('lib', { client: gsClient });
nunjucksEnv.addGlobal('formatDates', formatDates);

const nunjucksEnvText = nunjucks.configure(path.normalize(path.join(__dirname, '../../../../common/')), {
  autoescape: false,
  watch: false,
});
nunjucksEnvText.addFilter('addPreposition', stringUtil.addPreposition);
nunjucksEnvText.addGlobal('lib', { client: gsClient });
nunjucksEnvText.addGlobal('formatDates', formatDates);

const getSupervisorGarageReportPayload = async function getSupervisorGarageReportPayload(contact) {
  const garageImportStatistic = await app.models.GarageImportStatistic.findById(
    contact.payload.garageImportStatisticId
  );
  return { contact, report: garageImportStatistic.report, vuePath: 'internal/supervisor/garage-report' };
};

const getSupervisorEmailReportPayload = async function getSupervisorEmailReportPayload(contact) {
  const payload = {
    messages: [],
  };
  try {
    const supervisorMessages = await app.models.SupervisorMessage.find({
      where: { id: { inq: contact.payload.supervisorMessageIds } },
    });
    for (const message of supervisorMessages) {
      if (message.payload) {
        if (message.payload.contactId) {
          payload.messages.push(
            `${message.type} > Email: ${message.payload.email} > ContactId: ${message.payload.contactId}`
          );
        } else if (message.payload.error) {
          payload.messages.push(`${message.type} > ${message.payload.error} - ${message.payload.context}`);
        }
        if (message.payload.problems) {
          payload.problems = message.payload.problems;
        }
      }
    }
  } catch (e) {
    console.error(e);
  }
  return payload;
};

const getSupervisorSynchronisationReportEmailContent = async function getSupervisorSynchronisationReportEmailContent(
  contact
) {
  return {
    subject: nunjucksEnvText.render('./templates/email/supervisor-synchronisation-report/subject.nunjucks', {
      contact,
    }),
    textBody: nunjucksEnvText.render('./templates/email/supervisor-synchronisation-report/txt.nunjucks', { contact }),
    htmlBody: juice(
      nunjucksEnv.render('./templates/email/supervisor-synchronisation-report/html.nunjucks', { contact }),
      { preserveMediaQueries: true }
    ),
  };
};

module.exports = {
  getSupervisorEmailReportPayload,
  getSupervisorGarageReportPayload,
  getSupervisorSynchronisationReportEmailContent,

  SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT: async (c) => ({
    ...c.payload,
    type: ContactTypes.SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT,
  }),
  SUPERVISOR_LACK_OF_PHONE: async (contact) => ({ ...contact.payload, type: ContactTypes.SUPERVISOR_LACK_OF_PHONE }),
  SUPERVISOR_SOURCE_TYPE_MISMATCH: async (contact) => ({
    ...contact.payload,
    type: ContactTypes.SUPERVISOR_SOURCE_TYPE_MISMATCH,
  }),
  SUPERVISOR_X_LEADS_STATS_REPORT: async (contact) => ({
    logs: await getXLeadsStats(contact.createdAt),
    type: ContactTypes.SUPERVISOR_X_LEADS_STATS_REPORT,
  }),
};
