const { AuthenticationError, ForbiddenError } = require('apollo-server-express');
const GraphQLDate = require('graphql-date');
const { dataGetUnsatisfiedTicket } = require('../../../../frontend/api/graphql/definitions/queries.json');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { ObjectId } = require('mongodb');
const { getUserIdsByGarageId } = require('../../../../common/models/user/user-methods');

const { IZAD, log } = require('../../../../common/lib/util/log');

const typePrefix = 'dataGetUnsatisfiedTicket';
const resolveFunctions = {
  Date: GraphQLDate,
};

const _isUserInArray = (usersIds, user) => {
  if (!user || !Array.isArray(usersIds) || !usersIds.length) return false;
  return usersIds.map((userId) => userId.toString()).includes(user.id.toString());
};

module.exports.typeDef = `
  extend type Query {
    ${dataGetUnsatisfiedTicket.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    id: String
    unsatisfiedTicket: ${typePrefix}UnsatisfiedTicket
    unsatisfied: ${typePrefix}Unsatisfied
    customer: ${typePrefix}Customer
    garage: ${typePrefix}Garage
    review: ${typePrefix}Review
    service: ${typePrefix}Service
  }

    """ UnsatisfiedTicket """
  type ${typePrefix}UnsatisfiedTicket {
    createdAt: Date
    closedAt: Date
    comment: String
    type: String
    status: String
    frontDeskUserName: String
    customer: ${typePrefix}UnsatisfiedTicketCustomer
    manager: ${typePrefix}TicketUser
    vehicle: ${typePrefix}Vehicle
    actions: [${typePrefix}Actions]
  }

  type ${typePrefix}UnsatisfiedTicketCustomer {
    fullName: String
    contact: ${typePrefix}UnsatisfiedTicketCustomerContact
  }

  type ${typePrefix}UnsatisfiedTicketCustomerContact {
    mobilePhone: String
    email: String
  }

  """ vehicle """
  type ${typePrefix}Vehicle {
    make: String 
    model: String 
    plate: String 
    makeModel: String 
    mileage: Int
  }

  type ${typePrefix}Actions {
    name: String 
    createdAt: Date 
    reminderActionName: String 
    reminderStatus: String
    reminderDate: Date
    assigner: ${typePrefix}TicketUser
    reminderTriggeredBy: ${typePrefix}TicketUser
    ticketManager: ${typePrefix}TicketUserWithJob
    isManual: Boolean
    unsatisfactionResolved: Boolean
    followupIsRecontacted: Boolean
    providedSolutions: [String]
    claimReasons: [String]
    newArrayValue: [String]
    previousArrayValue: [String]
    previousValue: String
    field: String
    comment: String
    followupStatus: String
  }

  type ${typePrefix}TicketUser {
    id: ID 
    email: String 
    firstName: String 
    lastName: String
  }

  type ${typePrefix}TicketUserWithJob {
    id: ID 
    email: String 
    firstName: String 
    lastName: String
    job: String
  }

  """ garage COLLECTION""" 
  type ${typePrefix}Garage {
    id: ID
    publicDisplayName: String 
    type: String
    ratingType: String
    users: [${typePrefix}User]
  }

  """ customer""" 
  type ${typePrefix}Customer {
    city: ${typePrefix}CustomerCity
  }

  type ${typePrefix}CustomerCity {
    value: String
  }

  """ unsatisfied """
  type ${typePrefix}Unsatisfied {
    criteria: [${typePrefix}Criteria] 
  }

  type ${typePrefix}Criteria {
    label: String 
    values: [String] 
  }

   """ Review """
  type ${typePrefix}Review {
    createdAt: Date 
    comment: ${typePrefix}Comment
    rating: ${typePrefix}RatingValue
    reply: ${typePrefix}Reply 
  }
  type ${typePrefix}Comment {
    text: String 
  }
  type ${typePrefix}Reply {
    status: String 
    text: String 
    rejectedReason: String 
  }
  
  type ${typePrefix}RatingValue {
    value: Int
  }

   """ Service """
   type ${typePrefix}Service {
    providedAt: Date
  }

   """ User """
   type ${typePrefix}User {
    id: ID
    email: String
    firstName: String
    lastName: String
    job: String
    hasOnlyThisGarage: Boolean
  }
`;
module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, godMode },
        } = context;
        const { id } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        let isAuthorized;
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
            status: true,
            createdAt: true,
            closedAt: true,
            manager: true,
            comment: true,
            frontDeskUserName: true,
            vehicle: {
              make: true,
              model: true,
              plate: true,
              makeModel: true,
              mileage: true,
            },
            customer: {
              fullName: true,
              contact: {
                mobilePhone: true,
                email: true,
              },
            },
            actions: {
              name: true,
              createdAt: true,
              reminderActionName: true,
              reminderStatus: true,
              reminderDate: true,
              assignerUserId: true,
              reminderTriggeredByUserId: true,
              ticketManagerId: true,
              isManual: true,
              unsatisfactionResolved: true,
              followupIsRecontacted: true,
              providedSolutions: true,
              claimReasons: true,
              newArrayValue: true,
              previousArrayValue: true,
              previousValue: true,
              field: true,
              comment: true,
              followupStatus: true,
            },
          },
          review: {
            createdAt: true,
            comment: {
              text: true,
            },
            rating: {
              value: true,
            },
            reply: {
              status: true,
              text: true,
              rejectedReason: true,
            },
          },
          unsatisfied: {
            criteria: {
              label: true,
              values: true,
            },
          },
          service: {
            providedAt: true,
          },
        };

        const data = await app.models.Data.getMongoConnector().findOne({ _id: ObjectId(id) }, { projection });
        if (!data) {
          throw new Error('Data not found');
        } else if (!data.unsatisfiedTicket) {
          throw new Error('UnsatisfiedTicket not found');
        }

        const usersIdsByGaragesIds = await getUserIdsByGarageId(app, data.garageId, 'ticket.js open unsatisfiedTicket');
        /** Let's try to see if the user has access to the garage **/
        if (godMode || _isUserInArray(usersIdsByGaragesIds[data.garageId], user)) {
          isAuthorized = true;
        }
        if (!isAuthorized) throw new Error('Not authorized to access the garage associated to the ticket');
        return data;
      } catch (error) {
        log.error(IZAD, error);
        throw error || 'an error occured with the service';
      }
    },
  },
  [`${typePrefix}Result`]: {
    garage: async ({ garageId }, args, { app }) => {
      const garage = await app.models.Garage.getMongoConnector().findOne(
        { _id: ObjectId(garageId) },
        { projection: { id: '$_id', publicDisplayName: true, ratingType: true } }
      );
      return garage || null;
    },
  },
  [`${typePrefix}Garage`]: {
    users: async ({ id }, args, { app }) => {
      const users = await app.models.User.getMongoConnector()
        .find(
          { garageIds: id, email: { $not: /@garagescore\.com|@custeed\.com/ } },
          { projection: { id: '$_id', garageIds: true, email: true, firstName: true, lastName: true, job: true } }
        )
        .toArray();
      const filteredUsers = users.map((user) => ({ ...user, hasOnlyThisGarage: (user.garageIds || []).length <= 1 }));
      return filteredUsers;
    },
  },
  [`${typePrefix}UnsatisfiedTicket`]: {
    manager: async ({ manager: managerId }, args, { app }) => {
      if (!managerId) return null;
      const manager = await app.models.User.getMongoConnector().findOne(
        { _id: ObjectId(managerId) },
        { projection: { id: '$_id', firstName: true, lastName: true, email: true } }
      );
      return manager;
    },
    actions: async ({ actions }, args, { app }) => {
      const User = app.models.User.getMongoConnector();
      const usersCached = {};
      const findUser = async (id) => {
        if (!id) return null;
        if (!usersCached[id.toString()]) {
          usersCached[id] = await User.findOne(
            { _id: new ObjectId(id) },
            { projection: { id: '$_id', firstName: true, lastName: true, email: true, job: true } }
          );
        }
        return usersCached[id.toString()];
      };
      for (const action of actions) {
        action.assigner = await findUser(action.assignerUserId);
        action.ticketManager = await findUser(action.ticketManagerId);
        action.reminderTriggeredBy = await findUser(action.reminderTriggeredByUserId);
      }
      return actions || [];
    },
  },
};
