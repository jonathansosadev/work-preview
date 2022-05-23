const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'Invoice',
  fields: {
    name: { type: graphql.GraphQLString },
    path: { type: graphql.GraphQLString },
  },
});
