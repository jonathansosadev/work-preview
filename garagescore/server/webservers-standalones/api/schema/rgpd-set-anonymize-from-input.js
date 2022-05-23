const { AuthenticationError } = require('apollo-server-express');
const { rgpdSetAnonymizeFromInput } = require('../../../../frontend/api/graphql/definitions/mutations.json');
const Anonymizator = require('../../../../common/lib/rgpd/anonymizator.js');

const typePrefix = 'rgpdSetAnonymizeFromInput';
module.exports.typeDef = `
  extend type Mutation {
    ${rgpdSetAnonymizeFromInput.type}: ${typePrefix}Results
  }
  type ${typePrefix}Results {
    error: String
  }
`;

module.exports.resolvers = {
  Mutation: {
    [typePrefix]: async (obj, args, context) => {
      const res = {
        error: null,
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

        // We need to save customers dataIds before anonymising it
        const customers = await Anonymizator.Customer({ [field]: input }, { dataIds: true });
        await Anonymizator.Customer({ [field]: input }, null, true);
        let dataIds = [];
        if (customers && customers.length) {
          customers.forEach((customer) => dataIds.push(...customer.dataIds.filter((id) => !dataIds.includes(id))));
        }
        if (dataIds && dataIds.length) {
          await Anonymizator.Data({ dataIds }, null, true);
          await Anonymizator.Contact({ dataIds }, null, true);
        }
      } catch (error) {
        res.error = error;
      }
      return res;
    },
  },
};
