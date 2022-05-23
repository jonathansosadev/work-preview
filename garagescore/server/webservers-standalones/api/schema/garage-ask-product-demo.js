const { promisify } = require('util');
const { AuthenticationError } = require('apollo-server-express');
const mutations = require('../../../../frontend/api/graphql/definitions/mutations.json');
const slackClient = require('../../../../common/lib/slack/client');
const ContactService = require('../../../../common/lib/garagescore/contact/service.js');
const ContactType = require('../../../../common/models/contact.type.js');

const typePrefix = 'garageAskProductDemo';

module.exports.typeDef = `
  extend type Mutation {
    ${mutations.garageAskProductDemo.type}: ${typePrefix}Request
  }

  type ${typePrefix}Request {
    status: Boolean!
    message: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    garageAskProductDemo: async (obj, args, context) => {
      const {
        scope: { logged, authenticationError, user },
      } = context;
      const { productName } = args;

      if (!logged) {
        throw new AuthenticationError(authenticationError);
      }
      if (user.isGarageScoreUser()) {
        return { 
          message : 'GarageScore users should not click on this button',
          status: false
        };
      };

      // Email notification
      const email = await new Promise((resolve) => {
        ContactService.prepareForSend({
          to: 'mgrihangne@custeed.com',
          from: 'no-reply@custeed.com',
          sender: `GarageScore`,
          type: ContactType.PRODUCT_DEMONSTRATION,
          payload: {
            userId: user.id,
            productName
          }
        }, (contactError) => {
          resolve({ status: !contactError, error: contactError });
      })});

      // Slack notification
      const userName = user.firstName || user.lastName ? `${user.firstName} ${user.lastName}` : null;
      const userEmail = user.email ? user.email : null;
      const userPhone =  user.phone ? user.phone : (user.mobilePhone ? user.mobilePhone : null);
      const userCompany = user.businessName ? user.businessName : null;
      let message = `L'utilisateur ${userName} souhaite recevoir une démonstration de ${productName}.`;
      if (userEmail | userPhone | userCompany) message += `\nSes coordonnées sont les suivantes :`;   
      if (userEmail) message += `\nEmail: ${userEmail}`;   
      if (userPhone) message += `\nTéléphone: ${userPhone}`;   
      if (userCompany) message += `\nRaison sociale: ${userCompany}`;     

      const slack = await new Promise((resolve) =>
        slackClient.postMessage(
          {
            text: message,
            channel: `#contact_demande_demo_${productName.toLowerCase()}`,
            username: 'Demande Produit'
          },
          (slackError) => {
            resolve({ status: !slackError, error: slackError });
          }
        )
      );
      return { 
        message : email.error ? email.error : (slack.error ? slack.error : null),
        status: email.status && slack.status
      };
    },
  },
};
