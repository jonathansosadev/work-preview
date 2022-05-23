const graphql = require('graphql');
const GraphQLDate = require('graphql-date');

const DataTypes = require('../../../../../../models/data/type/data-types');
const GarageSubscriptionTypes = require('../../../../../../models/garage.subscription.type.js');
const { isSubscribed } = require('../../../../../../models/garage/garage-methods');
const garageCache = require('../../_common/garage-cache.js');

module.exports = {
  id: {
    type: new graphql.GraphQLNonNull(graphql.GraphQLID),
  },
  type: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('type');
    },
  },
  isApv: {
    type: graphql.GraphQLBoolean,
    resolve(data) {
      return data.get('type') === DataTypes.MAINTENANCE;
    },
  },
  isVn: {
    type: graphql.GraphQLBoolean,
    resolve(data) {
      return data.get('type') === DataTypes.NEW_VEHICLE_SALE;
    },
  },
  isVo: {
    type: graphql.GraphQLBoolean,
    resolve(data) {
      return data.get('type') === DataTypes.USED_VEHICLE_SALE;
    },
  },
  garageId: {
    type: graphql.GraphQLString,
  },
  garagePublicDisplayName: {
    type: graphql.GraphQLString,
    async resolve(data) {
      const garage = await garageCache.getGarage(data.garageId);
      return garage.publicDisplayName;
    },
  },
  garageType: {
    type: graphql.GraphQLString,
    async resolve(data) {
      const garage = await garageCache.getGarage(data.garageId);
      return garage.type;
    },
  },
  garageRatingType: {
    type: graphql.GraphQLString,
    async resolve(data) {
      const garage = await garageCache.getGarage(data.garageId);
      return garage.ratingType;
    },
  },
  garageSubscriptions: {
    type: new graphql.GraphQLObjectType({
      name: 'garageSubscriptions',
      fields: {
        Maintenance: { type: graphql.GraphQLBoolean },
        NewVehicleSale: { type: graphql.GraphQLBoolean },
        UsedVehicleSale: { type: graphql.GraphQLBoolean },
        Lead: { type: graphql.GraphQLBoolean },
        EReputation: { type: graphql.GraphQLBoolean },
      },
    }),
    async resolve(data) {
      const garage = await garageCache.getGarage(data.garageId);
      const subscriptions = {};
      for (const subscription of GarageSubscriptionTypes.values()) {
        subscriptions[subscription] = isSubscribed(garage.subscriptions, subscription);
      }
      return subscriptions;
    },
  },
  garageProvidedFrontDeskUserName: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('service.frontDeskUserName');
    },
  },
  garageProvidedCustomerId: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('service.frontDeskCustomerId');
    },
  },
  completedAt: {
    type: GraphQLDate,
    resolve(data) {
      return data.get('review.createdAt');
    },
  },
  customerTitle: {
    type: graphql.GraphQLString,
    description: 'the old customer fullName before update by the customer',
    resolve(data) {
      return data.get('customer.title.value');
    },
  },
  customerFullName: {
    type: graphql.GraphQLString,
    description: 'the customer fullName',
    resolve(data) {
      return data.get('customer.fullName.value');
    },
  },
  customerEmail: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('customer.contact.email.value') || data.get('customer.contact.email.original');
    },
  },
  customerEmailIsNc: {
    type: graphql.GraphQLBoolean,
    resolve(data) {
      return !!data.get('customer.contact.email.isNC');
    },
  },
  customerCity: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('customer.city.value');
    },
  },
  customerPhone: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('customer.contact.mobilePhone.value') || data.get('customer.contact.mobilePhone.original');
    },
  },
  vehicleModel: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('vehicle.model.value');
    },
  },
  vehicleMake: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('vehicle.make.value');
    },
  },
  vehicleRegistrationPlate: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('vehicle.plate.value');
    },
  },
  vehicleVin: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('vehicle.vin.value');
    },
  },
  serviceFrontDeskUserName: {
    type: graphql.GraphQLString,
    resolve(data) {
      return data.get('service.frontDeskUserName');
    },
  },
  serviceProvidedAt: {
    type: GraphQLDate,
    resolve(data) {
      return data.get('service.providedAt');
    },
  },
};
