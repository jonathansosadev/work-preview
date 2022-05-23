const IApiComponent = require('../../interfaces/api.interface.component');

class BillingAccountsComponent extends IApiComponent {
  constructor(app) {
    super('billing-accounts', app);
  }
}

module.exports = BillingAccountsComponent;
