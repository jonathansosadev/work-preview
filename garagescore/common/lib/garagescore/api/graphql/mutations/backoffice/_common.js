const graphql = require('graphql');

module.exports = {
  name: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
  externalId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
  type: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
  group: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
  businessId: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
  googlePlaceId: { type: graphql.GraphQLString },
  locale: { type: graphql.GraphQLString },
  additionalLocales: { type: new graphql.GraphQLList(graphql.GraphQLString) },
  timezone: { type: graphql.GraphQLString },
  zohoDealUrl: { type: graphql.GraphQLString },
  disableZohoUrl: { type: graphql.GraphQLBoolean },
  ratingType: { type: graphql.GraphQLString },
  isReverseRating: { type: graphql.GraphQLBoolean },
  certificateWording: { type: graphql.GraphQLString },
  brandNames: { type: new graphql.GraphQLList(graphql.GraphQLString) },
  surveySignature: {
    type: new graphql.GraphQLInputObjectType({
      name: 'surveySignature_input',
      fields: {
        defaultSignature: {
          type: new graphql.GraphQLInputObjectType({
            name: 'defaultSignature_input',
            fields: {
              firstName: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
              lastName: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
              job: { type: new graphql.GraphQLNonNull(graphql.GraphQLString) },
            },
          }),
        },
      },
    }),
  },
  apv: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
  vn: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
  vo: { type: new graphql.GraphQLNonNull(graphql.GraphQLInt) },
  link: { type: graphql.GraphQLString },
  billingAccountId: { type: graphql.GraphQLString }, // NEEDED FOR NEW GARAGE
  parentGarageId: { type: graphql.GraphQLString },
  shareLeadTicket: { type: graphql.GraphQLBoolean },
  shareLeadTicketNewVehicleSale: { type: graphql.GraphQLBoolean },
  shareLeadTicketUsedVehicleSale: { type: graphql.GraphQLBoolean },
  performerId: { type: graphql.GraphQLString },
  allowReviewCreationFromContactTicket: { type: graphql.GraphQLBoolean },
  enableCrossLeadsSelfAssignCallAlert: { type: graphql.GraphQLBoolean },
  leadsVisibleToEveryone: { type: graphql.GraphQLBoolean },
};
