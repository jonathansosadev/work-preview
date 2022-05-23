/**
 * Generate Alerts mails Body(Html, text, subject) from templates
 */
const debug = require('debug')('garagescore:common:lib:garagescore:alert-mail:render-content'); // eslint-disable-line max-len,no-unused-vars
const AlertTypes = require('../../../../common/models/alert.types');
const SourceTypes = require('../../../../common/models/data/type/source-types.js');
const app = require('../../../../server/server');
require('moment-timezone');

const _getAlertPath = (alertType) => {
  switch (alertType) {
    // UNSATISFIED
    case AlertTypes.UNSATISFIED_VI:
    case AlertTypes.UNSATISFIED_VO:
    case AlertTypes.UNSATISFIED_VN:
    case AlertTypes.UNSATISFIED_MAINTENANCE:
    case AlertTypes.SENSITIVE_VI:
    case AlertTypes.SENSITIVE_VO:
    case AlertTypes.SENSITIVE_VN:
    case AlertTypes.SENSITIVE_MAINTENANCE:
    case AlertTypes.SENSITIVE_MAINTENANCE_WITH_LEAD:
    case AlertTypes.UNSATISFIED_MAINTENANCE_WITH_LEAD:
      return 'unsatisfied';

    // UNSATISFIED_FOLLOWUP
    case AlertTypes.UNSATISFIED_FOLLOWUP:
    case AlertTypes.UNSATISFIED_FOLLOWUP_VI:
    case AlertTypes.UNSATISFIED_FOLLOWUP_VN:
    case AlertTypes.UNSATISFIED_FOLLOWUP_VO:
      return 'followup-unsatisfied';

    // LEAD
    case AlertTypes.LEAD_VO:
    case AlertTypes.LEAD_VN:
    case AlertTypes.LEAD:
      return 'lead';

    // LEAD_FOLLOWUP
    case AlertTypes.LEAD_FOLLOWUP_APV_NOT_RECONTACTED:
    case AlertTypes.LEAD_FOLLOWUP_VO_NOT_RECONTACTED:
    case AlertTypes.LEAD_FOLLOWUP_VN_NOT_RECONTACTED:
    case AlertTypes.LEAD_FOLLOWUP_APV_RDV_NOT_PROPOSED:
    case AlertTypes.LEAD_FOLLOWUP_VO_RDV_NOT_PROPOSED:
    case AlertTypes.LEAD_FOLLOWUP_VN_RDV_NOT_PROPOSED:
      return 'followup-lead';

    // AUTOMATION_LEAD
    case AlertTypes.AUTOMATION_LEAD_APV:
    case AlertTypes.AUTOMATION_LEAD_VN:
    case AlertTypes.AUTOMATION_LEAD_VO:
      return 'automation-lead';
    // OTHER ALERTS
    case AlertTypes.GOOGLE_CAMPAIGN_ACTIVATED:
      return 'google-campaigns/activation';
    case AlertTypes.GOOGLE_CAMPAIGN_DESACTIVATED:
      return 'google-campaigns/deactivation';
    case AlertTypes.AUTO_ALLOW_CRAWLERS:
      return 'auto-allow-crawlers';
    case AlertTypes.LEAD_TICKET_TRANSFER:
      return 'lead-ticket/transfer-ticket';
    case AlertTypes.LEAD_TICKET_CLOSE_ACTION:
      return 'lead-ticket/close-ticket';
    case AlertTypes.LEAD_TICKET_REOPEN:
      return 'lead-ticket/reopen-ticket';
    case AlertTypes.LEAD_TICKET_REMINDER:
      return 'lead-ticket/reminder-ticket';
    case AlertTypes.UNSATISFIED_TICKET_TRANSFER:
      return 'unsatisfied-ticket/transfer-ticket';
    case AlertTypes.UNSATISFIED_TICKET_CLOSE_ACTION:
      return 'unsatisfied-ticket/close-ticket';
    case AlertTypes.UNSATISFIED_TICKET_REOPEN:
      return 'unsatisfied-ticket/reopen-ticket';
    case AlertTypes.UNSATISFIED_TICKET_REMINDER:
      return 'unsatisfied-ticket/reminder-ticket';
    case AlertTypes.EXOGENOUS_NEW_REVIEW:
      return 'exogenous';
    case AlertTypes.USER_ADD:
      return 'user-add';
    case AlertTypes.NEW_R2:
      return 'new-R2';
    case AlertTypes.MAKE_SURVEYS:
      return 'make-surveys/make-surveys-alert';
    case AlertTypes.MAKE_SURVEYS_NOTIFICATION:
      return 'make-surveys/make-surveys-notification';

    // Error 404... or 418, you decide
    default:
      return null;
  }
};

