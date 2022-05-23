const graphql = require('graphql');

module.exports = new graphql.GraphQLObjectType({
  name: 'MonthlyValidEmails',
  fields: {
    garageId: { type: graphql.GraphQLString },
    garageName: { type: graphql.GraphQLString },
    totalForEmails12M: { type: graphql.GraphQLInt },
    totalForEmailsM: { type: graphql.GraphQLInt },
    totalForEmailsM1: { type: graphql.GraphQLInt },
    totalForEmailsM2: { type: graphql.GraphQLInt },
    totalForEmailsM3: { type: graphql.GraphQLInt },
    validEmails12M: { type: graphql.GraphQLInt },
    validEmailsM: { type: graphql.GraphQLInt },
    validEmailsM1: { type: graphql.GraphQLInt },
    validEmailsM2: { type: graphql.GraphQLInt },
    validEmailsM3: { type: graphql.GraphQLInt },
    emailQuality12M: {
      type: new graphql.GraphQLObjectType({
        name: 'emailQuality12M',
        fields: {
          validEmails: { type: graphql.GraphQLInt },
          wrongEmails: { type: graphql.GraphQLInt },
          missingEmails: { type: graphql.GraphQLInt },
        },
      }),
    },
    emailQualityM: {
      type: new graphql.GraphQLObjectType({
        name: 'emailQualityM',
        fields: {
          validEmails: { type: graphql.GraphQLInt },
          wrongEmails: { type: graphql.GraphQLInt },
          missingEmails: { type: graphql.GraphQLInt },
        },
      }),
    },
    emailQualityM1: {
      type: new graphql.GraphQLObjectType({
        name: 'emailQualityM1',
        fields: {
          validEmails: { type: graphql.GraphQLInt },
          wrongEmails: { type: graphql.GraphQLInt },
          missingEmails: { type: graphql.GraphQLInt },
        },
      }),
    },
    detailsUrl: { type: graphql.GraphQLString },
  },
});
