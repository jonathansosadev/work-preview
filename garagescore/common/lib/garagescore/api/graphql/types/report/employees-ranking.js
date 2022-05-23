const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'EmployeesRanking',
  fields: {
    leads: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'LeadsEmployeesRanking',
          fields: {
            employeeName: { type: graphql.GraphQLString },
            garageName: { type: graphql.GraphQLString },
            convertedLeads12M: { type: graphql.GraphQLInt },
            convertedLeadsM: { type: graphql.GraphQLInt },
            convertedLeadsM1: { type: graphql.GraphQLInt },
          },
        })
      ),
    } /*
    satisfaction: {
      type: new graphql.GraphQLList(new graphql.GraphQLObjectType({
        name: 'SatisfactionEmployeesRanking',
        fields: {
          employeeName: { type: graphql.GraphQLString },
          garageName: { type: graphql.GraphQLString },
          rating12M: { type: graphql.GraphQLFloat },
          ratingM: { type: graphql.GraphQLFloat },
          ratingM1: { type: graphql.GraphQLFloat }
        }
      }))
    },*/,
    problemResolution: {
      type: new graphql.GraphQLList(
        new graphql.GraphQLObjectType({
          name: 'ProblemResolutionEmployeesRanking',
          fields: {
            employeeName: { type: graphql.GraphQLString },
            garageName: { type: graphql.GraphQLString },
            solvingRate12M: { type: graphql.GraphQLFloat },
            solvingRateM: { type: graphql.GraphQLFloat },
            solvingRateM1: { type: graphql.GraphQLFloat },
          },
        })
      ),
    } /* ,
    validEmails: {
      type: new graphql.GraphQLList(new graphql.GraphQLObjectType({
        name: 'ValidEmailsEmployeesRanking',
        fields: {
          employeeName: { type: graphql.GraphQLString },
          garageName: { type: graphql.GraphQLString },
          emailsRate12M: { type: graphql.GraphQLFloat },
          emailsRateM: { type: graphql.GraphQLFloat },
          emailsRateM1: { type: graphql.GraphQLFloat }
        }
      }))
    }*/,
  },
});
