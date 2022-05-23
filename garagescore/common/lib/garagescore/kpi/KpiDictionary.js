const DataTypes = require('../../../models/data/type/data-types');
const { JS, log } = require('../../util/log');

const showErrors = process.env.NODE_ENV !== 'production';

//
// DICTIONARY - KEEP IT SIMPLE GUYS
//
class KpiDictionary {
  constructor() {
    this._$keys = {
      // Global Keys (0 - 9), You should add it to _dontEraseZero ! DON'T forget it
      garageId: 0, // (ADDED TO _dontEraseZero)
      userId: 1, // (ADDED TO _dontEraseZero)
      kpiType: 2, // (cf. common/models/kpi-type.js) (ADDED TO _dontEraseZero)
      garageType: 3, // common/models/garage.type.js => getIntegerVersion() (ADDED TO _dontEraseZero)
      period: 4, // Examples: ALL_HISTORY: 0 | YEAR: 2019 | QUARTER: 2019[1-4] | MONTH: 201903 (ADDED TO _dontEraseZero)
      // isDirty: 5,  deleted
      sourceType: 6, // (source.type) ADDED TO _dontEraseZero, this is IMPORTANT for the fields that are by default in the kpis
      automationCampaignId: 7, // (ADDED TO _dontEraseZero)

      //--------------------------------------------------------------------------------------//
      //                                Leads (1 000 - 1 xxx)                                 //
      //--------------------------------------------------------------------------------------//

      countLeads: 1001,
      countLeadsUnassigned: 1002,
      countLeadsAssigned: 1003,
      countLeadsUntouched: 1011,
      countLeadsUntouchedOpen: 1012,
      countLeadsTouched: 1014,
      countLeadsTouchedOpen: 1015,
      countLeadsTouchedClosed: 1016,
      countLeadsReactive: 1018,
      countLeadsWaitingForContact: 1021,
      countLeadsContactPlanned: 1022,
      countLeadsWaitingForMeeting: 1023,
      countLeadsMeetingPlanned: 1024,
      countLeadsWaitingForProposition: 1025,
      countLeadsPropositionPlanned: 1026,
      countLeadsWaitingForClosing: 1027,
      countLeadsClosedWithoutSale: 1030,
      countLeadsClosedWithSale: 1031,
      countLeadsClosedWithSaleWasInterested: 1032,
      countLeadsClosedWithSaleWasInContactWithVendor: 1033,
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness: 1034,
      // (projets d'achat welcome)
      countLeadsPotentialSales: 1041,

      // Leads APV
      countLeadsApv: 1101,
      countLeadsUnassignedApv: 1102,
      countLeadsAssignedApv: 1103,
      countLeadsUntouchedApv: 1111,
      countLeadsUntouchedOpenApv: 1112,
      countLeadsTouchedApv: 1114,
      countLeadsTouchedOpenApv: 1115,
      countLeadsTouchedClosedApv: 1116,
      countLeadsReactiveApv: 1118,
      countLeadsWaitingForContactApv: 1121,
      countLeadsContactPlannedApv: 1122,
      countLeadsWaitingForMeetingApv: 1123,
      countLeadsMeetingPlannedApv: 1124,
      countLeadsWaitingForPropositionApv: 1125,
      countLeadsPropositionPlannedApv: 1126,
      countLeadsWaitingForClosingApv: 1127,
      countLeadsClosedWithoutSaleApv: 1130,
      countLeadsClosedWithSaleApv: 1131,
      countLeadsClosedWithSaleWasInterestedApv: 1132,
      countLeadsClosedWithSaleWasInContactWithVendorApv: 1133,
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv: 1134,
      // (projets d'achat welcome)
      countLeadsPotentialSalesApv: 1141,
      // Leads Vn
      countLeadsVn: 1201,
      countLeadsUnassignedVn: 1202,
      countLeadsAssignedVn: 1203,
      countLeadsUntouchedVn: 1211,
      countLeadsUntouchedOpenVn: 1212,
      countLeadsTouchedVn: 1214,
      countLeadsTouchedOpenVn: 1215,
      countLeadsTouchedClosedVn: 1216,
      countLeadsReactiveVn: 1218,
      countLeadsWaitingForContactVn: 1221,
      countLeadsContactPlannedVn: 1222,
      countLeadsWaitingForMeetingVn: 1223,
      countLeadsMeetingPlannedVn: 1224,
      countLeadsWaitingForPropositionVn: 1225,
      countLeadsPropositionPlannedVn: 1226,
      countLeadsWaitingForClosingVn: 1227,
      countLeadsClosedWithoutSaleVn: 1230,
      countLeadsClosedWithSaleVn: 1231,
      countLeadsClosedWithSaleWasInterestedVn: 1232,
      countLeadsClosedWithSaleWasInContactWithVendorVn: 1233,
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn: 1234,
      // (projets d'achat welcome)
      countLeadsPotentialSalesVn: 1241,
      // Leads Vo
      countLeadsVo: 1301,
      countLeadsUnassignedVo: 1302,
      countLeadsAssignedVo: 1303,
      countLeadsUntouchedVo: 1311,
      countLeadsUntouchedOpenVo: 1312,
      countLeadsTouchedVo: 1314,
      countLeadsTouchedOpenVo: 1315,
      countLeadsTouchedClosedVo: 1316,
      countLeadsReactiveVo: 1318,
      countLeadsWaitingForContactVo: 1321,
      countLeadsContactPlannedVo: 1322,
      countLeadsWaitingForMeetingVo: 1323,
      countLeadsMeetingPlannedVo: 1324,
      countLeadsWaitingForPropositionVo: 1325,
      countLeadsPropositionPlannedVo: 1326,
      countLeadsWaitingForClosingVo: 1327,
      countLeadsClosedWithoutSaleVo: 1330,
      countLeadsClosedWithSaleVo: 1331,
      countLeadsClosedWithSaleWasInterestedVo: 1332,
      countLeadsClosedWithSaleWasInContactWithVendorVo: 1333,
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo: 1334,
      // (projets d'achat welcome)
      countLeadsPotentialSalesVo: 1341,

      // Leads Vn/Vo (Unknown)
      countLeadsUnknown: 1401,
      countLeadsUnassignedUnknown: 1402,
      countLeadsAssignedUnknown: 1403,
      countLeadsUntouchedUnknown: 1411,
      countLeadsUntouchedOpenUnknown: 1412,
      countLeadsTouchedUnknown: 1414,
      countLeadsTouchedOpenUnknown: 1415,
      countLeadsTouchedClosedUnknown: 1416,
      countLeadsReactiveUnknown: 1418,
      countLeadsWaitingForContactUnknown: 1421,
      countLeadsContactPlannedUnknown: 1422,
      countLeadsWaitingForMeetingUnknown: 1423,
      countLeadsMeetingPlannedUnknown: 1424,
      countLeadsWaitingForPropositionUnknown: 1425,
      countLeadsPropositionPlannedUnknown: 1426,
      countLeadsWaitingForClosingUnknown: 1427,
      countLeadsClosedWithoutSaleUnknown: 1430,
      countLeadsClosedWithSaleUnknown: 1431,
      countLeadsClosedWithSaleWasInterestedUnknown: 1432,
      countLeadsClosedWithSaleWasInContactWithVendorUnknown: 1433,
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown: 1434,
      // (projets d'achat welcome)
      countLeadsPotentialSalesUnknown: 1441,

      // Conversions (2xxx)
      countConvertedLeads: 2010,
      countConvertedLeadsNewProjects: 2011,
      countConvertedLeadsKnownProjects: 2012,
      countConvertedLeadsWonFromCompetition: 2013,
      countConvertedTradeIns: 2020,
      countConvertedTradeInsNewProjects: 2021,
      countConvertedTradeInsKnownProjects: 2022,
      countConvertedTradeInsWonFromCompetition: 2023,
      countConvertedLeadsVo: 2210,
      countConvertedLeadsNewProjectsVo: 2211,
      countConvertedLeadsKnownProjectsVo: 2212,
      countConvertedLeadsWonFromCompetitionVo: 2213,
      countConvertedTradeInsVo: 2220,
      countConvertedTradeInsNewProjectsVo: 2221,
      countConvertedTradeInsKnownProjectsVo: 2222,
      countConvertedTradeInsWonFromCompetitionVo: 2223,
      countConvertedLeadsVn: 2310,
      countConvertedLeadsNewProjectsVn: 2311,
      countConvertedLeadsKnownProjectsVn: 2312,
      countConvertedLeadsWonFromCompetitionVn: 2313,
      countConvertedTradeInsVn: 2320,
      countConvertedTradeInsNewProjectsVn: 2321,
      countConvertedTradeInsKnownProjectsVn: 2322,
      countConvertedTradeInsWonFromCompetitionVn: 2323,
      countConvertedLeadsClosed: 2324,

      //--------------------------------------------------------------------------------------//
      //                                 Satisfaction (3xxx)                                  //
      //--------------------------------------------------------------------------------------//

      satisfactionCountSurveys: 3000,
      satisfactionCountReviews: 3001,
      satisfactionCountPromoters: 3002,
      satisfactionCountDetractors: 3003,
      satisfactionCountPassives: 3004,
      satisfactionCountDetractorsWithoutResponse: 3006,
      satisfactionSumRating: 3007,
      satisfactionCountServiceMiddleManAlreadyCustomer: 3010,
      satisfactionCountServiceMiddleManFactoryWebsite: 3011,
      satisfactionCountServiceMiddleManGarageWebsite: 3012,
      satisfactionCountServiceMiddleManLeboncoinWebsite: 3013,
      satisfactionCountServiceMiddleManLacentraleWebsite: 3014,
      satisfactionCountServiceMiddleManAdvertingWebsite: 3015,
      satisfactionCountServiceMiddleManDiscountCommunication: 3016,
      satisfactionCountServiceMiddleManProximity: 3017,
      satisfactionCountServiceMiddleManThirdPartyRecommendation: 3018,
      satisfactionCountServiceMiddleManSocialNetworks: 3019,
      satisfactionCountServiceCategoryMaintenance1: 3020,
      satisfactionCountServiceCategoryMaintenance2: 3021,
      satisfactionCountServiceCategoryMaintenance3: 3022,
      satisfactionCountServiceCategoryMaintenance4: 3023,
      satisfactionCountServiceCategoryMaintenance5: 3024,
      satisfactionCountServiceCategoryMaintenance6: 3025,
      satisfactionCountServiceCategoryMaintenance7: 3026,
      satisfactionCountServiceCategoryMaintenance8: 3027,

      // Apv
      satisfactionCountSurveysApv: 3100,
      satisfactionCountReviewsApv: 3101,
      satisfactionCountPromotersApv: 3102,
      satisfactionCountDetractorsApv: 3103,
      satisfactionCountPassivesApv: 3104,
      satisfactionCountDetractorsWithoutResponseApv: 3106,
      satisfactionSumRatingApv: 3107,
      satisfactionCountServiceMiddleManAlreadyCustomerApv: 3110,
      satisfactionCountServiceMiddleManFactoryWebsiteApv: 3111,
      satisfactionCountServiceMiddleManGarageWebsiteApv: 3112,
      satisfactionCountServiceMiddleManLeboncoinWebsiteApv: 3113,
      satisfactionCountServiceMiddleManLacentraleWebsiteApv: 3114,
      satisfactionCountServiceMiddleManAdvertingWebsiteApv: 3115,
      satisfactionCountServiceMiddleManDiscountCommunicationApv: 3116,
      satisfactionCountServiceMiddleManProximityApv: 3117,
      satisfactionCountServiceMiddleManThirdPartyRecommendationApv: 3118,
      satisfactionCountServiceMiddleManSocialNetworksApv: 3119,
      satisfactionCountServiceCategoryMaintenance1Apv: 3120,
      satisfactionCountServiceCategoryMaintenance2Apv: 3121,
      satisfactionCountServiceCategoryMaintenance3Apv: 3122,
      satisfactionCountServiceCategoryMaintenance4Apv: 3123,
      satisfactionCountServiceCategoryMaintenance5Apv: 3124,
      satisfactionCountServiceCategoryMaintenance6Apv: 3125,
      satisfactionCountServiceCategoryMaintenance7Apv: 3126,
      satisfactionCountServiceCategoryMaintenance8Apv: 3127,

      // Vn
      satisfactionCountSurveysVn: 3200,
      satisfactionCountReviewsVn: 3201,
      satisfactionCountPromotersVn: 3202,
      satisfactionCountDetractorsVn: 3203,
      satisfactionCountPassivesVn: 3204,
      satisfactionCountDetractorsWithoutResponseVn: 3206,
      satisfactionSumRatingVn: 3207,
      satisfactionCountServiceMiddleManAlreadyCustomerVn: 3210,
      satisfactionCountServiceMiddleManFactoryWebsiteVn: 3211,
      satisfactionCountServiceMiddleManGarageWebsiteVn: 3212,
      satisfactionCountServiceMiddleManLeboncoinWebsiteVn: 3213,
      satisfactionCountServiceMiddleManLacentraleWebsiteVn: 3214,
      satisfactionCountServiceMiddleManAdvertingWebsiteVn: 3215,
      satisfactionCountServiceMiddleManDiscountCommunicationVn: 3216,
      satisfactionCountServiceMiddleManProximityVn: 3217,
      satisfactionCountServiceMiddleManThirdPartyRecommendationVn: 3218,
      satisfactionCountServiceMiddleManSocialNetworksVn: 3219,
      satisfactionCountServiceCategoryMaintenance1Vn: 3220,
      satisfactionCountServiceCategoryMaintenance2Vn: 3221,
      satisfactionCountServiceCategoryMaintenance3Vn: 3222,
      satisfactionCountServiceCategoryMaintenance4Vn: 3223,
      satisfactionCountServiceCategoryMaintenance5Vn: 3224,
      satisfactionCountServiceCategoryMaintenance6Vn: 3225,
      satisfactionCountServiceCategoryMaintenance7Vn: 3226,
      satisfactionCountServiceCategoryMaintenance8Vn: 3227,

      // Vo
      satisfactionCountSurveysVo: 3300,
      satisfactionCountReviewsVo: 3301,
      satisfactionCountPromotersVo: 3302,
      satisfactionCountDetractorsVo: 3303,
      satisfactionCountPassivesVo: 3304,
      satisfactionCountDetractorsWithoutResponseVo: 3306,
      satisfactionSumRatingVo: 3307,
      satisfactionCountServiceMiddleManAlreadyCustomerVo: 3310,
      satisfactionCountServiceMiddleManFactoryWebsiteVo: 3311,
      satisfactionCountServiceMiddleManGarageWebsiteVo: 3312,
      satisfactionCountServiceMiddleManLeboncoinWebsiteVo: 3313,
      satisfactionCountServiceMiddleManLacentraleWebsiteVo: 3314,
      satisfactionCountServiceMiddleManAdvertingWebsiteVo: 3315,
      satisfactionCountServiceMiddleManDiscountCommunicationVo: 3316,
      satisfactionCountServiceMiddleManProximityVo: 3317,
      satisfactionCountServiceMiddleManThirdPartyRecommendationVo: 3318,
      satisfactionCountServiceMiddleManSocialNetworksVo: 3319,
      satisfactionCountServiceCategoryMaintenance1Vo: 3320,
      satisfactionCountServiceCategoryMaintenance2Vo: 3321,
      satisfactionCountServiceCategoryMaintenance3Vo: 3322,
      satisfactionCountServiceCategoryMaintenance4Vo: 3323,
      satisfactionCountServiceCategoryMaintenance5Vo: 3324,
      satisfactionCountServiceCategoryMaintenance6Vo: 3325,
      satisfactionCountServiceCategoryMaintenance7Vo: 3326,
      satisfactionCountServiceCategoryMaintenance8Vo: 3327,

      //--------------------------------------------------------------------------------------//
      //                                   Contacts (4xxx)                                    //
      //--------------------------------------------------------------------------------------//

      contactsCountReceivedSurveys: 4000,
      contactsCountSurveysResponded: 4001,
      contactsCountValidEmails: 4002,
      contactsCountValidPhones: 4003,
      contactsCountNotContactable: 4004,
      contactsCountTotalShouldSurfaceInCampaignStats: 4005,
      contactsCountScheduledContacts: 4006,
      contactsCountBlockedLastMonthEmail: 4007,
      contactsCountUnsubscribedByEmail: 4008,
      contactsCountBlockedByPhone: 4009,
      contactsCountBlockedByEmail: 4010,
      contactsCountWrongEmails: 4011,
      contactsCountNotPresentEmails: 4012,
      contactsCountWrongPhones: 4013,
      contactsCountNotPresentPhones: 4014,

      //Apv
      contactsCountReceivedSurveysApv: 4100,
      contactsCountSurveysRespondedApv: 4101,
      contactsCountValidEmailsApv: 4102,
      contactsCountValidPhonesApv: 4103,
      contactsCountNotContactableApv: 4104,
      contactsCountTotalShouldSurfaceInCampaignStatsApv: 4105,
      contactsCountScheduledContactsApv: 4106,
      contactsCountBlockedLastMonthEmailApv: 4107,
      contactsCountUnsubscribedByEmailApv: 4108,
      contactsCountBlockedByPhoneApv: 4109,
      contactsCountBlockedByEmailApv: 4110,
      contactsCountWrongEmailsApv: 4111,
      contactsCountNotPresentEmailsApv: 4112,
      contactsCountWrongPhonesApv: 4113,
      contactsCountNotPresentPhonesApv: 4114,

      //Vn
      contactsCountReceivedSurveysVn: 4200,
      contactsCountSurveysRespondedVn: 4201,
      contactsCountValidEmailsVn: 4202,
      contactsCountValidPhonesVn: 4203,
      contactsCountNotContactableVn: 4204,
      contactsCountTotalShouldSurfaceInCampaignStatsVn: 4205,
      contactsCountScheduledContactsVn: 4206,
      contactsCountBlockedLastMonthEmailVn: 4207,
      contactsCountUnsubscribedByEmailVn: 4208,
      contactsCountBlockedByPhoneVn: 4209,
      contactsCountBlockedByEmailVn: 4210,
      contactsCountWrongEmailsVn: 4211,
      contactsCountNotPresentEmailsVn: 4212,
      contactsCountWrongPhonesVn: 4213,
      contactsCountNotPresentPhonesVn: 4214,

      //Vo
      contactsCountReceivedSurveysVo: 4300,
      contactsCountSurveysRespondedVo: 4301,
      contactsCountValidEmailsVo: 4302,
      contactsCountValidPhonesVo: 4303,
      contactsCountNotContactableVo: 4304,
      contactsCountTotalShouldSurfaceInCampaignStatsVo: 4305,
      contactsCountScheduledContactsVo: 4306,
      contactsCountBlockedLastMonthEmailVo: 4307,
      contactsCountUnsubscribedByEmailVo: 4308,
      contactsCountBlockedByPhoneVo: 4309,
      contactsCountBlockedByEmailVo: 4310,
      contactsCountWrongEmailsVo: 4311,
      contactsCountNotPresentEmailsVo: 4312,
      contactsCountWrongPhonesVo: 4313,
      contactsCountNotPresentPhonesVo: 4314,

      //--------------------------------------------------------------------------------------//
      //                                 Unsatisfied (1xxxx)                                  //
      //--------------------------------------------------------------------------------------//

      countUnsatisfied: 10001,
      countUnsatisfiedOpenUnassigned: 10002,
      countUnsatisfiedAllAssignedWithoutAction: 10003,
      countUnsatisfiedWaitingForContact: 10004,
      countUnsatisfiedContactPlanned: 10005,
      countUnsatisfiedWaitingForVisit: 10006,
      countUnsatisfiedVisitPlanned: 10007,
      countUnsatisfiedWaitingForClosing: 10008,
      countUnsatisfiedClosedWithoutResolution: 10009,
      countUnsatisfiedClosedWithResolution: 10010,
      countUnsatisfiedAssigned: 10011,
      countUnsatisfiedAllUnassigned: 10012,
      countUnsatisfiedAllAlreadyContacted: 10013,
      countUnsatisfiedUntouched: 10014,
      countUnsatisfiedUntouchedOpen: 10015,
      countUnsatisfiedTouched: 10017,
      countUnsatisfiedTouchedOpen: 10018,
      countUnsatisfiedTouchedClosed: 10019,
      countUnsatisfiedReactive: 10020,
      countUnsatisfiedFollowupResponded: 10021,
      countUnsatisfiedFollowupRecontacted: 10022,
      // Unsatisfied APV
      countUnsatisfiedApv: 10101,
      countUnsatisfiedOpenUnassignedApv: 10102,
      countUnsatisfiedAllAssignedWithoutActionApv: 10103,
      countUnsatisfiedWaitingForContactApv: 10104,
      countUnsatisfiedContactPlannedApv: 10105,
      countUnsatisfiedWaitingForVisitApv: 10106,
      countUnsatisfiedVisitPlannedApv: 10107,
      countUnsatisfiedWaitingForClosingApv: 10108,
      countUnsatisfiedClosedWithoutResolutionApv: 10109,
      countUnsatisfiedClosedWithResolutionApv: 10110,
      countUnsatisfiedAssignedApv: 10111,
      countUnsatisfiedAllUnassignedApv: 10112,
      countUnsatisfiedAllAlreadyContactedApv: 10113,
      countUnsatisfiedUntouchedApv: 10114,
      countUnsatisfiedUntouchedOpenApv: 10115,
      countUnsatisfiedTouchedApv: 10117,
      countUnsatisfiedTouchedOpenApv: 10118,
      countUnsatisfiedTouchedClosedApv: 10119,
      countUnsatisfiedReactiveApv: 10120,
      countUnsatisfiedFollowupRespondedApv: 10121,
      countUnsatisfiedFollowupRecontactedApv: 10122,
      // Unsatisfied VO
      countUnsatisfiedVo: 10201,
      countUnsatisfiedOpenUnassignedVo: 10202,
      countUnsatisfiedAllAssignedWithoutActionVo: 10203,
      countUnsatisfiedWaitingForContactVo: 10204,
      countUnsatisfiedContactPlannedVo: 10205,
      countUnsatisfiedWaitingForVisitVo: 10206,
      countUnsatisfiedVisitPlannedVo: 10207,
      countUnsatisfiedWaitingForClosingVo: 10208,
      countUnsatisfiedClosedWithoutResolutionVo: 10209,
      countUnsatisfiedClosedWithResolutionVo: 10210,
      countUnsatisfiedAssignedVo: 10211,
      countUnsatisfiedAllUnassignedVo: 10212,
      countUnsatisfiedAllAlreadyContactedVo: 10213,
      countUnsatisfiedUntouchedVo: 10214,
      countUnsatisfiedUntouchedOpenVo: 10215,
      countUnsatisfiedTouchedVo: 10217,
      countUnsatisfiedTouchedOpenVo: 10218,
      countUnsatisfiedTouchedClosedVo: 10219,
      countUnsatisfiedReactiveVo: 10220,
      countUnsatisfiedFollowupRespondedVo: 10221,
      countUnsatisfiedFollowupRecontactedVo: 10222,
      // Unsatisfied VN
      countUnsatisfiedVn: 10301,
      countUnsatisfiedOpenUnassignedVn: 10302,
      countUnsatisfiedAllAssignedWithoutActionVn: 10303,
      countUnsatisfiedWaitingForContactVn: 10304,
      countUnsatisfiedContactPlannedVn: 10305,
      countUnsatisfiedWaitingForVisitVn: 10306,
      countUnsatisfiedVisitPlannedVn: 10307,
      countUnsatisfiedWaitingForClosingVn: 10308,
      countUnsatisfiedClosedWithoutResolutionVn: 10309,
      countUnsatisfiedClosedWithResolutionVn: 10310,
      countUnsatisfiedAssignedVn: 10311,
      countUnsatisfiedAllUnassignedVn: 10312,
      countUnsatisfiedAllAlreadyContactedVn: 10313,
      countUnsatisfiedUntouchedVn: 10314,
      countUnsatisfiedUntouchedOpenVn: 10315,
      countUnsatisfiedTouchedVn: 10317,
      countUnsatisfiedTouchedOpenVn: 10318,
      countUnsatisfiedTouchedClosedVn: 10319,
      countUnsatisfiedReactiveVn: 10320,
      countUnsatisfiedFollowupRespondedVn: 10321,
      countUnsatisfiedFollowupRecontactedVn: 10322,

      //--------------------------------------------------------------------------------------//
      //                                   Ereputation (2xxxx)                                //
      //--------------------------------------------------------------------------------------//

      erepCountReviews: 20001,
      erepCountHasRating: 20002,
      erepCountHasRecommendation: 20003,
      erepSumRating: 20004,
      erepCountPromoters: 20005,
      erepCountDetractors: 20006,
      erepCountPassives: 20007,
      erepCountRecommend: 20008,
      erepCountDetractorsWithoutResponse: 20009,

      erepCountReviewsGoogle: 20011,
      erepCountHasRatingGoogle: 20012,
      erepSumRatingGoogle: 20013,
      erepCountPromotersGoogle: 20015,
      erepCountDetractorsGoogle: 20016,
      erepCountDetractorsWithoutResponseGoogle: 20019,

      erepCountReviewsFacebook: 20021,
      erepCountHasRecommendationFacebook: 20023,
      erepCountPromotersFacebook: 20025,
      erepCountDetractorsFacebook: 20026,
      erepCountRecommendFacebook: 20028,
      erepCountDetractorsWithoutResponseFacebook: 20029,

      erepCountReviewsPagesJaunes: 20031,
      erepCountHasRatingPagesJaunes: 20032,
      erepSumRatingPagesJaunes: 20033,
      erepCountPromotersPagesJaunes: 20035,
      erepCountDetractorsPagesJaunes: 20036,
      erepCountDetractorsWithoutResponsePagesJaunes: 20039,

      //--------------------------------------------------------------------------------------//
      //                                   Automation (3xxxx)                                 //
      //--------------------------------------------------------------------------------------//

      KPI_automationCountTargetedSales: 30001,
      KPI_automationCountTargetedMaintenances: 30002,
      KPI_automationCountSentSales: 30003,
      KPI_automationCountSentMaintenances: 30004,
      KPI_automationCountOpenedSales: 30005,
      KPI_automationCountOpenedMaintenances: 30006,
      KPI_automationCountConvertedSales: 30007,
      KPI_automationCountConvertedMaintenances: 30008,
      KPI_automationCountCrossedSales: 30009,
      KPI_automationCountCrossedMaintenances: 30010,
      KPI_automationCountLeadSales: 30011,
      KPI_automationCountLeadMaintenances: 30012,
    };
    this._checkDictionaryIntegrity();
  }

