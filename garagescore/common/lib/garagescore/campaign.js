'use strict';

/**
 * @module garagescore/campaign
 */
var _ = require('lodash');
var app = null; // we want our tests to run without having to run the app
var config = require('config');
var debug = require('debug')('garagescore:common:lib:garagescore:campaign'); // eslint-disable-line max-len,no-unused-vars
var sgizmoRestApi = require('../surveygizmo/rest-api');
var async = require('async');
// update webhook url to forward to our local app
function updateWebHooksUrl(surveyId, sgizmoSurveyData, callback) {
  if (process.env.NODE_APP_INSTANCE === 'app') {
    // I wanted to use NODE_ENV as a way to identify the true prod but, it's sat at 'production' everywhere
    debug('[SurveyGizmo] NOT updating webhooks in production');
    callback(null, sgizmoSurveyData);
    return;
  }
  if (config.has('survey.useFakeApi') && config.get('survey.useFakeApi')) {
    debug('[SurveyGizmo] NOT updating webhooks with fake api');
    callback(null, sgizmoSurveyData);
    return;
  }
  sgizmoRestApi.getSurvey(surveyId, function (e, s) {
    if (e) {
      console.error(e);
      callback(e);
    }
    var questionsIds = [];
    s.data.pages.forEach(function (p) {
      p.questions.forEach(function (q) {
        if (q._type === 'SurveyAction' && q.properties && q.properties.url) {
          console.log(q.id + ' ' + q.properties.url);
          questionsIds.push(q.id);
        }
      });
    });
    debug('[SurveyGizmo] Update ' + questionsIds.length + ' webhooks');
    async.eachSeries(
      questionsIds,
      function (questionsId, next) {
        sgizmoRestApi.updateSurveyQuestion(
          questionsId,
          { properties: { url: config.get('publicUrl.app_url') + '/webhook/sgizmo/http-connect' } },
          { surveyId: surveyId },
          function (eu, uq) {
            if (eu) {
              next(eu);
              return;
            }
            console.log('>> ' + uq.data.id + ' ' + uq.data.properties.url);
            next();
          }
        );
      },
      function () {
        callback(null, sgizmoSurveyData);
      }
    );
  });
}

/*
 * Create SurveyGizmo Survey for a given campaignId, based on settings of given type
 * @param {String} sgizmoMasterSurveyId
 * @param {Object} options
 * @param {Function} callback
 *
 * @promiseable
 */
