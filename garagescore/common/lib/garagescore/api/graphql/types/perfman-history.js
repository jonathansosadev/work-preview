const graphql = require('graphql');

const getPerfmanUsers = new graphql.GraphQLObjectType({
  name: 'getPerfmanUsers',
  fields: {
    id: { type: graphql.GraphQLString },
    name: { type: graphql.GraphQLString },
    perf: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'details',
          fields: {
            subTotal: { type: graphql.GraphQLFloat },
            subTotalPrev: { type: graphql.GraphQLFloat },
            uTotal: { type: graphql.GraphQLFloat },
            uTotalPrev: { type: graphql.GraphQLFloat },
            xTotal: { type: graphql.GraphQLFloat },
            xTotalPrev: { type: graphql.GraphQLFloat },
          },
        })
      ),
    },
  },
});

module.exports = getPerfmanUsers;
