const IApiComponent = require('../../interfaces/api.interface.component');

class SubscriptionsComponent extends IApiComponent {
  constructor(app) {
    super('subscription', app);
  }
}

module.exports = SubscriptionsComponent;
