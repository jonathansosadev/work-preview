/*
 * Create or remove unsatisfied ticket if necessary
 */
const Scheduler = require('../../../garagescore/scheduler/scheduler.js');
const { JobTypes } = require('../../../../../frontend/utils/enumV2');
const GarageTypes = require('../../../../models/garage.type');
const { SurveyPageTypes } = require('../../../../../frontend/utils/enumV2');

const addTicket = async (self, data, garage, callback) => {
  try {
    await data.addUnsatisfiedTicket(garage, {});
    self.modelInstances.data = await data.save();
    callback();
  } catch (e) {
    callback(e);
  }
};

const removeTicket = async (self, data, callback) => {
  try {
    self.modelInstances.data = await data.unsatisfiedTicket_deleteTicket();
    await Scheduler.removeJob(JobTypes.ESCALATE, { dataId: data.getId().toString(), type: 'unsatisfied', stage: 1 });
  } catch (e) {
    console.error(e);
  }
  callback();
};

async function updateTicket(callback) {
  const self = this;
  const { data, garage } = self.modelInstances;
  const foreignResponses = data && data.survey && data.survey.foreignResponses || null;
  const surveyReviewPagePass = (foreignResponses && foreignResponses.slice().find(response =>
    response.payload && response.payload.currentPageName === SurveyPageTypes.REVIEW_PAGE)
  ) || null;
  const surveyIsComplete = (foreignResponses && foreignResponses.slice().reverse().find(response => response.payload && response.payload.isComplete)) || null;

  // final conditions
  const garageType = (garage && garage.type) || GarageTypes.DEALERSHIP;
  const viEnough = garageType === GarageTypes.VEHICLE_INSPECTION && (surveyReviewPagePass || surveyIsComplete);
  const isUnsat = data.review_isDetractor() || data.review_isSensitive(garage);
  const notVi = garageType !== GarageTypes.VEHICLE_INSPECTION;
  const shouldHaveATicket = isUnsat && (notVi || viEnough);
  const ticketAlreadyExists = data.get('unsatisfiedTicket') && data.get('unsatisfiedTicket.createdAt');

  if (shouldHaveATicket && ticketAlreadyExists) callback();
  else if (!shouldHaveATicket && !ticketAlreadyExists) callback();
  else if (shouldHaveATicket && !ticketAlreadyExists) await addTicket(self, data, garage, callback);
  else if (!shouldHaveATicket && ticketAlreadyExists) await removeTicket(self, data, callback);
}

module.exports = updateTicket;
