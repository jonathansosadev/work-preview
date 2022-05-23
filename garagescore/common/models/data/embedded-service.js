// const serviceCategories = require('./type/service-categories');
const { ServiceMiddleMans } = require('../../../frontend/utils/enumV2');

/**
 * A commercial service (maintenance, sale)
 * With billing data and assignee
 */
const model = () => ({
  properties: {
    /* Is the service a quote */
    isQuote: {
      type: 'boolean',
      required: true,
      default: false,
    },
    /* When the service was provided */
    providedAt: {
      type: 'date',
      required: true,
    },
    /* How much the service (would) cost */
    price: {
      type: 'number',
      required: true,
    },
    /* When the service was billed */
    billedAt: {
      type: 'date',
    },
    /* details of the service */
    // categories: [
    //   { type: serviceCategories.type }
    // ],
    /* Who is assigned in the company to provide the service */
    frontDeskUserName: {
      type: 'string',
    },
    /* Company team of frontDeskUserName  */
    frontDeskUserTeam: {
      type: 'string',
    },
    /* Internal garage  id in the company */
    frontDeskGarageId: {
      type: 'string',
    },
    /* Internal customer id in the company */
    frontDeskCustomerId: {
      type: 'string',
    },
    /* this is a field from the customer response of th survey */
    middleMans: {
      type: [{ type: ServiceMiddleMans.type }],
    },
  },
});

const prototypeMethods = {};
module.exports = { model, prototypeMethods };
