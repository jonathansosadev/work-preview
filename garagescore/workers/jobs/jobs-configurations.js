/** Configure each job, linking them with a a queue name and a rate */
const { JobTypes } = require('../../frontend/utils/enumV2');
const config = require('config');

const CONFS = {};
// Normally we would put the config in the enum direectly, not doing that now...

// Test job
CONFS[JobTypes.TEST_RATING_UPDATED] = {
  queue: 'testRatingUpdated',
  requestsPerMinute: 60,
};

// Contacts
CONFS[JobTypes.SEND_CONTACT_HIGH_PRIORITY] = {
  queue: 'sendContactHighPriority',
  requestsPerMinute: process.env.CONTACTS_HIGH_PRIORITY_SENT_PER_MINUTE || 100,
};
CONFS[JobTypes.SEND_CONTACT_MEDIUM_PRIORITY] = {
  queue: 'sendContactMediumPriority',
  requestsPerMinute: process.env.CONTACTS_MEDIUM_PRIORITY_SENT_PER_MINUTE || 100,
};
CONFS[JobTypes.SEND_CONTACT_LOW_PRIORITY] = {
  queue: 'sendContactLowPriority',
  requestsPerMinute: process.env.CONTACTS_LOW_PRIORITY_SENT_PER_MINUTE || 100,
};

// Datas
CONFS[JobTypes.SEND_AUTOMATIC_REPLY] = {
  queue: 'sendAutomaticReply',
  requestsPerMinute: 200,
};

// Lead & unsatisfied tickets
CONFS[JobTypes.CLOSE_EXPIRED_LEAD_TICKET] = {
  queue: 'closeTicketsLead',
  requestsPerMinute: 600,
};
CONFS[JobTypes.CLOSE_EXPIRED_UNSATISFIED_TICKET] = {
  queue: 'closeTicketsUnsatisfied',
  requestsPerMinute: 600,
};
CONFS[JobTypes.SEND_UNSATISFIED_FOLLOWUP] = {
  queue: 'sendUnsatisfiedFollowup',
  requestsPerMinute: 400,
};
CONFS[JobTypes.POSSIBLE_SUCCESS_ALERT] = {
  queue: 'possibleSuccessAlert',
  requestsPerMinute: 100,
};
CONFS[JobTypes.SEND_LEAD_FOLLOWUP] = {
  queue: 'sendLeadFollowup',
  requestsPerMinute: 400,
};
CONFS[JobTypes.ESCALATE] = {
  queue: 'escalate',
  requestsPerMinute: 100,
};
CONFS[JobTypes.UPDATE_UNSATISFIED_DELAY_STATUS] = {
  queue: 'updateUnsatisfiedDelayStatus',
  requestsPerMinute: 600,
};
CONFS[JobTypes.EXTERNAL_API] = {
  queue: 'externalApi',
  requestsPerMinute: 100,
};

// Xleads
CONFS[JobTypes.CROSS_LEADS_INCOMING_CALL] = {
  queue: 'crossLeadsIncomingCall',
  requestsPerMinute: 400,
};
CONFS[JobTypes.CROSS_LEADS_INCOMING_EMAIL] = {
  queue: 'crossLeadsIncomingEmail',
  requestsPerMinute: 400,
};
CONFS[JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER] = {
  queue: 'crossLeadsSendSelfAssignReminder',
  requestsPerMinute: 400,
};

// Automation
CONFS[JobTypes.AUTOMATION_ADD_DATAS_TO_CUSTOMER] = {
  queue: 'automationAddDatasToCustomer',
  requestsPerMinute: 400,
};
CONFS[JobTypes.AUTOMATION_CREATE_TICKET] = {
  queue: 'automationCreateTicket',
  requestsPerMinute: 400,
};
CONFS[JobTypes.AUTOMATION_RESET_PRESSURE] = {
  queue: 'automationResetPressure',
  requestsPerMinute: 400,
};
CONFS[JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER] = {
  queue: 'automationSendContactToCustomer',
  requestsPerMinute: 400,
};
CONFS[JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION] = {
  queue: 'automationCheckContactModification',
  requestsPerMinute: 400,
};
CONFS[JobTypes.AUTOMATION_CONSOLIDATE_CUSTOMER] = {
  queue: 'automationConsolidateCustomer',
  requestsPerMinute: 1000,
};

// Misc
CONFS[JobTypes.SHORT_URL_REFRESH] = {
  queue: 'shortUrlRefresh',
  requestsPerMinute: 400,
};
CONFS[JobTypes.MAILGUN_EVENT] = {
  queue: 'mailgunEvents',
  requestsPerMinute: 100,
};
CONFS[JobTypes.START_EXPORT] = {
  queue: 'startExport',
  requestsPerMinute: 100,
};
CONFS[JobTypes.CLEAN_EXPORT] = {
  queue: 'cleanExport',
  requestsPerMinute: 100,
};

// ADD NEW JOBS here
// ...
// ...

module.exports = function jobConfigs(job) {
  if (config.has('messageQueue.prefix')) {
    const prefixQueue = config.get('messageQueue.prefix');
    const { queue, requestsPerMinute } = CONFS[job];
    return { queue: `${prefixQueue}jobs_${queue}`, requestsPerMinute };
  }
  console.error('jobs-configuration: No `messageQueue.prefix` config found, stopping');
  process.exit(1);
  return null;
};
