const config = require('config');
const URI = require('urijs');
const { encrypt } = require('../survey/survey-id-encryption');
const urls = require('../urls');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const SurveyTypes = require('../../../../common/models/data/type/survey-types.js');
const Scheduler = require('../../../../common/lib/garagescore/scheduler/scheduler.js');

module.exports = async (data, surveyType) => {
  if (!SurveyTypes.hasValue(surveyType)) throw new Error(`'${surveyType}' is not a valid surveyType`);
  const protectedId = encrypt(data.getId().toString(), surveyType);
  const base = `${config.get('publicUrl.survey_url')}${urls.getUrlNamespace('SURVEY').GARAGE}/${protectedId}`;
  const createdShortUrl = await data.app().models.ShortUrl.getShortUrl(base, 30);
  const baseShort = new URI(createdShortUrl.url).toString();
  data.set('survey.acceptNewResponses', false);
  await Scheduler.upsertJob(
    JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION,
    { dataId: data.getId().toString() },
    new Date()
  );
  data.set(`${surveyType}.urls`, { base, baseShort });
  await data.save(true);
};
