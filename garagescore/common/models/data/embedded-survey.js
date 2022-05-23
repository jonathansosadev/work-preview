const { newUpdaterObject, fillUpdatesSurvey } = require('../../lib/garagescore/survey/survey-updates');
const DataTypes = require('../../../common/models/data/type/data-types');

/**
 * A survey
 */

const model = () => ({
  properties: {
    /* when the survey was sent
    // loopback doesnt understand and thinks type == string, we comment it, for now, but the type is always here
    /** Is the survey still open */
    acceptNewResponses: {
      type: 'boolean',
      default: true,
      required: true,
    },

    /* when the survey was sent, the code doesnt seem to work...
    sendAt: {
      type: 'date'
    }, */
    /* last time we received a survey response */
    lastRespondedAt: {
      type: 'date',
    },
    /* first time we received a survey response */
    firstRespondedAt: {
      type: 'date',
    },
    /* list of received responses */
    foreignResponses: {
      type: 'array',
    },
    /* sgizmo data */
    surveygizmo: {
      type: 'object',
    },
    /** Progression */
    progress: {
      isComplete: {
        type: 'boolean',
        default: false,
        required: true,
      },
    },
    /* urls */
    urls: {
      base: { type: 'string' },
      score: { type: 'array' },
      baseShort: { type: 'string' },
    },
    /** User tracking: ip */
    lastRespondentIP: {
      type: 'string',
    },
    /** User tracking: browser fingerprint */
    lastRespondentFingerPrint: {
      type: 'string',
    },
  },
});
// updating a survey means also potentially updating a lot fields and other instances (publicScore)
// use this method to prepare an update and then run() it
const prepareUpdates = function prepareUpdates(surveyType) {
  return newUpdaterObject(this.app(), this, surveyType);
};

// parse the foreign responses list and update the data
// if needed, run also the cascading updates (score update)
const parseForeignResponses = function parseForeignResponses(surveyType, callback) {
  try {
    const isComplete = this.get(`${surveyType}.progress.isComplete`);
    if (!isComplete) {
      const updates = fillUpdatesSurvey(surveyType, this);
      updates.run(callback);
    } else {
      callback();
    }
  } catch (e) {
    console.error('Error during parsing of');
    console.error(this.get('garageType') || DataTypes.DEALERSHIP);
    console.error(this.getId());
    console.error(e);
    callback();
  }
};

const _addForeignResponses = function addForeignResponses(data, surveyType, foreignResponse, callback) {
  let foreignResponses = data.get(`${surveyType}.foreignResponses`);
  if (!foreignResponses) {
    foreignResponses = [];
  }
  foreignResponses.push(foreignResponse);
  data.set(`${surveyType}.foreignResponses`, foreignResponses);
  data.save(callback);
};
// add a new foreignResponse to the survey
const addSurveyGizmoForeignResponse = function addSurveyGizmoForeignResponse(surveyType, foreignResponse, callback) {
  if (!surveyType) {
    callback();
    return;
  }
  _addForeignResponses(this, surveyType, foreignResponse, (createForeignResponsesErr, updatedData) => {
    if (createForeignResponsesErr) {
      console.error(createForeignResponsesErr);
      callback(createForeignResponsesErr);
      return;
    }
    parseForeignResponses.bind(updatedData)(surveyType, callback);
  });
};

// save respondent ip and fingerprint
const saveUserTracking = function saveUserTracking(surveyType, userIp, userFingerPrint, cb) {
  const shouldSave =
    this.get(`${surveyType}.lastRespondentIP`) !== userIp ||
    this.get(`${surveyType}.lastRespondentFingerPrint`) !== userFingerPrint;
  if (shouldSave) {
    this.set(`${surveyType}.lastRespondentIP`, userIp);
    this.set(`${surveyType}.lastRespondentFingerPrint`, userFingerPrint);
    this.save(cb);
  } else {
    cb();
  }
};

const prototypeMethods = {
  prepareUpdates,
  addSurveyGizmoForeignResponse,
  saveUserTracking,
  parseForeignResponses,
};
module.exports = { model, prototypeMethods };
