const debug = require('debug')('garagescore:common:models:contact');
const app = require('../../server/server');
const config = require('config');
const { promisify } = require('util');
const { ObjectID } = require('mongodb');
const ContactType = require('../../common/models/contact.type.js');
const AlertTypes = require('./alert.types.js');
const ContactEvent = require('./contact.event');
const SupervisorMessageType = require('./supervisor-message.type');
const EmailBlackListReason = require('./black-list-reason');
const MailgunTools = require('../lib/mailgun/tools.js');
const ContactService = require('../lib/garagescore/contact/service');
const StringUtil = require('../lib/util/string');
const GsSupervisor = require('../lib/garagescore/supervisor/service');
const InstancesCache = require('../../common/lib/model-tool/instances-cache');
const runEvents = require('../lib/garagescore/data-campaign/run/run-events');
const gsClient = require('../../common/lib/garagescore/client.js');
const { AutomationCampaignsEventsType } = require('../../frontend/utils/enumV2');
const AutomationCampaignChannelTypes = require('./automation-campaign-channel.type.js');

const { getReportPayload } = require('../../common/lib/garagescore/report-mail/render-content.js');
const {
  getMonthlySummaryPayload,
} = require('../../common/lib/garagescore/report-mail/render-monthly-summary-email.js');
const {
  getMonthlySummarySmsPayload,
} = require('../../common/lib/garagescore/report-mail/render-monthly-summary-sms.js');
const { getAlertPayload } = require('../../common/lib/garagescore/alert-mail/render-content.js');
const { getProductDemonstrationPayload } = require('../../common/lib/garagescore/contact/render-product-demonstration.js');
const { getSelfAssignPayload } = require('../../common/lib/garagescore/contact/render-self-assign.js');
const {
  getCrossLeadsRecontactPayload,
} = require('../../common/lib/garagescore/contact/render-cross-leads-recontact.js');
const {
  getLeadSuccessAlertPayload,
  getUnsatisfiedSuccessAlertPayload,
} = require('../../common/lib/garagescore/contact/render-success-contact.js');
const { getEscalateAlertPayload } = require('../../common/lib/garagescore/contact/render-escalate-contact.js');
const {
  getAutomationCampaignPayload,
} = require('../../common/lib/garagescore/contact/render-automation-campaign-contact.js');
const { getAutomationGdprPayload } = require('../../common/lib/garagescore/contact/render-automation-gdpr-contact.js');
const { renderContactPayload } = require('../../common/lib/garagescore/contact/render-campaign-contact.js');
const { getResetPasswordPayload } = require('../../common/lib/garagescore/contact/render-reset-password-email.js');
const { getWelcomePayload } = require('../../common/lib/garagescore/contact/render-welcome.js');
const { getCampaignsReadyPayload } = require('../../common/lib/garagescore/contact/render-campaigns-ready.js');
const _appReviewNamespace = require('./_app-review-namespace');

const {
  getSubscriptionFeatureRequestPayload,
  getSubscriptionConfirmationPayload,
  getSubscriptionRequestPayload,
  getUserAccessRequestPayload,
} = require('../../common/lib/garagescore/contact/render-subscription-request.js');
const supervisorRenderer = require('../../common/lib/garagescore/supervisor/renderer.js');
const {
  getSupervisorSynchronisationReportEmailContent,
  getSupervisorEmailReportPayload,
  getSupervisorGarageReportPayload,
} = require('../../common/lib/garagescore/supervisor/renderer.js');
const { getFtpCredentialsPayload } = require('../../common/lib/garagescore/ftp/render-credentials.js');
const { getCockpitExportEmailPayload } = require('../../common/lib/garagescore/cockpit-exports/renderer.js');
const nuxtRender = require('../../common/lib/garagescore/contact/render.js');
const { defaultStandardCss } = require('survey-vue');

const iCache = new InstancesCache({ max: 5000, maxAge: 5 * 60 * 60 });

function validateEmail(email) {
  const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return re.test(email);
}

function validateMobile(mobile) {
  /** TODO implement sms validation **/
  return mobile && true;
}

const createAddLog = async (app, contact, eventType, contactType) => {
  if (!contact) throw new Error('AutomationCampaignsEvents contact.js: contact required');
  if (!eventType) throw new Error('AutomationCampaignsEvents contact.js: eventType required');
  if (!contactType) throw new Error('AutomationCampaignsEvents contact.js: contactType required');
  await app.models.AutomationCampaignsEvents.addLog(
    {
      garageId: contact.payload.garageId,
      campaignId: contact.payload.campaignId,
      customerId: contact.payload.customerId,
      eventType,
      contactType,
      target: contact.payload.target,
      campaignType: contact.payload.campaignType,
      campaignRunDay: contact.payload.campaignRunDay,
    },
    {
      customContentId: contact.payload.customContent && contact.payload.customContent._id,
    }
  );
};

