const IApiModel = require('../../../interfaces/configuration/api.interface.model');

class BillingAccountsModel extends IApiModel {
  constructor(app) {
    super(
      app,
      {
        dataSource: 'garagescoreMongoDataSource',
        public: true,
      },
      {
        name: 'BillingAccount',
        plural: 'BillingAccounts',
        base: 'GarageScoreBaseModel',
        options: {},
        mongodb: {
          collection: 'billingAccounts',
        },
        http: {
          path: 'billingAccounts',
        },
        mixins: {
          EventEmitter: true,
          Stream: true,
        },
        properties: {
          name: {
            type: 'string',
            required: true,
            index: {
              unique: true,
            },
          },
          email: {
            type: 'string',
            required: true,
          },
          accountingId: {
            type: 'string',
            required: true,
            index: {
              unique: true,
            },
          },
          companyName: {
            type: 'string',
            required: true,
          },
          address: {
            type: 'string',
            required: true,
          },
          postalCode: {
            type: 'string',
            required: true,
          },
          city: {
            type: 'string',
            required: true,
          },
          country: {
            type: 'string',
            required: false,
          },
          billingDate: {
            type: 'number',
            required: true,
          },
          vfClientId: {
            type: 'number',
            required: false,
          },
          dateNextBilling: {
            type: 'date',
            required: true,
          },
          goCardLessSetup: {
            type: 'boolean',
            required: false,
            default: false,
          },
          technicalContact: {
            type: 'string',
            required: false,
            default: '',
          },
          accountingContact: {
            type: 'string',
            required: false,
            default: '',
          },
          RGPDContact: {
            type: 'string',
            required: false,
            default: '',
          },
          externalId: {
            type: 'string',
            required: false,
            default: null,
            index: {
              unique: true,
            },
          },
          mandateId: {
            type: 'string',
            required: false,
            default: '',
            index: {
              unique: true,
            },
          },
          customerId: {
            type: 'string',
            required: false,
            default: '',
            index: {
              unique: true,
            },
          },
        },
        validations: [],
        relations: {
          garages: {
            type: 'referencesMany',
            model: 'Garage',
          },
        },
        acls: [],
        methods: {},
      }
    );
  }
}

module.exports = BillingAccountsModel;
