//@ts-check

/* GLOBAL */

const logError = (msg = 'Error occured') => {
  console.error('\x1b[31m', `[ERROR] : ${msg}`, '\x1b[0m');
};

const logInfo = (msg = '') => {
  console.log('\x1b[33m', `[INFO] : ${msg}`, '\x1b[0m');
};

/**
 * Generate percent formula
 * @param {string} num
 * @param {string} den
 * @returns {object} percent computation
 */
const $pct = (num, den) => ({ $multiply: [100, { $cond: [{ $ne: [den, 0] }, { $divide: [num, den] }, 0] }] });

/**
 * Generate sum formula
 * @param {string[]} fields
 * @returns {object} sum computation
 */
const $sum = (...fields) => {
  return {
    $sum: [
      fields.map((field) => {
        return { $ifNull: [field, 0] };
      }),
    ],
  };
};

const percentComputation = {
  //--------------------------------------------------------------------------------------//
  //                                        Leads                                         //
  //--------------------------------------------------------------------------------------//

  countLeadsUntouchedPercent: $pct('$countLeadsUntouched', '$countLeads'),
  countLeadsTouchedPercent: $pct('$countLeadsTouched', '$countLeads'),
  countLeadsClosedWithSalePercent: $pct('$countLeadsClosedWithSale', '$countLeads'),
  countConvertedLeadsPercent: $pct('$countConvertedLeads', '$countLeads'),
  countLeadsReactivePercent: $pct('$countLeadsReactive', '$countLeads'),

  /* Apv */
  countLeadsUntouchedPercentApv: $pct('$countLeadsUntouchedApv', '$countLeadsApv'),
  countLeadsTouchedPercentApv: $pct('$countLeadsTouchedApv', '$countLeadsApv'),
  countLeadsClosedWithSalePercentApv: $pct('$countLeadsClosedWithSaleApv', '$countLeadsApv'),
  countConvertedLeadsPercentApv: $pct('$countConvertedLeadsApv', '$countLeadsApv'),
  countLeadsReactivePercentApv: $pct('$countLeadsReactiveApv', '$countLeadsApv'),

  /* Vn */
  countLeadsUntouchedPercentVn: $pct('$countLeadsUntouchedVn', '$countLeadsVn'),
  countLeadsTouchedPercentVn: $pct('$countLeadsTouchedVn', '$countLeadsVn'),
  countLeadsClosedWithSalePercentVn: $pct('$countLeadsClosedWithSaleVn', '$countLeadsVn'),
  countConvertedLeadsPercentVn: $pct('$countConvertedLeadsVn', '$countLeadsVn'),
  countLeadsReactivePercentVn: $pct('$countLeadsReactiveVn', '$countLeadsVn'),

  /* Vo */
  countLeadsUntouchedPercentVo: $pct('$countLeadsUntouchedVo', '$countLeadsVo'),
  countLeadsTouchedPercentVo: $pct('$countLeadsTouchedVo', '$countLeadsVo'),
  countLeadsClosedWithSalePercentVo: $pct('$countLeadsClosedWithSaleVo', '$countLeadsVo'),
  countConvertedLeadsPercentVo: $pct('$countConvertedLeadsVo', '$countLeadsVo'),
  countLeadsReactivePercentVo: $pct('$countLeadsReactiveVo', '$countLeadsVo'),

  /* Vn/Vo (Unknown) */
  countLeadsUntouchedPercentUnknown: $pct('$countLeadsUntouchedUnknown', '$countLeadsUnknown'),
  countLeadsTouchedPercentUnknown: $pct('$countLeadsTouchedUnknown', '$countLeadsUnknown'),
  countLeadsClosedWithSalePercentUnknown: $pct('$countLeadsClosedWithSaleUnknown', '$countLeadsUnknown'),
  countConvertedLeadsPercentUnknown: $pct('$countConvertedLeadsUnknown', '$countLeadsUnknown'),
  countLeadsReactivePercentUnknown: $pct('$countLeadsReactiveUnknown', '$countLeadsUnknown'),

  //--------------------------------------------------------------------------------------//
  //                                     Satisfaction                                     //
  //--------------------------------------------------------------------------------------//
  satisfactionCountReviewsPercent: $pct('$satisfactionCountReviews', '$satisfactionCountSurveys'),
  satisfactionCountPromotersPercent: $pct('$satisfactionCountPromoters', '$satisfactionCountReviews'),
  satisfactionCountDetractorsPercent: $pct('$satisfactionCountDetractors', '$satisfactionCountReviews'),

  /* Apv */
  satisfactionCountReviewsPercentApv: $pct('$satisfactionCountReviewsApv', '$satisfactionCountSurveysApv'),
  satisfactionCountPromotersPercentApv: $pct('$satisfactionCountPromotersApv', '$satisfactionCountReviewsApv'),
  satisfactionCountDetractorsPercentApv: $pct('$satisfactionCountDetractorsApv', '$satisfactionCountReviewsApv'),

  /* Vn */
  satisfactionCountReviewsPercentVn: $pct('$satisfactionCountReviewsVn', '$satisfactionCountSurveysVn'),
  satisfactionCountPromotersPercentVn: $pct('$satisfactionCountPromotersVn', '$satisfactionCountReviewsVn'),
  satisfactionCountDetractorsPercentVn: $pct('$satisfactionCountDetractorsVn', '$satisfactionCountReviewsVn'),

  /* Vo */
  satisfactionCountReviewsPercentVo: $pct('$satisfactionCountReviewsVo', '$satisfactionCountSurveysVo'),
  satisfactionCountPromotersPercentVo: $pct('$satisfactionCountPromotersVo', '$satisfactionCountReviewsVo'),
  satisfactionCountDetractorsPercentVo: $pct('$satisfactionCountDetractorsVo', '$satisfactionCountReviewsVo'),

  //--------------------------------------------------------------------------------------//
  //                                       Contacts                                       //
  //--------------------------------------------------------------------------------------//
  respondentsPercent: $pct(
    '$contactsCountSurveysResponded',
    $sum('$contactsCountReceivedSurveys', '$contactsCountScheduledContacts')
  ),
  validEmailsPercent: $pct(
    $sum('$contactsCountValidEmails', '$contactsCountBlockedByEmail'),
    $sum(
      '$contactsCountValidEmails',
      '$contactsCountBlockedByEmail',
      '$contactsCountWrongEmails',
      '$contactsCountNotPresentEmails'
    )
  ),
  validPhonesPercent: $pct(
    $sum('$contactsCountValidPhones', '$contactsCountBlockedByPhone'),
    $sum(
      '$contactsCountValidPhones',
      '$contactsCountBlockedByPhone',
      '$contactsCountWrongPhones',
      '$contactsCountNotPresentPhones'
    )
  ),
  unreachablesPercent: $pct('$contactsCountNotContactable', '$contactsCountTotalShouldSurfaceInCampaignStats'),

  /* Apv */
  respondentsPercentApv: $pct(
    '$contactsCountSurveysRespondedApv',
    $sum('$contactsCountReceivedSurveysApv', '$contactsCountScheduledContactsApv')
  ),
  validEmailsPercentApv: $pct(
    $sum('$contactsCountValidEmailsApv', '$contactsCountBlockedByEmailApv'),
    $sum(
      '$contactsCountValidEmailsApv',
      '$contactsCountBlockedByEmailApv',
      '$contactsCountWrongEmailsApv',
      '$contactsCountNotPresentEmailsApv'
    )
  ),
  validPhonesPercentApv: $pct(
    $sum('$contactsCountValidPhonesApv', '$contactsCountBlockedByPhoneApv'),
    $sum(
      '$contactsCountValidPhonesApv',
      '$contactsCountBlockedByPhoneApv',
      '$contactsCountWrongPhonesApv',
      '$contactsCountNotPresentPhonesApv'
    )
  ),
  unreachablesPercentApv: $pct('$contactsCountNotContactableApv', '$contactsCountTotalShouldSurfaceInCampaignStatsApv'),

  /* Vn */
  respondentsPercentVn: $pct(
    '$contactsCountSurveysRespondedVn',
    $sum('$contactsCountReceivedSurveysVn', '$contactsCountScheduledContactsVn')
  ),
  validEmailsPercentVn: $pct(
    $sum('$contactsCountValidEmailsVn', '$contactsCountBlockedByEmailVn'),
    $sum(
      '$contactsCountValidEmailsVn',
      '$contactsCountBlockedByEmailVn',
      '$contactsCountWrongEmailsVn',
      '$contactsCountNotPresentEmailsVn'
    )
  ),
  validPhonesPercentVn: $pct(
    $sum('$contactsCountValidPhonesVn', '$contactsCountBlockedByPhoneVn'),
    $sum(
      '$contactsCountValidPhonesVn',
      '$contactsCountBlockedByPhoneVn',
      '$contactsCountWrongPhonesVn',
      '$contactsCountNotPresentPhonesVn'
    )
  ),
  unreachablesPercentVn: $pct('$contactsCountNotContactableVn', '$contactsCountTotalShouldSurfaceInCampaignStatsVn'),
  /* Vo */
  respondentsPercentVo: $pct(
    '$contactsCountSurveysRespondedVo',
    $sum('$contactsCountReceivedSurveysVo', '$contactsCountScheduledContactsVo')
  ),
  validEmailsPercentVo: $pct(
    $sum('$contactsCountValidEmailsVo', '$contactsCountBlockedByEmailVo'),
    $sum(
      '$contactsCountValidEmailsVo',
      '$contactsCountBlockedByEmailVo',
      '$contactsCountWrongEmailsVo',
      '$contactsCountNotPresentEmailsVo'
    )
  ),
  validPhonesPercentVo: $pct(
    $sum('$contactsCountValidPhonesVo', '$contactsCountBlockedByPhoneVo'),
    $sum(
      '$contactsCountValidPhonesVo',
      '$contactsCountBlockedByPhoneVo',
      '$contactsCountWrongPhonesVo',
      '$contactsCountNotPresentPhonesVo'
    )
  ),
  unreachablesPercentVo: $pct('$contactsCountNotContactableVo', '$contactsCountTotalShouldSurfaceInCampaignStatsVo'),
  //--------------------------------------------------------------------------------------//
  //                                       Unsatisfied                                    //
  //--------------------------------------------------------------------------------------//

  countUnsatisfiedUntouchedPercent: $pct('$countUnsatisfiedUntouched', '$countUnsatisfied'),
  countUnsatisfiedTouchedPercent: $pct('$countUnsatisfiedTouched', '$countUnsatisfied'),
  countUnsatisfiedClosedWithResolutionPercent: $pct('$countUnsatisfiedClosedWithResolution', '$countUnsatisfied'),
  countUnsatisfiedReactivePercent: $pct('$countUnsatisfiedReactive', '$countUnsatisfied'),

  /* Apv */
  countUnsatisfiedUntouchedPercentApv: $pct('$countUnsatisfiedUntouchedApv', '$countUnsatisfiedApv'),
  countUnsatisfiedTouchedPercentApv: $pct('$countUnsatisfiedTouchedApv', '$countUnsatisfiedApv'),
  countUnsatisfiedClosedWithResolutionPercentApv: $pct(
    '$countUnsatisfiedClosedWithResolutionApv',
    '$countUnsatisfiedApv'
  ),
  countUnsatisfiedReactivePercentApv: $pct('$countUnsatisfiedReactiveApv', '$countUnsatisfiedApv'),

  /* Vn */
  countUnsatisfiedUntouchedPercentVn: $pct('$countUnsatisfiedUntouchedVn', '$countUnsatisfiedVn'),
  countUnsatisfiedTouchedPercentVn: $pct('$countUnsatisfiedTouchedVn', '$countUnsatisfiedVn'),
  countUnsatisfiedClosedWithResolutionPercentVn: $pct('$countUnsatisfiedClosedWithResolutionVn', '$countUnsatisfiedVn'),
  countUnsatisfiedReactivePercentVn: $pct('$countUnsatisfiedReactiveVn', '$countUnsatisfiedVn'),

  /* Vo */
  countUnsatisfiedUntouchedPercentVo: $pct('$countUnsatisfiedUntouchedVo', '$countUnsatisfiedVo'),
  countUnsatisfiedTouchedPercentVo: $pct('$countUnsatisfiedTouchedVo', '$countUnsatisfiedVo'),
  countUnsatisfiedClosedWithResolutionPercentVo: $pct('$countUnsatisfiedClosedWithResolutionVo', '$countUnsatisfiedVo'),
  countUnsatisfiedReactivePercentVo: $pct('$countUnsatisfiedReactiveVo', '$countUnsatisfiedVo'),

  //--------------------------------------------------------------------------------------//
  //                                     Ereputation                                      //
  //--------------------------------------------------------------------------------------//

  erepCountRecommendPercent: $pct('$erepCountRecommend', '$erepCountReviews'),
  erepCountPromotersPercent: $pct('$erepCountPromoters', '$erepCountReviews'),
  erepCountPassivesPercent: $pct('$erepCountPassives', '$erepCountReviews'),
  erepCountDetractorsPercent: $pct('$erepCountDetractors', '$erepCountReviews'),

  /* Apv */
  erepCountRecommendPercentApv: $pct('$erepCountRecommendApv', '$erepCountReviewsApv'),
  erepCountPromotersPercentApv: $pct('$erepCountPromotersApv', '$erepCountReviewsApv'),
  erepCountPassivesPercentApv: $pct('$erepCountPassivesApv', '$erepCountReviewsApv'),
  erepCountDetractorsPercentApv: $pct('$erepCountDetractorsApv', '$erepCountReviewsApv'),
  /* Vn */
  erepCountRecommendPercentVn: $pct('$erepCountRecommendVn', '$erepCountReviewsVn'),
  erepCountPromotersPercentVn: $pct('$erepCountPromotersVn', '$erepCountReviewsVn'),
  erepCountPassivesPercentVn: $pct('$erepCountPassivesVn', '$erepCountReviewsVn'),
  erepCountDetractorsPercentVn: $pct('$erepCountDetractorsVn', '$erepCountReviewsVn'),
  /* Vo */
  erepCountRecommendPercentVo: $pct('$erepCountRecommendVo', '$erepCountReviewsVo'),
  erepCountPromotersPercentVo: $pct('$erepCountPromotersVo', '$erepCountReviewsVo'),
  erepCountPassivesPercentVo: $pct('$erepCountPassivesVo', '$erepCountReviewsVo'),
  erepCountDetractorsPercentVo: $pct('$erepCountDetractorsVo', '$erepCountReviewsVo'),
};

/**
 * Unify the computation of percent keys
 * @param {string[]} requestedKeys
 * @returns {object}
 */
module.exports = function computePercentKeys(requestedKeys) {
  /* step1 - on récupère toute les clés en array */
  const percentComputationKeys = Object.keys(percentComputation);
  const result = {};
  for (const keyName of requestedKeys) {
    /* step 2 checks if all the requested keys are in percentComputation */
    if (!percentComputationKeys.includes(keyName)) {
      logError(`requestedKey ${keyName} does not exists yet in percentComputation`);
      logInfo(`Skipping ${keyName} ...`);
      continue;
    }

    /* add it to result */
    result[keyName] = percentComputation[keyName];
  }

  return { ...result };
};
