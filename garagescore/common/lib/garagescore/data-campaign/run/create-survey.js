const config = require('config');
const { encrypt } = require('../../survey/survey-id-encryption');
const urls = require('../../urls');
const URI = require('urijs');

/*
 * Create DataRecord Survey for CampaignItem
 */

function createSurvey(callback) {
  const self = this;
  const data = self.modelInstances.data;
  const protectedId = encrypt(data.getId().toString()); // No surveyType needed for the original survey
  const surveyUrls = {
    base: `${config.get('publicUrl.survey_url')}${urls.getUrlNamespace('SURVEY').GARAGE}/${protectedId}`,
    mobileLanding: `${config.get('publicUrl.survey_url')}${
      urls.getUrlNamespace('SURVEY').MOBILE_LANDING_PAGE
    }/${protectedId}`,
    unsatisfiedLanding: `${config.get('publicUrl.survey_url')}${
      urls.getUrlNamespace('SURVEY').UNSATISFIED_LANDING
    }/${protectedId}`,
  };

  // url shortener
  data
    .app()
    .models.ShortUrl.getShortUrl(surveyUrls.mobileLanding, 30)
    .then(
      (createdShortUrl) => {
        surveyUrls.baseShort = new URI(createdShortUrl.url).toString();
        data.addSurvey(surveyUrls);
        data.save((errSave, updatedData) => {
          if (errSave) {
            callback(errSave);
            return;
          }
          self.modelInstances.data = updatedData;
          callback();
        });
      },
      (err) => {
        if (err) {
          callback(err);
        }
      }
    );
}

module.exports = createSurvey;
