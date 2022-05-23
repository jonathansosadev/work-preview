const graphql = require('graphql');
const GraphQLDate = require('graphql-date');
const CustomerClaimReason = require('../insatisfaction-sub-type/customer-claim-reason');
const GarageSolutionType = require('../insatisfaction-sub-type/garage-solution-type');

module.exports = {
  insatisfactionProcessingDeadline: {
    type: graphql.GraphQLString,
  },
  insatisfactionProcessingUserName: {
    type: graphql.GraphQLString,
  },
  insatisfactionProcessingUserFullName: {
    type: graphql.GraphQLString,
  },
  insatisfactionProcessingActions: {
    type: new graphql.GraphQLList(
      new graphql.GraphQLObjectType({
        name: 'InsatisfactionProcessingAction',
        fields: () => ({
          name: { type: graphql.GraphQLString },
          userFullName: { type: graphql.GraphQLString },
          userName: { type: graphql.GraphQLString },
          date: { type: GraphQLDate },
          assignedBy: { type: graphql.GraphQLString },
          comment: { type: graphql.GraphQLString },
        }),
      })
    ),
  },
  insatisfactionProcessingCloseAction: {
    type: new graphql.GraphQLObjectType({
      name: 'InsatisfactionProcessingCloseAction',
      fields: () => ({
        userFullName: { type: graphql.GraphQLString },
        userName: { type: graphql.GraphQLString },
        date: { type: GraphQLDate },
        warnOtherUsers: { type: graphql.GraphQLBoolean },
      }),
    }),
  },
  customerClaimReason: { type: CustomerClaimReason },
  garageSolutionTypes: { type: GarageSolutionType },
};
