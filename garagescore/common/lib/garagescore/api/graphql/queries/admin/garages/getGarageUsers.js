const graphql = require('graphql');
const UserType = require('../../../types/user');
const decodeArguments = require('../../../decodeArguments.js');

module.exports = {
  type: new graphql.GraphQLList(UserType),
  args: {
    garageId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
  },
  async resolve(root, args, req) {
    try {
      const argv = decodeArguments.decodeArguments(args);
      const fields = { id: true, email: true, firstName: true, lastName: true, job: true };
      const users = await req.app.models.Garage.getUsersForGarageWithoutCusteedUsers(argv.garageId, fields);

      return users || [];
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
