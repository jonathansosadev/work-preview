var _ = require('underscore');
var crypto = require('crypto');
var debug = require('debug')('garagescore:common:lib:surveygizmo:sg-tools'); // eslint-disable-line max-len,no-unused-vars
var surveygizmo = require('surveygizmo-js');
var URI = require('urijs');
var config = require('config');
var rest = require('restler');

var sgTools = {};

sgTools.sguidMatch = function (decodedSguid, eitherDecodedOrEncodedSguid) {
  if (
    decodedSguid.toString() === eitherDecodedOrEncodedSguid.toString() ||
    surveygizmo.util.encodeSguid(decodedSguid) === eitherDecodedOrEncodedSguid.toString()
  ) {
    return true;
  }

  return false;
};

// use api V5 to get the encoded sguid
sgTools.getSGUID = function (surveyId, campaignId, contactId, cb) {
  var url =
    'https://restapi.surveygizmo.com/v5/survey/' +
    surveyId +
    '/surveycampaign/' +
    campaignId +
    '/surveycontact/' +
    contactId;
  url =
    url +
    '?api_token=' +
    config.get('surveygizmo.restApi.auth.key') +
    '&api_token_secret=' +
    config.get('surveygizmo.restApi.auth.secretKey');
  rest
    .get(url)
    .on('complete', function (d, response) {
      var sguid = null;
      var raw = response.rawEncoded;
      if (raw) {
        var r = raw.match(/sguid=([^"]*)"/);
        if (r && r.length > 0) {
          sguid = r[1];
        }
      }
      cb(null, sguid);
    })
    .on('error', cb);
};

sgTools.generateSurveyGizmoSurveyUrlError = '/';

sgTools.generateSurveyGizmoSurveyUrl = function (surveyData, optionsParam, cb) {
  var options = _.isUndefined(optionsParam) ? {} : optionsParam;

  if (
    typeof surveyData === 'undefined' ||
    !('campaignUri' in surveyData) ||
    !('sguid' in surveyData) ||
    !('surveyId' in surveyData) ||
    !('campaignId' in surveyData) ||
    !('campaignEmailMessageId' in surveyData)
  ) {
    cb(sgTools.generateSurveyGizmoSurveyUrlError);
  }
  sgTools.getSGUID(surveyData.surveyId, surveyData.campaignId, surveyData.sguid, function (errSGUID, encodedSguid) {
    // var encodedSguid = surveygizmo.util.encodeSguid(surveyData.sguid);
    var surveyUrl = new URI(
      (surveyData.isCampaignSsl ? 'https://' : 'http://') +
        surveyData.campaignUri +
        '/' +
        ['i', encodedSguid, surveyData.campaignEmailMessageId].join('-')
    )
      .query(_.extend({}, { sguid: encodedSguid }, options))
      .toString();
    cb(null, surveyUrl);
  });
};

sgTools.generateSurveyGizmoSurveyAccessToken = function () {
  var surveyAccessToken = crypto.randomBytes(8).toString('hex');
  return surveyAccessToken;
};

module.exports = sgTools;