const _getConf = {};
_getConf[ContactType.REPORT_EMAIL] = { payload: getReportPayload, vuePath: 'notifications/report/daily-weekly' };
_getConf[ContactType.MONTHLY_SUMMARY_EMAIL] = {
  payload: getMonthlySummaryPayload,
  vuePath: 'notifications/report/monthly',
};
_getConf[ContactType.MONTHLY_SUMMARY_SMS] = {
  payload: getMonthlySummarySmsPayload,
  vuePath: 'notifications/report/monthly/monthly-summary-sms',
};
_getConf[ContactType.ALERT_EMAIL] = { payload: getAlertPayload };
_getConf[ContactType.FTP_CREDENTIALS] = { payload: getFtpCredentialsPayload };
_getConf[ContactType.USER_MESSAGE_EMAIL] = { payload: (c) => c.payload, vuePath: 'internal/user-message' };
_getConf[ContactType.RESET_PASSWORD_EMAIL] = {
  payload: getResetPasswordPayload,
  vuePath: 'notifications/reset-password',
};
_getConf[ContactType.WELCOME_EMAIL] = { payload: getWelcomePayload };
_getConf[ContactType.CAMPAIGNS_READY] = { payload: getCampaignsReadyPayload };
_getConf[ContactType.SUPERVISOR_REPORT_EMAIL] = {
  payload: getSupervisorEmailReportPayload,
  vuePath: 'internal/supervisor',
};
_getConf[ContactType.SUPERVISOR_GARAGE_REPORT_EMAIL] = { payload: getSupervisorGarageReportPayload };
for (const type of [
  // ALL SUPERVISOR generic PAYLOAD
  'SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT',
  'SUPERVISOR_LACK_OF_PHONE',
  'SUPERVISOR_SOURCE_TYPE_MISMATCH',
  'SUPERVISOR_X_LEADS_STATS_REPORT',
])
  _getConf[ContactType[type]] = { payload: supervisorRenderer[type], vuePath: 'internal/supervisor' };
_getConf[ContactType.SUBSCRIPTION_FEATURE_REQUEST_EMAIL] = { payload: getSubscriptionFeatureRequestPayload };
_getConf[ContactType.USER_ACCESS_REQUEST] = { payload: getUserAccessRequestPayload };
_getConf[ContactType.SUBSCRIPTION_CONFIRMATION_EMAIL] = { payload: getSubscriptionConfirmationPayload };
// Success alert
_getConf[ContactType.LEAD_SUCCESS_ALERT] = {
  payload: getLeadSuccessAlertPayload,
  vuePath: 'notifications/success/leads',
};
_getConf[ContactType.UNSATISFIED_SUCCESS_ALERT] = {
  payload: getUnsatisfiedSuccessAlertPayload,
  vuePath: 'notifications/success/unsatisfied',
};
// Escalate
_getConf[ContactType.ESCALATE_LEAD_1] = { payload: getEscalateAlertPayload, vuePath: 'notifications/escalate/leads/1' };
_getConf[ContactType.ESCALATE_LEAD_2] = { payload: getEscalateAlertPayload, vuePath: 'notifications/escalate/leads/2' };
_getConf[ContactType.ESCALATE_UNSATISFIED_1] = {
  payload: getEscalateAlertPayload,
  vuePath: 'notifications/escalate/unsatisfied/1',
};
_getConf[ContactType.ESCALATE_UNSATISFIED_2] = {
  payload: getEscalateAlertPayload,
  vuePath: 'notifications/escalate/unsatisfied/2',
};
// Automation
_getConf[ContactType.AUTOMATION_CAMPAIGN_EMAIL] = {
  payload: getAutomationCampaignPayload,
  vuePath: 'automation/campaign',
};
_getConf[ContactType.AUTOMATION_CAMPAIGN_SMS] = {
  payload: getAutomationCampaignPayload,
  vuePath: 'automation/campaign-sms',
};
_getConf[ContactType.AUTOMATION_GDPR_EMAIL] = { payload: getAutomationGdprPayload, vuePath: 'automation/gdpr' };
_getConf[ContactType.AUTOMATION_GDPR_SMS] = { payload: getAutomationGdprPayload, vuePath: 'automation/gdpr-sms' };

// XLeads self-assign payload
_getConf[ContactType.CROSS_LEADS_SELF_ASSIGN_EMAIL] = {
  payload: getSelfAssignPayload,
  vuePath: 'notifications/cross-leads/self-assign/email',
};
_getConf[ContactType.CROSS_LEADS_RECONTACT] = {
  payload: getCrossLeadsRecontactPayload,
  vuePath: 'notifications/cross-leads/recontact/email',
};
_getConf[ContactType.CROSS_LEADS_SELF_ASSIGN_CALL] = {
  payload: getSelfAssignPayload,
  vuePath: 'notifications/cross-leads/self-assign/call',
};
_getConf[ContactType.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL] = {
  payload: getSelfAssignPayload,
  vuePath: 'notifications/cross-leads/self-assign/missed-call',
};
_getConf[ContactType.COCKPIT_EXPORT_EMAIL] = {
  payload: getCockpitExportEmailPayload,
  vuePath: 'notifications/cockpit-exports',
};
_getConf[ContactType.PRODUCT_DEMONSTRATION] = { payload: getProductDemonstrationPayload };

