const _jobAcronyms = ["APV", "VN", "VO", "VI"];
const _genericListGenerator = (prefix, value) => {
  // eslint-disable-line
  return _jobAcronyms.reduce((acc, job) => {
    acc[`${prefix}${job}`] = value; // eslint-disable-line
    return acc;
  }, {});
};

export default {
  garageHistory() {
    return {
      score: Number,
      countSurveysResponded: Number,
      countSurveyRespondedAll: Number,
      ..._genericListGenerator("score", Number),
      ..._genericListGenerator("countSurveyResponded", Number),
      countSurveyPromotor: Number,
      countSurveyUnsatisfied: Number,
      countSurveyDetractorsWithResponse: Number,
      countSurveyLead: Number,
      countSurveyLeadVn: Number,
      countSurveyLeadVo: Number,
      countSurveyLeadTrade: Number,
      countReceivedAndScheduledSurveys: Number,
      countContacts: Number,
      countNotContactable: Number,
      countValidEmails: Number,
      countBlockedByEmail: Number,

      countModifiedEmail: Number,
      countBlockedLastMonthEmail: Number,
      countUnsubscribedByEmail: Number,
      countWrongEmails: Number,
      countNotPresentEmails: Number,

      countValidPhones: Number,
      countModifiedPhone: Number,
      countBlockedLastMonthPhone: Number,
      countBlockedByPhone: Number,
      countUnsubscribedByPhone: Number,
      countWrongPhones: Number,
      countNotPresentPhones: Number,
      countSurveys: Number,
      countReceivedSurveys: Number,
      countBlocked: Number,

      countSurveysRespondedPercent: Number,
      countValidPhonesPercent: Number,
      countNotContactablePercent: Number,
      countPromotorsPercent: Number,
      countDetractorsPercent: Number,
      garagePublicDisplayName: String,
      garageSlug: String,
      hideDirectoryPage: Boolean,
      frontDesk: String,

      countEmails: Number,
      totalShouldSurfaceInCampaignStats: Number,
    };
  },

  garageHistories() {
    return {
      id: String,
      externalId: String,
      garagePublicDisplayName: String,
      garagePublicSearchName: String,
      garagePublicSubscriptions: {
        Maintenance: Number,
        Lead: Number,
        NewVehicleSale: Number,
        UsedVehicleSale: Number,
        EReputation: Number
      },
      hideDirectoryPage: Boolean,
      garageSlug: String,
      garageId: String,
      score: String,
      ..._genericListGenerator("score", String),
      scoreNPS: String,
      countSurveysResponded: Number,
      countSurveysRespondedPercent: Number,
      countSurveyDetractor: Number,
      countSurveyDetractorsWithResponse: Number,
      countSurveyPromotor: Number,
      countSurveyRecommand: Number,
      surveyRecommandPercent: Number,
      surveySatisfiedPercent: Number,
      surveyUnsatisfiedPercent: Number,
      surveyUncontactablePercent: Number,
      countReceivedAndScheduledSurveys: Number,
      countSurveyLead: Number,
      countConversionsVO: Number,
      countConversionsVN: Number,
      countConversions: Number,
      countSurveyRespondedAll: Number,
      countReceivedSurveys: Number,
      frontDesk: String
    };
  },
};
