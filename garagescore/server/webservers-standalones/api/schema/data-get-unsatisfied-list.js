const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const { ObjectId } = require('mongodb');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { dataGetUnsatisfiedList } = require('../../../../frontend/api/graphql/definitions/queries.json');
const DataFilters = require('../_common/data-generate-filters');
const { garagesWanted } = require('../_common/search-garages');
const config = require('config');
const { ANASS, log } = require('../../../../common/lib/util/log');
const followupUnsatisfiedStatus = require('../_common/followup-unsatisfied-status');

const typePrefix = 'dataGetUnsatisfiedList';
const resolveFunctions = {
  Date: GraphQLDate,
};
module.exports.typeDef = `
  extend type Query {
    ${dataGetUnsatisfiedList.type}: ${typePrefix}UnsatisfiedList
  }

  type ${typePrefix}UnsatisfiedList {
    datas: [${typePrefix}Data]
    hasMore: Boolean
    cursor: Date
    noResultGodMode: Boolean
  }
  type ${typePrefix}Data {    
    id: ID!
    unsatisfiedTicket: ${typePrefix}UnsatisfiedTicket
    garage: ${typePrefix}Garage
    source: ${typePrefix}Source
    review: ${typePrefix}Review
    service: ${typePrefix}Service
    surveyFollowupUnsatisfied: ${typePrefix}SurveyFollowupUnsatisfied
    unsatisfied: ${typePrefix}Unsatisfied
    customer: ${typePrefix}Customer
    followupUnsatisfiedStatus: String # Custom type followupUnsatisfiedStatus
  }

  """ UnsatisfiedTicket """
  type ${typePrefix}UnsatisfiedTicket {
    type: String
    delayStatus: String
    status: String
    createdAt: Date 
    referenceDate: Date 
    closedAt: Date 
    manager: ${typePrefix}Manager # get user with manager USER COLLECTION
    frontDeskUserName: String 
    criteria: [${typePrefix}Criteria] 
    actions: [${typePrefix}Actions]
    vehicle: ${typePrefix}Vehicle
    comment: String
  }
  type ${typePrefix}Manager {
    id: ID
    firstName: String
    lastName: String
    email: String
  }

  """ Source """
  type ${typePrefix}Source {
    type: String 
  }

  type ${typePrefix}Value {
    value: String
  }

  """ Review """
  type ${typePrefix}Review {
    createdAt: Date 
    followupChangeEvaluation: Boolean 
    rating: ${typePrefix}Value
    comment: ${typePrefix}Comment
  }
  type ${typePrefix}Comment {
    text: String 
    moderated: String 
  }

   """ customer """
  type ${typePrefix}Customer {
    fullName: String 
    contact:  ${typePrefix}Contact
    city: String
  }
  type ${typePrefix}Contact {
    mobilePhone: String 
    email: String 
  }

  """ service """
  type ${typePrefix}Service {
    frontDeskCustomerId: String 
    providedAt: Date 
  }

  """ vehicle """
  type ${typePrefix}Vehicle {
    make: String 
    model: String 
    plate: String 
    vin: String
    mileage: Int
    registrationDate: String
  }

  """ surveyFollowupUnsatisfied """
  type ${typePrefix}SurveyFollowupUnsatisfied {
    sendAt: Date 
    lastRespondedAt: Date 
  }

  """ unsatisfied """
  type ${typePrefix}Unsatisfied {
    sendAt: Date 
    followupStatus: String 
    isRecontacted: String 
    criteria: [${typePrefix}Criteria] 
  }

  """ garage COLLECTION""" 
  type ${typePrefix}Garage {
    id: ID
    publicDisplayName: String 
    type: String 
    ratingType: String 
  }

  """ custom Criteria """
  type ${typePrefix}Criteria {
    label: String 
    values: [String] 
  }

  """ unsatisfiedTicket.actions """
  type ${typePrefix}Actions {
    name: String 
    createdAt: Date 
    comment: String 
    unsatisfactionResolved: Boolean 
    closedForInactivity: Boolean 
    providedSolutions: [String] 
    claimReasons: [String] 
    isManual: Boolean 
    assigner: ${typePrefix}Assigner # get user with assignerUserId USER COLLECTION 
    ticketManager: ${typePrefix}TicketManager # get user with ticketManagerId USER COLLECTION
    previousTicketManager: ${typePrefix}PreviousTicketManager # get user with previousTicketManagerId USER COLLECTION
    newValue: String 
    previousValue: String 
    newArrayValue: [String] 
    previousArrayValue: [String] 
    field: String 
    reminderDate: String 
    reminderActionName: String 
    reminderStatus: String 
    reminderTriggeredBy: ${typePrefix}ReminderTriggeredBy # get user with reminderTriggeredByUserId
    followupStatus: String 
    followupIsRecontacted: Boolean
    followupUnsatisfiedCommentForManager: String
  }
  type ${typePrefix}Assigner {
      lastName: String
      firstName: String
      email: String
  }
  type ${typePrefix}TicketManager {
      id: ID
      lastName: String
      firstName: String
      email: String
      job: String
  }
  type ${typePrefix}PreviousTicketManager {
      id: ID
      lastName: String
      firstName: String
      email: String
  }
  type ${typePrefix}ReminderTriggeredBy {
      id: ID
      firstName: String
      lastName: String
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode, garageIds },
        } = context;
        const {
          periodId,
          before,
          limit: limitArg,
          garageId,
          cockpitType,
          search,
          unsatisfiedDataType,
          unsatisfiedElapsedTime,
          surveySatisfactionLevel,
          unsatisfiedHasLead,
          unsatisfiedManager,
          unsatisfiedStatus,
          unsatisfiedFollowUpStatus,
        } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }

        if (godMode && !garageId) {
          return {
            datas: [],
            hasMore: false,
            cursor: null,
            noResultGodMode: true,
          };
        }

        const userGarages = await garagesWanted(app, cockpitType, garageId, garageIds);
        const isManager = godMode || (await user.isManager());
        const query = new DataFilters()
          .setBasicFilterForUnsatisfiedList()
          .setGarageId(userGarages, garageId)
          .setPeriodId(periodId, {
            dateField: 'unsatisfiedTicket.referenceDate',
            filterDefaultDate: true,
            before: before && new Date(before),
          })
          .setSearch(search)
          .setUnsatisfiedElapsedTime(unsatisfiedElapsedTime)
          .setUnsatisfiedDataType(unsatisfiedDataType)
          .setUnsatisfiedHasLead(unsatisfiedHasLead)
          .setSurveySatisfactionLevel(surveySatisfactionLevel)
          .setUnsatisfiedStatus(unsatisfiedStatus)
          .setUnsatisfiedFollowUpStatus(unsatisfiedFollowUpStatus)
          .setUnsatisfiedManager(unsatisfiedManager, user.id.toString(), isManager)
          .generateMatch();

        const projection = {
          _id: false,
          id: '$_id',
          garageId: true,
          customer: {
            city: {
              value: true,
            },
          },
          unsatisfiedTicket: {
            type: true,
            followUpDelayDays: true,
            delayStatus: true,
            status: true,
            createdAt: true,
            referenceDate: true,
            closedAt: true,
            manager: true,
            frontDeskUserName: true,
            criteria: {
              label: true,
              values: true,
            },
            vehicle: {
              make: true,
              model: true,
              plate: true,
              vin: true,
              mileage: true,
              registrationDate: true,
            },
            customer: {
              fullName: true,
              contact: {
                mobilePhone: true,
                email: true,
              },
            },
            comment: true,
            actions: {
              name: true,
              createdAt: true,
              comment: true,
              unsatisfactionResolved: true,
              closedForInactivity: true,
              providedSolutions: true,
              claimReasons: true,
              isManual: true,
              assignerUserId: true,
              ticketManagerId: true,
              previousTicketManagerId: true,
              newValue: true,
              previousValue: true,
              newArrayValue: true,
              previousArrayValue: true,
              field: true,
              reminderDate: true,
              reminderActionName: true,
              reminderStatus: true,
              reminderTriggeredByUserId: true,
              followupStatus: true,
              followupIsRecontacted: true,
              followupUnsatisfiedCommentForManager: true,
            },
          },
          source: {
            type: true,
          },
          review: {
            createdAt: true,
            followupUnsatisfiedRating: true,
            rating: {
              value: true,
            },
            comment: {
              text: true,
              moderated: true,
            },
            followupUnsatisfiedComment: {
              text: true,
            },
          },
          service: {
            frontDeskCustomerId: true,
            providedAt: true,
          },
          surveyFollowupUnsatisfied: {
            sendAt: true,
            lastRespondedAt: true,
          },
          unsatisfied: {
            sendAt: true,
            followupStatus: true,
            isRecontacted: true,
            criteria: {
              label: true,
              values: true,
            },
          },
        };
        const sort = { 'unsatisfiedTicket.referenceDate': -1 };
        // Todo => Replace skip by after param
        const limit = limitArg < 1 || limitArg > 100 ? config.get('server.queryLimits.list') + 1 : limitArg + 1;

        const datas = await app.models.Data.getMongoConnector().find(query, { projection, sort, limit }).toArray();

        const hasMore = datas.length === limit;
        if (hasMore) {
          datas.pop();
        }
        const cursor =
          hasMore &&
          datas[datas.length - 1].unsatisfiedTicket &&
          datas[datas.length - 1].unsatisfiedTicket.referenceDate;

        const garageIdsToFetch = [...datas.map(({ garageId }) => garageId)]
          .filter((gId, i, list) => gId && list.indexOf(gId) === i)
          .map((gId) => new ObjectId(gId));

        const garages = await app.models.Garage.getMongoConnector()
          .find(
            { _id: { $in: garageIdsToFetch } },
            {
              projection: {
                id: '$_id',
                publicDisplayName: true,
                type: true,
                ratingType: true,
                campaignScenarioId: true,
              },
            }
          )
          .toArray();

        const usersIds = [];
        const fields = ['assignerUserId', 'ticketManagerId', 'previousTicketManagerId', 'reminderTriggeredByUserId'];

        for (const data of datas) {
          const { manager, actions } = data.unsatisfiedTicket || {};
          if (manager) {
            usersIds.push(manager.toString());
          }
          if (actions && actions.length) {
            for (const action of actions) {
              for (const field of fields) {
                if (action[field]) {
                  usersIds.push(action[field].toString());
                }
              }
            }
          }
        }
        const userIdsToFetch = [...usersIds]
          .filter((uId, i, list) => ObjectId.isValid(uId) && list.indexOf(uId) === i)
          .map((uId) => new ObjectId(uId));

        const users = await app.models.User.getMongoConnector()
          .find(
            { _id: { $in: userIdsToFetch } },
            { projection: { id: '$_id', firstName: true, lastName: true, email: true, job: true } }
          )
          .toArray();

        context.garages = Object.fromEntries(garages.map((garage) => [garage.id, garage]));
        context.users = Object.fromEntries(users.map((user) => [user.id, user]));

        return { datas, hasMore, cursor };
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
  [`${typePrefix}Data`]: {
    garage: async ({ garageId }, args, { garages }) => {
      return garages[garageId] || null;
    },
    customer: async (parent) => {
      let { fullName } = parent.unsatisfiedTicket.customer || {};
      let { email, mobilePhone } = parent.unsatisfiedTicket.customer.contact || {};
      let { value } = parent.customer.city || {};
      if (fullName && typeof fullName !== 'string') fullName = fullName.value;
      if (mobilePhone && typeof mobilePhone !== 'string') mobilePhone = mobilePhone.value;
      if (email && typeof email !== 'string') email = email.value;
      if (value && typeof value !== 'string') value = value.value;
      return {
        fullName,
        contact: {
          email,
          mobilePhone,
        },
        city: value,
      };
    },
    followupUnsatisfiedStatus: async (data) => {
      return followupUnsatisfiedStatus(data);
    },
  },
  [`${typePrefix}UnsatisfiedTicket`]: {
    manager: async ({ manager: managerId }, args, { users }) => {
      if (!managerId) return null;
      return users[managerId.toString()] || null;
    },
  },
  [`${typePrefix}Actions`]: {
    assigner: async ({ assignerUserId }, args, { users }) => {
      if (!assignerUserId) return null;
      return users[assignerUserId.toString()] || null;
    },
    ticketManager: async ({ ticketManagerId }, args, { users }) => {
      if (!ticketManagerId) return null;
      return users[ticketManagerId.toString()] || null;
    },
    previousTicketManager: async ({ previousTicketManagerId }, args, { users }) => {
      if (!previousTicketManagerId) return null;
      return users[previousTicketManagerId.toString()] || null;
    },
    reminderTriggeredBy: async ({ reminderTriggeredByUserId }, args, { users }) => {
      if (!reminderTriggeredByUserId) return null;
      return users[reminderTriggeredByUserId.toString()] || null;
    },
  },
  [`${typePrefix}Review`]: {
    followupChangeEvaluation: async ({ followupUnsatisfiedComment, followupUnsatisfiedRating }) => {
      if (followupUnsatisfiedComment || followupUnsatisfiedRating) {
        return true;
      }
      return false;
    },
  },
};
