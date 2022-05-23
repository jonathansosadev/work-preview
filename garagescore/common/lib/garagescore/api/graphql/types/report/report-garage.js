const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'ReportGarage',
  fields: {
    garageId: { type: graphql.GraphQLString },
    garageName: { type: graphql.GraphQLString },
    group: { type: graphql.GraphQLString },
    authorizations: {
      type: new graphql.GraphQLObjectType({
        name: 'ReportGarageAuthorization',
        fields: {
          leads: { type: new graphql.GraphQLList(graphql.GraphQLString) },
          satisfaction: { type: new graphql.GraphQLList(graphql.GraphQLString) },
          problemResolution: { type: new graphql.GraphQLList(graphql.GraphQLString) },
          validEmails: { type: new graphql.GraphQLList(graphql.GraphQLString) },
        },
      }),
    },
  },
});
