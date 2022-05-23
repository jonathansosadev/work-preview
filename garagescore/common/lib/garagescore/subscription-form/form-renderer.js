const app = require('../../../../server/server');
/** render form with prefill if params :id in the url */
function renderForm(req, config, cb) {
  const createContext = function createContext(callback) {
    const context = {
      title: '',
      url: req.url,
    };

    context.config = config;
    if (!req.params || !req.params.id) {
      callback(null, context);
      return;
    }
    app.models.SubscriptionsQueue.findById(req.params.id, (err, res) => {
      if (err) {
        callback(err);
        return;
      }
      const subscription = res.data;
      if (subscription) {
        context.id = req.params.id;
        if (subscription.user) context.user = subscription.user;
        if (subscription.garages) context.garages = subscription.garages;
        if (subscription.services) context.services = subscription.services;
        if (subscription.invoice) context.invoice = subscription.invoice;
      }
      callback(null, context);
    });
  };
  createContext((err, context) => {
    // eslint-disable-line
    if (err) {
      cb(null, 'Error createContext');
      return;
    }
    cb(null, context); // TODO REFACTORING
  });
}

module.exports = {
  renderForm,
};
