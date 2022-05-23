/** Encrypt our survey id to expose them online */
const crypt = require('../../util/public-link-encrypted-id');
const SurveyTypes = require('../../../../common/models/data/type/survey-types.js');

module.exports = {
  encrypt: (dataId, surveyType) => {
    if (!surveyType) return crypt.encrypt(dataId); // When there's only the dataId in the URL
    return `${crypt.encrypt(dataId)}-${Buffer.from(surveyType).toString('base64')}`; // btoa to keep the string
  },
  decrypt: (encoded) => ({
    dataId: crypt.decrypt(encoded.split('-')[0]), // Retro-compatible
    surveyType: encoded.includes('-')
      ? Buffer.from(encoded.split('-')[1], 'base64').toString('ascii')
      : SurveyTypes.SURVEY,
  }),
};
