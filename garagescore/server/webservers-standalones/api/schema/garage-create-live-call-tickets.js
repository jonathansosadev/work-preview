/* Template file to define a new Apollo GraphQL query */
/* Read _README.txt, copy this file, rename the copy, don't forget the extension */
const { AuthenticationError } = require('apollo-server-express');
const OVH = require('../../../../common/lib/garagescore/cross-leads/ovh-telephony-api.js');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const crossLeadsIncomingCall = require('../../../../workers/jobs/scripts/cross-leads-incoming-call.js');

const { SIMON, log } = require('../../../../common/lib/util/log');

const typePrefix = 'garageCreateLiveCallTickets';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.GarageCreateLiveCallTickets.type}: ${typePrefix}ReturnType
  }
  type ${typePrefix}ReturnType {
    newTickets: Boolean
  }
`;
module.exports.resolvers = {
  Mutation: {
    GarageCreateLiveCallTickets: async (obj, args, context) => {
      let newTickets = false;
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        const phones = await app.models.Garage.getAllTakenPhones(user.garageIds);
        for (const phone of phones) {
          let calls = [];
          try {
            const [firstQueue] = await OVH.getQueues(phone.value);
            calls = await OVH.liveCalls(phone.value, firstQueue); // take only first queue for now
            log.error(SIMON, `OVH API Calls for ${phone.value}: ${calls || 'No'} calls...`);
            for (const liveCallId of calls) {
              let call = null;
              const callDetails = await OVH.liveCallDetails(phone.value, firstQueue, liveCallId);
              try {
                call = await app.models.IncomingCrossLead.initFromCall(
                  callDetails,
                  phone.garageId,
                  phone.sourceType,
                  true
                );
                if (call) {
                  await crossLeadsIncomingCall({ payload: { callId: call.externalId } }); // Manually execute the job right now
                  newTickets = true;
                }

                log.info(SIMON, `crossLeadsIncomingCall ${call.id.toString()} done !`);
              } catch (error) {
                log.error(SIMON, `LIVE CALL HANDLE error: ${error.message}`);
              }
            }
          } catch (error) {
            log.error(SIMON, error);
          }
        }
        return { newTickets };
      } catch (error) {
        log.error(SIMON, error);
        return { newTickets };
      }
    },
  },
};
