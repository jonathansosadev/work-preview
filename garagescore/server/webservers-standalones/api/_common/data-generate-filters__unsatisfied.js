/**
 * Submodule of ./data-generate-filters.js
 * Please respect the notation, it's important not to mess with the "this"
 * And also, avoid overriding Parent class' methods
 */
const TicketStatus = require('../../../../common/models/data/type/unsatisfied-ticket-status');
const UnsatisfiedFollowupStatus = require('../../../../common/models/data/type/unsatisfied-followup-status.js');

module.exports = {
  // Basics
  setBasicFilterForUnsatisfiedList() {
    this.filters = {
      shouldSurfaceInStatistics: true,
    };
    return this;
  },

  // Unsatisfied list filters
  setUnsatisfiedElapsedTime(unsatisfiedElapsedTime) {
    if (unsatisfiedElapsedTime) {
      this.filters['unsatisfiedTicket.delayStatus'] = unsatisfiedElapsedTime;
    }
    return this;
  },

  setUnsatisfiedDataType(unsatisfiedDataType) {
    if (unsatisfiedDataType) {
      this.filters['unsatisfiedTicket.type'] = unsatisfiedDataType;
    }
    return this;
  },

  setUnsatisfiedHasLead(unsatisfiedHasLead) {
    if (unsatisfiedHasLead) {
      this.filters['lead.timing'] = { $gte: 0 };
    }
    return this;
  },

  setSurveySatisfactionLevel(surveySatisfactionLevel) {
    if (surveySatisfactionLevel) {
      if (surveySatisfactionLevel === 'Neutral') {
        this.filters['review.rating.value'] = { $gt: 6, $lt: 9 };
      } else {
        this.filters['review.rating.value'] = { $lte: 6 };
      }
    }
    return this;
  },

  setUnsatisfiedStatus(unsatisfiedStatus) {
    if (unsatisfiedStatus) {
      switch (unsatisfiedStatus) {
        case 'Contact':
          this.filters['unsatisfiedTicket.status'] = {
            $in: [TicketStatus.WAITING_FOR_CONTACT, TicketStatus.CONTACT_PLANNED],
          };
          break;
        case 'Visit':
          this.filters['unsatisfiedTicket.status'] = {
            $in: [TicketStatus.WAITING_FOR_VISIT, TicketStatus.VISIT_PLANNED],
          };
          break;
        case 'Closing':
          this.filters['unsatisfiedTicket.status'] = TicketStatus.WAITING_FOR_CLOSING;
          break;
        case 'Resolved':
          this.filters['unsatisfiedTicket.status'] = TicketStatus.CLOSED_WITH_RESOLUTION;
          break;
        case 'Closed':
          this.filters['unsatisfiedTicket.status'] = {
            $in: [TicketStatus.CLOSED_WITH_RESOLUTION, TicketStatus.CLOSED_WITHOUT_RESOLUTION],
          };
          break;

        default:
          break;
      }
    }
    return this;
  },

  setUnsatisfiedFollowUpStatus(unsatisfiedFollowUpStatus) {
    if (unsatisfiedFollowUpStatus) {
      switch (unsatisfiedFollowUpStatus) {
        case UnsatisfiedFollowupStatus.NEW_UNSATISFIED:
          this.filters.$or = [
            ...(this.filters.$or || []),
            { 'surveyFollowupUnsatisfied.sendAt': { $eq: 'undefined' } },
            { 'surveyFollowupUnsatisfied.sendAt': { $eq: null } },
          ];
          this.filters['review.rating.value'] = { $lte: 6 };
          this.filters['surveyFollowupUnsatisfied.sendAt'] = { $ne: 'undefined' };
          break;
        case UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER:
          this.filters.$or = [
            ...(this.filters.$or || []),
            { 'unsatisfied.followupStatus': { $eq: 'undefined' } },
            { 'unsatisfied.followupStatus': { $eq: null } },
          ];
          this.filters['surveyFollowupUnsatisfied.sendAt'] = { $gte: new Date(0) };
          break;
        case UnsatisfiedFollowupStatus.RESOLVED:
        case UnsatisfiedFollowupStatus.NOT_RESOLVED:
        case UnsatisfiedFollowupStatus.IN_PROGRESS:
          this.filters['unsatisfied.followupStatus'] = unsatisfiedFollowUpStatus;
          break;
        default:
          break;
      }
    }
    return this;
  },

  setUnsatisfiedManager(unsatisfiedManager, userId, isManager) {
    if (unsatisfiedManager) {
      if (unsatisfiedManager === 'Team') {
        if (!this.filters.$and) {
          this.filters.$and = [];
        }
        this.filters.$and.push(
          ...[{ 'unsatisfiedTicket.manager': { $ne: 'undefined' } }, { 'unsatisfiedTicket.manager': { $ne: null } }]
        ); // eslint-disable-line
      } else if (unsatisfiedManager === 'undefined') {
        if (!this.filters.$and) {
          this.filters.$and = [];
        }
        this.filters.$and.push({
          $or: [{ 'unsatisfiedTicket.manager': 'undefined' }, { 'unsatisfiedTicket.manager': null }],
        });
        this.filters.$and.push({ 'unsatisfiedTicket.status': { $ne: TicketStatus.CLOSED_WITH_RESOLUTION } });
        this.filters.$and.push({ 'unsatisfiedTicket.status': { $ne: TicketStatus.CLOSED_WITHOUT_RESOLUTION } });
      } else {
        this.filters['unsatisfiedTicket.manager'] = unsatisfiedManager;
      }
    } else if (!isManager) {
      if (!this.filters.$and) {
        this.filters.$and = [];
      }
      this.filters.$and.push({
        $or: [
          { 'unsatisfiedTicket.manager': 'undefined' },
          { 'unsatisfiedTicket.manager': null },
          { 'unsatisfiedTicket.manager': userId },
        ],
      }); // eslint-disable-line
    }
    return this;
  },
};
