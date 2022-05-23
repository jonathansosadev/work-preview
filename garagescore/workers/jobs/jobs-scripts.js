/* Give the script to run for each job
this module must only be required by the worker to avoir circular dependencies
*/
const { JobTypes } = require('../../frontend/utils/enumV2');

// Test job
const testRatingUpdated = require('./scripts/test-rating-updated');
// Contacts
const sendContact = require('./scripts/send-contact');
// Datas
const sendAutomaticReply = require('./scripts/send-automatic-reply');
// Lead & unsatisfied ticket
const closeUnsatisfiedTicket = require('./scripts/close-unsatisfied-ticket.js');
const closeLeadTicket = require('./scripts/close-lead-ticket.js');
const sendUnsatisfiedFollowup = require('./scripts/send-unsatisfied-followup.js');
const possibleSuccessAlert = require('./scripts/possible-success-alert');
const sendLeadFollowup = require('./scripts/send-lead-followup.js');
const escalate = require('./scripts/escalate');
const updateUnsatisfiedDelayStatus = require('./scripts/update-unsatisfied-delay-status.js');
// XLeads
const crossLeadsIncomingCall = require('./scripts/cross-leads-incoming-call.js');
const crossLeadsIncomingEmail = require('./scripts/cross-leads-incoming-email.js');
const crossLeadsSendSelfAssignReminder = require('./scripts/cross-leads-send-self-assign-reminder.js');
// Automation
const automationAddDatasToCustomer = require('./scripts/automation-add-datas-to-customer.js');
const automationCreateTicket = require('./scripts/automation-create-ticket.js');
const automationResetPressure = require('./scripts/automation-reset-pressure.js');
const automationSendContactToCustomer = require('./scripts/automation-send-contact-to-customer.js');
const automationCheckContactModification = require('./scripts/automation-check-contact-modification.js');
const automationConsolidateCustomer = require('./scripts/automation-consolidate-customer.js');
// Misc
const shortUrlRefresh = require('./scripts/short-url-refresh.js');
const mailgunEvent = require('./scripts/mailgun-event.js');
const startExport = require('./scripts/start-export');
const cleanExport = require('./scripts/clean-export');
const exportLeadsToApi = require('./scripts/export-leads-to-api');

const CONFS = {};
// test job
CONFS[JobTypes.TEST_RATING_UPDATED] = testRatingUpdated;
// Contacts
CONFS[JobTypes.SEND_CONTACT_HIGH_PRIORITY] = sendContact;
CONFS[JobTypes.SEND_CONTACT_MEDIUM_PRIORITY] = sendContact;
CONFS[JobTypes.SEND_CONTACT_LOW_PRIORITY] = sendContact;
// Datas
CONFS[JobTypes.SEND_AUTOMATIC_REPLY] = sendAutomaticReply;
// Lead & unsatisfied tickets
CONFS[JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET] = closeUnsatisfiedTicket;
CONFS[JobTypes.CLOSE_EXPIRED_LEAD_TICKET] = closeLeadTicket;
CONFS[JobTypes.SEND_UNSATISFIED_FOLLOWUP] = sendUnsatisfiedFollowup;
CONFS[JobTypes.POSSIBLE_SUCCESS_ALERT] = possibleSuccessAlert;
CONFS[JobTypes.SEND_LEAD_FOLLOWUP] = sendLeadFollowup;
CONFS[JobTypes.ESCALATE] = escalate;
CONFS[JobTypes.UPDATE_UNSATISFIED_DELAY_STATUS] = updateUnsatisfiedDelayStatus;
// XLeads
CONFS[JobTypes.CROSS_LEADS_INCOMING_CALL] = crossLeadsIncomingCall;
CONFS[JobTypes.CROSS_LEADS_INCOMING_EMAIL] = crossLeadsIncomingEmail;
CONFS[JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER] = crossLeadsSendSelfAssignReminder;
CONFS[JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER] = automationAddDatasToCustomer;
// Automation
CONFS[JobTypes.AUTOMATION_CREATE_TICKET] = automationCreateTicket;
CONFS[JobTypes.AUTOMATION_RESET_PRESSURE] = automationResetPressure;
CONFS[JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER] = automationSendContactToCustomer;
CONFS[JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION] = automationCheckContactModification;
CONFS[JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER] = automationConsolidateCustomer;
// Misc
CONFS[JobTypes.SHORT_URL_REFRESH] = shortUrlRefresh;
CONFS[JobTypes.MAILGUN_EVENT] = mailgunEvent;
CONFS[JobTypes.START_EXPORT] = startExport;
CONFS[JobTypes.CLEAN_EXPORT] = cleanExport;
CONFS[JobTypes.EXTERNAL_API] = exportLeadsToApi;

module.exports = (jobType) => CONFS[jobType];