module.exports = function ContactDefinition(Contact) {
  _appReviewNamespace(Contact);
  Contact.prototype.getFinalPayloadForTests = async function getVariablesRenderedForTests() {
    return _getConf[this.type].payload(this);
  };
  Contact.prototype.render = async function render(options) {
    try {
      // --------------------------- NOT UPGRADED YET ---------------------------
      if (this.type === ContactType.TEST) {
        return {
          subject: 'Test',
          textBody: 'Email Test',
          htmlBody: 'Email Test',
        };
      }
      if (this.type === ContactType.CAMPAIGN_EMAIL || this.type === ContactType.CAMPAIGN_SMS) {
        // Adding garageId / dataId / contactId as a tag in Mailgun to be able to manage unsubscribes for example
        if (this.payload.garageId) {
          this.payload.tags = [`garageId_${this.payload.garageId.toString()}`, `contactId_${this.id.toString()}`];
        }
        return await renderContactPayload(this);
      }
      if ([ContactType.AUTOMATION_CAMPAIGN_EMAIL, ContactType.AUTOMATION_CAMPAIGN_SMS].includes(this.type)) {
        // Adding customerId as a tag in Mailgun to be able to manage unsubscribes for example
        if (this.payload.customerId) this.payload.tags = [this.payload.customerId.toString()];
      }
      if (this.type === ContactType.SUBSCRIPTION_REQUEST_EMAIL) return await getSubscriptionRequestPayload(this);
      if (this.type === ContactType.SUPERVISOR_SYNCHRONISATION_REPORT)
        return await getSupervisorSynchronisationReportEmailContent(this);
      // -------------------------------------------------------------------------
      if (!this.type || !_getConf[this.type]) return {};
      let payload = await _getConf[this.type].payload(this);
      let to = null;
      payload = { ...payload, gsClient, config, baseUrl: config.get('publicUrl.app_url') };
      if (options && options.forceLocale) {
        payload.locale = options.forceLocale;
      } else if (!payload.locale) {
        // Still no locale ? LAST fallback: get the lang of the receiver !
        to = await Contact.app.models.User.findOne({ where: { email: this.to } });
        if (to) payload.locale = await to.getLocale();
      }
      if (!payload.timezone) {
        to = to || (await Contact.app.models.User.findOne({ where: { email: this.to } }));
        if (to) payload.timezone = await to.getTimezone();
      }
      const vuePath = _getConf[this.type].vuePath || payload.vuePath;
      if (this.isSms()) {
        const body = await nuxtRender.txt(`sms/${vuePath}`, payload);
        return { body };
      }
      const subject = await nuxtRender.txt(`emails/${vuePath}/subject`, payload);
      const textBody = await nuxtRender.txt(`emails/${vuePath}/body`, payload);
      const htmlBody = await nuxtRender.html(`emails/${vuePath}/body`, payload);
      return { subject, textBody, htmlBody };
    } catch (e) {
      console.error(e);
      return null;
    }
  };
  Contact.validateMonthlySummaryEmail = function validateMonthlySummaryEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.reportId) {
      callback('reportId is not found for reportEmail');
      return;
    }
    callback();
  };
  Contact.validateMonthlySummarySms = function validateMonthlySummarySms(contact, callback) {
    if (!contact.to || !validateMobile(contact.to)) {
      callback(`Invalid recipient mobile ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.reportId) {
      callback('reportId is not found for reportSMS');
      return;
    }
    callback();
  };
  Contact.validateReportEmail = function validateReportEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.reportId) {
      callback('reportId is not found for reportEmail');
      return;
    }
    callback();
  };
  Contact.validateAlertEmail = function validateAlertEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.alertType) {
      callback('alertType is not found for alertEmail');
      return;
    }
    if (
      (contact.payload.alertType === AlertTypes.GOOGLE_CAMPAIGN_ACTIVATED ||
        contact.payload.alertType === AlertTypes.GOOGLE_CAMPAIGN_DESACTIVATED) &&
      !contact.payload.addresseeId
    ) {
      callback('Invalid or nonexistent addresseeId');
      return;
    }
    callback();
  };
  Contact.validateStandardEmail = function validateAlertEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.dataId) {
      callback('dataId is not found for standardEmail');
      return;
    }
    callback();
  };
  Contact.validateAutomationEmail = function validateAlertEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.campaignId) {
      callback('campaignId is not found for automationEmail');
      return;
    }
    if (!contact.payload || !contact.payload.customerId) {
      callback('customerId is not found for automationEmail');
      return;
    }
    callback();
  };
  Contact.validateAutomationSMS = function validateAlertEmail(contact, callback) {
    if (!validateMobile(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.campaignId) {
      callback('campaignId is not found for automationEmail');
      return;
    }
    if (!contact.payload || !contact.payload.customerId) {
      callback('customerId is not found for automationEmail');
      return;
    }
    callback();
  };
  Contact.validateAutomationGdprEmail = function validateAlertEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.customerId) {
      callback('customerId is not found for automationEmail');
      return;
    }
    callback();
  };
  Contact.validateAutomationGdprSMS = function validateAlertEmail(contact, callback) {
    if (!validateMobile(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.customerId) {
      callback('customerId is not found for automationEmail');
      return;
    }
    callback();
  };
  Contact.validateCockpitExportEmail = function validateCockpitExportEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.downloadUrl) {
      callback('Download URL not found for CockpitExportEmail');
      return;
    }
    if (!contact.payload || !contact.payload.locale) {
      callback('Locale not found for CockpitExportEmail');
      return;
    }
    callback();
  };
  Contact.validateCampaignEmail = function validateCampaignEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.from}`);
      return;
    }
    if (!contact.payload || !contact.payload.dataId) {
      callback('campaignItemId is not found for campaignContact neither dataId');
      return;
    }
    if (!contact.payload || !contact.payload.key) {
      callback('campaignContact key is not found for campaignContact');
      return;
    }
    callback();
  };
  Contact.validateUserMessageEmail = function validateUserMessageEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    callback();
  };
  Contact.validateResetPasswordEmail = function validateResetPasswordEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.token) {
      callback('token is not found for ResetPasswordEmail');
      return;
    }
    callback();
  };
  Contact.validateWelcomeEmail = function validateWelcomeEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.userId) {
      callback('userId is not found for welcomeEmail');
      return;
    }
    if (!contact.payload || !contact.payload.token) {
      callback('token is not found for welcomeEmail');
      return;
    }
    callback();
  };
  Contact.validateCampaignsReadyEmail = function validateCampaignsReadyEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.garageName) {
      callback('garageName is not found for campaignReady email');
      return;
    }
    callback();
  };
  Contact.validateSupervisorReportEmail = function validateSupervisorReportEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.supervisorMessageIds) {
      callback('supervisorMessages is not found for supervisor report email');
      return;
    }
    if (!contact.payload || !contact.payload.reportName) {
      callback('reportName is not found for supervisor report email');
      return;
    }
    callback();
  };
  Contact.validateProductDemonstrationEmail = function validateProductDemonstrationEmail(contact, callback) {
    if (contact.to && !validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.from}`);
      return;
    }
    if (!contact.payload || !contact.payload.userId) {
      callback('userId is not found for productDemonstrationEmail');
      return;
    }
    callback();
  };
  Contact.validateSupervisorGarageReportEmail = function validateSupervisorGarageReportEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.garageImportStatisticId) {
      callback('garageImportStatisticId is not found for supervisor garage report email');
      return;
    }
    callback();
  };
  Contact.validateSupervisorSynchronisationReportEmail = function validateSupervisorSynchronisationReportEmail(
    contact,
    callback
  ) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.data) {
      callback('data is not found for supervisor Synchronisation report email');
      return;
    }
    callback();
  };
  Contact.validateSupervisor = function validateSupervisor(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    callback();
  };
  Contact.validateCampaignSms = function validateCampaignSms(contact, callback) {
    if (!contact.to || !validateMobile(contact.to)) {
      callback(`Invalid recipient mobile ${contact.to}`);
      return;
    }
    if (contact.from && !validateMobile(contact.from)) {
      callback(`Invalid sender mobile ${contact.to}`);
      return;
    }
    if (!contact.payload || (!contact.payload.campaignItemId && !contact.payload.dataId)) {
      callback('campaignItemId is not found for campaignContact neither dataId');
      return;
    }
    if (!contact.payload || !contact.payload.key) {
      callback('campaignContact key is not found for campaignContact');
      return;
    }
    callback();
  };
  Contact.validateFtpCredentialsEmail = function validateFtpCredentialsEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    if (!contact.payload || !contact.payload.user) {
      callback('user is not found in contact payload');
      return;
    }
    if (!contact.payload.pwd) {
      callback('pwd is not found in contact payload');
      return;
    }
    callback();
  };
  Contact.validateSubscriptionRequestEmail = function validateSubscriptionRequestEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    callback();
  };
  Contact.validateSubscriptionConfirmationEmail = function validateSubscriptionConfirmationEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    callback();
  };
  Contact.validateSubscriptioFeatureRequestEmail = function validateSubscriptioFeatureRequestEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    callback();
  };
  Contact.validateUserAccessRequestEmail = function validateUserAccessRequestEmail(contact, callback) {
    if (!validateEmail(contact.to)) {
      callback(`Invalid recipient email address ${contact.to}`);
      return;
    }
    if (contact.from && !validateEmail(contact.from)) {
      callback(`Invalid sender email address ${contact.to}`);
      return;
    }
    callback();
  };
  Contact.blackList = async function blackList(data, contact, reason) {
    if (contact.type === ContactType.CAMPAIGN_EMAIL || contact.type === ContactType.CAMPAIGN_SMS) {
      const isAlreadyBlacklisted = await app.models.BlackListItem.find({
        where: { dataId: data.id },
      });
      if (!isAlreadyBlacklisted.length) {
        await app.models.BlackListItem.create({
          contactId: contact.id,
          contactType: contact.type,
          dataId: data.id,
          foreign: {
            garageId: (data && data.garageId) || (contact.payload && contact.payload.garageId),
          },
          reason,
          to: contact.to,
        });
      }
    }
  };

  Contact.markDataForBlacklist = async function markDataForBlacklist(data, contact, reason, callback) {
    if (contact.type === ContactType.CAMPAIGN_EMAIL) {
      // this flag is testing if the email was revised between email send and the blacklist
      const updateOriginal = StringUtil.deepEquality(contact.to, data.get('customer.contact.email.original'));
      const updateValue = StringUtil.deepEquality(contact.to, data.get('customer.contact.email.value'));
      if (!updateOriginal && !updateValue) {
        callback();
        return;
      }
      if (reason === EmailBlackListReason.USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL) {
        if (updateOriginal) {
          data.set('customer.contact.email.isOriginalUnsubscribed', true);
        }
        if (updateValue) {
          data.set('customer.contact.email.isUnsubscribed', true);
        }
      }
      if (reason === EmailBlackListReason.USER_COMPLAINED_BY_EMAIL) {
        if (updateOriginal) {
          data.set('customer.contact.email.isOriginalComplained', true);
        }
        if (updateValue) {
          data.set('customer.contact.email.isComplained', true);
        }
      }
      if (reason === EmailBlackListReason.USER_EMAIL_ON_DROPPED) {
        if (updateOriginal) {
          data.set('customer.contact.email.isOriginalDropped', true);
          data.set('campaign.contactStatus.hasOriginalBeenContactedByEmail', false);
        }
        if (updateValue) {
          data.set('customer.contact.email.isDropped', true);
          data.set('campaign.contactStatus.hasBeenContactedByEmail', false);
        }
      }
    }
    if (contact.type === ContactType.CAMPAIGN_SMS) {
      const updateOriginal = contact.to === data.get('customer.contact.mobilePhone.original');
      const updateValue = contact.to === data.get('customer.contact.mobilePhone.value');
      if (reason === EmailBlackListReason.USER_UNSUBSCRIBED_FROM_GARAGE_BY_PHONE) {
        data.set('customer.contact.mobilePhone.isUnsubscribed', true);
      }
      if (reason === EmailBlackListReason.USER_PHONE_ON_DROPPED) {
        if (updateOriginal) {
          data.set('customer.contact.mobilePhone.isOriginalDropped', true);
          data.set('campaign.contactStatus.hasOriginalBeenContactedByPhone', false);
        }
        if (updateValue) {
          data.set('customer.contact.mobilePhone.isDropped', true);
          data.set('campaign.contactStatus.hasBeenContactedByPhone', false);
        }
      }
    }
    data.save(callback);
  };
  Contact.validate = function validate(contact, callback) {
    if (!contact.type) {
      callback('contact have no type');
      return;
    }
    if (contact.sendAt && !(contact.sendAt instanceof Date)) {
      callback(`contact.sendAt isn't a date object (${contact.sendAt}).`);
      return;
    }
    switch (contact.type) {
      case ContactType.TEST:
        callback();
        break;
      case ContactType.MONTHLY_SUMMARY_EMAIL:
        Contact.validateMonthlySummaryEmail(contact, callback);
        break;
      case ContactType.MONTHLY_SUMMARY_SMS:
        Contact.validateMonthlySummarySms(contact, callback);
        break;
      case ContactType.REPORT_EMAIL:
        Contact.validateReportEmail(contact, callback);
        break;
      case ContactType.ALERT_EMAIL:
        Contact.validateAlertEmail(contact, callback);
        break;
      case ContactType.CAMPAIGN_EMAIL:
        Contact.validateCampaignEmail(contact, callback);
        break;
      case ContactType.CAMPAIGN_SMS:
        Contact.validateCampaignSms(contact, callback);
        break;
      case ContactType.USER_MESSAGE_EMAIL:
        Contact.validateUserMessageEmail(contact, callback);
        break;
      case ContactType.RESET_PASSWORD_EMAIL:
        Contact.validateResetPasswordEmail(contact, callback);
        break;
      case ContactType.WELCOME_EMAIL:
        Contact.validateWelcomeEmail(contact, callback);
        break;
      case ContactType.CAMPAIGNS_READY:
        Contact.validateCampaignsReadyEmail(contact, callback);
        break;
      case ContactType.SUPERVISOR_REPORT_EMAIL:
        Contact.validateSupervisorReportEmail(contact, callback);
        break;
      case ContactType.SUPERVISOR_GARAGE_REPORT_EMAIL:
        Contact.validateSupervisorGarageReportEmail(contact, callback);
        break;
      case ContactType.SUPERVISOR_SYNCHRONISATION_REPORT:
        Contact.validateSupervisorSynchronisationReportEmail(contact, callback);
        break;
      case ContactType.FTP_CREDENTIALS:
        Contact.validateFtpCredentialsEmail(contact, callback);
        break;
      case ContactType.SUBSCRIPTION_REQUEST_EMAIL:
        Contact.validateSubscriptionRequestEmail(contact, callback);
        break;
      case ContactType.SUBSCRIPTION_CONFIRMATION_EMAIL:
        Contact.validateSubscriptionConfirmationEmail(contact, callback);
        break;
      case ContactType.SUBSCRIPTION_FEATURE_REQUEST_EMAIL:
        Contact.validateSubscriptioFeatureRequestEmail(contact, callback);
        break;
      case ContactType.USER_ACCESS_REQUEST:
        Contact.validateUserAccessRequestEmail(contact, callback);
        break;
      case ContactType.SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT:
      case ContactType.SUPERVISOR_LACK_OF_PHONE:
      case ContactType.SUPERVISOR_SOURCE_TYPE_MISMATCH:
      case ContactType.SUPERVISOR_X_LEADS_STATS_REPORT:
        Contact.validateSupervisor(contact, callback);
        break;
      case ContactType.LEAD_SUCCESS_ALERT:
      case ContactType.UNSATISFIED_SUCCESS_ALERT:
      case ContactType.ESCALATE_LEAD_1:
      case ContactType.ESCALATE_LEAD_2:
      case ContactType.ESCALATE_UNSATISFIED_1:
      case ContactType.ESCALATE_UNSATISFIED_2:
      case ContactType.CROSS_LEADS_SELF_ASSIGN_EMAIL:
      case ContactType.CROSS_LEADS_RECONTACT:
      case ContactType.CROSS_LEADS_SELF_ASSIGN_CALL:
      case ContactType.CROSS_LEADS_SELF_ASSIGN_MISSED_CALL:
        Contact.validateStandardEmail(contact, callback);
        break;
      case ContactType.AUTOMATION_CAMPAIGN_EMAIL:
        Contact.validateAutomationEmail(contact, callback);
        break;
      case ContactType.AUTOMATION_CAMPAIGN_SMS:
        Contact.validateAutomationSMS(contact, callback);
        break;
      case ContactType.AUTOMATION_GDPR_EMAIL:
        Contact.validateAutomationGdprEmail(contact, callback);
        break;
      case ContactType.AUTOMATION_GDPR_SMS:
        Contact.validateAutomationGdprSMS(contact, callback);
        break;
      case ContactType.COCKPIT_EXPORT_EMAIL:
        Contact.validateCockpitExportEmail(contact, callback);
        break;
      case ContactType.PRODUCT_DEMONSTRATION:
        Contact.validateProductDemonstrationEmail(contact, callback);
        break;
      default:
        callback('Contact type validation not supported');
        return;
    }
  };
  const _eventHandlers = {};
  const handleEvent = async (contact, event) => {
    if (!_eventHandlers[event]) {
      // console.log(`No handlers for '${event}'`); // sometimes fail cause EMAIL_DELIVERY is fired. It's ok.
      return null;
    }
    await app.models.Contact.getMongoConnector().updateOne({
      _id: contact.id
    }, {
      $push: {
        eventHistories: { name: event, date: new Date() }
      }
    });
    return _eventHandlers[event](contact);
  };
  /**
   * @description Update a contact and emit an event thanks to mailgunEvent object
   * @throw {Error} mailgunEvent is not correctly formed
   * @throw {Error} contactId is invalid
   * @throw {Error} contact is not found
   */
  Contact.emitEventFromMailgunEvent = async function emitEventFromMailgunEvent(mailgunEvent) {
    MailgunTools.validateMailgunEvent(mailgunEvent);

    // get contact
    const contactId = MailgunTools.validateMailgunContactId(mailgunEvent.contactId);
    const contact = await promisify(iCache.findById.bind(iCache))('Contact', contactId);
    if (!contact) throw Error(`Instance not found for Contact with id ${contactId}`);

    const event = MailgunTools.convertMailgunEvent(mailgunEvent.event, mailgunEvent.deliveryStatusCode);
    // update status & failureDescription
    await app.models.Contact.getMongoConnector().updateOne({
      _id: contact.id
    }, {
      $set: {
        status: MailgunTools.supportedMailgunEventsByName[event].contactStatus,
        ...(MailgunTools.needFailureDescription(mailgunEvent.deliveryStatusDescription, event) && {
          failureDescription: mailgunEvent.deliveryStatusDescription,
        })
      }
    });

    // check if we the mailgunEvent is tracked
    if (!ContactService.isEventEmittingTracked(mailgunEvent)) {
      debug(`Garagescore emails ${mailgunEvent.recipient} are not to be tracked`);
      return;
    }

    await handleEvent(contact, MailgunTools.supportedMailgunEventsByName[event].eventName);
  };
  Contact.emitEventFromSmsFactorEvent = async function emitEventFromSmsFactorEvent(contact, eventName) {
    /**
     * Quand on fera le code du Webhook SMS, on en profitera pour déporter l'update du contact ici
     * Pour l'instant les traitements sont pas faits aux mêmes endroits pour les SMS et les Emails et ça risque d'être piégeux pour les devs
     */
    await handleEvent(contact, eventName);
    const eventPayload = {
      foreign: { smsfactor: contact.payload.smsfactor },
      contactType: contact.type,
      contactId: contact._id,
    };
    return promisify(Contact.emitEvent)(contact, eventName, eventPayload);
  };

  _eventHandlers[ContactEvent.EMAIL_DROP] = async (contact) => {
    try {
      await emailEventBlacklistListenerGenerator(
        contact,
        ContactEvent.EMAIL_DROP,
        EmailBlackListReason.USER_EMAIL_ON_DROPPED
      );

      if (contact.type === ContactType.ALERT_EMAIL || contact.type === ContactType.WELCOME_EMAIL) {
        await promisify(GsSupervisor.warn)({
          type: SupervisorMessageType.DROPPED_ALERT_EMAIL,
          payload: { contactId: contact._id, email: contact.to || 'Unknown' },
        });
      }
      if (contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL) {
        await createAddLog(
          Contact.app,
          contact,
          AutomationCampaignsEventsType.DROPPED,
          AutomationCampaignChannelTypes.EMAIL
        );
      }
      debug(`Contact on ${ContactEvent.EMAIL_DROP} finished successfully`);
    } catch (error) {
      debug(`${ContactEvent.EMAIL_DROP} error: ${error}`);
    }
  };

  _eventHandlers[ContactEvent.SMS_UNSUBSCRIBE] = async (contact) => {
    try {
      await emailEventBlacklistListenerGenerator(
        contact,
        ContactEvent.SMS_UNSUBSCRIBE,
        EmailBlackListReason.USER_UNSUBSCRIBED_FROM_GARAGE_BY_PHONE
      );

      await Contact.app.models.Customer.unsubscribe(contact.payload.customerId);
      const eventType =
        contact.type === ContactType.AUTOMATION_CAMPAIGN_SMS
          ? AutomationCampaignsEventsType.UNSUBSCRIBED
          : AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED;
      await createAddLog(Contact.app, contact, eventType, AutomationCampaignChannelTypes.MOBILE);
      debug(`Contact on ${ContactEvent.SMS_UNSUBSCRIBE} finished successfully`);
    } catch (error) {
      debug(`${ContactEvent.SMS_UNSUBSCRIBE} error: ${error}`);
    }
  };

  _eventHandlers[ContactEvent.SMS_DROP] = async (contact) => {
    try {
      await emailEventBlacklistListenerGenerator(
        contact,
        ContactEvent.SMS_DROP,
        EmailBlackListReason.USER_PHONE_ON_DROPPED
      );

      if (contact.type === ContactType.AUTOMATION_CAMPAIGN_SMS) {
        await createAddLog(
          Contact.app,
          contact,
          AutomationCampaignsEventsType.DROPPED,
          AutomationCampaignChannelTypes.MOBILE
        );
      }
      debug(`Contact on ${ContactEvent.SMS_DROP} finished successfully`);
    } catch (error) {
      debug(`${ContactEvent.SMS_DROP} error: ${error}`);
    }
  };

  const emailEventBlacklistListenerGenerator = async (contact, eventName, blackListReason) => {
    try {
      let where = { garageId: contact.payload.garageId };
      switch(eventName) {
        case ContactEvent.EMAIL_UNSUBSCRIBE:
        case ContactEvent.EMAIL_DROP:
        case ContactEvent.EMAIL_COMPLAINT:
          where = { ...where, 'customer.contact.email.value': contact.to };
          break;
        case ContactEvent.SMS_UNSUBSCRIBE:
        case ContactEvent.SMS_DROP:
          where = { ...where, 'customer.contact.mobilePhone.value': contact.to };
          break;
      }

      const datas = await app.models.Data.find({ where });
      for (const data of datas) {
        if (
          contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL ||
          contact.type === ContactType.AUTOMATION_CAMPAIGN_SMS
        ) {
          // We reset pressure since we didnt send anything (blacklisted)
          await app.models.Customer.resetPressure(contact.payload.campaignType, new ObjectID(contact.payload.customerId));
        }
        await Contact.blackList(data, contact, blackListReason);
        await Contact.markDataForBlacklist(data, contact, blackListReason);
      
        if (eventName === ContactEvent.EMAIL_DROP && contact.type === ContactType.CAMPAIGN_EMAIL) {
          const nextContact = await data.campaign_determineNextCampaignContact(runEvents.CONTACT_SENT, data);
          await app.models.Data.getMongoConnector().updateOne({
            _id: ObjectID(data.id)
          }, {
            $set: { 
              'campaign.contactScenario.nextCampaignContact': nextContact.key || null,
              'campaign.contactScenario.nextCampaignContactDay': nextContact.day || null
             }
          });
        }
      }
    
      debug(`Contact on ${eventName} finished successfully`);
    } catch (error) {
      debug(`${eventName} error: ${error}`);
    }
  };

  _eventHandlers[ContactEvent.EMAIL_UNSUBSCRIBE] = async (contact) => {
    if (contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL || contact.type === ContactType.AUTOMATION_GDPR_EMAIL) {
      await Contact.app.models.Customer.unsubscribe(contact.payload.customerId);
      const eventType =
        contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL
          ? AutomationCampaignsEventsType.UNSUBSCRIBED
          : AutomationCampaignsEventsType.GDPR_UNSUBSCRIBED;
      await createAddLog(Contact.app, contact, eventType, AutomationCampaignChannelTypes.EMAIL);
    } else {
      await emailEventBlacklistListenerGenerator(
        contact,
        ContactEvent.EMAIL_UNSUBSCRIBE,
        EmailBlackListReason.USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL
      );
    }
  };
  _eventHandlers[ContactEvent.EMAIL_COMPLAINT] = async (contact) => {
    if (contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL) {
      await createAddLog(
        Contact.app,
        contact,
        AutomationCampaignsEventsType.DROPPED,
        AutomationCampaignChannelTypes.EMAIL
      );
    }
    await emailEventBlacklistListenerGenerator(
      contact,
      ContactEvent.EMAIL_COMPLAINT, 
      EmailBlackListReason.USER_COMPLAINED_BY_EMAIL
    );
  };
  _eventHandlers[ContactEvent.EMAIL_BOUNCE] = async (contact) => {
    if (contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL) {
      await createAddLog(
        Contact.app,
        contact,
        AutomationCampaignsEventsType.DROPPED,
        AutomationCampaignChannelTypes.EMAIL
      );
    }
  };
  _eventHandlers[ContactEvent.EMAIL_CLICK] = async (contact) => {
    if (contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL) {
      const isOpen = await Contact.app.models.AutomationCampaignsEvents.count({
        garageId: new ObjectID(contact.payload.garageId),
        campaignId: new ObjectID(contact.payload.campaignId),
        'samples.customerId': new ObjectID(contact.payload.customerId),
        type: AutomationCampaignsEventsType.OPENED,
        campaignRunDay: contact.payload.campaignRunDay,
      });
      const eventType = !isOpen ? AutomationCampaignsEventsType.OPENED : AutomationCampaignsEventsType.CLICKED;
      await createAddLog(Contact.app, contact, eventType, AutomationCampaignChannelTypes.EMAIL);
    }
  };
  _eventHandlers[ContactEvent.EMAIL_DELIVERY] = async (contact) => {
    if (contact.type === ContactType.AUTOMATION_CAMPAIGN_EMAIL) {
      await createAddLog(
        Contact.app,
        contact,
        AutomationCampaignsEventsType.RECEIVED,
        AutomationCampaignChannelTypes.EMAIL
      );
    }
  };
  _eventHandlers[ContactEvent.EMAIL_OPEN] = async (contact) => {
    if ([ContactType.AUTOMATION_CAMPAIGN_EMAIL, ContactType.AUTOMATION_GDPR_EMAIL].includes(contact.type)) {
      const openType =
        contact.type === ContactType.AUTOMATION_GDPR_EMAIL
          ? AutomationCampaignsEventsType.GDPR_OPENED
          : AutomationCampaignsEventsType.OPENED;
      const sentType =
        contact.type === ContactType.AUTOMATION_GDPR_EMAIL
          ? AutomationCampaignsEventsType.GDPR_SENT
          : AutomationCampaignsEventsType.SENT;
      const events = await Contact.app.models.AutomationCampaignsEvents.find({
        where: {
          garageId: new ObjectID(contact.payload.garageId),
          campaignId: new ObjectID(contact.payload.campaignId),
          'samples.customerId': new ObjectID(contact.payload.customerId),
          type: { in: [openType, sentType] },
          campaignRunDay: contact.payload.campaignRunDay,
        },
      });
      if (!events.find((e) => e.type === openType)) {
        const sentEvent = events.find((e) => e.type === sentType);
        if (!sentEvent) {
          throw new Error(`Event OPEN without SENT found beforehand :
          (garageId - ${contact.payload.garageId}),
          (campaignId - ${contact.payload.campaignId})
          (customerId - ${contact.payload.customerId})`);
        }
        let sentTimeStamp =
          sentEvent &&
          sentEvent.samples &&
          sentEvent.samples.find((e) => e.customerId.toString() === contact.payload.customerId);
        sentTimeStamp = sentTimeStamp.time;
        const rightNow = new Date();
        // We ignore open events from less than a minute after sending, they may be email clients' triggered to analyze the content
        if (rightNow.getTime() - sentTimeStamp > 60000) {
          await createAddLog(Contact.app, contact, openType, AutomationCampaignChannelTypes.EMAIL);
        } else {
          console.log(`Event OPEN too close to SENT event :
          (garageId - ${contact.payload.garageId}),
          (campaignId - ${contact.payload.campaignId})
          (customerId - ${contact.payload.customerId}) : ignored`);
        }
      }
      console.log(`Event OPEN already found :
          (garageId - ${contact.payload.garageId}),
          (campaignId - ${contact.payload.campaignId})
          (customerId - ${contact.payload.customerId}) : ignored`);
    }
  };

  Contact.prototype.isSms = function isSms() {
    return [
      ContactType.MONTHLY_SUMMARY_SMS,
      ContactType.CAMPAIGN_SMS,
      ContactType.AUTOMATION_CAMPAIGN_SMS,
      ContactType.AUTOMATION_GDPR_SMS,
    ].includes(this.type);
  };
  Contact.prototype.toString = function toString() {
    return `from: ${this.from} / to: ${this.to} / type: ${this.type} / `;
  };
};
