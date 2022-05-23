const IApiException = require('../../../interfaces/execution/api.interface.exception');

class SubscriptionException extends IApiException {
  constructor(msg) {
    super('Subscription', msg);
  }
}

module.exports = SubscriptionException;
