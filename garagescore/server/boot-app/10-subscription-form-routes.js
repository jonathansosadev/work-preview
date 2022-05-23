const gsClient = require('../../common/lib/garagescore/client');
const formRenderer = require('../../common/lib/garagescore/subscription-form/form-renderer');
const formSubmiter = require('../../common/lib/garagescore/subscription-form/form-submiter');
const configs = require('../../common/lib/garagescore/subscription-form/configs');

module.exports = function mountSubscriptionFormRoutes(app) {
  app.post(gsClient.url.getUrl('SUBSCRIPTION_SUBMIT'), formSubmiter.saveAndSend.bind(null, app));

  const renderForm = function (req, res) {
    const version = req.params && req.params.slug;
    const config = configs[version];
    if (!config) {
      res.send(404);
      return;
    }
    config.version = version;
    formRenderer.renderForm(req, config, (err, data) => {
      res.json(data);
    });
  };
  app.get(`${gsClient.url.getUrl('SUBSCRIPTION_FORM')}/:id`, renderForm);
  app.get(gsClient.url.getUrl('SUBSCRIPTION_FORM'), renderForm);
};
