/* Template file to define a new Apollo GraphQL query */
/* Read _README.txt, copy this file, rename the copy, don't forget the extension */
const { AuthenticationError } = require('apollo-server-express');
const { ObjectId } = require('mongodb');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const { TicketActionNames } = require('../../../../frontend/utils/enumV2');
const { addAction } = require('../../../../common/models/data/_common-ticket');

const { SIMON, log } = require('../../../../common/lib/util/log');

const typePrefix = 'dataSetLeadTicketSelfAssigned';

const getUserName = (u) =>
  (u && ((u.lastName && [u.firstName, u.lastName].join(' ')) || u.email)) || 'Unknown user name';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.DataSetLeadTicketSelfAssigned.type}: ${typePrefix}ReturnType
  }
  type ${typePrefix}ReturnType {
    message: String
    status: Int
    selfAssignedUserName: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    DataSetLeadTicketSelfAssigned: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user, garageIds },
        } = context;
        const { dataId } = args;

        if (!logged) throw new AuthenticationError(authenticationError);

        let selfAssignedTo = null;
        const data = await app.models.Data.findById(dataId);

        if (!Array.isArray(garageIds) || !garageIds.map((id) => id.toString()).includes(data.get('garageId'))) {
          return {
            message: "Sorry, this ticket doesn't belong to you",
            status: 403,
          };
        }

        if (data.get('leadTicket.selfAssignedTo') && data.get('leadTicket.selfAssignedTo') !== user.id.toString()) {
          selfAssignedTo = await app.models.User.getMongoConnector().findOne(
            { _id: ObjectId(data.get('leadTicket.selfAssignedTo')) },
            { projection: { lastName: true, firstName: true, email: true } }
          );
          return {
            message: `Sorry, user ${data.get('leadTicket.selfAssignedTo')} was there before you ${
              user.id
            } on data ${dataId}`,
            status: 403,
            selfAssignedUserName: getUserName(selfAssignedTo),
          };
        } else if (data.get('leadTicket.manager') === user.id.toString()) {
          return {
            message: `User ${user.id} already assigned to data ${dataId}`,
            status: 208,
            selfAssignedUserName: getUserName(user),
          };
        }
        const isActionPerformed = (data.get('leadTicket.actions') || []).find(
          (action) =>
            ![
              TicketActionNames.LEAD_STARTED,
              TicketActionNames.INCOMING_EMAIL,
              TicketActionNames.INCOMING_CALL,
              TicketActionNames.INCOMING_MISSED_CALL,
            ].includes(action.name)
        );
        // Someone already took care of the leadTicket
        if (isActionPerformed) {
          const manager = await app.models.User.getMongoConnector().findOne(
            { _id: ObjectId(data.get('manager')) },
            { projection: { lastName: true, firstName: true, email: true } }
          );
          return {
            message: `Sorry, user ${data.get('manager')} was there before you ${user.id} on data ${dataId}`,
            status: 403,
            selfAssignedUserName: getUserName(manager),
          };
        }
        await addAction('lead', data, {
          name: TicketActionNames.TRANSFER,
          assignerUserId: user.id.toString(),
          ticketManagerId: user.id.toString(),
          selfAssigned: true,
          sourceType: data.get('source.type'),
        });
        data.set('leadTicket.selfAssignedTo', user.id.toString()); // keep trace
        await data.save();
        return {
          message: `User ${user.id} assigned with success to data ${dataId}`,
          status: 201,
          selfAssignedUserName: getUserName(user),
        };
      } catch (error) {
        log.error(SIMON, error);
        return {
          message: error,
          status: 500,
        };
      }
    },
  },
};