function createSurveyGizmoSurvey(/* sgizmoMasterSurveyId, [options], callback */) {
  if (!app) {
    app = require('../../../server/server');
  }
  var sgizmoMasterSurveyId = arguments[0];
  var options;
  var callback;
  if (_.isFunction(arguments[1])) {
    // Assume createSurveyGizmoSurvey(sgizmoMasterSurveyId, callback);
    options = {};
    callback = arguments[1];
  } else {
    // Assume createSurveyGizmoSurvey(sgizmoMasterSurveyId, options, callback);
    options = arguments[1];
    callback = arguments[2];
  }

  var sgizmoSurveyData = {};

  if (!sgizmoMasterSurveyId) {
    callback(new Error('Undefined `sgizmoMasterSurveyId`'));
    return;
  }
  if (typeof options.campaignId === 'undefined') {
    callback(new Error('Undefined `options.campaignId`'));
    return;
  }
  sgizmoSurveyData.masterSurveyId = sgizmoMasterSurveyId;

  app.models.Campaign.findById(options.campaignId, { include: ['garage'] }, function (errCampaign, campaign) {
    if (errCampaign) {
      callback(errCampaign);
      return;
    }
    debug(
      '[SurveyGizmo] About to copy Master Survey %s into new Survey for campaignId:%s (“%s”)…',
      sgizmoSurveyData.masterSurveyId,
      campaign.getId().toString(),
      campaign.name
    );

    var sgizmoSurveyTitle = campaign.name;
    if (config.has('surveygizmo.survey.prefix') && config.get('surveygizmo.survey.prefix') !== false) {
      sgizmoSurveyTitle = config.get('surveygizmo.survey.prefix') + ' ' + sgizmoSurveyTitle;
    }
    sgizmoRestApi.copySurvey(
      sgizmoSurveyData.masterSurveyId,
      {
        title: campaign.garage().publicDisplayName,
        options: { internal_title: sgizmoSurveyTitle },
      },
      function (errCopySurvey, copySurveyResult) {
        if (errCopySurvey) {
          callback(new Error(errCopySurvey.message));
          return;
        }
        debug(copySurveyResult);
        var sgizmoSurvey = copySurveyResult.data;
        sgizmoSurveyData.surveyId = sgizmoSurvey.id;
        debug(
          '[SurveyGizmo] Copied Master Survey %s into Survey %s.',
          sgizmoSurveyData.masterSurveyId,
          sgizmoSurveyData.surveyId
        );
        debug('[SurveyGizmo] About to create Campaign for Survey %s…', sgizmoSurveyData.surveyId);
        sgizmoRestApi.createSurveyCampaign(
          {
            type: 'email',
            name: campaign.name,
            language: 'Auto', // Survey will *apparently* adjust based on HTTP Accept-Language header
            subtype: 'private',
          },
          { surveyId: sgizmoSurveyData.surveyId },
          function (errCreateSurvey, createSurveyCampaignResult) {
            if (errCreateSurvey) {
              callback(new Error(errCreateSurvey));
              return;
            }
            debug(createSurveyCampaignResult);
            var sgizmoCampaign = createSurveyCampaignResult.data;
            sgizmoSurveyData.campaignId = sgizmoCampaign.id;
            sgizmoSurveyData.campaignInviteId = sgizmoCampaign.inviteid;
            debug(
              '[SurveyGizmo] Created Campaign %s (Invite %s) for Survey %s',
              sgizmoSurveyData.campaignId,
              sgizmoSurveyData.campaignInviteId,
              sgizmoSurveyData.surveyId
            );
            // For some weird reason, the privatename option is not working for Campaign create,
            // but it is working for Campaign update.
            debug('[SurveyGizmo] About to update private link of Campaign %s…', sgizmoSurveyData.campaignId);
            sgizmoRestApi.updateSurveyCampaign(
              sgizmoSurveyData.campaignId,
              {
                privatename: 'survey.garagescore.com',
              },
              { surveyId: sgizmoSurveyData.surveyId },
              function (errUpdateSurvey, updateSurveyCampaignResult) {
                if (errUpdateSurvey) {
                  callback(new Error(errUpdateSurvey));
                  return;
                }
                debug(updateSurveyCampaignResult);
                sgizmoCampaign = updateSurveyCampaignResult.data;
                sgizmoSurveyData.campaignUri = sgizmoCampaign.uri;
                sgizmoSurveyData.isCampaignSsl = sgizmoCampaign.SSL === 'True';
                debug('[SurveyGizmo] Updated private link of Campaign %s…', sgizmoSurveyData.campaignId);
                sgizmoRestApi.getEmailMessages(
                  {
                    surveyId: sgizmoSurveyData.surveyId,
                    surveyCampaignId: sgizmoSurveyData.campaignId,
                  },
                  function (errGetEmail, getEmailMessagesResult) {
                    if (errGetEmail) {
                      callback(new Error(errGetEmail));
                      return;
                    }
                    debug(getEmailMessagesResult);
                    debug('[SurveyGizmo] About to fetch EmailMessage of Campaign %s…', sgizmoSurveyData.campaignId);
                    var sgizmoCampaignEmailMessages = getEmailMessagesResult.data;
                    var sgizmoCampaignEmailMessage = sgizmoCampaignEmailMessages[0];
                    sgizmoSurveyData.campaignEmailMessageId = sgizmoCampaignEmailMessage.id;
                    debug('[SurveyGizmo] Fetched EmailMessage %s…', sgizmoSurveyData.campaignEmailMessageId);
                    updateWebHooksUrl(sgizmoSurveyData.surveyId, sgizmoSurveyData, callback);
                  }
                );
              }
            );
          }
        );
      }
    );
  });
}

module.exports = {
  createSurveyGizmoSurvey: createSurveyGizmoSurvey,
  updateWebHooksUrl: updateWebHooksUrl,
};
