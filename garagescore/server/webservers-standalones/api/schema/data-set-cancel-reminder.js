const { AuthenticationError, ForbiddenError, UserInputError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const { dataSetCancelReminder } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const gsMutex = require('../../../../common/lib/garagescore/mutex/mutex');
const commonTicket = require('../../../../common/models/data/_common-ticket');

const { IZAD, log } = require('../../../../common/lib/util/log');

const prefix = 'dataSetCancelReminder';
const requestId = Math.round(Math.random() * 1000);
let lockedByMe = false;
let dataId;

module.exports.typeDef = `
  extend type Mutation {
    ${dataSetCancelReminder.type}: ${prefix}Result
  }
  type ${prefix}Result {
    status: Boolean!
  }
`;
module.exports.resolvers = {
  Mutation: {
    [prefix]: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { id, ticketType, userId, createdAt } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_COCKPIT)) {
          throw new ForbiddenError('Not authorized to access this resource');
        }
        dataId = id;
        await gsMutex.lockByDataId(id);
        console.log(`Request ${requestId} Got The Lock`);
        lockedByMe = true;
        const data = await app.models.Data.findById(id);

        if (
          !data ||
          !data[`${ticketType}Ticket`] ||
          !data[`${ticketType}Ticket`].actions ||
          data[`${ticketType}Ticket`].actions.length === 0
        ) {
          throw new UserInputError(`Data not found or ${ticketType}Ticket not found or actions not found`);
        }
        await commonTicket.cancelReminder(ticketType, data, { userId, createdAt });
        await data.save();

        gsMutex.unlockByDataId(id);
        console.log(` * Request ${requestId} Unlock`);
        if (!gsMutex.isLockedByDataId(id)) {
          gsMutex.deleteMutexByDataId(id);
        }

        return { status: true };
      } catch (error) {
        log.error(IZAD, error);
        if (gsMutex.mutexExistsByDataId(dataId) && gsMutex.isLockedByDataId(dataId) && lockedByMe) {
          gsMutex.unlockByDataId(dataId);
          console.log(` * Request ${requestId} Unlock`);
          if (!gsMutex.isLockedByDataId(dataId)) {
            gsMutex.deleteMutexByDataId(dataId);
          }
        }
        return { status: false };
      }
    },
  },
};
