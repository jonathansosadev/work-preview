'use strict';

var config = require('config');
var debug = require('debug')('garagescore:common:lib:garagescore:campaign:surveygizmo'); // eslint-disable-line max-len,no-unused-vars
var sgizmoRestApi = require('../../surveygizmo/rest-api');
var updateWebHooksUrl = require('../../garagescore/campaign.js').updateWebHooksUrl;
var util = require('util');
var _ = require('underscore');

function createSurveyGizmoSurvey(sgizmoMasterSurveyId, sgizmoSurveyTitle, options, callback) {
  if (!sgizmoMasterSurveyId) {
    callback(new Error('Empty `sgizmoMasterSurveyId`'));
    return;
  }
  if (!sgizmoSurveyTitle) {
    callback(new Error('Empty `sgizmoSurveyTitle`'));
    return;
  }
  var sgizmoSurveyData = {};
  sgizmoSurveyData.masterSurveyId = sgizmoMasterSurveyId;
  sgizmoSurveyData.surveyTitle = sgizmoSurveyTitle;

  var sgizmoSurveyInternalTitle = sgizmoSurveyTitle;
  if (options && options.sgizmoSurveyInternalTitle) {
    sgizmoSurveyInternalTitle = options.sgizmoSurveyInternalTitle;
  }
  if (config.has('surveygizmo.survey.prefix') && config.get('surveygizmo.survey.prefix') !== false) {
    debug(
      util.format('Prefixing SurveyGizmo Survey Internal Title with "%s"', config.get('surveygizmo.survey.prefix'))
    );
    sgizmoSurveyInternalTitle = config.get('surveygizmo.survey.prefix') + ' ' + sgizmoSurveyInternalTitle;
  }
  sgizmoSurveyData.surveyInternalTitle = sgizmoSurveyInternalTitle;

  debug(
    util.format(
      'About to copy SurveyGizmo Master Survey (id:%s) into new SurveyGizmo Survey with (title:“%s”)…',
      sgizmoMasterSurveyId,
      sgizmoSurveyTitle
    )
  );

  sgizmoRestApi.copySurvey(
    sgizmoMasterSurveyId,
    {
      title: sgizmoSurveyTitle,
      options: { internal_title: sgizmoSurveyInternalTitle },
    },
    function (e, copySurveyResult) {
      if (e) {
        callback(new Error(e.message));
        return;
      }
      debug(util.format('copySurveyResult: %j', copySurveyResult));
      var sgizmoSurvey = copySurveyResult.data;
      var sgizmoSurveyId = sgizmoSurvey.id;
      debug(
        util.format(
          'Copied SurveyGizmo Master Survey (id:%s) into new SurveyGizmo Survey (id:%s).',
          sgizmoMasterSurveyId,
          sgizmoSurveyId
        )
      );
      sgizmoSurveyData.surveyId = sgizmoSurveyId;
      updateWebHooksUrl(sgizmoSurveyData.surveyId, sgizmoSurveyData, callback);
    }
  );
}

function deleteSurveyGizmoSurvey(sgizmoSurveyId, options, callback) {
  if (sgizmoSurveyId === null || sgizmoSurveyId === undefined) {
    callback(new Error('Empty `sgizmoSurveyId`'));
    return;
  }
  debug(util.format('About to delete SurveyGizmo Survey (id:%s)…', sgizmoSurveyId));
  sgizmoRestApi.deleteSurvey(sgizmoSurveyId, function (errDelete, deleteSurveyResult) {
    if (errDelete) {
      callback(errDelete);
      return;
    }
    debug(util.format('deleteSurveyResult: %j', deleteSurveyResult));
    debug(util.format('Deleted SurveyGizmo Survey (id:%s).', sgizmoSurveyId));
    callback(null, {});
  });
}

