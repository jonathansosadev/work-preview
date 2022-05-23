/**
 * insatisfaction that will be displayed on a row in the cockpit contact qualification page list
 */
const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'GarageSolutionType',
  fields: {
    workQuality: { type: graphql.GraphQLBoolean },
    billClarity: { type: graphql.GraphQLBoolean },
    reductionBill: { type: graphql.GraphQLBoolean },
    constructorProblem: { type: graphql.GraphQLBoolean },
    otherSolution: { type: graphql.GraphQLString },
  },
});
