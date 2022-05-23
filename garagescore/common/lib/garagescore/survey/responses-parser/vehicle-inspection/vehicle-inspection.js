const leadTypes = require('../../../../../../common/models/data/type/lead-types.js');
const vehicleEnergytypes = require('../../../../../models/data/type/vehicle-energytypes');
const _common = require('../_common');

//the aim is to have an array of energy Types
function getEnergyTypes(foreignResponses) {
  const energyType = _common.getValueFromForeignResponses('leadEnergyType', foreignResponses);
  if (energyType === null) return null;

  if (energyType.includes('_')) {
    return energyType.split('_');
  }

  return [energyType];
}

/**
 * Update function list for the survey for vehicle inspection
 */
module.exports = [
  _common.updateReviewRatingIntern,
  _common.updateReviewCommentIntern,
  _common.updateReviewRevisedDataIntern,
  _common.updateShareWithPartners,
  _common.updateSharedOnGoogleClicked,
  _common.updateSurveyProgressIntern,
  (foreignResponses, updates) => {
    const middleMans = _common.getValueFromForeignResponses('serviceMiddleMan', foreignResponses);
    updates.updateMiddleMan(middleMans);
  },
  (foreignResponses, updates) => {
    const unsatisfiedCriteria = _common.getValueFromForeignResponses('unsatisfiedCriteria', foreignResponses);
    if (unsatisfiedCriteria && unsatisfiedCriteria.length) {
      const insatisfactionReasons = {};
      unsatisfiedCriteria.forEach((reason) => {
        insatisfactionReasons[reason] = [reason];
      });
      if (Object.keys(insatisfactionReasons).length > 0) {
        updates.updateUnsatisfactionReasons(insatisfactionReasons);
      }
    }
  },
  (foreignResponses, updates) => {
    // acceptTermOfSharing : if true => the user wants a new vehicle AND accepts to share the lead
    const acceptTermOfSharing = _common.getValueFromForeignBooleanResponses('acceptTermOfSharing', foreignResponses);
    let type = acceptTermOfSharing === true ? leadTypes.INTERESTED : leadTypes.NOT_INTERESTED;

    updates.updateLead({
      type,
      acceptTermOfSharing,
      timing: _common.getValueFromForeignResponses('leadTime', foreignResponses),
      saleType: _common.getValueFromForeignResponses('leadSaleType', foreignResponses),
      tradeIn: _common.getValueFromForeignResponses('leadTradeIn', foreignResponses),
      testDrive: _common.getValueFromForeignResponses('testDrive', foreignResponses),
      energyType: getEnergyTypes(foreignResponses),
      brands: _common.getCarModelsFromSurveyVI(foreignResponses),
      financing: _common.getValueFromForeignResponses('leadFunding', foreignResponses),
      leadFundingQuestionCashBudgetVn: _common.getValueFromForeignResponses(
        'leadFundingQuestionCashBudgetVn',
        foreignResponses
      ),
      leadFundingQuestionCashBudgetVo: _common.getValueFromForeignResponses(
        'leadFundingQuestionCashBudgetVo',
        foreignResponses
      ),
      leadFundingQuestionCreditBudget: _common.getValueFromForeignResponses(
        'leadFundingQuestionCreditBudget',
        foreignResponses
      ),
      leadDesiredServices: _common.getValueFromForeignResponses('leadDesiredServices', foreignResponses),
      leadSaleCategories: _common.getValueFromForeignResponses('leadSaleCategories', foreignResponses),
    });
  },
  (foreignResponses, updates) => {
    // reviewServiceCategories
    const cats = _common.getValueFromForeignResponses('serviceCategories', foreignResponses);
    if (cats && cats.length > 0) {
      updates.updateCategories(cats);
    }
  },
];
