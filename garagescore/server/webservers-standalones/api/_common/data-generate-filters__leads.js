/**
 * Submodule of ./data-generate-filters.js
 * Please respect the notation, it's important not to mess with the "this"
 * And also, avoid overriding Parent class' methods
 */
const SourceTypes = require('../../../../common/models/data/type/source-types');
const LeadTicketStatus = require('../../../../common/models/data/type/lead-ticket-status');
const LeadFinancing = require('../../../../common/models/data/type/lead-financing');
const LeadTimings = require('../../../../common/models/data/type/lead-timings');
const LeadSaleTypes = require('../../../../common/models/data/type/lead-sale-types');
const LeadFollowupStatus = require('../../../../common/models/data/type/lead-followup-status');

module.exports = {
  // Basics
  setBasicFilterForLeadsList() {
    this.filters = {
      shouldSurfaceInStatistics: true,
    };
    return this;
  },

  // Leads list filters
  setLeadBodyType(leadBodyType) {
    if (leadBodyType) {
      this.filters['leadTicket.bodyType'] = leadBodyType;
    }
    return this;
  },
  setLeadFinancing(leadFinancing) {
    if (LeadFinancing.hasValue(leadFinancing)) {
      this.filters['leadTicket.financing'] = leadFinancing;
    }
    return this;
  },
  setLeadTiming(leadTiming) {
    if (LeadTimings.hasValue(leadTiming)) {
      this.filters['leadTicket.timing'] = leadTiming;
    }
    return this;
  },
  setLeadSaleType(leadSaleType) {
    if (Array.isArray(leadSaleType) && leadSaleType.length > 1) {
      const result = [];
      for (const type of leadSaleType) {
        if (type === LeadSaleTypes.UNKNOWN) {
          result.push(...[LeadSaleTypes.UNKNOWN, null]);
        } else if (LeadSaleTypes.hasValue(type)) {
          result.push(type);
        }
      }
      this.filters['leadTicket.saleType'] = { $in: result };
    } else if (Array.isArray(leadSaleType) && LeadSaleTypes.hasValue(leadSaleType[0])) {
      this.filters['leadTicket.saleType'] =
        leadSaleType[0] === LeadSaleTypes.UNKNOWN ? { $in: [LeadSaleTypes.UNKNOWN, null] } : leadSaleType[0];
    } else if (leadSaleType === LeadSaleTypes.UNKNOWN) {
      this.filters['leadTicket.saleType'] = { $in: [LeadSaleTypes.UNKNOWN, null] };
    } else if (LeadSaleTypes.hasValue(leadSaleType)) {
      this.filters['leadTicket.saleType'] = leadSaleType;
    }
    return this;
  },
  setLeadManager(leadManager, { defaultManager, isManager = false, followed = false }) {
    if (leadManager) {
      if (leadManager === 'Team') {
        this.filters.$and = [
          ...(this.filters.$and || []),
          { 'leadTicket.manager': { $ne: 'undefined' } },
          { 'leadTicket.manager': { $ne: null } },
        ];
      } else if (leadManager === 'undefined') {
        this.filters.$and = [
          ...(this.filters.$and || []),
          { $or: [{ 'leadTicket.manager': 'undefined' }, { 'leadTicket.manager': null }] },
          { 'leadTicket.status': { $ne: LeadTicketStatus.CLOSED_WITH_SALE } },
          { 'leadTicket.status': { $ne: LeadTicketStatus.CLOSED_WITHOUT_SALE } },
        ];
      } else {
        this.filters['leadTicket.manager'] = leadManager;
      }
    } else if (!isManager && !followed) {

      this.filters.$and = [
        ...(this.filters.$and || []),
        {
          $or: [
            { 'leadTicket.manager': 'undefined' },
            { 'leadTicket.manager': null },
            { 'leadTicket.manager': defaultManager.id.toString() },
          ],
        },
      ];
    }
    return this;
  },
  setLeadStatus(leadStatus) {
    if (leadStatus === 'Contact') {
      this.filters['leadTicket.status'] = {
        $in: [LeadTicketStatus.WAITING_FOR_CONTACT, LeadTicketStatus.CONTACT_PLANNED],
      };
    }
    if (leadStatus === 'Meeting') {
      this.filters['leadTicket.status'] = {
        $in: [LeadTicketStatus.WAITING_FOR_MEETING, LeadTicketStatus.MEETING_PLANNED],
      };
    }
    if (leadStatus === 'Proposition') {
      this.filters['leadTicket.status'] = {
        $in: [LeadTicketStatus.WAITING_FOR_PROPOSITION, LeadTicketStatus.PROPOSITION_PLANNED],
      };
    }
    if (leadStatus === 'Closing') {
      this.filters['leadTicket.status'] = LeadTicketStatus.WAITING_FOR_CLOSING;
    }
    if (leadStatus === 'Sold') {
      this.filters['leadTicket.status'] = LeadTicketStatus.CLOSED_WITH_SALE;
    }
    if (leadStatus === 'Closed') {
      this.filters['leadTicket.status'] = {
        $in: [LeadTicketStatus.CLOSED_WITH_SALE, LeadTicketStatus.CLOSED_WITHOUT_SALE],
      };
    }
    return this;
  },
  setLeadSource(leadSource) {
    if (leadSource && leadSource.includes('Automation_')) {
      // Here we are actually asking for a combination of Automation + dataType coming from the target
      this.filters['source.type'] = SourceTypes.AUTOMATION;
      this.filters['source.by'] = leadSource.split('_').pop();
    } else if (leadSource) {
      // Automation without combination with the targetted dataType will end up here
      this.filters['source.type'] = leadSource;
    }
    return this;
  },
  setFollowupLeadStatus(followupLeadStatus) {
    // The Enum doesn't exist...
    if (followupLeadStatus === LeadFollowupStatus.LEAD_CONVERTED) {
      this.filters['lead.isConverted'] = true;
    } else if (followupLeadStatus) {
      // exclude all converted if followupLeadStatus is filled
      this.filters['lead.isConverted'] = false;
      this.filters['lead.potentialSale'] = true;
    }

    if (followupLeadStatus === LeadFollowupStatus.NOT_RECONTACTED) {
      this.filters['leadTicket.followup.recontacted'] = false;
    } else if ([
      LeadFollowupStatus.NOT_PROPOSED,
      LeadFollowupStatus.YES_PLANNED,
      LeadFollowupStatus.YES_DONE,
      LeadFollowupStatus.NOT_WANTED
    ].includes(followupLeadStatus)) {
      this.filters['leadTicket.followup.appointment'] = followupLeadStatus;
    } else if (followupLeadStatus === LeadFollowupStatus.LEAD_WITHOUT_ANSWER) {
      this.filters.$and = [
        ...(this.filters.$and || []),
        { 'leadTicket.followup': { $ne: 'undefined' } },
        { 'leadTicket.followup': { $ne: null } },
        { 'surveyFollowupLead.sendAt': { $gte: new Date(0) } },
      ];
    }
    return this;
  },
};
