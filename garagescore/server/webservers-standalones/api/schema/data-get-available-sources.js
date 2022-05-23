const { AuthenticationError } = require('apollo-server-express');
const queries = require('../../../../frontend/api/graphql/definitions/queries.json');
const SourceTypes = require('../../../../common/models/data/type/source-types');

const { ANASS, log } = require('../../../../common/lib/util/log');

const typePrefix = 'dataGetAvailableSources';
module.exports.typeDef = `
  extend type Query {
    ${queries[typePrefix].type}: ${typePrefix}Sources

  }
  type ${typePrefix}Sources {
    sources: [String!]
  }
`;

const getGarageIdsToFilter = ({ godMode, garageIds, garageId }) => {
  if (godMode) {
    if (!garageId) {
      throw new Error('Please select 1 garage for god users');
    }
    return garageId.length <= 1 ? [garageId[0].toString()] : garageId.map((gId) => gId.toString())
  }else {
    if (!garageId){
      return garageIds.map((gId) => gId.toString());
    }else {
      return garageId.length <= 1 ? [garageId[0].toString()] : garageId.map((gId) => gId.toString())
    }
  }
};

const getBaseSourceList = ({ leadSaleType, customSourcesOnly }) => {
  if (customSourcesOnly) {
    return [];
  }
  return (
    SourceTypes.keys()
      .filter((key) => {
        const isManualLeadSource = SourceTypes.getProperty(key, 'manualLeadSource');
        const saleTypeProp = SourceTypes.getProperty(key, 'saleType');
        const isApplicableToDataType = saleTypeProp && saleTypeProp.includes(leadSaleType);
        return isManualLeadSource && isApplicableToDataType;
      })
      // Remove that map if we prefer returning the keys instead
      .map((key) => SourceTypes[key])
  );
};

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, godMode, garageIds },
        } = context;
        const { garageId, leadSaleType, customSourcesOnly } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const leadTicketConnector = app.models.DatasAsyncviewLeadTicket.getMongoConnector();
        const garageIdsToFilter = getGarageIdsToFilter({ godMode, garageIds, garageId });

        const rawSourceList = await leadTicketConnector.distinct('source.type', {
          garageId: { $in: garageIdsToFilter },
        });

        const baseSourceList = getBaseSourceList({ leadSaleType, customSourcesOnly });

        const customSources = rawSourceList.filter((source) => !SourceTypes.hasValue(source));

        return { sources: [...baseSourceList, ...customSources] };
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
