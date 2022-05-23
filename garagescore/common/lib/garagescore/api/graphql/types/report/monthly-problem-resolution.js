const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'MonthlyProblemResolution',
  fields: {
    garageId: { type: graphql.GraphQLString },
    garageName: { type: graphql.GraphQLString },
    countUnsatisfied12M: { type: graphql.GraphQLInt },
    countUnsatisfiedM: { type: graphql.GraphQLInt },
    countUnsatisfiedM1: { type: graphql.GraphQLInt },
    countUnsatisfiedM2: { type: graphql.GraphQLInt },
    countUnsatisfiedM3: { type: graphql.GraphQLInt },
    unsatisfiedSolved12M: { type: graphql.GraphQLInt },
    unsatisfiedSolvedM: { type: graphql.GraphQLInt },
    unsatisfiedSolvedM1: { type: graphql.GraphQLInt },
    unsatisfiedSolvedM2: { type: graphql.GraphQLInt },
    unsatisfiedSolvedM3: { type: graphql.GraphQLInt },
    problemProcessing12M: {
      type: new graphql.GraphQLObjectType({
        name: 'problemProcessing12M',
        fields: {
          noAction: { type: graphql.GraphQLInt },
          contacted: { type: graphql.GraphQLInt },
          closedWithResolution: { type: graphql.GraphQLInt },
        },
      }),
    },
    problemProcessingM: {
      type: new graphql.GraphQLObjectType({
        name: 'problemProcessingM',
        fields: {
          noAction: { type: graphql.GraphQLInt },
          contacted: { type: graphql.GraphQLInt },
          closedWithResolution: { type: graphql.GraphQLInt },
        },
      }),
    },
    problemProcessingM1: {
      type: new graphql.GraphQLObjectType({
        name: 'problemProcessingM1',
        fields: {
          noAction: { type: graphql.GraphQLInt },
          contacted: { type: graphql.GraphQLInt },
          closedWithResolution: { type: graphql.GraphQLInt },
        },
      }),
    },
    detailsUrl: { type: graphql.GraphQLString },
  },
});
