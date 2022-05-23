/**
 * Configure Alert Detection : Alert will be detected if check function return true.
 * Ids are important to track on saved Alert and it will be used in recheck alert condition
 * intervale is the waiting time until sending deferred alerts ( isDeferred must be set to true in this case)
 */
const AlertTypes = require('../../../models/alert.types.js');
const LeadSaleTypes = require('../../../models/data/type/lead-sale-types');
const dataTypes = require('../../../models/data/type/data-types');
const unsatisfiedFollowupStatus = require('../../../models/data/type/unsatisfied-followup-status.js');

const deferredAlertsDelay = parseInt(process.env.DEFERRED_ALERTS_DELAY, 10) || 3600;

const configs = [
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.LEAD_FOLLOWUP_APV_NOT_RECONTACTED,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('leadTicket.followup.recontacted') === false &&
          singleData.get('lead.saleType') === LeadSaleTypes.MAINTENANCE
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.LEAD_FOLLOWUP_VO_NOT_RECONTACTED,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('leadTicket.followup.recontacted') === false &&
          singleData.get('lead.saleType') === LeadSaleTypes.USED_VEHICLE_SALE
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.LEAD_FOLLOWUP_VN_NOT_RECONTACTED,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('leadTicket.followup.recontacted') === false &&
          [LeadSaleTypes.NEW_VEHICLE_SALE, LeadSaleTypes.UNKNOWN].includes(singleData.get('lead.saleType'))
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.LEAD_FOLLOWUP_APV_RDV_NOT_PROPOSED,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('leadTicket.followup.appointment') === 'NotProposed' &&
          singleData.get('lead.saleType') === LeadSaleTypes.MAINTENANCE
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.LEAD_FOLLOWUP_VO_RDV_NOT_PROPOSED,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('leadTicket.followup.appointment') === 'NotProposed' &&
          singleData.get('lead.saleType') === LeadSaleTypes.USED_VEHICLE_SALE
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.LEAD_FOLLOWUP_VN_RDV_NOT_PROPOSED,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('leadTicket.followup.appointment') === 'NotProposed' &&
          [LeadSaleTypes.NEW_VEHICLE_SALE, LeadSaleTypes.UNKNOWN].includes(singleData.get('lead.saleType'))
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.UNSATISFIED_FOLLOWUP,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('type') === dataTypes.MAINTENANCE &&
          singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.NOT_RESOLVED
      ),
  },
  {
    // new
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.UNSATISFIED_FOLLOWUP_VI,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('type') === dataTypes.VEHICLE_INSPECTION &&
          singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.NOT_RESOLVED
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.UNSATISFIED_FOLLOWUP_VN,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('type') === dataTypes.NEW_VEHICLE_SALE &&
          singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.NOT_RESOLVED
      ),
  },
  {
    isDeferred: true,
    interval: deferredAlertsDelay,
    type: AlertTypes.UNSATISFIED_FOLLOWUP_VO,
    check: (singleData, callback) =>
      callback(
        null,
        singleData &&
          singleData.get('type') === dataTypes.USED_VEHICLE_SALE &&
          singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.NOT_RESOLVED
      ),
  },
  // id: 666 google alert
  // id: 777 ato allow crawler
];
module.exports = configs;
