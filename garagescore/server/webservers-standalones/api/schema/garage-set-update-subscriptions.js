const { gql, AuthenticationError, ForbiddenError } = require('apollo-server-express');
const UserAuthorization = require('../../../../common/models/user-autorization');
const BillingAccountPipeline = require('../../../../common/lib/garagescore/automatic-billing/billing-api/components/billing-accounts/execution/pipelines/billing-accounts.pipeline');
const BillingAccountPipelineAction = require('../../../../common/lib/garagescore/automatic-billing/billing-api/components/billing-accounts/execution/pipelines/billing-accounts.pipeline.action');
const BillingAccountPipelineCatalog = require('../../../../common/lib/garagescore/automatic-billing/billing-api/components/billing-accounts/execution/pipelines/billing-accounts.pipeline.catalog');

const typePrefix = 'garageSetUpdateSubscriptions';

const typeDef = gql`
  type ${typePrefix}ChurnDetails {
    enabled: Boolean
    delta: Float
  }

  type ${typePrefix}Details {
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

  type ${typePrefix}Result {
    active: Boolean
    priceValidated: Boolean
    dateStart: Date
    dateEnd: Date
    isFullChurn: Boolean
    churnEffectiveDate: Date
    Maintenance: ${typePrefix}Details
    NewVehicleSale: ${typePrefix}Details
    UsedVehicleSale: ${typePrefix}Details
    Lead: ${typePrefix}Details
    EReputation: ${typePrefix}Details
    VehicleInspection: ${typePrefix}Details
    Analytics: ${typePrefix}Details
    Coaching: ${typePrefix}Details
    Connect: ${typePrefix}Details
    CrossLeads: ${typePrefix}Details
    Automation: ${typePrefix}Details
    setup: ${typePrefix}Details
    users: ${typePrefix}Details
    contacts: ${typePrefix}Details
    AutomationApv: ${typePrefix}Details
    AutomationVo: ${typePrefix}Details
    AutomationVn: ${typePrefix}Details
  }

  input ${typePrefix}ChurnDetailsInput {
    enabled: Boolean
    delta: Float
  }

  input ${typePrefix}DetailsInput {
    enabled: Boolean
    price: Float
    included: Int
    maximumTotalPriceForUsers: Float
    every: Float
    bundle: Boolean
    monthOffset: Int
    billDate: Date
    alreadyBilled: Boolean
    restrictMobile: Boolean
    minutePrice: Float
    unitPrice: Float
    date: Date
    churn: ${typePrefix}ChurnDetailsInput
  }

  input ${typePrefix}LoggedInUserInput {
    email: String
    username: String
  }

  input ${typePrefix}Input {
    priceValidated: Boolean
    dateStart: Date
    dateEnd: Date
    isFullChurn: Boolean
    churnEffectiveDate: Date
    annexGarageId: ID
    Maintenance: ${typePrefix}DetailsInput
    NewVehicleSale: ${typePrefix}DetailsInput
    UsedVehicleSale: ${typePrefix}DetailsInput
    Lead: ${typePrefix}DetailsInput
    EReputation: ${typePrefix}DetailsInput
    VehicleInspection: ${typePrefix}DetailsInput
    Analytics: ${typePrefix}DetailsInput
    Coaching: ${typePrefix}DetailsInput
    Connect: ${typePrefix}DetailsInput
    CrossLeads: ${typePrefix}DetailsInput
    Automation: ${typePrefix}DetailsInput
    AutomationApv: ${typePrefix}DetailsInput
    AutomationVn: ${typePrefix}DetailsInput
    AutomationVo: ${typePrefix}DetailsInput
    setup: ${typePrefix}DetailsInput
    users: ${typePrefix}DetailsInput
    contacts: ${typePrefix}DetailsInput
  }

  extend type Mutation {
    ${typePrefix}(
      garageId: ID!
      billingAccountId: ID!
      subscriptions: ${typePrefix}Input
    ): ${typePrefix}Result
  }
`;

const resolvers = {
  Mutation: {
    [typePrefix]: async (
      _,
      { garageId, billingAccountId, subscriptions },
      { app, scope: { logged, authenticationError, user } }
    ) => {
      if (!logged) {
        throw new AuthenticationError(authenticationError);
      } else if (!user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
        throw new ForbiddenError();
      }

      subscriptions.greyBologgedUser = {
        username: `${user.firstName} ${user.lastName}`,
        email: user.email,
      };

      //! idk why this is name sub and not subscriptions but I don't want to change all the pipeline functions now
      const data = { garageId, billingAccountId, sub: subscriptions };
      const pipeline = new BillingAccountPipeline(app, '{GA}');
      const actions = [
        BillingAccountPipelineCatalog.getOneBillingAccount,
        BillingAccountPipelineCatalog.getOneGarage,
        BillingAccountPipelineCatalog.checkIfGarageExistsInBillingAccount,
        BillingAccountPipelineCatalog.updateOneSubscription,
        BillingAccountPipelineCatalog.notifySlackChannelsModification,
      ];
      for (const action of actions) {
        pipeline.pushBack(new BillingAccountPipelineAction(...action));
      }

      const { subscriptions: res } = await pipeline.run(data);

      return res;
    },
  },
};

module.exports = {
  typeDef,
  resolvers,
};
