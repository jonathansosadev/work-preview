const Enum = require('../lib/util/enum.js');

module.exports = new Enum({
  TEST: 'TEST',
  MONTHLY_SUMMARY_EMAIL: 'MONTHLY_SUMMARY_EMAIL',
  MONTHLY_SUMMARY_SMS: 'MONTHLY_SUMMARY_SMS',
  REPORT_EMAIL: 'REPORT_EMAIL',
  ALERT_EMAIL: 'ALERT_EMAIL',
  CAMPAIGN_EMAIL: 'CAMPAIGN_EMAIL',
  CAMPAIGN_SMS: 'CAMPAIGN_SMS',
  USER_MESSAGE_EMAIL: 'USER_MESSAGE_EMAIL',
  RESET_PASSWORD_EMAIL: 'RESET_PASSWORD_EMAIL',
  WELCOME_EMAIL: 'WELCOME_EMAIL',
  CAMPAIGNS_READY: 'CAMPAIGNS_READY',
  FTP_CREDENTIALS: 'FTP_CREDENTIALS',
  SUPERVISOR_REPORT_EMAIL: 'SUPERVISOR_REPORT_EMAIL',
  SUPERVISOR_GARAGE_REPORT_EMAIL: 'SUPERVISOR_GARAGE_REPORT_EMAIL',
  SUPERVISOR_SYNCHRONISATION_REPORT: 'SUPERVISOR_SYNCHRONISATION_REPORT', // not used anymore

  SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT: 'SUPERVISOR_ZOHO_SYNCHRONISATION_REPORT', // new
  SUPERVISOR_LACK_OF_PHONE: 'SUPERVISOR_LACK_OF_PHONE', // new
  SUPERVISOR_SOURCE_TYPE_MISMATCH: 'SUPERVISOR_SOURCE_TYPE_MISMATCH', // new
  SUPERVISOR_X_LEADS_STATS_REPORT: 'SUPERVISOR_X_LEADS_STATS_REPORT', // new

  SUBSCRIPTION_REQUEST_EMAIL: 'SUBSCRIPTION_REQUEST_EMAIL',
  SUBSCRIPTION_CONFIRMATION_EMAIL: 'SUBSCRIPTION_CONFIRMATION_EMAIL',
  SUBSCRIPTION_FEATURE_REQUEST_EMAIL: 'SUBSCRIPTION_FEATURE_REQUEST_EMAIL',
  USER_ACCESS_REQUEST: 'USER_ACCESS_REQUEST',
  // Alerts success
  LEAD_SUCCESS_ALERT: 'LEAD_SUCCESS_ALERT',
  UNSATISFIED_SUCCESS_ALERT: 'UNSATISFIED_SUCCESS_ALERT',
  // Escalade
  ESCALATE_LEAD_1: 'ESCALATE_LEAD_1',
  ESCALATE_LEAD_2: 'ESCALATE_LEAD_2',
  ESCALATE_UNSATISFIED_1: 'ESCALATE_UNSATISFIED_1',
  ESCALATE_UNSATISFIED_2: 'ESCALATE_UNSATISFIED_2',

  AUTOMATION_CAMPAIGN_EMAIL: 'AUTOMATION_CAMPAIGN_EMAIL',
  AUTOMATION_CAMPAIGN_SMS: 'AUTOMATION_CAMPAIGN_SMS',
  AUTOMATION_GDPR_EMAIL: 'AUTOMATION_GDPR_EMAIL',
  AUTOMATION_GDPR_SMS: 'AUTOMATION_GDPR_SMS',

  // XLeads self-assign emails
  CROSS_LEADS_SELF_ASSIGN_EMAIL: 'CROSS_LEADS_SELF_ASSIGN_EMAIL',
  CROSS_LEADS_SELF_ASSIGN_CALL: 'CROSS_LEADS_SELF_ASSIGN_CALL',
  CROSS_LEADS_SELF_ASSIGN_MISSED_CALL: 'CROSS_LEADS_SELF_ASSIGN_MISSED_CALL',
  CROSS_LEADS_RECONTACT: 'CROSS_LEADS_RECONTACT',

  COCKPIT_EXPORT_EMAIL: 'COCKPIT_EXPORT_EMAIL',

  PRODUCT_DEMONSTRATION: 'PRODUCT_DEMONSTRATION',
});