var app = require('../../../server/server.js');
var SurveyType = require('../../../common/models/survey.type.js');
var request = require('request');
var config = require('config');

var surveyId;

var surveyGizmoReqBody = {
  Question_SKU: '172',
  Language: 'French',
};

var surveyGizmoReqBodySale = {
  Question_SKU: '172',
  Language: 'French',
};

process.argv.forEach(function (val, index) {
  if (val === '--help') {
    console.log('');
    console.log('* This command simulate sending request to surveygizmo for a revised data');
    console.log('* If no data are specified the script send the original data instead');
    console.log('');
    console.log('Usage node bin/survey-gizmo/simulate-revised-data.js [options]');
    console.log('options:');
    console.log('--survey-id \t the surveyId');
    console.log('--title \t optionnel: customer new Title');
    process.exit(0);
  }
  if (val === '--survey-id') {
    surveyId = process.argv[index + 1];
  }

  if (val === '--title') {
    surveyGizmoReqBody.q_id_159 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_210 = process.argv[index + 1];
  }
  if (val === '--full-name') {
    surveyGizmoReqBody.q_id_158 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_208 = process.argv[index + 1];
  }
  if (val === '--street-address') {
    surveyGizmoReqBody.q_id_161 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_212 = process.argv[index + 1];
  }
  if (val === '--post-code') {
    surveyGizmoReqBody.q_id_165 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_216 = process.argv[index + 1];
  }
  if (val === '--city') {
    surveyGizmoReqBody.q_id_163 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_214 = process.argv[index + 1];
  }
  if (val === '--email') {
    surveyGizmoReqBody.q_id_167 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_218 = process.argv[index + 1];
  }
  if (val === '--mobile-phone') {
    surveyGizmoReqBody.q_id_170 = process.argv[index + 1];
    surveyGizmoReqBodySale.q_id_219 = process.argv[index + 1];
  }
});
if (!surveyId) {
  console.log('The survey id is mandatory');
  process.exit(-1);
}

app.on('booted', function () {
  var surevyWebhookUrl = config.get('publicUrl.app_url') + '/webhook/sgizmo/http-connect';
  app.models.Survey.findById(surveyId, function (err, survey) {
    if (err || !survey) {
      console.log(err || 'survey not found');
      process.exit(-1);
    }
    if (survey.type !== SurveyType.MAINTENANCE && survey.type !== SurveyType.VEHICLE_SALE) {
      console.log('Error only maintenance and vehicleSale surveys are supported');
      process.exit(-1);
    }
    surveyGizmoReqBody.hva_sguid = survey.foreign.sgizmo.sguid;
    surveyGizmoReqBody.hva_token = survey.accessToken;
    surveyGizmoReqBody.hva_garagescore_survey_id = survey.getId().toString();
    surveyGizmoReqBodySale.hva_sguid = survey.foreign.sgizmo.sguid;
    surveyGizmoReqBodySale.hva_token = survey.accessToken;
    surveyGizmoReqBodySale.hva_garagescore_survey_id = survey.getId().toString();
    app.models.CampaignItem.findById(survey.campaignItemId, function (err2, campaignItem) {
      if (err2 || !campaignItem || !campaignItem.addressee.contactChannel) {
        console.log(err2 || 'campaignItem not found' || 'campaignItem.addressee.contactChannel not found');
        process.exit(-1);
      }
      var contactChannel = campaignItem.addressee.contactChannel;
      if (!surveyGizmoReqBody.q_id_159) {
        surveyGizmoReqBody.q_id_159 = campaignItem.addressee.title;
        surveyGizmoReqBodySale.q_id_210 = campaignItem.addressee.title;
      }
      if (!surveyGizmoReqBody.q_id_158) {
        surveyGizmoReqBody.q_id_158 = campaignItem.addressee.fullName;
        surveyGizmoReqBodySale.q_id_208 = campaignItem.addressee.fullName;
      }
      if (!surveyGizmoReqBody.q_id_161) {
        surveyGizmoReqBody.q_id_161 = contactChannel.snailMail && contactChannel.snailMail.streetAddress;
        surveyGizmoReqBodySale.q_id_212 = contactChannel.snailMail && contactChannel.snailMail.streetAddress;
      }
      if (!surveyGizmoReqBody.q_id_165) {
        surveyGizmoReqBody.q_id_165 = contactChannel.snailMail && contactChannel.snailMail.postCode;
        surveyGizmoReqBodySale.q_id_216 = contactChannel.snailMail && contactChannel.snailMail.postCode;
      }
      if (!surveyGizmoReqBody.q_id_163) {
        surveyGizmoReqBody.q_id_163 = contactChannel.snailMail && contactChannel.snailMail.city;
        surveyGizmoReqBodySale.q_id_214 = contactChannel.snailMail && contactChannel.snailMail.city;
      }
      if (!surveyGizmoReqBody.q_id_167) {
        surveyGizmoReqBody.q_id_167 = contactChannel.email && contactChannel.email.address;
        surveyGizmoReqBodySale.q_id_218 = contactChannel.email && contactChannel.email.address;
      }
      if (!surveyGizmoReqBody.q_id_170) {
        surveyGizmoReqBody.q_id_170 = contactChannel.mobilePhone && contactChannel.mobilePhone.number;
        surveyGizmoReqBodySale.q_id_219 = contactChannel.mobilePhone && contactChannel.mobilePhone.number;
      }
      var options = {
        url: surevyWebhookUrl,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(survey.type === SurveyType.MAINTENANCE ? surveyGizmoReqBody : surveyGizmoReqBodySale),
      };
      request.post(options, function (err3, res, body) {
        if (err3) {
          throw err3;
        }
        if (body !== 'Ok') {
          throw new Error(surevyWebhookUrl + ' is not responding or another probleme occured');
        }
        console.log('Request send');
        process.exit(0);
      });
    });
  });
});
