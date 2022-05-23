const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'ReportAuthorizations',
  fields: {
    leads: {
      type: new graphql.GraphQLList(graphql.GraphQLString),
    },
    satisfaction: {
      type: new graphql.GraphQLList(graphql.GraphQLString),
    },
    problemResolution: {
      type: new graphql.GraphQLList(graphql.GraphQLString),
    },
    validEmails: {
      type: new graphql.GraphQLList(graphql.GraphQLString),
    },
  },
});
