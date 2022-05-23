const IApiValidations = require('../../../interfaces/configuration/api.interface.validations');

class SubscriptionsValidations extends IApiValidations {
  constructor(app) {
    // eslint-disable-line
    super(app);
  }
}

module.exports = SubscriptionsValidations;
