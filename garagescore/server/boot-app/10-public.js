const debugPerfs = require('debug')('perfs:server:boot:public-api');
const { ObjectId } = require('mongodb');
const gsClient = require('../../common/lib/garagescore/client');
const {
  automationCampaign,
  automationCampaignUnsubscribe,
  automationCampaignNotFound,
  automationCampaignRedirect,
} = require('../routes/backoffice/public-request');

debugPerfs('Starting boot public');

module.exports = function mountPublic(app) {
  /* Automation Campaign */
  app.get(gsClient.url.getUrl('AUTOMATION_CAMPAIGN'), async (req, res) => {
    await automationCampaign(req, res);
  });

  app.get(gsClient.url.getUrl('AUTOMATION_CAMPAIGN_REDIRECT'), async (req, res) => {
    await automationCampaignRedirect(req, res);
  });

  app.post(gsClient.url.getUrl('AUTOMATION_CAMPAIGN_UNSUBSCRIBE'), async (req, res) => {
    await automationCampaignUnsubscribe(req, res);
  });

  app.get('/automation-campaign', (req, res) => {
    automationCampaignNotFound(req, res);
  });
  app.get('/automation-campaign/*', (req, res) => {
    automationCampaignNotFound(req, res);
  });
  /* google write review */
  app.get(gsClient.url.getUrl('PUBLIC_REDIRECT_TO_GOOGLE_WRITE_REVIEW'), async (req, res) => {
    await app.models.Data.getMongoConnector().updateOne(
      { _id: ObjectId(req.params.dataid) },
      { $set: { 'review.sharedOnGoogleClicked': true } }
    );
    // redirect 302 to google write review
    res.redirect(302, 'https://search.google.com/local/writereview?placeid=' + req.params.googlePlaceId);
  });
};
