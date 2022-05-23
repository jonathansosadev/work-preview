/**
 * the reason of customer insatisfaction claim
 */
const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'CustomerClaimReason',
  fields: {
    workQuality: { type: graphql.GraphQLBoolean },
    billClarity: { type: graphql.GraphQLBoolean },
    constructorProblem: { type: graphql.GraphQLBoolean },
    delay: { type: graphql.GraphQLBoolean },
    loanVehicle: { type: graphql.GraphQLBoolean },
    payment: { type: graphql.GraphQLBoolean },
    notExplainable: { type: graphql.GraphQLBoolean },
    otherReason: { type: graphql.GraphQLString },
  },
});
