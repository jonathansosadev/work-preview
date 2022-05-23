/* Template file to define a new Apollo GraphQL query */
/* Read _README.txt, copy this file, rename the copy, don't forget the extension */
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { TicketActionNames } = require('../../../../frontend/utils/enumV2');
const SourceTypes = require('../../../../common/models/data/type/source-types.js');
const { addAction } = require('../../../../common/models/data/_common-ticket');
const { BANG, log } = require('../../../../common/lib/util/log');
const gsMutex = require('../../../../common/lib/garagescore/mutex/mutex');
const typePrefix = 'dataSetAction';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.dataSetAction.type}: ${typePrefix}ReturnType
  }
  type ${typePrefix}ReturnType {
    message: String
    status: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    dataSetAction: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { id, type } = args;
        const rdm = (min, max) => Math.round(Math.random() * (max - min) + min);
        const requestId = rdm(0, 1000);
        if (!logged) throw new AuthenticationError(authenticationError);
        // Try to get the lock for this data before fetching it from the database
        await gsMutex.lockByDataId(id);
        console.log(`Request ${requestId} Got The Lock`);
        lockedByMe = true;
        const data = await app.models.Data.findById(id);
        // Basic verification
        if (!data) {
          gsMutex.unlockByDataId(id);
          console.log(` * Request ${requestId} Unlock`);
          if (!gsMutex.isLockedByDataId(id)) {
            gsMutex.deleteMutexByDataId(id);
          }
          return Promise.reject({ message: 'Data not found', status: 'KO' });
        } else if (type !== 'lead' && type !== 'unsatisfied') {
          gsMutex.unlockByDataId(id);
          if (!gsMutex.isLockedByDataId(id)) {
            gsMutex.deleteMutexByDataId(id);
          }
          return Promise.reject({ message: 'Unknown ticket type', status: 'KO' });
        }
        // Adding the new action
        if (await addAction(type, data, args)) {
          await data.save();
          // self assign if user perform an action for the 1st time for XLeads sources. Don't if it's a transfer
          if (SourceTypes.supportedCrossLeadsSources().includes(data.get('source.type'))) {
            const { actions } = data.get('leadTicket');
            const isPerformAction = actions.find(
              (action) =>
                ![
                  TicketActionNames.LEAD_STARTED,
                  TicketActionNames.INCOMING_EMAIL,
                  TicketActionNames.INCOMING_CALL,
                  TicketActionNames.INCOMING_MISSED_CALL,
                  TicketActionNames.TRANSFER,
                ].includes(action.name)
            );
            const selfAssignedTo =
              data.get('leadTicket.selfAssignedTo') ||
              actions.find((action) => action.name === TicketActionNames.TRANSFER);
            if (isPerformAction && !selfAssignedTo) {
              await addAction('lead', data, {
                name: TicketActionNames.TRANSFER,
                assignerUserId: args.assignerUserId.toString(),
                ticketManagerId: args.assignerUserId.toString(),
                selfAssigned: true,
                sourceType: data.get('source.type'),
              });
              data.set('leadTicket.selfAssignedTo', args.assignerUserId.toString());
              await data.save();
            }
          }
          gsMutex.unlockByDataId(id);
          if (!gsMutex.isLockedByDataId(id)) {
            gsMutex.deleteMutexByDataId(id);
          }
          return Promise.resolve({ message: 'Action added successfully', status: 'OK' });
        }
        gsMutex.unlockByDataId(id);
        if (!gsMutex.isLockedByDataId(id)) {
          gsMutex.deleteMutexByDataId(id);
        }
        return Promise.reject({ message: 'Unknown error', status: 'KO' });
      } catch (error) {
        log.error(BANG, error);
        return { message: error, status: 500 };
      }
    },
  },
};
