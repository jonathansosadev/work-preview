const IApiModel = require('../../../interfaces/configuration/api.interface.model');

class SubscriptionModel extends IApiModel {
  constructor(app) {
    super(
      app,
      {
        dataSource: 'garagescoreMongoDataSource',
        public: true,
      },
      {
        name: 'AutomaticBillingSubscription',
        plural: 'AutomaticBillingSubscriptions',
        base: 'GarageScoreBaseModel',
        options: {
          strictObjectIDCoercion: true,
        },
        mongodb: {
          collection: 'automaticBillingSubscriptions',
        },
        http: {
          path: 'automaticBillingSubscriptions',
        },
        mixins: {
          EventEmitter: true,
          Stream: true,
        },
        properties: {
          garageId: {
            type: 'string',
            required: true,
          },
          dateStart: {
            type: 'date',
            required: true,
          },
          dateEnd: {
            type: 'date',
            required: false,
            default: null,
          },
          active: {
            type: 'boolean',
            required: true,
          },
          setup: {
            enabled: 'boolean',
            price: 'number',
            monthOffset: 'number',
            billDate: 'date',
            alreadyBilled: 'boolean',
          },
          subApv: {
            enabled: 'boolean',
            price: 'number',
            dateSubscription: 'date',
          },
          subSale: {
            enabled: 'boolean',
            price: 'number',
            dateSubscription: 'date',
          },
          subLeads: {
            enabled: 'boolean',
            price: 'number',
            dateSubscription: 'date',
          },
          subAnalytics: {
            enabled: 'boolean',
            price: 'number',
            dateSubscription: 'date',
          },
          subEReputation: {
            enabled: 'boolean',
            price: 'number',
            dateSubscription: 'date',
          },
          subVehicleInspection: {
            enabled: 'boolean',
            price: 'number',
            dateSubscription: 'date',
          },
          subUsers: {
            included: 'number',
            price: 'number',
            maximumTotalPriceForUsers: 'number',
          },
          subContacts: {
            included: 'number',
            price: 'number',
          },
          sub100Contacts: {
            enabled: 'boolean',
            included: 'number',
            every: 'number',
            price: 'number',
          },
          annex: {
            enabled: 'boolean',
            garageId: 'string',
          },
        },
        validations: [],
        relations: {},
        acls: [],
        methods: {},
      }
    );
  }
}

module.exports = SubscriptionModel;