  _checkDictionaryIntegrity() {
    const values = [];

    for (const key of Object.keys(this.keys)) {
      if (values.includes(this.keys[key])) {
        if (showErrors) {
          log.error(JS, `The property "${key}" is using an already used value in KpiDictionary`);
        }
        throw new Error(`The property "${key}" is using an already used value in KpiDictionary`);
      } else if (typeof this.keys[key] !== 'number') {
        if (showErrors) {
          log.error(JS, `The property "${key}" does not have a numerical value`);
        }
        throw new Error(`The property "${key}" does not have a numerical value`);
      }
      values.push(this.keys[key]);
    }
  }

  accumulativeKeysByDataType(dataType) {
    /**
     * Filters the kpi keys by the given dataType
     * Giving no dataType (or wrong one) returns the global keys
     */
    return this.accumulativeKeys.filter((k) => {
      if (dataType === DataTypes.MAINTENANCE) {
        return /Apv$/.test(k);
      }
      if (dataType === DataTypes.NEW_VEHICLE_SALE) {
        return /Vn$/.test(k);
      }
      if (dataType === DataTypes.USED_VEHICLE_SALE) {
        return /Vo$/.test(k);
      }
      return !/(Apv|Vn|Vo)$/.test(k);
    });
  }

  get keys() {
    return this._$keys;
  }

