const graphql = require('graphql');
const User = require('./user');

const link = new graphql.GraphQLObjectType({
  name: 'GarageLink',
  fields: {
    name: { type: graphql.GraphQLString },
    url: { type: graphql.GraphQLString },
  },
});

module.exports = new graphql.GraphQLObjectType({
  name: 'Garage',
  fields: {
    id: { type: new graphql.GraphQLNonNull(graphql.GraphQLID) },
    type: { type: graphql.GraphQLString },
    status: { type: graphql.GraphQLString },
    users: { type: new graphql.GraphQLList(User) },
    usersQuota: { type: graphql.GraphQLInt },
    countAllSubscribedUsers: { type: graphql.GraphQLInt },
    slug: { type: graphql.GraphQLString },
    publicDisplayName: { type: graphql.GraphQLString },
    securedDisplayName: { type: graphql.GraphQLString },
    businessId: { type: graphql.GraphQLString },
    brandNames: { type: new graphql.GraphQLList(graphql.GraphQLString) },
    googlePlaceId: { type: graphql.GraphQLString },
    zohoDealUrl: { type: graphql.GraphQLString },
    disableZohoUrl: { type: graphql.GraphQLBoolean },
    locale: { type: graphql.GraphQLString },
    timezone: { type: graphql.GraphQLString },
    ratingType: { type: graphql.GraphQLString },
    isReverseRating: { type: graphql.GraphQLBoolean },
    certificateWording: { type: graphql.GraphQLString },
    streetAddress: { type: graphql.GraphQLString },
    city: { type: graphql.GraphQLString },
    postalCode: { type: graphql.GraphQLString },
    subRegion: { type: graphql.GraphQLString },
    region: { type: graphql.GraphQLString },
    group: { type: graphql.GraphQLString },
    links: { type: new graphql.GraphQLList(link) },
    annexGarageId: { type: graphql.GraphQLString },
    bizDevId: { type: graphql.GraphQLString },
    performerId: { type: graphql.GraphQLString },
    googlePlace: {
      type: new graphql.GraphQLObjectType({
        name: 'googlePlace',
        fields: {
          rating: { type: graphql.GraphQLFloat },
          latitude: { type: graphql.GraphQLFloat },
          longitude: { type: graphql.GraphQLFloat },
          streetAddress: { type: graphql.GraphQLString },
          city: { type: graphql.GraphQLString },
          postalCode: { type: graphql.GraphQLString },
          subRegion: { type: graphql.GraphQLString },
          region: { type: graphql.GraphQLString },
        },
      }),
    },
    ticketsConfiguration: {
      type: new graphql.GraphQLObjectType({
        name: 'ticketsConfiguration',
        fields: {
          Unsatisfied_Maintenance: { type: graphql.GraphQLString },
          Unsatisfied_NewVehicleSale: { type: graphql.GraphQLString },
          Unsatisfied_UsedVehicleSale: { type: graphql.GraphQLString },
          Lead_NewVehicleSale: { type: graphql.GraphQLString },
          Lead_UsedVehicleSale: { type: graphql.GraphQLString },
        },
      }),
    },
    thresholds: {
      type: new graphql.GraphQLObjectType({
        name: 'GarageThresholds',
        fields: {
          alertSensitiveThreshold: {
            type: new graphql.GraphQLObjectType({
              name: 'GarageAlertSensitiveTreshold',
              fields: {
                maintenance: { type: graphql.GraphQLFloat },
                sale_new: { type: graphql.GraphQLFloat },
                sale_used: { type: graphql.GraphQLFloat },
              },
            }),
          },
        },
      }),
    },
    parent: {
      type: new graphql.GraphQLObjectType({
        name: 'Parent',
        fields: {
          garageId: { type: graphql.GraphQLString },
          shareLeadTicket: {
            type: new graphql.GraphQLObjectType({
              name: 'ShareLeadTicket',
              fields: {
                enabled: { type: graphql.GraphQLBoolean },
                NewVehicleSale: { type: graphql.GraphQLBoolean },
                UsedVehicleSale: { type: graphql.GraphQLBoolean },
              },
            }),
          },
        },
      }),
    },
    subscriptions: {
      type: new graphql.GraphQLObjectType({
        name: 'adminSubscriptions',
        fields: {
          Maintenance: { type: graphql.GraphQLBoolean },
          NewVehicleSale: { type: graphql.GraphQLBoolean },
          UsedVehicleSale: { type: graphql.GraphQLBoolean },
          Lead: { type: graphql.GraphQLBoolean },
        },
      }),
    },
    surveySignature: {
      type: new graphql.GraphQLObjectType({
        name: 'surveySignature',
        fields: {
          useDefault: { type: graphql.GraphQLBoolean },
          defaultSignature: {
            type: new graphql.GraphQLObjectType({
              name: 'surveySignature_defaultSignature',
              fields: {
                lastName: { type: graphql.GraphQLString },
                firstName: { type: graphql.GraphQLString },
                job: { type: graphql.GraphQLString },
              },
            }),
          },
        },
      }),
    },
    allowReviewCreationFromContactTicket: { type: graphql.GraphQLBoolean },
    enableCrossLeadsSelfAssignCallAlert: { type: graphql.GraphQLBoolean },
  },
});
