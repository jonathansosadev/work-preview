const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'MonthlyLeads',
  fields: {
    garageId: { type: graphql.GraphQLString },
    garageName: { type: graphql.GraphQLString },
    convertedLeads12M: {
      type: new graphql.GraphQLObjectType({
        name: 'convertedLeads12M',
        fields: {
          newProjects: { type: graphql.GraphQLInt },
          knownProjects: { type: graphql.GraphQLInt },
          wonFromCompetition: { type: graphql.GraphQLInt },
        },
      }),
    },
    convertedLeadsM: {
      type: new graphql.GraphQLObjectType({
        name: 'convertedLeadsM',
        fields: {
          newProjects: { type: graphql.GraphQLInt },
          knownProjects: { type: graphql.GraphQLInt },
          wonFromCompetition: { type: graphql.GraphQLInt },
        },
      }),
    },
    convertedLeadsM1: {
      type: new graphql.GraphQLObjectType({
        name: 'convertedLeadsM1',
        fields: {
          newProjects: { type: graphql.GraphQLInt },
          knownProjects: { type: graphql.GraphQLInt },
          wonFromCompetition: { type: graphql.GraphQLInt },
        },
      }),
    },
    convertedLeadsM2: { type: graphql.GraphQLInt },
    convertedLeadsM3: { type: graphql.GraphQLInt },
    detailsUrl: { type: graphql.GraphQLString },
  },
});
