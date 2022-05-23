import Enum from '~/utils/enum.js'

export default new Enum(
  {
    // Lead new projects
    INTERESTED: 'Interested',
    OBLIGATION_AND_RENEWAL: 'ObligationAndRenewal', // new, for VI
    SELLING_WITH_RENEWAL: 'SellingWithRenewal', // new, for VI
    // Leads already known
    ALREADY_PLANNED: 'AlreadyPlanned',
    IN_CONTACT_WITH_VENDOR: 'InContactWithVendor',
    OBLIGATION_AND_IN_CONTACT_WITH_VENDOR: 'ObligationAndInContactWithVendor', // new, for VI
    // Leads won from competition
    ALREADY_PLANNED_OTHER_BUSINESS: 'AlreadyPlannedOtherBusiness',
    // Below are not leads
    NOT_INTERESTED: 'NotInterested',
    ALREADY_ORDERED: 'AlreadyOrdered',
    ALREADY_ORDERED_OTHER_BUSINESS: 'AlreadyOrderedOtherBusiness',
    ALREADY_ORDERED_UNSPECIFIED: 'AlreadyOrderedUnspecified'
  },
  {
    getLeadValues() {
      // Add some choices if you need to
      return [
        this.INTERESTED,
        this.ALREADY_PLANNED,
        this.ALREADY_PLANNED_OTHER_BUSINESS,
        this.IN_CONTACT_WITH_VENDOR,
        this.OBLIGATION_AND_IN_CONTACT_WITH_VENDOR,
        this.OBLIGATION_AND_RENEWAL,
        this.SELLING_WITH_RENEWAL
      ]
    },
    isLead(type) {
      return this.getLeadValues().includes(type)
    }
  }
)
