// noinspection GraphQLUnresolvedReference

import gql from 'graphql-tag';

// TODO cleanup when all scope was analyse
const KPI_BY_PERIOD_SINGLE_KPI = gql`
  query kpiByPeriodGetSingle(
    $periodId: String!
    $garageId: [String]
    $type: String
    $cockpitType: String!
    $frontDesk: String
  ) {
    kpiByPeriodSingle: kpiByPeriodGetSingle(
      periodId: $periodId
      garageIds: $garageId
      type: $type
      cockpitType: $cockpitType
      frontDesk: $frontDesk
    ) {
      totalShouldSurfaceInCampaignStats
      countEmails
      countSurveys
      countReceivedSurveys
      countSurveysResponded
      countSurveySatisfied
      countSurveyUnsatisfied
      countSurveyLead
      countSurveyLeadVo
      countSurveyLeadVn
      countLeads
      countLeadsApv
      countLeadsVn
      countLeadsVo
      countLeadsUnknown
      countValidEmails
      countBlockedByEmail
      countBlockedLastMonthEmail
      countUnsubscribedByEmail
      countWrongEmails
      countNotPresentEmails
      countValidPhones
      countBlockedByPhone
      countWrongPhones
      countNotPresentPhones
      countBlocked
      countNotContactable
      countSurveyRespondedAPV
      countSurveyRespondedVN
      countSurveyRespondedVO
      countScheduledContacts
    }
  }
`;

const KPI_BY_PERIOD_GET_SINGLE_AND_EREP_KPI = gql`
  query kpiByPeriodGetSingleAndErep(
    $periodId: String!
    $garageId: [String]
    $cockpitType: String!
  ) {
    kpiByPeriodSingle: kpiByPeriodGetSingle(
      periodId: $periodId
      garageIds: $garageId
      cockpitType: $cockpitType
    ) {
      countSurveysResponded
    }

    erepKpis: ErepKpis(
      period: $periodId
      garageId: $garageId
      cockpitType: $cockpitType
    ) {
      source
      rating
      countReviews
      countRecommend
      countDetractorsWithoutResponse
      countDetractors
    }
  }
`;

const WELCOME_GET_KPIS = gql`
  query welcome_get_kpis(
    $periodId: String!
    $garageId: [String]
    $type: String
    $cockpitType: String!
  ) {
    kpiByPeriodSingle: kpiByPeriodGetSingle(
      periodId: $periodId
      garageIds: $garageId
      type: $type
      cockpitType: $cockpitType
    ) {
      totalShouldSurfaceInCampaignStats
      countEmails
      countSurveys
      countReceivedSurveys
      countSurveysResponded
      countSurveySatisfied
      countSurveyUnsatisfied
      countSurveyLead
      countSurveyLeadVo
      countSurveyLeadVn
      countLeads
      countLeadsApv
      countLeadsVn
      countLeadsVo
      countLeadsUnknown
      countValidEmails
      countBlockedByEmail
      countBlockedLastMonthEmail
      countUnsubscribedByEmail
      countWrongEmails
      countNotPresentEmails
      countValidPhones
      countBlockedByPhone
      countWrongPhones
      countNotPresentPhones
      countBlocked
      countNotContactable
      countSurveyRespondedAPV
      countSurveyRespondedVN
      countSurveyRespondedVO
      countScheduledContacts
    }

    erepKpis: ErepKpis(
      period: $periodId
      garageId: $garageId
      cockpitType: $cockpitType
    ) {
      source
      rating
      countReviews
      countRecommend
      countDetractorsWithoutResponse
      countDetractors
    }

    garagesConversions: kpiByPeriodGetGaragesConversions(
      cockpitType: $cockpitType
      garageIds: $garageId
    ) {
      countConvertedLeadsPct
      countConversionsTradeInsPct
      countConversionsVO
      countConversionsVN
      countConversionsLeads
      countConversionsTradeins
      countLeads
    }

    garagesSolvedUnsatisfied: kpiByPeriodGetSolvedUnsatisfied(
      garageIds: $garageId
      cockpitType: $cockpitType
    ) {
      countUnsatisfied
      countSolvedAPVUnsatisfied
      countSolvedVNUnsatisfied
      countSolvedVOUnsatisfied
    }
  }
`;

