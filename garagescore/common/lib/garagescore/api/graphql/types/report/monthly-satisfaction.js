const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'MonthlySatisfaction',
  fields: {
    garageId: { type: graphql.GraphQLString },
    garageName: { type: graphql.GraphQLString },
    surveysResponded12M: { type: graphql.GraphQLInt },
    surveysRespondedM: { type: graphql.GraphQLInt },
    surveysRespondedM1: { type: graphql.GraphQLInt },
    surveysRespondedM2: { type: graphql.GraphQLInt },
    surveysRespondedM3: { type: graphql.GraphQLInt },
    ponderatedScore12M: { type: graphql.GraphQLFloat },
    ponderatedScoreM: { type: graphql.GraphQLFloat },
    ponderatedScoreM1: { type: graphql.GraphQLFloat },
    ponderatedScoreM2: { type: graphql.GraphQLFloat },
    ponderatedScoreM3: { type: graphql.GraphQLFloat },
    satisfaction12M: {
      type: new graphql.GraphQLObjectType({
        name: 'satisfaction12M',
        fields: {
          promotors: { type: graphql.GraphQLInt },
          passives: { type: graphql.GraphQLInt },
          detractors: { type: graphql.GraphQLInt },
        },
      }),
    },
    satisfactionM: {
      type: new graphql.GraphQLObjectType({
        name: 'satisfactionM',
        fields: {
          promotors: { type: graphql.GraphQLInt },
          passives: { type: graphql.GraphQLInt },
          detractors: { type: graphql.GraphQLInt },
        },
      }),
    },
    satisfactionM1: {
      type: new graphql.GraphQLObjectType({
        name: 'satisfactionM1',
        fields: {
          promotors: { type: graphql.GraphQLInt },
          passives: { type: graphql.GraphQLInt },
          detractors: { type: graphql.GraphQLInt },
        },
      }),
    },
    detailsUrl: { type: graphql.GraphQLString },
  },
});