function createSurveyGizmoCampaign(sgizmoSurveyId, options, callback) {
  var sgizmoSurveyData = {};
  if (sgizmoSurveyId === null || sgizmoSurveyId === undefined) {
    callback(Error('Empty `sgizmoSurveyId`'));
    return;
  }
  debug('About to create SurveyGizmo Campaign for SirveyGizmo Survey (id:%s)…', sgizmoSurveyId);

  var sgizmoCampaignType;
  if (!_.isEmpty(options) && !_.isEmpty(options.sgizmoCampaignType)) {
    sgizmoCampaignType = options.sgizmoCampaignType;
  } else {
    sgizmoCampaignType = 'email';
  }

  var sgizmoCampaignName;
  if (!_.isEmpty(options) && !_.isEmpty(options.sgizmoCampaignName)) {
    sgizmoCampaignName = options.sgizmoCampaignName;
  } else {
    sgizmoCampaignName = util.format(
      'Campaign (%s) for SurveyGizmo Survey (id:%s)',
      sgizmoCampaignType,
      sgizmoSurveyId
    );
  }

  sgizmoRestApi.createSurveyCampaign(
    {
      type: sgizmoCampaignType,
      name: sgizmoCampaignName,
      language: 'Auto', // Survey will *apparently* adjust based on HTTP Accept-Language header
      subtype: 'private',
    },
    {
      surveyId: sgizmoSurveyId,
    },
    function (errCreateSurveyCampaign, createSurveyCampaignResult) {
      if (errCreateSurveyCampaign) {
        callback(errCreateSurveyCampaign);
        return;
      }
      debug(util.format('createSurveyCampaignResult: %j', createSurveyCampaignResult));

      var sgizmoCampaign = createSurveyCampaignResult.data;
      var sgizmoCampaignId = sgizmoCampaign.id;
      var sgizmoCampaignInviteId = sgizmoCampaign.inviteid;

      debug(
        'Created SurveyGizmo Campaign (id:%s) with Invite (id:%s) for SurveyGizmo Survey (id:%s).',
        sgizmoCampaignId,
        sgizmoCampaignInviteId,
        sgizmoSurveyId
      );

      sgizmoSurveyData.campaignId = sgizmoCampaignId;
      sgizmoSurveyData.campaignInviteId = sgizmoCampaignInviteId;

      // For some weird reason, the privatename option is not working for Campaign create,
      // but it is working for Campaign update.
      debug('About to update private link of SurveyGizmo Campaign (id:%s)…', sgizmoCampaignId);
      sgizmoRestApi.updateSurveyCampaign(
        sgizmoCampaignId,
        { privatename: 'survey.garagescore.com' },
        { surveyId: sgizmoSurveyId },
        function (errUpdate, updateSurveyCampaignResult) {
          if (errUpdate) {
            callback(errUpdate);
            return;
          }
          debug(util.format('updateSurveyCampaignResult: %j', updateSurveyCampaignResult));
          var updatedSgizmoCampaign = updateSurveyCampaignResult.data;
          debug('Updated private link of SurveyGizmo Campaign (id:%s).', sgizmoCampaignId);
          sgizmoSurveyData.campaignUri = updatedSgizmoCampaign.uri;
          sgizmoSurveyData.isCampaignSsl = updatedSgizmoCampaign.SSL === 'True';
          debug(
            util.format(
              'About to fetch SurveyGizmo EmailMessage of SurveyGizmo Survey (id:%s), SurveyGizmo Campaign (id:%s)…',
              sgizmoSurveyId,
              sgizmoCampaignId
            )
          );
          sgizmoRestApi.getEmailMessages({ surveyId: sgizmoSurveyId, surveyCampaignId: sgizmoCampaignId }, function (
            eEmail,
            getEmailMessagesResult
          ) {
            if (eEmail) {
              callback(eEmail);
              return;
            }
            debug(util.format('getEmailMessagesResult: %j', getEmailMessagesResult));
            var sgizmoCampaignEmailMessages = getEmailMessagesResult.data;
            var sgizmoCampaignEmailMessage = sgizmoCampaignEmailMessages[0];
            var sgizmoCampaignEmailMessageId = sgizmoCampaignEmailMessage.id;
            debug(
              util.format(
                'Fetched SurveyGizmo EmailMessage (id:%s) of SurveyGizmo Survey (id:%s), SurveyGizmo Campaign (id:%s)…',
                sgizmoCampaignEmailMessageId,
                sgizmoSurveyId,
                sgizmoCampaignId
              )
            );
            sgizmoSurveyData.campaignEmailMessageId = sgizmoCampaignEmailMessage.id;
            callback(null, sgizmoSurveyData);
          });
        }
      );
    }
  );
}