// TODO cleanup when all scope was analyse
const garagesKpiFragment = gql`
  fragment garagesKpi on kpiByPeriodGetKpiKpi {
    garagesKpi {
      # Unsatisfied ( garage - team )
      countUnsatisfiedTouched
      countUnsatisfied
      countUnsatisfiedClosedWithResolution
      countUnsatisfiedUntouched


      countLeads
      countLeadsUnassigned
      countLeadsAssigned
      countLeadsUntouched
      countLeadsUntouchedOpen
      countLeadsTouched
      countLeadsTouchedOpen
      countLeadsTouchedClosed
      countLeadsReactive
      countLeadsWaitingForContact
      countLeadsContactPlanned
      countLeadsWaitingForMeeting
      countLeadsMeetingPlanned
      countLeadsWaitingForProposition
      countLeadsPropositionPlanned
      countLeadsWaitingForClosing
      countLeadsClosedWithoutSale
      countLeadsClosedWithSale
      countLeadsClosedWithSaleWasInterested
      countLeadsClosedWithSaleWasInContactWithVendor
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness
      countLeadsApv
      countLeadsUnassignedApv
      countLeadsAssignedApv
      countLeadsUntouchedApv
      countLeadsUntouchedOpenApv
      countLeadsTouchedApv
      countLeadsTouchedOpenApv
      countLeadsTouchedClosedApv
      countLeadsReactiveApv
      countLeadsWaitingForContactApv
      countLeadsContactPlannedApv
      countLeadsWaitingForMeetingApv
      countLeadsMeetingPlannedApv
      countLeadsWaitingForPropositionApv
      countLeadsPropositionPlannedApv
      countLeadsWaitingForClosingApv
      countLeadsClosedWithoutSaleApv
      countLeadsClosedWithSaleApv
      countLeadsClosedWithSaleWasInterestedApv
      countLeadsClosedWithSaleWasInContactWithVendorApv
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv
      countLeadsVn
      countLeadsUnassignedVn
      countLeadsAssignedVn
      countLeadsUntouchedVn
      countLeadsUntouchedOpenVn
      countLeadsTouchedVn
      countLeadsTouchedOpenVn
      countLeadsTouchedClosedVn
      countLeadsReactiveVn
      countLeadsWaitingForContactVn
      countLeadsContactPlannedVn
      countLeadsWaitingForMeetingVn
      countLeadsMeetingPlannedVn
      countLeadsWaitingForPropositionVn
      countLeadsPropositionPlannedVn
      countLeadsWaitingForClosingVn
      countLeadsClosedWithoutSaleVn
      countLeadsClosedWithSaleVn
      countLeadsClosedWithSaleWasInterestedVn
      countLeadsClosedWithSaleWasInContactWithVendorVn
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn
      countLeadsVo
      countLeadsUnassignedVo
      countLeadsAssignedVo
      countLeadsUntouchedVo
      countLeadsUntouchedOpenVo
      countLeadsTouchedVo
      countLeadsTouchedOpenVo
      countLeadsTouchedClosedVo
      countLeadsReactiveVo
      countLeadsWaitingForContactVo
      countLeadsContactPlannedVo
      countLeadsWaitingForMeetingVo
      countLeadsMeetingPlannedVo
      countLeadsWaitingForPropositionVo
      countLeadsPropositionPlannedVo
      countLeadsWaitingForClosingVo
      countLeadsClosedWithoutSaleVo
      countLeadsClosedWithSaleVo
      countLeadsClosedWithSaleWasInterestedVo
      countLeadsClosedWithSaleWasInContactWithVendorVo
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo
      countLeadsUnknown
      countLeadsUnassignedUnknown
      countLeadsAssignedUnknown
      countLeadsUntouchedUnknown
      countLeadsUntouchedOpenUnknown
      countLeadsTouchedUnknown
      countLeadsTouchedOpenUnknown
      countLeadsTouchedClosedUnknown
      countLeadsReactiveUnknown
      countLeadsWaitingForContactUnknown
      countLeadsContactPlannedUnknown
      countLeadsWaitingForMeetingUnknown
      countLeadsMeetingPlannedUnknown
      countLeadsWaitingForPropositionUnknown
      countLeadsPropositionPlannedUnknown
      countLeadsWaitingForClosingUnknown
      countLeadsClosedWithoutSaleUnknown
      countLeadsClosedWithSaleUnknown
      countLeadsClosedWithSaleWasInterestedUnknown
      countLeadsClosedWithSaleWasInContactWithVendorUnknown
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown
      countUnsatisfied
      countUnsatisfiedAssigned
      countUnsatisfiedOpenUnassigned
      countUnsatisfiedWaitingForContact
      countUnsatisfiedContactPlanned
      countUnsatisfiedWaitingForVisit
      countUnsatisfiedVisitPlanned
      countUnsatisfiedWaitingForClosing
      countUnsatisfiedClosedWithoutResolution
      countUnsatisfiedClosedWithResolution
      countUnsatisfiedUntouched
      countUnsatisfiedUntouchedOpen
      countUnsatisfiedTouched
      countUnsatisfiedTouchedOpen
      countUnsatisfiedTouchedClosed
      countUnsatisfiedReactive
      countUnsatisfiedApv
      countUnsatisfiedAssignedApv
      countUnsatisfiedOpenUnassignedApv
      countUnsatisfiedWaitingForContactApv
      countUnsatisfiedContactPlannedApv
      countUnsatisfiedWaitingForVisitApv
      countUnsatisfiedVisitPlannedApv
      countUnsatisfiedWaitingForClosingApv
      countUnsatisfiedClosedWithoutResolutionApv
      countUnsatisfiedClosedWithResolutionApv
      countUnsatisfiedUntouchedApv
      countUnsatisfiedUntouchedOpenApv
      countUnsatisfiedTouchedApv
      countUnsatisfiedTouchedOpenApv
      countUnsatisfiedTouchedClosedApv
      countUnsatisfiedReactiveApv
      countUnsatisfiedVo
      countUnsatisfiedAssignedVo
      countUnsatisfiedOpenUnassignedVo
      countUnsatisfiedWaitingForContactVo
      countUnsatisfiedContactPlannedVo
      countUnsatisfiedWaitingForVisitVo
      countUnsatisfiedVisitPlannedVo
      countUnsatisfiedWaitingForClosingVo
      countUnsatisfiedClosedWithoutResolutionVo
      countUnsatisfiedClosedWithResolutionVo
      countUnsatisfiedUntouchedVo
      countUnsatisfiedUntouchedOpenVo
      countUnsatisfiedTouchedVo
      countUnsatisfiedTouchedOpenVo
      countUnsatisfiedTouchedClosedVo
      countUnsatisfiedReactiveVo
      countUnsatisfiedVn
      countUnsatisfiedAssignedVn
      countUnsatisfiedOpenUnassignedVn
      countUnsatisfiedWaitingForContactVn
      countUnsatisfiedContactPlannedVn
      countUnsatisfiedWaitingForVisitVn
      countUnsatisfiedVisitPlannedVn
      countUnsatisfiedWaitingForClosingVn
      countUnsatisfiedClosedWithoutResolutionVn
      countUnsatisfiedClosedWithResolutionVn
      countUnsatisfiedUntouchedVn
      countUnsatisfiedUntouchedOpenVn
      countUnsatisfiedTouchedVn
      countUnsatisfiedTouchedOpenVn
      countUnsatisfiedTouchedClosedVn
      countUnsatisfiedReactiveVn
    }
  }
`;

