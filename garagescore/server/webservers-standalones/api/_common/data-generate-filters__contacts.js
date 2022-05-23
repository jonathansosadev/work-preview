/**
 * Submodule of ./data-generate-filters.js
 * Please respect the notation, it's important not to mess with the "this"
 * And also, avoid overriding Parent class' methods
 */
const DataTypes = require('../../../../common/models/data/type/data-types');
const SourceTypes = require('../../../../common/models/data/type/source-types');
const EmailStatus = require('../../../../common/models/data/type/email-status');
const CampaignStatus = require('../../../../common/models/data/type/campaign-status');
const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');
const ContactTicketStatus = require('../../../../common/models/data/type/contact-ticket-status');
const CampaignContactStatus = require('../../../../common/models/data/type/campaign-contact-status');

module.exports = {
  // Basics
  setBasicFilterForContactList() {
    this.filters['source.type'] = SourceTypes.DATAFILE;
    this.filters.shouldSurfaceInStatistics = true;
    this.filters['campaign.status'] = { $ne: CampaignStatus.CANCELLED };
    this.filters.type = { $ne: DataTypes.UNKNOWN };
    return this;
  },

  // Contacts list filters
  setEmailStatus(emailStatus) {
    if (emailStatus === EmailStatus.UNSUBSCRIBED) {
      this.filters.$or = [
        { 'campaign.contactStatus.emailStatus': emailStatus },
        { 'campaign.contactStatus.previouslyUnsubscribedByEmail': true }
      ];
    } else if (emailStatus) {
      this.filters['campaign.contactStatus.emailStatus'] = emailStatus;
    }
    return this;
  },

  setPhoneStatus(phoneStatus) {
    if (phoneStatus) {
      this.filters['campaign.contactStatus.phoneStatus'] = phoneStatus;
    }
    return this;
  },

  setCampaignStatus(campaignStatus, periodId) {
    if (campaignStatus === 'ReceivedResponded') {
      this.filters['campaign.contactStatus.status'] = CampaignContactStatus.RECEIVED;
      if (periodId !== GarageHistoryPeriod.ALL_HISTORY) {
        this.filters['review.createdAt'] = { $gte: GarageHistoryPeriod.getPeriodMinDate(periodId) };
      } else {
        this.filters.review = { $exists: true };
      }
    } else if (campaignStatus === 'ReceivedNotResponded') {
      this.filters['campaign.contactStatus.status'] = CampaignContactStatus.RECEIVED;
      this.filters.review = { $exists: false };
    } else if (campaignStatus) {
      this.filters['campaign.contactStatus.status'] = campaignStatus;
    }
    return this;
  },

  setRevisionStatus(revisionStatus) {
    if (revisionStatus === 'Validated') {
      this.filters['customer.isValidated'] = true;
      this.filters['customer.isRevised'] = { $ne: true };
    }
    if (revisionStatus === 'Revised') {
      this.filters['customer.isRevised'] = true;
    }
    if (revisionStatus === 'NotValidated') {
      this.filters['customer.isValidated'] = { $ne: true };
    }
    return this;
  },

  setTicketStatus(ticketStatus, periodId) {
    const fiveDaysAgo = new Date().setDate(new Date().getDate() - 5);
    const campaignPhoneStatus = 'campaign.contactStatus.phoneStatus';
    const campaignContactStatus = 'campaign.contactStatus.status';
    const phoneStatus = !this.filters[campaignPhoneStatus] || this.filters[campaignPhoneStatus] === 'Valid';
    const contactStatus =
      !this.filters[campaignContactStatus] || this.filters[campaignContactStatus] === CampaignContactStatus.RECEIVED;

    if (ticketStatus === ContactTicketStatus.TO_RECONTACT_WITHOUT_CAMPAIGN) {
      if (
        phoneStatus &&
        (!this.filters[campaignContactStatus] || this.filters[campaignContactStatus] === CampaignContactStatus.BLOCKED)
      ) {
        this.filters.contactTicket = { $exists: false };
        this.filters[campaignContactStatus] = CampaignContactStatus.BLOCKED;
        this.filters[campaignPhoneStatus] = 'Valid';
      } else {
        this.filters['service.providedAt'] = 42;
      } // This is a trick to show NOTHING when we try to combine a phoneStatus/toRecontactWithoutCampaign
    } else if (ticketStatus === ContactTicketStatus.TO_RECONTACT) {
      if (phoneStatus && contactStatus) {
        this.filters.contactTicket = { $exists: false };
        this.filters.review = { $exists: false };
        this.filters[campaignContactStatus] = CampaignContactStatus.RECEIVED;
        this.filters[campaignPhoneStatus] = 'Valid';
        this.filters['campaign.contactScenario.firstContactedAt'] = { $lte: new Date(fiveDaysAgo) };
      } else {
        this.filters['service.providedAt'] = 42;
      } // This is a trick to show NOTHING when we try to combine a phoneStatus/toRecontact
    } else if (ticketStatus === ContactTicketStatus.NOT_POSSIBLE) {
      this.filters.contactTicket = null;
      const $or = [
        {
          'review.createdAt': { $gte: GarageHistoryPeriod.getPeriodMinDate(periodId) },
          'campaign.contactScenario.firstContactedAt': { $gt: new Date(fiveDaysAgo) },
        },
        { 'campaign.contactStatus.status': { $ne: CampaignContactStatus.RECEIVED } },
        { 'campaign.contactStatus.phoneStatus': { $ne: 'Valid' } },
      ];
      this.filters.$or = this.filters.$or ? [...this.filters.$or, ...$or] : $or;
    } else if (ticketStatus) {
      this.filters['contactTicket.status'] = ticketStatus;
    }
    if (ticketStatus === ContactTicketStatus.NOT_POSSIBLE) {
      this.filters.$and.push({ 'campaign.status': { $ne: CampaignStatus.WITHOUTCAMPAIGN } });
    }
    return this;
  },
};
