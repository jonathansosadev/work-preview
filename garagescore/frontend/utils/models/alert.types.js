import Enum from '~/utils/enum.js'

export default new Enum(
  {
    EXOGENOUS_NEW_REVIEW: 'ExogenousNewReview',
    LEAD: 'Lead',
    LEAD_VN: 'LeadVn',
    LEAD_VO: 'LeadVo',
    LEAD_APV: 'LeadApv',
    AUTOMATION_LEAD_APV: 'AutomationLeadApv',
    AUTOMATION_LEAD_VN: 'AutomationLeadVn',
    AUTOMATION_LEAD_VO: 'AutomationLeadVo',
    UNSATISFIED: 'Unsatisfied',
    UNSATISFIED_VI: 'UnsatisfiedVI', // new
    UNSATISFIED_VN: 'UnsatisfiedVn',
    UNSATISFIED_VO: 'UnsatisfiedVo',
    UNSATISFIED_MAINTENANCE: 'UnsatisfiedMaintenance',
    UNSATISFIED_MAINTENANCE_WITH_LEAD: 'UnsatisfiedMaintenanceWithLead',
    SENSITIVE_VI: 'SensitiveVI', // new
    SENSITIVE_VN: 'SensitiveVn',
    SENSITIVE_VO: 'SensitiveVo',
    SENSITIVE_MAINTENANCE: 'SensitiveMaintenance',
    SENSITIVE_MAINTENANCE_WITH_LEAD: 'SensitiveMaintenanceWithLead',
    LEAD_FOLLOWUP_APV_NOT_RECONTACTED: 'LeadFollowupApvNotRecontacted', // new for AUTOMATION
    LEAD_FOLLOWUP_VN_NOT_RECONTACTED: 'LeadFollowupVnNotRecontacted', // new
    LEAD_FOLLOWUP_VO_NOT_RECONTACTED: 'LeadFollowupVoNotRecontacted', // new
    LEAD_FOLLOWUP_APV_RDV_NOT_PROPOSED: 'LeadFollowupApvRDVNotProposed', // new for AUTOMATION
    LEAD_FOLLOWUP_VN_RDV_NOT_PROPOSED: 'LeadFollowupVnRDVNotProposed', // new
    LEAD_FOLLOWUP_VO_RDV_NOT_PROPOSED: 'LeadFollowupVoRDVNotProposed', // new
    UNSATISFIED_FOLLOWUP: 'UnsatisfiedFollowup',
    UNSATISFIED_FOLLOWUP_VN: 'UnsatisfiedFollowupVn',
    UNSATISFIED_FOLLOWUP_VO: 'UnsatisfiedFollowupVo',
    UNSATISFIED_FOLLOWUP_VI: 'UnsatisfiedFollowupVI', // new
    GOOGLE_CAMPAIGN_ACTIVATED: 'GoogleCampaignActivated',
    GOOGLE_CAMPAIGN_DESACTIVATED: 'GoogleCampaignDesativated',
    AUTO_ALLOW_CRAWLERS: 'AutoAllowCrawlers',
    LEAD_TICKET_TRANSFER: 'LeadTicketTransfer',
    LEAD_TICKET_CLOSE_ACTION: 'LeadTicketCloseAction',
    LEAD_TICKET_REOPEN: 'LeadTicketReOpen',
    LEAD_TICKET_REMINDER: 'LeadTicketReminder',
    UNSATISFIED_TICKET_TRANSFER: 'UnsatisfiedTicketTransfer',
    UNSATISFIED_TICKET_CLOSE_ACTION: 'UnsatisfiedTicketCloseAction',
    UNSATISFIED_TICKET_REOPEN: 'UnsatisfiedTicketReOpen',
    UNSATISFIED_TICKET_REMINDER: 'UnsatisfiedTicketReminder',
    USER_ADD: 'UserAdd',
    NEW_R2: 'NewR2',
    MAKE_SURVEYS: 'MakeSurveys',
    MAKE_SURVEYS_NOTIFICATION: 'MakeSurveysNotification',
    // CROSS_LEAD_CALL: 'CrossLeadCall', // V1, OLD
    // CROSS_LEAD_MISSED_CALL: 'CrossLeadMissedCall', // V1, OLD
    // CROSS_LEAD_EMAIL: 'CrossLeadEmail', // V1, OLD
  },
  {
    isLeadTicketAlert(value) {
      return value && value.match('LeadTicket')
    },
    isUnsatisfiedTicketAlert(value) {
      return value && value.match('UnsatisfiedTicket')
    }
  }
)
