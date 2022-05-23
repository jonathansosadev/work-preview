const LeadFollowupStatus = require('../../../../common/models/data/type/lead-followup-status');

module.exports = function followupLeadStatus ({ lead, leadTicket, surveyFollowupLead }, mustBePotentialSale = false) {
  if (!lead || (mustBePotentialSale && !lead.potentialSale)) {
    return null;
  }

  if (lead.isConverted) {
    return LeadFollowupStatus.LEAD_CONVERTED;
  }
  
  if (!leadTicket || !leadTicket.followUpDelayDays) {
      return LeadFollowupStatus.NOT_CONFIGURED;
  }

  if (!surveyFollowupLead || !surveyFollowupLead.sendAt) {
    return LeadFollowupStatus.NEW_LEAD;
  }
  
  if (leadTicket.followup) {
    const { recontacted, appointment } = leadTicket.followup;
    if (!recontacted) {
      return LeadFollowupStatus.NOT_RECONTACTED;
    }

    if ([
      LeadFollowupStatus.NOT_PROPOSED, 
      LeadFollowupStatus.YES_PLANNED, 
      LeadFollowupStatus.YES_DONE, 
      LeadFollowupStatus.NOT_WANTED
    ].includes(appointment)) {
      return appointment;
    }
  }
  
  return LeadFollowupStatus.LEAD_WITHOUT_ANSWER;
}