const getAlertPayload = async function getAlertPayload(contact) {
  const payload = {};
  if (contact.payload.garageId) payload.garage = await app.models.Garage.findById(contact.payload.garageId);
  if (contact.payload.garageIds)
    payload.garages = await app.models.Garage.find({ where: { id: { inq: contact.payload.garageIds } } });
  if (contact.payload.addresseeId) payload.addressee = await app.models.User.findById(contact.payload.addresseeId);
  if (contact.payload.assignerUserId) payload.assigner = await app.models.User.findById(contact.payload.assignerUserId);
  if (contact.payload.dataId) payload.data = await app.models.Data.findById(contact.payload.dataId);
  if (contact.payload.agentId) payload.agent = await app.models.Garage.findById(contact.payload.agentId);
  if (contact.payload.automationCampaignId) {
    const fields = { displayName: 1 };
    payload.automationCampaign = await app.models.AutomationCampaign.findById(contact.payload.automationCampaignId, {
      fields,
    });
  }

  if (
    [
      AlertTypes.AUTOMATION_LEAD_APV,
      AlertTypes.AUTOMATION_LEAD_VN,
      AlertTypes.AUTOMATION_LEAD_VO,
      AlertTypes.LEAD_VO,
      AlertTypes.LEAD_VN,
      AlertTypes.LEAD,
    ].includes(contact.payload.alertType)
  ) {
    payload.manager = payload.data ? payload.data.get('leadTicket.manager') : null;
    payload.manager =
      payload.manager && payload.manager !== 'undefined' ? await app.models.User.findById(payload.manager) : null;
    /** If the data is from a agent, we replace the R1 garage with the R2 garage */
    if (payload.data && payload.data.get('source.garageId')) {
      payload.garage = await app.models.Garage.findById(payload.data.get('source.garageId'));
    }
  }
  if (
    [
      AlertTypes.UNSATISFIED_VI,
      AlertTypes.UNSATISFIED_VO,
      AlertTypes.UNSATISFIED_VN,
      AlertTypes.UNSATISFIED_MAINTENANCE,
      AlertTypes.SENSITIVE_VI,
      AlertTypes.SENSITIVE_VO,
      AlertTypes.SENSITIVE_VN,
      AlertTypes.SENSITIVE_MAINTENANCE,
      AlertTypes.SENSITIVE_MAINTENANCE_WITH_LEAD,
      AlertTypes.UNSATISFIED_MAINTENANCE_WITH_LEAD,
    ].includes(contact.payload.alertType)
  ) {
    payload.manager = payload.data ? payload.data.get('unsatisfiedTicket.manager') : null;
    payload.manager =
      payload.manager && payload.manager !== 'undefined' ? await app.models.User.findById(payload.manager) : null;
  }
  // if ([AlertTypes.CROSS_LEAD_CALL, AlertTypes.CROSS_LEAD_MISSED_CALL, AlertTypes.CROSS_LEAD_EMAIL].includes(contact.payload.alertType)
  // && payload.garage) {
  //   payload.campaignScenario = await app.models.CampaignScenario.findById(payload.garage.campaignScenarioId);
  //
  // Faire le calcul pour récup juste le nombre d'heure pour le fpa. Peut être trop lourd finalement, abort mission...
  // }
  if (Number.isInteger(contact.payload.actionIndex)) {
    if (contact.payload.alertType.indexOf('Lead') === 0) payload.actions = payload.data.get('leadTicket.actions');
    else if (contact.payload.alertType.indexOf('UnsatisfiedTicket') === 0)
      payload.actions = payload.data.get('unsatisfiedTicket.actions');
    payload.ticketAction = (payload.actions && payload.actions[contact.payload.actionIndex]) || [];
  }
  payload.locale =
    (payload.garage && payload.garage.locale) ||
    (payload.garages && payload.garages[0] && payload.garages[0].locale) ||
    (payload.addressee && (await payload.addressee.getLocale()));
  payload.timezone =
    (payload.garage && payload.garage.timezone) ||
    (payload.garages && payload.garages[0] && payload.garages[0].timezone) ||
    (payload.addressee && (await payload.addressee.getTimezone())) ||
    null;
  payload.today = new Date();
  payload.fullYearNumber = payload.today.getFullYear();
  payload.vuePath = `notifications/${_getAlertPath(contact.payload.alertType)}`;
  payload.contact = contact;
  if (payload.data) payload.sourceTypeCategory = SourceTypes.getCategory(payload.data.get('source.type'));
  return payload;
};

module.exports = {
  getAlertPayload,
};
