const reviewDetailedSubCriteria = require('../../../../../models/data/type/review-detailed-subcriterias.js');
const _common = require('../_common');
/*
 * Maintenance
 *
 * Update function list for the survey for maintenance
 */
module.exports = [
  _common.updateReviewRatingIntern,
  _common.updateReviewCommentIntern,
  _common.updateReviewRevisedDataIntern,
  _common.updateShareWithPartners,
  _common.updateSharedOnGoogleClicked,
  _common.updateSurveyProgressIntern,
  _common.updateMiddleMan,
  (foreignResponses, updates) => {
    // unsatisfiedSubcriteria
    let rawSubCriteria = [];
    rawSubCriteria = rawSubCriteria.concat(
      _common.getValueFromForeignResponses('unsatisfiedCriteria1', foreignResponses)
    );
    rawSubCriteria = rawSubCriteria.concat(
      _common.getValueFromForeignResponses('unsatisfiedCriteria2', foreignResponses)
    );
    rawSubCriteria = rawSubCriteria.concat(
      _common.getValueFromForeignResponses('unsatisfiedCriteria3', foreignResponses)
    );
    rawSubCriteria = rawSubCriteria.concat(
      _common.getValueFromForeignResponses('unsatisfiedCriteria4', foreignResponses)
    );
    rawSubCriteria = rawSubCriteria.concat(
      _common.getValueFromForeignResponses('unsatisfiedCriteria5', foreignResponses)
    );
    if (rawSubCriteria && rawSubCriteria.length) {
      const unsatisfactionReasons = {};
      rawSubCriteria.forEach((subCriterion) => {
        if (subCriterion) {
          const criteria = reviewDetailedSubCriteria.getParentCriteria(subCriterion);
          if (!unsatisfactionReasons[criteria]) {
            unsatisfactionReasons[criteria] = [];
          }
          unsatisfactionReasons[criteria].push(subCriterion);
        }
      });
      if (Object.keys(unsatisfactionReasons).length > 0) {
        updates.updateUnsatisfactionReasons(unsatisfactionReasons);
      }
    }
  },
  (foreignResponses, updates) => {
    // reviewLead
    updates.updateLead({
      type: _common.getValueFromForeignResponses('leadType', foreignResponses),
      timing: _common.getValueFromForeignResponses('leadTime', foreignResponses),
      saleType: _common.getValueFromForeignResponses('leadSaleType', foreignResponses),
      tradeIn: _common.getValueFromForeignResponses('leadTradeIn', foreignResponses),
      knowVehicle: _common.getValueFromForeignResponses('leadKnowVehicle', foreignResponses) === 'yes',
      vehicle: _common.getValueFromForeignResponses('leadVehicle', foreignResponses),
      energyType: _common.getValueFromForeignResponses('leadEnergyType', foreignResponses),
      brands: _common.getCarModels(foreignResponses),
      bodyType: _common.getValueFromForeignResponses('leadBodyType', foreignResponses),
      financing: _common.getValueFromForeignResponses('leadFunding', foreignResponses),
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
