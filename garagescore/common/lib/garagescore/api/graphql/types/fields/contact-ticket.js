const graphql = require('graphql');

module.exports = {
  contactTicket: {
    type: new graphql.GraphQLObjectType({
      name: 'ContactTicket',
      fields: () => ({
        score: { type: graphql.GraphQLInt },
        unsatisfiedCriteria: { type: new graphql.GraphQLList(graphql.GraphQLString) },
        resolved: { type: graphql.GraphQLInt },
        status: { type: graphql.GraphQLString },
        comment: { type: graphql.GraphQLString },
        assigner: { type: graphql.GraphQLString },

        leadType: { type: graphql.GraphQLString },
        leadToCreate: { type: graphql.GraphQLBoolean },
        leadAssigner: { type: graphql.GraphQLString },
        leadComment: { type: graphql.GraphQLString },
        leadTiming: { type: graphql.GraphQLString },
        leadFinancing: { type: graphql.GraphQLString },
        leadSaleType: { type: graphql.GraphQLString },
        leadTradeIn: { type: graphql.GraphQLString },
        leadBudget: { type: graphql.GraphQLString },
        leadBrandModel: { type: graphql.GraphQLString },
        leadBodyType: { type: new graphql.GraphQLList(graphql.GraphQLString) },
        leadEnergy: { type: new graphql.GraphQLList(graphql.GraphQLString) },
        leadCylinder: { type: new graphql.GraphQLList(graphql.GraphQLString) },
      }),
    }),
    async resolve(data) {
      return data.get('contactTicket') || {};
    },
  },
};
