const IApiException = require('../../../interfaces/execution/api.interface.exception');

class BillingAccountsException extends IApiException {
  constructor(msg) {
    super('BillingAccount', msg);
  }
}

module.exports = BillingAccountsException;
