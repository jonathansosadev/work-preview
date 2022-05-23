const UnsatisfiedFollowupStatus = require('../../../../common/models/data/type/unsatisfied-followup-status');

module.exports = function followupUnsatisfiedStatus({ unsatisfied, unsatisfiedTicket, surveyFollowupUnsatisfied, review }) {
  if (!unsatisfiedTicket) {
    return null;
  }
  
  if (!unsatisfiedTicket.followUpDelayDays) {
    return UnsatisfiedFollowupStatus.NOT_CONFIGURED;
  }

  if (review && (!surveyFollowupUnsatisfied || !surveyFollowupUnsatisfied.sendAt)) {
    const { rating } = review;
    if (typeof rating === 'undefined') {
      return UnsatisfiedFollowupStatus.FOLLOWUP_MANUAL;
    } 
    if (rating.value > 6) {
      return UnsatisfiedFollowupStatus.FOLLOWUP_SENSIBLE;
    }
    return UnsatisfiedFollowupStatus.NEW_UNSATISFIED;
  }

  if (unsatisfied) {
    const { followupStatus } = unsatisfied;
    if ([
      UnsatisfiedFollowupStatus.IN_PROGRESS,
      UnsatisfiedFollowupStatus.NOT_RESOLVED,
      UnsatisfiedFollowupStatus.RESOLVED
    ].includes(followupStatus))
      return followupStatus;
  }
  
  return UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER;
}