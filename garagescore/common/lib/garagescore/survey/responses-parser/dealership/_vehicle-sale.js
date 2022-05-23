const reviewDetailedSubCriteria = require('../../../../../models/data/type/review-detailed-subcriterias.js');
const _common = require('../_common');
/*
 * Sale
 */

/**
 * Update function list for the survey for vehicle sale
 */
module.exports = [
  _common.updateReviewRatingIntern,
  _common.updateReviewCommentIntern,
  _common.updateReviewRevisedDataIntern,
  _common.updateShareWithPartners,
  _common.updateSharedOnGoogleClicked,
  _common.updateSurveyProgressIntern,
  _common.updateMiddleMan,
  (foreignResponses, updates, dataType) => {
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
    rawSubCriteria = rawSubCriteria.concat(
      _common.getValueFromForeignResponses('unsatisfiedCriteria6', foreignResponses)
    );
    if (rawSubCriteria && rawSubCriteria.length) {
      const unsatisfactionReasons = {};
      rawSubCriteria.forEach((rawSubCriterion) => {
        const subCriterion = reviewDetailedSubCriteria.distinctSaleTypeSubCriteria(rawSubCriterion, dataType);
        if (!subCriterion) return;
        const criteria = reviewDetailedSubCriteria.getParentCriteria(subCriterion);
        if (!unsatisfactionReasons[criteria]) {
          unsatisfactionReasons[criteria] = [];
        }
        unsatisfactionReasons[criteria].push(subCriterion);
      });
      if (Object.keys(unsatisfactionReasons).length > 0) {
        updates.updateUnsatisfactionReasons(unsatisfactionReasons);
      }
    }
  },
];