function createSurveyGizmoContactFromData(data, sgizmoSurveyId, sgizmoCampaignId, callback) {
  var sgizmoContact = {};
  sgizmoContact.semailaddress = data.get('customer.contact.email') || 'null@garagescore.com';

  var mobilePhone = data.get('customer.contact.mobilePhone.value');
  sgizmoContact.sbusinessphone = mobilePhone ? mobilePhone.replace('+33 ', '0') : '';

  debug('About to create SurveyGizmo Contact %j …', sgizmoContact);

  sgizmoRestApi.createContact(
    { semailaddress: sgizmoContact.semailaddress, sbusinessphone: sgizmoContact.sbusinessphone },
    { surveyId: sgizmoSurveyId, surveyCampaignId: sgizmoCampaignId },
    function (errCreateContact, createContactResult) {
      if (errCreateContact) {
        callback(errCreateContact);
        return;
      }
      debug(util.format('createContactResult: %j', createContactResult));
      if (typeof createContactResult === 'undefined' || typeof createContactResult.id === 'undefined') {
        callback(new Error('SurveyGizmo createContact returned no sguid'));
        return;
      }
      var sguid = createContactResult.id.toString();
      debug('Created SurveyGizmo Contact (sguid:%s)', sguid);
      callback(null, sguid);
    }
  );
}

function setSurveyGizmoContactCustomFields(sgizmoSurveyId, sgizmoCampaignId, sguid, customFields, callback) {
  if (sguid === null || sguid === undefined) {
    callback(Error('Empty `sguid`'));
    return;
  }
  if (!Array.isArray(customFields)) {
    callback(Error('`customFields` is not an array'));
    return;
  }
  if (customFields.length > 10) {
    callback(Error('`customFields` is too long'));
    return;
  }
  // [ 'hello', 'world' ] => { scustomfield1: 'hello', scustomfield2: 'world' }
  var sgizmoCustomFields = {};
  _.each(customFields, function (value, index) {
    if (value) {
      sgizmoCustomFields['scustomfield' + (index + 1).toString()] = value;
    }
  });

  /*
   * WARNING: SurveyGizmo caveat!
   * Apparently, updating just scustomfield2 erases scustomfield1.
   * So the whole extent of custom fields must be passed in each time.
   */
  debug('About to update SurveyGizmo Contact (sguid:%s) with custom fields %j …', sguid, sgizmoCustomFields);
  sgizmoRestApi.updateContact(
    sguid,
    sgizmoCustomFields,
    { surveyId: sgizmoSurveyId, surveyCampaignId: sgizmoCampaignId },
    function (errUpdate, updateContactResult) {
      if (errUpdate) {
        callback(errUpdate);
        return;
      }
      debug(util.format('updateContactResult: %j', updateContactResult));
      debug('Updated SurveyGizmo Contact (sguid:%s) with custom fields %j …', sguid, sgizmoCustomFields);
      callback();
    }
  );
}

// survey gizmo disabled
if (config.has('survey.disableGeneration') && config.get('survey.disableGeneration')) {
  var disabled = function () {
    debug('surveygizmo disabled ');

    var data = {};
    data.surveyId = -1;
    data = -1;
    data.sguid = -1;
    if (arguments.length > 0 && typeof arguments[arguments.length - 1] === 'function') {
      arguments[arguments.length - 1]();
    }
  };
  module.exports = {
    setSurveyGizmoContactCustomFields: disabled,
    createSurveyGizmoCampaign: disabled,
    createSurveyGizmoContactFromData: disabled,
    createSurveyGizmoSurvey: disabled,
    deleteSurveyGizmoSurvey: disabled,
  };
} else {
  module.exports = {
    setSurveyGizmoContactCustomFields: setSurveyGizmoContactCustomFields,
    createSurveyGizmoCampaign: createSurveyGizmoCampaign,
    createSurveyGizmoContactFromData: createSurveyGizmoContactFromData,
    createSurveyGizmoSurvey: createSurveyGizmoSurvey,
    deleteSurveyGizmoSurvey: deleteSurveyGizmoSurvey,
  };
}
