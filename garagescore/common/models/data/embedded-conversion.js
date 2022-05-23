/**
 * Conversions data
 */
const LeadTypes = require('./type/lead-types');

const model = () => ({
  properties: {
    /* do we have a lead with the same customer */
    isConvertedFromLead: {
      type: 'boolean',
      default: false,
    },
    /* original lead date */
    leadSourceProvidedAt: {
      type: 'date',
    },
    /* original lead id */
    leadSourceDataId: {
      type: 'string',
    },
    /* original lead type */
    leadSourceType: {
      type: LeadTypes.type,
    },
    leadSourceManagerId: {
      type: 'string',
    },
    /* do we have a lead with the same vehicle */
    isConvertedFromTradeIn: {
      type: 'boolean',
      default: false,
    },
    /* original tradeIn date */
    tradeInSourceProvidedAt: {
      type: 'date',
    },
    /* original tradeIn id */
    tradeInSourceDataId: {
      type: 'string',
    },
    /* original lead type */
    tradeInSourceType: {
      type: LeadTypes.type,
    },
    tradeInSourceManagerId: {
      type: 'string',
    },
  },
});

module.exports = { model };