// TODO cleanup when all scope was analyse
const userKpisFragment = gql`
  fragment usersKpi on kpiByPeriodGetKpiKpi {
    usersKpi {
      # Unsatisfied ( garage - team )
      countUnsatisfiedTouched
      countUnsatisfied
      countUnsatisfiedClosedWithResolution
      countUnsatisfiedUntouched


      # unsatisfied ( reviews )
      countUnsatisfied
      countUnsatisfiedWaitingForContact
      countUnsatisfiedContactPlanned
      countUnsatisfiedWaitingForVisit
      countUnsatisfiedVisitPlanned
      countUnsatisfiedWaitingForClosing
      countUnsatisfiedClosedWithResolution
      countUnsatisfiedClosedWithoutResolution
      countUnsatisfiedClosedWithResolutionApv
      countUnsatisfiedClosedWithResolutionVo
      countUnsatisfiedClosedWithResolutionVn


      countLeads
      countLeadsUnassigned
      countLeadsAssigned
      countLeadsUntouched
      countLeadsUntouchedOpen
      countLeadsTouched
      countLeadsTouchedOpen
      countLeadsTouchedClosed
      countLeadsReactive
      countLeadsWaitingForContact
      countLeadsContactPlanned
      countLeadsWaitingForMeeting
      countLeadsMeetingPlanned
      countLeadsWaitingForProposition
      countLeadsPropositionPlanned
      countLeadsWaitingForClosing
      countLeadsClosedWithoutSale
      countLeadsClosedWithSale
      countLeadsClosedWithSaleWasInterested
      countLeadsClosedWithSaleWasInContactWithVendor
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness
      countLeadsApv
      countLeadsUnassignedApv
      countLeadsAssignedApv
      countLeadsUntouchedApv
      countLeadsUntouchedOpenApv
      countLeadsTouchedApv
      countLeadsTouchedOpenApv
      countLeadsTouchedClosedApv
      countLeadsReactiveApv
      countLeadsWaitingForContactApv
      countLeadsContactPlannedApv
      countLeadsWaitingForMeetingApv
      countLeadsMeetingPlannedApv
      countLeadsWaitingForPropositionApv
      countLeadsPropositionPlannedApv
      countLeadsWaitingForClosingApv
      countLeadsClosedWithoutSaleApv
      countLeadsClosedWithSaleApv
      countLeadsClosedWithSaleWasInterestedApv
      countLeadsClosedWithSaleWasInContactWithVendorApv
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv
      countLeadsVn
      countLeadsUnassignedVn
      countLeadsAssignedVn
      countLeadsUntouchedVn
      countLeadsUntouchedOpenVn
      countLeadsTouchedVn
      countLeadsTouchedOpenVn
      countLeadsTouchedClosedVn
      countLeadsReactiveVn
      countLeadsWaitingForContactVn
      countLeadsContactPlannedVn
      countLeadsWaitingForMeetingVn
      countLeadsMeetingPlannedVn
      countLeadsWaitingForPropositionVn
      countLeadsPropositionPlannedVn
      countLeadsWaitingForClosingVn
      countLeadsClosedWithoutSaleVn
      countLeadsClosedWithSaleVn
      countLeadsClosedWithSaleWasInterestedVn
      countLeadsClosedWithSaleWasInContactWithVendorVn
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn
      countLeadsVo
      countLeadsUnassignedVo
      countLeadsAssignedVo
      countLeadsUntouchedVo
      countLeadsUntouchedOpenVo
      countLeadsTouchedVo
      countLeadsTouchedOpenVo
      countLeadsTouchedClosedVo
      countLeadsReactiveVo
      countLeadsWaitingForContactVo
      countLeadsContactPlannedVo
      countLeadsWaitingForMeetingVo
      countLeadsMeetingPlannedVo
      countLeadsWaitingForPropositionVo
      countLeadsPropositionPlannedVo
      countLeadsWaitingForClosingVo
      countLeadsClosedWithoutSaleVo
      countLeadsClosedWithSaleVo
      countLeadsClosedWithSaleWasInterestedVo
      countLeadsClosedWithSaleWasInContactWithVendorVo
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo
      countLeadsUnknown
      countLeadsUnassignedUnknown
      countLeadsAssignedUnknown
      countLeadsUntouchedUnknown
      countLeadsUntouchedOpenUnknown
      countLeadsTouchedUnknown
      countLeadsTouchedOpenUnknown
      countLeadsTouchedClosedUnknown
      countLeadsReactiveUnknown
      countLeadsWaitingForContactUnknown
      countLeadsContactPlannedUnknown
      countLeadsWaitingForMeetingUnknown
      countLeadsMeetingPlannedUnknown
      countLeadsWaitingForPropositionUnknown
      countLeadsPropositionPlannedUnknown
      countLeadsWaitingForClosingUnknown
      countLeadsClosedWithoutSaleUnknown
      countLeadsClosedWithSaleUnknown
      countLeadsClosedWithSaleWasInterestedUnknown
      countLeadsClosedWithSaleWasInContactWithVendorUnknown
      countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown
      countUnsatisfied
      countUnsatisfiedAssigned
      countUnsatisfiedOpenUnassigned
      countUnsatisfiedWaitingForContact
      countUnsatisfiedContactPlanned
      countUnsatisfiedWaitingForVisit
      countUnsatisfiedVisitPlanned
      countUnsatisfiedWaitingForClosing
      countUnsatisfiedClosedWithoutResolution
      countUnsatisfiedClosedWithResolution
      countUnsatisfiedUntouched
      countUnsatisfiedUntouchedOpen
      countUnsatisfiedTouched
      countUnsatisfiedTouchedOpen
      countUnsatisfiedTouchedClosed
      countUnsatisfiedReactive
      countUnsatisfiedApv
      countUnsatisfiedAssignedApv
      countUnsatisfiedOpenUnassignedApv
      countUnsatisfiedWaitingForContactApv
      countUnsatisfiedContactPlannedApv
      countUnsatisfiedWaitingForVisitApv
      countUnsatisfiedVisitPlannedApv
      countUnsatisfiedWaitingForClosingApv
      countUnsatisfiedClosedWithoutResolutionApv
      countUnsatisfiedClosedWithResolutionApv
      countUnsatisfiedUntouchedApv
      countUnsatisfiedUntouchedOpenApv
      countUnsatisfiedTouchedApv
      countUnsatisfiedTouchedOpenApv
      countUnsatisfiedTouchedClosedApv
      countUnsatisfiedReactiveApv
      countUnsatisfiedVo
      countUnsatisfiedAssignedVo
      countUnsatisfiedOpenUnassignedVo
      countUnsatisfiedWaitingForContactVo
      countUnsatisfiedContactPlannedVo
      countUnsatisfiedWaitingForVisitVo
      countUnsatisfiedVisitPlannedVo
      countUnsatisfiedWaitingForClosingVo
      countUnsatisfiedClosedWithoutResolutionVo
      countUnsatisfiedClosedWithResolutionVo
      countUnsatisfiedUntouchedVo
      countUnsatisfiedUntouchedOpenVo
      countUnsatisfiedTouchedVo
      countUnsatisfiedTouchedOpenVo
      countUnsatisfiedTouchedClosedVo
      countUnsatisfiedReactiveVo
      countUnsatisfiedVn
      countUnsatisfiedAssignedVn
      countUnsatisfiedOpenUnassignedVn
      countUnsatisfiedWaitingForContactVn
      countUnsatisfiedContactPlannedVn
      countUnsatisfiedWaitingForVisitVn
      countUnsatisfiedVisitPlannedVn
      countUnsatisfiedWaitingForClosingVn
      countUnsatisfiedClosedWithoutResolutionVn
      countUnsatisfiedClosedWithResolutionVn
      countUnsatisfiedUntouchedVn
      countUnsatisfiedUntouchedOpenVn
      countUnsatisfiedTouchedVn
      countUnsatisfiedTouchedOpenVn
      countUnsatisfiedTouchedClosedVn
      countUnsatisfiedReactiveVn
    }
  }`;

