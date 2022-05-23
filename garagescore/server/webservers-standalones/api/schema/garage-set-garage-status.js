const { AuthenticationError } = require('apollo-server-express');
const config = require('config');
const { ObjectId } = require('mongodb');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const ContactType = require('../../../../common/models/contact.type.js');
const garageStatuses = require('../../../../common/models/garage.status');
const { getUserIdsByGarageId } = require('../../../../common/models/user/user-methods');
const ContactService = require('../../../../common/lib/garagescore/contact/service.js');
const slackClient = require('../../../../common/lib/slack/client');

const { ANASS, log } = require('../../../../common/lib/util/log');

const sendCampaignsReadyEmail = async (app, garage) => {
  const usersIdsByGaragesIds = await getUserIdsByGarageId(app, garage.id);
  const users =
    usersIdsByGaragesIds[garage.id] &&
    usersIdsByGaragesIds[garage.id].map((id) => app.models.User.getCachedUserById(id));
  for (const user of users) {
    ContactService.prepareForSend(
      {
        to: user.email,
        recipient: user.fullName || [user.firstName, user.lastName].join(' '),
        from: 'no-reply@custeed.com',
        sender: 'GarageScore',
        type: ContactType.CAMPAIGNS_READY,
        payload: {
          userId: user.id.toString(),
          garageName: garage.publicDisplayName,
        },
      },
      (err, res) => {
        if (err) {
          console.error(err);
        }
      }
    );
  }
};

const typePrefix = 'garageSetGarageStatus';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.GarageSetGarageStatus.type}: ${typePrefix}Result
  }
  type ${typePrefix}Result {
    result: String
  }

  input ${typePrefix}Ticket {
    name: String
    id: String
    userId: String
  }
`;
module.exports.resolvers = {
  Mutation: {
    GarageSetGarageStatus: async (obj, args, context) => {
      try {
        const {
          app,
          scope: { logged, authenticationError, user },
        } = context;
        const { id, tickets, status } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }
        const garage = await app.models.Garage.findById(id);
        const update = {};
        const billingAccount = await app.models.BillingAccount.findOne({ where: { garageIds: garage.id } });
        if (!garage) {
          return { result: `Le garage avec l'id ${id} n'existe pas` };
        }
        if (!billingAccount) {
          return { result: 'Impossible de trouver le compte de facturation associé' };
        }
        const usersCount = await app.models.Garage.countReallySubscribedUsers(garage.getId());
        if (!usersCount) {
          return { result: `Le garage avec l'id ${id} n'a pas d'utilisateur, lancement impossible` };
        }
        const statusChanged = garage.status !== status;
        if (statusChanged) {
          update.status = status;
        }

        if (tickets) {
          for (const ticket of tickets) {
            update[`ticketsConfiguration.${ticket.id}`] = ticket.userId ? new ObjectId(ticket.userId.toString()) : null;
          }
        }

        await garage.updateFromObject(update);

        // Slack posting
        const garageId = id;
        const billingAccountId = billingAccount ? billingAccount.id.toString() : null;
        const dboUrl = `${config.get('publicUrl.app_url')}/backoffice/garages#${garageId}`;
        const gboUrl = `${config.get(
          'publicUrl.app_url'
        )}/grey-bo/automatic-billing/billing-account/${billingAccountId}/garages/${garageId}`;
        try {
          await new Promise((res, rej) =>
            slackClient.postMessage(
              {
                text: `L'établissement ${garage.publicDisplayName} vient d'être lancé en automatique ! :tada:`,
                channel: '#factu_go-go-go',
                username: user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : user.email,
                attachments: [
                  {
                    fallback: `Voir cet établissement à ${dboUrl}`,
                    actions: [
                      {
                        type: 'button',
                        text: 'Lien DarkBO 🐍',
                        url: dboUrl,
                      },
                      ...(billingAccountId
                        ? [
                            {
                              type: 'button',
                              text: 'Lien GreyBO 🔧',
                              url: gboUrl,
                            },
                          ]
                        : []),
                    ],
                  },
                ],
              },
              (e) => (e ? rej(e) : res())
            )
          );
        } catch (slackErr) {
          /*
              An error while posting on Slack should not return us an error as it's not something vital for this request to succeed
              Also marking the request as failed at this point leads us to misunderstanding because new garage status is already saved
              Are we sure we want to await for the slack message to be sent before completing the request ?
          */
          console.error(slackErr);
        }

        // Fire CAMPAIGNS_READY emails to all users of this garage (don't await because we don't need it's result for the mutation)
        if (statusChanged && garage.status === garageStatuses.RUNNING_AUTO) {
          sendCampaignsReadyEmail(app, garage);
        }

        return { result: 'OK' };
      } catch (error) {
        log.error(ANASS, error);
        return error;
      }
    },
  },
};
