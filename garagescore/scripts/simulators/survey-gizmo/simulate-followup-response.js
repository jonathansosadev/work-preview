var app = require('../../../server/server.js');
var SurveyType = require('../../../common/models/survey.type.js');
var request = require('request');
var config = require('config');

var surveyId;

var surveyGizmoReqBody = {
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
    if (survey.type !== SurveyType.MAINTENANCE_FOLLOWUP) {
      console.log('Error only followupUnsatisfied surveys are supported');
      process.exit(-1);
    }
    surveyGizmoReqBody.hva_sguid = survey.foreign.sgizmo.sguid;
    surveyGizmoReqBody.hva_token = survey.accessToken;
    surveyGizmoReqBody.hva_garagescore_survey_id = survey.getId().toString();
    surveyGizmoReqBody.q_id_3 = '1';
    surveyGizmoReqBody.q_id_7 = '20';
    surveyGizmoReqBody.q_id_9 = '20';
    surveyGizmoReqBody.q_id_10 = '20';
    surveyGizmoReqBody.q_id_12 = '20';
    surveyGizmoReqBody.q_id_13 = '20';
    surveyGizmoReqBody.q_id_21 = ' ';
    surveyGizmoReqBody.q_id_118 = ['accepted'];
    surveyGizmoReqBody.q_id_123 = '';
    surveyGizmoReqBody.q_id_122 = 'Oui';
    surveyGizmoReqBody.q_id_125 = 'Oui';
    surveyGizmoReqBody.q_id_124 = '';
    surveyGizmoReqBody.sv_page_number = '2';
    surveyGizmoReqBody.sv_page_count = '5';
    surveyGizmoReqBody.sv_page_id = '3';
    var options = {
      url: surevyWebhookUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(surveyGizmoReqBody),
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
