const { AuthenticationError, ForbiddenError, gql } = require('apollo-server-express');
const aws = require('aws-sdk');

const UserAuthorization = require('../../../../common/models/user-autorization');
const { ObjectID } = require('mongodb');

const typePrefix = 'billingAccountGetBillingAccount';

module.exports.typeDef = gql`
  scalar Date

  type ${typePrefix}BillingAccount {
    id: ID
    name: String
    email: String
    billingDate: Int
    dateNextBilling: Date
    goCardLessSetup: Boolean
    billingType: String
    total: Int
    active: Int
    accountingId: String
    companyName: String
    address: String
    postalCode: String
    city: String
    country: String
    vfClientId: Int
    technicalContact: String
    accountingContact: String
    RGPDContact: String
    externalId: String
    mandateId: String
    customerId: String
    garageIds: [String]
    createdAt: Date
    updatedAt: Date
    invoices: [${typePrefix}Invoice]
    sentLastAt: String
    garages: [${typePrefix}Garage]
  }

  type ${typePrefix}Invoice {
    name: String
    path: String
  }

  type ${typePrefix}Garage {
    id: ID!
    type: String
    publicDisplayName: String
    slug: String
    status: String
    subscriptions: ${typePrefix}Subscriptions
    bizDevId: String
    performerId: String
    annexGarageId: String
    googlePlaceId: String
    businessId: String
    zohoDealUrl: String
    disableZohoUrl: Boolean
    locale: String
    additionalLocales: [String]
    timezone: String
    group: String
    ratingType: String
    isReverseRating: Boolean
    brandNames: [String]
    certificateWording: String
    externalId: String
    links: [${typePrefix}Links]
    surveySignature: ${typePrefix}SurveySignature
    thresholds: ${typePrefix}Thresholds
    parent: ${typePrefix}Parent
    ticketsConfiguration: ${typePrefix}TicketsConfiguration
    crossLeadsSourcesEnabled: Boolean
    allowReviewCreationFromContactTicket: Boolean
    enableCrossLeadsSelfAssignCallAlert: Boolean
    leadsVisibleToEveryone: Boolean
    billingAccount: ${typePrefix}BillingAccount
  }

  type ${typePrefix}Links {
    name: String
    url: String
  }

  type ${typePrefix}SurveySignature {
    defaultSignature: ${typePrefix}Signature
  }
  type ${typePrefix}Signature {
    lastName: String
    firstName: String
    job: String
  }
  type ${typePrefix}Thresholds {
    alertSensitiveThreshold: ${typePrefix}AlertSensitiveThreshold
  }
  type ${typePrefix}AlertSensitiveThreshold {
    maintenance: Int
    sale_new: Int
    sale_used: Int
    vehicle_inspection: Int
  }
  type ${typePrefix}Parent {
    garageId: String
    shareLeadTicket: ${typePrefix}ShareLeadTicket
  }
  type ${typePrefix}ShareLeadTicket {
    enabled: Boolean
    NewVehicleSale: Boolean
    UsedVehicleSale: Boolean
  }
  type ${typePrefix}TicketsConfiguration {
    Unsatisfied_Maintenance: String
    Unsatisfied_NewVehicleSale: String
    Unsatisfied_UsedVehicleSale: String
    Lead_Maintenance: String
    Lead_NewVehicleSale: String
    Lead_UsedVehicleSale: String
    VehicleInspection: String
  }
  type ${typePrefix}Subscriptions {
    active: Boolean
    priceValidated: Boolean
    dateStart: String
    dateEnd: String
    isFullChurn: Boolean
    churnEffectiveDate: Date
    Maintenance: ${typePrefix}SubscriptionDetails
    NewVehicleSale: ${typePrefix}SubscriptionDetails
    UsedVehicleSale: ${typePrefix}SubscriptionDetails
    Lead: ${typePrefix}SubscriptionDetails
    EReputation: ${typePrefix}SubscriptionDetails
    VehicleInspection: ${typePrefix}SubscriptionDetails
    Analytics: ${typePrefix}SubscriptionDetails
    Coaching: ${typePrefix}SubscriptionDetails
    Connect: ${typePrefix}SubscriptionDetails
    CrossLeads: ${typePrefix}SubscriptionDetails
    Automation: ${typePrefix}SubscriptionDetails
    setup: ${typePrefix}SubscriptionDetails
    users: ${typePrefix}SubscriptionDetails
    contacts: ${typePrefix}SubscriptionDetails
    AutomationApv: ${typePrefix}SubscriptionDetails
    AutomationVn: ${typePrefix}SubscriptionDetails
    AutomationVo: ${typePrefix}SubscriptionDetails
  }
  """
  I gathered every fields I would find in any subscription,
  some of those will be null for some subs ans that's normal
  """
  type ${typePrefix}SubscriptionDetails {
    enabled: Boolean
    price: Float
    included: Int
    maximumTotalPriceForUsers: Float
    every: Float
    bundle: Boolean
    monthOffset: String
    billDate: Float
    alreadyBilled: Boolean
    restrictMobile: Boolean
    minutePrice: Float
    unitPrice: Float
    churn: ${typePrefix}ChurnDetails
  }

  type ${typePrefix}ChurnDetails {
    enabled: Boolean
    delta: Float
  }

  extend type Query {
    ${typePrefix}(billingAccountId: ID!): ${typePrefix}BillingAccount
  }
`;
module.exports.resolvers = {
  [`${typePrefix}Garage`]: {
    id: (garage) => garage._id,
    crossLeadsSourcesEnabled: (garage) =>
      garage.crossLeadsSourcesEnabled && !!garage.crossLeadsConfig.sources.find((s) => s.enabled),
  },
  [`${typePrefix}BillingAccount`]: {
    id: (billingAccount) => billingAccount._id,
    garages: ({ garageIds }, _, { app }) => {
      if (!garageIds || !garageIds.length) {
        return [];
      }
      return app.models.Garage.getMongoConnector()
        .find({ _id: { $in: garageIds } })
        .toArray();
    },
    invoices: async (billingAccount) => {
      aws.config.region = 'eu-central-1';
      const awsS3Bucket = new aws.S3({ params: { Bucket: 'facturation-automatique' } });
      const id = billingAccount._id.toString();

      const objects = await awsS3Bucket
        .listObjectsV2({
          MaxKeys: 1000,
          Prefix: id,
        })
        .promise();

      return objects.Contents.map((object) => ({ name: object.Key.split('/').pop(), path: object.Key }));
    },
  },
  Query: {
    [typePrefix]: async (root, { billingAccountId }, { app, scope: { logged, authenticationError, user } }) => {
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
        throw new ForbiddenError();
      }
      return app.models.BillingAccount.getMongoConnector().findOne({ _id: new ObjectID(billingAccountId) });
    },
  },
};
