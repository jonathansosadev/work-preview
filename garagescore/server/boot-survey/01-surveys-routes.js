/** ONLINE surveys (replace surveygizmo) */
const debugPerfs = require('debug')('perfs:server:boot:www-surveys');
const {
  render,
  renderMobileLandingPage,
  renderUnsatisfiedLandingPage,
} = require('../../common/lib/garagescore/survey/survey-renderer');
const { decrypt } = require('../../common/lib/garagescore/survey/survey-id-encryption');
const responsesQueue = require('../../common/lib/garagescore/survey/responses-queue');
const urls = require('../../common/lib/garagescore/urls');
const tracking = require('../../common/lib/garagescore/tracking');
const SurveyTypes = require('../../common/models/data/type/survey-types.js');

debugPerfs('Starting boot www-surveys');

module.exports = function mountWWWSurveys(app) {
  // online survey: unsatisfied landing page with only the rating
  app.get(`${urls.getUrlNamespace('SURVEY').UNSATISFIED_LANDING}/:protectedId`, async (req, res) => {
    try {
      const protectedId = req.params.protectedId;
      const decrypted = decrypt(protectedId);
      const data = await app.models.Data.findById(decrypted.dataId);
      const garage = await app.models.Garage.findById(data.garageId);
      if (!data.get('survey.acceptNewResponses')) {
        res.status(404).send('Désolé, vous ne pouvez plus accéder à cette enquête.');
        return;
      }

      if (data.get('survey.progress.isComplete')) {
        const surveyType =
          decrypted.surveyType === SurveyTypes.SURVEY ? data.getSurveyInProgress() : decrypted.surveyType;
        res.send(render(protectedId, surveyType, data, garage));
      } else {
        res.send(renderUnsatisfiedLandingPage(protectedId, data, garage));
      }
    } catch (e) {
      res.status(404).send('Désolé, vous ne pouvez pas accéder à cette enquête.');
    }
  });
  // online survey: mobile landing page with only the rating
  app.get(`${urls.getUrlNamespace('SURVEY').MOBILE_LANDING_PAGE}/:protectedId`, async (req, res) => {
    try {
      const protectedId = req.params.protectedId;
      const decrypted = decrypt(protectedId);
      const data = await app.models.Data.findById(decrypted.dataId);
      const garage = await app.models.Garage.findById(data.garageId);
      if (!data.get('survey.acceptNewResponses')) {
        res.status(404).send('Désolé, vous ne pouvez plus accéder à cette enquête.');
        return;
      }
      res.send(renderMobileLandingPage(protectedId, data, garage));
    } catch (e) {
      res.status(404).send('Désolé, vous ne pouvez pas accéder à cette enquête.');
    }
  });
  // online survey: online form
  app.get(`${urls.getUrlNamespace('SURVEY').GARAGE}/:protectedId`, async (req, res) => {
    try {
      const protectedId = req.params.protectedId;
      const decrypted = decrypt(protectedId);
      const data = await app.models.Data.findById(decrypted.dataId);
      /**
       * TO BE RETRO-COMPATIBLE, we need data.getSurveyInProgress() when we don't have the surveyType in the URL !
       * KEEP THIS UNTIL 01/09/2019, then -> we should trust 'decrypted.surveyType' only and remove getSurveyInProgress
       */
      const surveyType =
        decrypted.surveyType === SurveyTypes.SURVEY ? data.getSurveyInProgress() : decrypted.surveyType;
      const garage = await app.models.Garage.findById(data.garageId);
      if (!data.getSurveyInProgress()) {
        res.status(404).send('Désolé, vous ne pouvez plus accéder à cette enquête.');
        return;
      }
      res.send(render(protectedId, surveyType, data, garage));
    } catch (e) {
      res.status(404).send('Désolé, vous ne pouvez pas accéder à cette enquête.');
    }
  });
  // online surveys: save results
  // reponses:
  // -1: problem during save
  // 1: save ok
  app.post(`${urls.getUrlNamespace('SURVEY').GARAGE}/save/:protectedId`, async (req, res) => {
    const protectedId = req.params.protectedId;
    const userIp = tracking.ip(req) || 'unknown';
    const userFingerPrint = tracking.fingerPrint(req) || 'unknown';
    const userAgent = req.get('user-agent');
    try {
      await responsesQueue.add(protectedId, req.body, userIp, userFingerPrint, userAgent);
      res.status(200).send('1');
    } catch (e) {
      console.error(e);
      res.status(404).send('-1');
    }
  });
};
