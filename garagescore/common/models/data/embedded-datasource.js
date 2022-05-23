const SourceTypes = require('./type/source-types');
/**
 * Source data
 */
const model = () => ({
  properties: {
    /** type of source, this field cannot be named 'type' as it would make loopback bug */
    sourceType: {
      type: SourceTypes.type,
    },
    /* dataFile Id  */
    sourceId: {
      type: 'string',
      required: true,
    },
    /* When the data was imported from the source */
    importedAt: {
      type: 'date',
      required: true,
    },
    /* Raw info (ex: row in excel)*/
    raw: {
      type: 'object',
      required: true,
    },
    /* Checksum of the review, only used by ExogenousReviews at this time */
    checksum: {
      type: 'string',
      required: false,
    },
  },
});

module.exports = { model };
