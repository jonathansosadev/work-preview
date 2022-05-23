const { ObjectId } = require('mongodb');
/**
 * A CockpitTopFilter document
 * @typedef {Object} CockpitTopFilter
 * @property {ObjectId} [id]
 * @property {ObjectId} [_id]
 * @property {string} garageId
 * @property {string} source
 * @property {string | null} frontDeskUserName
 * @property {string} type
 * @property {string} [unsatisfiedTicketManager]
 * @property {string} [leadSaleType]
 * @property {string} [leadTicketManager]
 * @property {CockpitTopFilterIndex[]} [index]
 * @property {Date|string} [createdAt]
 * @property {Date|string} [updatedAt]
 * @property {string} [status]
 * @property {string} garageType
 * @property {string} garagePublicDisplayName
 * @property {string} [automationCampaignType]
 */

/**
 * @typedef {Object} CockpitTopFilterIndex
 * @property {string} k
 * @property {string} v
 */

const CockpitTopFilterModel = {
  /**
   * Save cockpitTopFilter in bdd
   * @param {object} app the app instance
   * @param {CockpitTopFilter} data the CockpitTopFilter data to insert
   * @returns {Promise<object>} the inserted mongo document
   */
  create: async function (app, data) {
    const document = { ...data };

    /* add createdAt and updatedAt properties */
    document.createdAt = new Date();
    document.updatedAt = new Date();

    /* convert ObjectId properties to a string */
    const objectIdKeys = ['garageId', 'leadTicketManager', 'unsatisfiedTicketManager'];
    objectIdKeys.forEach((key) => {
      if (document[key]) {
        document[key] = document[key].toString();
      }
    });

    return app.models.CockpitTopFilter.getMongoConnector().insertOne(document);
  },
};

module.exports = CockpitTopFilterModel;
