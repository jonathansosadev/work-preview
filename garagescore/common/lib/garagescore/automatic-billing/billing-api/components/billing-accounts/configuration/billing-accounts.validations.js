const IApiValidations = require('../../../interfaces/configuration/api.interface.validations');

class BillingAccountsValidations extends IApiValidations {
  constructor(app) {
    super(app, 'BillingAccount', 'name.Unique', 'accountingId.Unique');
  }
}

module.exports = BillingAccountsValidations;
