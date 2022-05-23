const { AuthenticationError } = require('apollo-server-express');
const { rgpdGetRelatedDataFromInput } = require('../../../../frontend/api/graphql/definitions/queries.json');
const Anonymizator = require('../../../../common/lib/rgpd/anonymizator.js');

const typePrefix = 'rgpdGetRelatedDataFromInput';
module.exports.typeDef = `
  extend type Query {
    ${rgpdGetRelatedDataFromInput.type}: ${typePrefix}Results
  }
  type ${typePrefix}Results {
    error: String
    customer: Int
    data: Int
    contact: Int
    billingAccounts: [${typePrefix}billingAccount]
  }

  type ${typePrefix}billingAccount {
    name: String
    RGPDContact: String
  }
`;

module.exports.resolvers = {
  Query: {
    [typePrefix]: async (obj, args, context) => {
      const res = {
        error: null,
        customer: 0,
        data: 0,
        contact: 0,
        billingAccounts: [],
      };
      try {
        const {
          app,
          scope: { logged, authenticationError },
        } = context;
        const { input } = args;

        if (!logged) {
          throw new AuthenticationError(authenticationError);
        }

        const field = input.includes('@') ? 'email' : 'phone';

        const customers = await Anonymizator.Customer({ [field]: input }, { dataIds: true, garageId: true });

        let dataIds = [];
        let garageIds = [];
        let contacts = [];
        if (customers && customers.length) {
          customers.forEach((customer) => {
            dataIds.push(...customer.dataIds.filter((id) => !dataIds.includes(id)));
            if (!garageIds.includes(customer.garageId)) garageIds.push(customer.garageId);
          });
        }
        res.billingAccounts = await app.models.BillingAccount.getMongoConnector()
          .find({ garageIds: { $in: garageIds } }, { projection: { RGPDContact: true, name: true } })
          .toArray();
        if (dataIds && dataIds.length) {
          contacts = await Anonymizator.Contact({ dataIds });
        }

        res.customer = customers.length;
        res.data = dataIds.length;
        res.contact = contacts.length;
      } catch (error) {
        res.error = error;
      }
      return res;
    },
  },
};
