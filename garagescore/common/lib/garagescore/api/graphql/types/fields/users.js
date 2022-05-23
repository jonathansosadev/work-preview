const graphql = require('graphql');
const app = require('../../../../../../../server/server.js');

module.exports = {
  users: {
    type: new graphql.GraphQLList(
      new graphql.GraphQLObjectType({
        name: 'Users',
        fields: () => ({
          id: { type: graphql.GraphQLString },
          email: { type: graphql.GraphQLString },
          firstName: { type: graphql.GraphQLString },
          lastName: { type: graphql.GraphQLString },
          job: { type: graphql.GraphQLString },
        }),
      })
    ),
    async resolve(data) {
      const fields = { id: true, email: true, firstName: true, lastName: true, job: true };
      return app.models.Garage.getUsersForGarageWithoutCusteedUsers(data.garageId, fields);
    },
  },
};
