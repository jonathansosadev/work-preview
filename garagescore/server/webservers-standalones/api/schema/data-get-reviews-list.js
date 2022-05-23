const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const config = require('config');
const GraphQLDate = require('graphql-date');
const { dataGetReviewsList } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const DataFilters = require('../_common/data-generate-filters');
const { ObjectId } = require('mongodb');
const DataTypes = require('../../../../common/models/data/type/data-types');
const SourceTypes = require('../../../../common/models/data/type/source-types');
const followupLeadStatus = require('../_common/followup-lead-status');
const followupUnsatisfiedStatus = require('../_common/followup-unsatisfied-status');

const { IZAD, log } = require('../../../../common/lib/util/log');

const typePrefix = 'dataGetReviewsList';
const resolveFunctions = {
  Date: GraphQLDate,
};

module.exports.typeDef = `
  extend type Query {
    ${dataGetReviewsList.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    datas: [${typePrefix}Datas]
    hasMore: Boolean
    cursor: Date
    noResultGodMode: Boolean
  }

  type ${typePrefix}Datas {
    id: ID
    type: String
    followupUnsatisfiedStatus: String # Custom type followupUnsatisfiedStatus
    followupLeadStatus: String # Custom type followupLeadStatus
    isApv: Boolean
    isVn: Boolean
    isVo: Boolean
    garage: ${typePrefix}Garage
    review: ${typePrefix}Review
    vehicle: ${typePrefix}Vehicle
    lead: ${typePrefix}Lead
    service: ${typePrefix}Service
    leadTicket: ${typePrefix}LeadTicket
    customer: ${typePrefix}Customer
    unsatisfied: ${typePrefix}Unsatisfied
    surveyFollowupUnsatisfied: ${typePrefix}SurveyFollowupUnsatisfied
    surveyFollowupLead: ${typePrefix}SurveyFollowupLead
  }

  type ${typePrefix}Garage {
    id: ID
    type: String
    ratingType: String
    publicDisplayName: String
  }

  type ${typePrefix}Review {
    createdAt: Date
    fromCockpitContact: Boolean
    followupChangeEvaluation: String
    surveyComment: String
    comment: ${typePrefix}ReviewComment
    reply: ${typePrefix}ReviewReply
    rating: ${typePrefix}ReviewRating
    followupUnsatisfiedComment: ${typePrefix}ReviewFollowupUnsatisfiedComment
  }

  type ${typePrefix}ReviewComment {
    text: String
    status: String
    rejectedReason: String
  }

  type ${typePrefix}ReviewReply {
    text: String
    status: String
    rejectedReason: String
  }

  type ${typePrefix}ReviewRating {
    value: Int
  }

  type ${typePrefix}ReviewFollowupUnsatisfiedComment {
    text: String
  }

  type ${typePrefix}Vehicle {
    model: ${typePrefix}Value
    make: ${typePrefix}Value
    plate: ${typePrefix}Value
    vin: ${typePrefix}Value
    mileage: ${typePrefix}Value
    registrationDate: ${typePrefix}Value
  }

  type ${typePrefix}Value {
    value: String
  }

  type ${typePrefix}Lead {
    potentialSale: Boolean
    timing: String
    saleType: String
    knowVehicle: Boolean
    brands: [String]
    bodyType: [String]
    energyType: [String]
    cylinder: [String]
    tradeIn: String
    financing: String
    type: String
    conversion: ${typePrefix}Conversion
  }

  type ${typePrefix}Service {
    frontDeskUserName: String
    providedAt: Date
    frontDeskCustomerId: ID
  }

  type ${typePrefix}LeadTicket {
    followup: ${typePrefix}LeadTicketFollowUp
  }

  type ${typePrefix}LeadTicketFollowUp {
    recontacted: Boolean
    satisfied: Boolean
    satisfiedReasons: [String]
    notSatisfiedReasons: [String]
    appointment: String
  }

  type ${typePrefix}Customer {
    fullName: ${typePrefix}Value
    city: ${typePrefix}Value
    contact: ${typePrefix}Contact
  }

  type ${typePrefix}Contact {
    email: ${typePrefix}ContactObj
    mobilePhone: ${typePrefix}ContactObj
  }

  type ${typePrefix}ContactObj {
    value: String
  }

  type ${typePrefix}Unsatisfied {
    isRecontacted: Boolean
    criteria: [${typePrefix}UnsatisfiedCriteria]
  }

  type ${typePrefix}UnsatisfiedCriteria {
    label: String
    values: [String]
  }

  type ${typePrefix}SurveyFollowupUnsatisfied {
    sendAt: Date
    firstRespondedAt: Date
  }
    
  type ${typePrefix}SurveyFollowupLead {
    sendAt: Date
    firstRespondedAt: Date
  }

  type ${typePrefix}Conversion {
    sale: ${typePrefix}ConversionSale
    tradeIn: ${typePrefix}ConversionTradeIn
  }

  type ${typePrefix}ConversionSale {
    type: String
    vehicle: ${typePrefix}ConversionVehicle
    service: ${typePrefix}ConversionService
  }

  type ${typePrefix}ConversionVehicle {
    model: ${typePrefix}Value
    make: ${typePrefix}Value
    plate: ${typePrefix}Value
  }

  type ${typePrefix}ConversionService {
    providedAt: Date
    frontDeskUserName: String
  }

  type ${typePrefix}ConversionTradeIn {
    customer: ${typePrefix}ConversionTradeInCustomer
    vehicle: ${typePrefix}ConversionVehicle
    service: ${typePrefix}ConversionService
  }

  type ${typePrefix}ConversionTradeInCustomer {
    fullName: ${typePrefix}Value
    contact: ${typePrefix}ConversionTradeInCustomerContact
  }

  type ${typePrefix}ConversionTradeInCustomerContact {
    mobilePhone: ${typePrefix}Value
    email: ${typePrefix}Value
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, garageIds },
        } = context;
        const {
          limit: limitArg,
          before: beforeArg = null,
          periodId,
          cockpitType,
          search,
          garageId,
          type,
          surveySatisfactionLevel,
          publicReviewStatus,
          publicReviewCommentStatus,
          followupUnsatisfiedStatus,
          followupLeadStatus,
          dataId,
          frontDeskUserName,
        } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized');
        }

        if (user.isGod() && !garageId) return { datas: [], hasMore: false, noResultGodMode: true };

        const before = beforeArg && new Date(beforeArg);
        const query = new DataFilters()
          .setBasicFilterForSatisfactionList()
          .setCockpitType(cockpitType)
          .setGarageId(garageIds, garageId)
          .setType(type)
          .setPeriodId(periodId, { dateField: 'review.createdAt', filterDefaultDate: true, before })
          .setSearch(search)
          .setSurveySatisfactionLevelForSatisfaction(surveySatisfactionLevel)
          .setFollowupLeadStatus(followupLeadStatus)
          .setPublicReviewStatus(publicReviewStatus)
          .setPublicReviewCommentStatus(publicReviewCommentStatus)
          .setFollowupUnsatisfiedStatus(followupUnsatisfiedStatus)
          .setSource([SourceTypes.DATAFILE, SourceTypes.AGENT])
          .setDataId(dataId)
          .setFrontDeskUserName(frontDeskUserName)
          .generateMatch();

        const projection = {
          id: '$_id',
          garageId: true, // for garage.id & garage.publicDisplayName
          type: true, // for isApv, isVn...
          review: {
            createdAt: true,
            fromCockpitContact: true,
            followupUnsatisfiedComment: { text: true }, // not only for followupChangeEvaluation
            followupUnsatisfiedRating: true, // for followupChangeEvaluation
            rating: {
              value: true,
            },
            comment: {
              text: true,
              moderated: true,
              status: true,
              rejectedReason: true,
            },
            reply: {
              text: true,
              status: true,
              rejectedReason: true,
            },
          },
          customer: {
            fullName: {
              value: true,
            },
            contact: {
              mobilePhone: true,
              email: true,
            },
            city: {
              value: true,
            },
          },
          vehicle: {
            model: {
              value: true,
            },
            make: {
              value: true,
            },
            plate: {
              value: true,
            },
            vin: {
              value: true,
            },
            mileage: {
              value: true,
            },
            registrationDate: {
              value: true,
            },
          },
          lead: {
            potentialSale: true,
            isConverted: true,
            timing: true,
            saleType: true,
            knowVehicle: true,
            brands: true,
            bodyType: true,
            energyType: true,
            cylinder: true,
            tradeIn: true,
            financing: true,
            type: true,
            isConvertedToSale: true,
            isConvertedToTradeIn: true,
            convertedSaleDataId: true,
            convertedTradeInDataId: true,
          },
          service: {
            frontDeskUserName: true,
            providedAt: true,
            frontDeskCustomerId: true,
          },
          leadTicket: {
            followUpDelayDays: true,
            followup: {
              recontacted: true,
              satisfied: true,
              satisfiedReasons: true,
              notSatisfiedReasons: true,
              appointment: true,
            },
          },
          surveyFollowupLead: {
            sendAt: true,
            firstRespondedAt: true,
          },
          unsatisfied: {
            isRecontacted: true,
            criteria: {
              label: true,
              values: true,
            },
          },
          unsatisfiedTicket: {
            followUpDelayDays: true,
          },
          surveyFollowupUnsatisfied: {
            sendAt: true,
            firstRespondedAt: true,
          },
        };

        const sort = { 'review.createdAt': -1 };
        const limit = limitArg < 1 || limitArg > 100 ? config.get('server.queryLimits.list') + 1 : limitArg + 1;
        const datas = await app.models.Data.getMongoConnector().find(query, { projection, sort, limit }).toArray();

        const hasMore = datas.length === limit;
        if (hasMore) {
          datas.pop();
        }
        const cursor = hasMore && datas[datas.length - 1].review && datas[datas.length - 1].review.createdAt;
        const garageIdsToFetch = datas
          .map(({ garageId }) => garageId)
          .filter((gId, i, list) => gId && list.indexOf(gId) === i)
          .map((gId) => new ObjectId(gId));

        const garages = await app.models.Garage.getMongoConnector()
          .find(
            { _id: { $in: garageIdsToFetch } },
            { projection: { id: '$_id', publicDisplayName: true, ratingType: true, type: true } }
          )
          .toArray();

        const conversionsDataIdsTofetch = datas
          .reduce((conversionsDataIdsArray, { lead }) => {
            if (!lead) {
              return conversionsDataIdsArray;
            }
            if (lead.convertedSaleDataId) {
              conversionsDataIdsArray.push(lead.convertedSaleDataId);
            }
            if (lead.convertedTradeInDataId) {
              conversionsDataIdsArray.push(lead.convertedTradeInDataId);
            }
            return conversionsDataIdsArray;
          }, [])
          .filter((gId, i, list) => gId && list.indexOf(gId) === i)
          .map((gId) => new ObjectId(gId));

        const conversionsDatas = await app.models.Data.getMongoConnector()
          .find(
            { _id: { $in: conversionsDataIdsTofetch } },
            { projection: { id: '$_id', type: true, customer: true, service: true, vehicle: true } }
          )
          .toArray();

        context.conversionsDatas = Object.fromEntries(
          conversionsDatas.map((conversionsData) => [conversionsData.id, conversionsData])
        );

        context.garages = Object.fromEntries(garages.map((garage) => [garage.id, garage]));
        return { datas, hasMore, cursor };
      } catch (error) {
        log.error(IZAD, error);
        return error;
      }
    },
  },
  [`${typePrefix}Datas`]: {
    garage: async ({ garageId }, args, { garages }) => {
      return garages[garageId] || null;
    },
    isApv: async ({ type }) => {
      return type === DataTypes.MAINTENANCE;
    },
    isVn: async ({ type }) => {
      return type === DataTypes.NEW_VEHICLE_SALE;
    },
    isVo: async ({ type }) => {
      return type === DataTypes.USED_VEHICLE_SALE;
    },
    followupLeadStatus: async (data) => {
      return followupLeadStatus(data, true);
    },
    followupUnsatisfiedStatus: async (data) => {
      return followupUnsatisfiedStatus(data); 
    },
  },
  [`${typePrefix}Review`]: {
    followupChangeEvaluation: async ({ followupUnsatisfiedComment, followupUnsatisfiedRating }) => {
      if (followupUnsatisfiedComment || followupUnsatisfiedRating) {
        return 'yes';
      }
      return 'no';
    },
    surveyComment: async ({ comment }) => {
      if (!comment) {
        return null;
      }
      const { moderated, text } = comment;
      if (moderated) {
        return `${moderated} (modéré)`;
      }
      return text;
    },
  },
  [`${typePrefix}Lead`]: {
    conversion: async (
      { isConvertedToSale, isConvertedToTradeIn, convertedSaleDataId, convertedTradeInDataId },
      args,
      { conversionsDatas }
    ) => {
      const conversions = {
        sale: null,
        tradeIn: null,
      };
      if (!isConvertedToSale && !isConvertedToTradeIn) {
        return conversions;
      }
      if (isConvertedToSale && convertedSaleDataId) {
        conversions.sale = conversionsDatas[convertedSaleDataId] || null;
      }

      if (isConvertedToTradeIn && convertedTradeInDataId) {
        conversions.tradeIn = conversionsDatas[convertedTradeInDataId] || null;
      }

      return conversions;
    },
  },
  [`${typePrefix}Customer`]: {
    contact: async ({ contact }) => {
      if (!contact) {
        return null;
      }

      return {
        email: { value: (contact.email && contact.email.value) || (contact.email && contact.email.original) },
        mobilePhone: {
          value:
            (contact.mobilePhone && contact.mobilePhone.value) || (contact.mobilePhone && contact.mobilePhone.original),
        },
      };
    },
  },
};