  get keyTypes() {
    return Object.keys(this._$keys).reduce((acc, key) => {
      acc[key] = key.includes('Id') ? String : Number; // eslint-disable-line
      return acc;
    }, {});
  }

  get keysAsArray() {
    return Object.keys(this._$keys);
  }

  get nonAccumulativeKeys() {
    return this.keysAsArray.filter((k) => !k.includes('count'));
  }

  get accumulativeKeys() {
    return this.keysAsArray.filter(
      (k) =>
        // ALL KEYS THAT ARE NOT IN _dontEraseZero SHOULD BE ACCUMULATIVE !!!
        // rating is for keys sumRating and hasRating
        k.toLowerCase().includes('count') || k.toLowerCase().includes('rating')
    );
  }

  get conversionKeys() {
    return this.keysAsArray.filter((k) => k.includes('Converted') && !k.includes('automation'));
  }

  get notConversionKeys() {
    return this.keysAsArray.filter((k) => k.includes('count') && !k.includes('Converted'));
  }
}

//
// THEN WE PROXY IT TO MAKE IT TRANSPARENT
//
const KpiDictionaryProxy = new Proxy(new KpiDictionary(), {
  get(obj, prop) {
    if (prop === 'keys') {
      return obj.keys;
    }
    if (!(prop in obj.keys) && !(prop in obj)) {
      if (showErrors) {
        log.error(JS, `The property "${prop}" does not exist in KpiDictionary`);
      }
    }
    return obj[prop] || obj.keys[prop];
  },
  set() {
    if (showErrors) {
      log.error(JS, 'You cannot change the KpiDictionary programmatically');
    }
    throw new Error('You cannot change the KpiDictionary programmatically');
  },
  enumerate(obj) {
    return [...Object.keys(obj.keys), '__esModule'];
  },
  ownKeys(obj) {
    return [...Object.keys(obj.keys), '__esModule'];
  },
  getOwnPropertyDescriptor(obj, prop) {
    if (prop in obj.keys) {
      return {
        value: obj.keys[prop],
        writable: false,
        configurable: true,
        enumerable: true,
      };
    }
    return { value: true, writable: false, enumerable: false, configurable: false };
  },
});

module.exports = exports = KpiDictionaryProxy;

Object.defineProperty(exports, '__esModule', { value: true });