const GARAGES_KPI = gql`
  ${garagesKpiFragment}
  query kpiByPeriodGetKpi(
    $periodId: String!
    $garageId: [String]
    $cockpitType: String
    $userId: String
  ) {
    kpiData: kpiByPeriodGetKpi(
      periodId: $periodId
      garageId: $garageId
      cockpitType: $cockpitType
      userId: $userId
    ) {
      ...garagesKpi
    }
  }`;

const USERS_KPI = gql`
  ${userKpisFragment}
  query kpiByPeriodGetKpi(
    $periodId: String!
    $garageId: [String]
    $cockpitType: String
    $userId: String
  ) {
    kpiData: kpiByPeriodGetKpi(
      periodId: $periodId
      garageId: $garageId
      cockpitType: $cockpitType
      userId: $userId
    ) {
      ...usersKpi
    }
  }`;

const GARAGES_AND_USERS_KPI = gql`
  ${userKpisFragment}
  ${garagesKpiFragment}
  query kpiByPeriodGetKpi(
    $periodId: String!
    $garageId: [String]
    $cockpitType: String
    $userId: String
  ) {
    kpiData: kpiByPeriodGetKpi(
      periodId: $periodId
      garageId: $garageId
      cockpitType: $cockpitType
      userId: $userId
    ) {
      ...garagesKpi
      ...usersKpi
    }
  }`;

export {
  KPI_BY_PERIOD_SINGLE_KPI,
  WELCOME_GET_KPIS,
  GARAGES_KPI,
  GARAGES_AND_USERS_KPI,
  USERS_KPI,
  KPI_BY_PERIOD_GET_SINGLE_AND_EREP_KPI,
};
