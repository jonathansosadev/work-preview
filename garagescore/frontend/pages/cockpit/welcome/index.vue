<template>
  <div class="page-welcome custom-scrollbar">
    <div
      v-for="row in activeDashboardLayoutRows"
      :key="row.name"
      :class="getRowClassName(row)"
    >
      <div
        v-for="column in row.columns"
        :key="column.name"
        :class="getColumnClassName(column, !isSingleColumnRow(row))"
      >
        <template v-if="isSingleTileColumn(column)">
          <StatsTileSkeleton
            v-if="mixinKpiData.isLoading"
            :rowQuantity="getSkeletonRowQuantity(row)"
          />
          <Component
            v-else
            v-bind="resolveProps(getColumnFirstTile(column))"
            :is="getColumnFirstTile(column).name"
          />
        </template>
        <template v-else>
          <template v-for="tile in column.tiles">
            <div :key="tile.name" class="page-welcome__subitem">
              <StatsTileSkeleton v-if="mixinKpiData.isLoading" />
              <Component v-else v-bind="resolveProps(tile)" :is="tile.name" />
            </div>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import EReputationStatsSkeleton from '~/components/global/skeleton/EReputationStatsSkeletons.vue';
import TileSkeleton from '~/components/global/skeleton/TileSkeleton.vue';
import StatsTileSkeleton from '~/components/global/skeleton/StatsTileSkeleton.vue';
import { setupHotJar } from '~/util/externalScripts/hotjar';
import GarageTypes from '~/utils/models/garage.type.js';
import kpiMixin from '~/components/cockpit/mixins/kpiMixin';
import { WELCOME_GET_KPIS } from '~/utils/kpi/graphqlQueries';

export default {
  name: 'Welcome',
  components: {
    EReputationStatsSkeleton,
    StatsTileSkeleton,
    TileContact: () => import('~/components/cockpit/dashboard/TileContact.vue'),
    TileEReputation: () => import('~/components/cockpit/dashboard/TileEReputation.vue'),
    TilePurchaseProject: () => import('~/components/cockpit/dashboard/TilePurchaseProject.vue'),
    TileSalesPeriod: () => import('~/components/cockpit/dashboard/TileSalesPeriod.vue'),
    TileSatisfaction: () => import('~/components/cockpit/dashboard/TileSatisfaction.vue'),
    TileSkeleton,
    TileSolvedUnsatisfiedPeriod: () => import('~/components/cockpit/dashboard/TileSolvedUnsatisfiedPeriod.vue'),
  },
  props: {
    modalMixin: {
      type: Object,
      required: true,
    },
    navigationDataProvider: {
      type: Object,
    },
  },
  middleware: ['hasAccessToWelcome'],
  mixins: [
    kpiMixin(
      WELCOME_GET_KPIS,
      [
        'navigationDataProvider.garageIds',
        'navigationDataProvider.periodId',
        'navigationDataProvider.dataTypeId',
        'navigationDataProvider.cockpitType',
        'navigationDataProvider.dms.frontDeskUserName',
      ],
      {
        erepKpis: [],
        kpiByPeriodSingle: {},
        garagesConversions: {},
        garagesSolvedUnsatisfied: {},
      }
    ),
  ],
  async mounted() {
    setupHotJar(this.navigationDataProvider.locale, 'welcome');
  },

  computed: {
    activeDashboardLayout() {
      const {
        dashboardLayouts = [],
        navigationDataProvider: { cockpitType },
      } = this;
      const { dealership, maintainance } = dashboardLayouts;
      const isDealershipCockpit = cockpitType !== GarageTypes.VEHICLE_INSPECTION;
      return isDealershipCockpit ? dealership : maintainance;
    },
    activeDashboardLayoutRows() {
      return this.activeDashboardLayout?.rows || [];
    },
    ereputationProps() {
      return {
        refreshEreputationRouteParameters: () => null,
        fetchReviews: () => null,
        changeReviewFilters: () => null,
        singleKpi: {},
        connectSource: () => null,
        sourcesInMaintenance: process.env.EREP_SOURCES_IN_MAINTENANCE,
      };
    },
    dashboardLayouts() {
      const dealershipLayout = {
        name: 'dealership',
        rows: [
          {
            name: 'default stats',
            columns: [
              {
                name: 'DefaultSatisfactionTileColumn',
                tiles: [
                  {
                    name: 'TileSatisfaction',
                    props: {
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      hasAccessToSatisfaction: null,
                    },
                  },
                ],
              },
              {
                name: 'DefaultMultipleTileColumn',
                tiles: [
                  {
                    name: 'TilePurchaseProject',
                    props: {
                      'navigationDataProvider.authorizations': null,
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      hasAccessToLeads: null,
                      closeModal: null,
                      openModal: null,
                    },
                  },
                  {
                    name: 'TileSalesPeriod',
                    props: {
                      'navigationDataProvider.authorizations': null,
                      'mixinKpiData.data.garagesConversions': null,
                      openModal: null,
                    },
                  },
                  {
                    name: 'TileSolvedUnsatisfiedPeriod',
                    props: {
                      'navigationDataProvider.cockpitType': null,
                      'mixinKpiData.data.garagesSolvedUnsatisfied': null,
                      hasAccessToUnsatisfied: null,
                    },
                  },
                ],
              },
              {
                name: 'DefaultContactTileColumn',
                tiles: [
                  {
                    name: 'TileContact',
                    props: {
                      'navigationDataProvider.dataTypeId': null,
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      hasAccessToContacts: null,
                    },
                  },
                ],
              },
            ],
          },
          {
            name: 'DefaultEreputation',
            columns: [
              {
                name: 'DefaultEreputationTilecolumn',
                tiles: [
                  {
                    name: 'TileEReputation',
                    props: {
                      'mixinKpiData.data.erepKpis': null,
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      'navigationDataProvider.locale': null,
                      interactive: false,
                      openModal: null,
                      ereputationProps: this.ereputationProps,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      const maintenanceLayout = {
        name: 'maintainance',
        rows: [
          {
            name: 'default stats',
            columns: [
              {
                name: 'DefaultSatisfactionTileColumn',
                tiles: [
                  {
                    name: 'TileSatisfaction',
                    props: {
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      hasAccessToSatisfaction: null,
                    },
                  },
                ],
              },
              {
                name: 'DefaultMultipleTileColumn',
                tiles: [
                  {
                    name: 'TilePurchaseProject',
                    props: {
                      'navigationDataProvider.authorizations': null,
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      hasAccessToLeads: null,
                      closeModal: null,
                      openModal: null,
                    },
                  },
                  {
                    name: 'TileSolvedUnsatisfiedPeriod',
                    props: {
                      'navigationDataProvider.cockpitType': null,
                      'mixinKpiData.data.garagesSolvedUnsatisfied': null,
                      hasAccessToUnsatisfied: null,
                    },
                  },
                ],
              },
              {
                name: 'DefaultContactTileColumn',
                tiles: [
                  {
                    name: 'TileContact',
                    props: {
                      'navigationDataProvider.dataTypeId': null,
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                    },
                  },
                ],
              },
            ],
          },
          {
            name: 'DefaultEreputation',
            columns: [
              {
                name: 'DefaultEreputationTilecolumn',
                tiles: [
                  {
                    name: 'TileEReputation',
                    props: {
                      'mixinKpiData.data.erepKpis': null,
                      'mixinKpiData.data.kpiByPeriodSingle': null,
                      'navigationDataProvider.locale': null,
                      interactive: false,
                      openModal: null,
                      ereputationProps: this.ereputationProps,
                    },
                  },
                ],
              },
            ],
          },
        ],
      };
      return {
        dealership: dealershipLayout,
        maintainance: maintenanceLayout,
      };
    },
    hasAccessToContacts() {
      return this.$store.getters['auth/hasAccessToContacts'];
    },
    hasAccessToLeads() {
      return this.$store.getters['auth/hasAccessToLeads'];
    },
    hasAccessToSatisfaction() {
      return this.$store.getters['auth/hasAccessToSatisfaction'];
    },
    hasAccessToUnsatisfied() {
      return this.$store.getters['auth/hasAccessToUnsatisfied'];
    },
  },
  methods: {
    // TODO need to fix KPIMixin
    // async fetchEreputationKpisData() {
    //   this.isEreputationKpisLoading = true;
    //   const { navigationDataProvider: { cockpitType, garageId, periodId } = {} } = this;
    //
    //   const kpisRequest = {
    //     name: 'ErepKpis',
    //     args: {
    //       period: periodId,
    //       garageId,
    //       cockpitType,
    //     },
    //     fields: `source
    //       rating
    //       countReviews
    //       countRecommend
    //       countDetractorsWithoutResponse
    //       countDetractors
    //     `,
    //   };
    //   const { data } = await makeApolloQueries([kpisRequest]);
    //   const { ErepKpis } = data || {};
    //   this.erepKpis = ErepKpis;
    //   this.isEreputationKpisLoading = false;
    // },
    // async fetchGaragesSolvedUnsatisfiedData() {
    //   this.isGaragesSolvedUnsatisfiedLoading = true;
    //   const { navigationDataProvider: { cockpitType, garageId } = {} } = this;
    //   const request = {
    //     name: 'kpiByPeriodGetSolvedUnsatisfied',
    //     args: {
    //       garageIds: garageId,
    //       cockpitType,
    //     },
    //     fields: `
    //     countUnsatisfied
    //       countSolvedAPVUnsatisfied
    //       countSolvedVNUnsatisfied
    //       countSolvedVOUnsatisfied
    //     `,
    //   };
    //   const { data } = await makeApolloQueries([request]);
    //   const { kpiByPeriodGetSolvedUnsatisfied } = data || {};
    //   this.garagesSolvedUnsatisfied = kpiByPeriodGetSolvedUnsatisfied;
    //   this.isGaragesSolvedUnsatisfiedLoading = false;
    // },
    // async fetchKpiByPeriodSingleData() {
    //   const { navigationDataProvider: { cockpitType, dataTypeId, frontDeskUserName, garageId, periodId } = {} } = this;
    //
    //   this.isKpiByPeriodSingleLoading = true;
    //   const request = {
    //     name: 'kpiByPeriodGetSingle',
    //     args: {
    //       periodId,
    //       garageIds: garageId,
    //       type: dataTypeId,
    //       cockpitType,
    //       frontDesk: frontDeskUserName,
    //     },
    //     fields: `
    //         totalShouldSurfaceInCampaignStats
    //         countEmails
    //         countSurveys
    //         countReceivedSurveys
    //         countSurveysResponded
    //         countSurveySatisfied
    //         countSurveyUnsatisfied
    //         countSurveyLead
    //         countSurveyLeadVo
    //         countSurveyLeadVn
    //         countValidEmails
    //         countBlockedByEmail
    //         countBlockedLastMonthEmail
    //         countUnsubscribedByEmail
    //         countWrongEmails
    //         countNotPresentEmails
    //         countValidPhones
    //         countBlockedByPhone
    //         countWrongPhones
    //         countNotPresentPhones
    //         countBlocked
    //         countNotContactable
    //         countSurveyRespondedAPV
    //         countSurveyRespondedVN
    //         countSurveyRespondedVO
    //         countScheduledContacts
    //     `,
    //   };
    //   const { data } = await makeApolloQueries([request]);
    //   const { kpiByPeriodGetSingle } = data || {};
    //   this.kpiByPeriodSingle = kpiByPeriodGetSingle;
    //   this.isKpiByPeriodSingleLoading = false;
    // },
    // async fetchGaragesConversionsData() {
    //   this.isGaragesConversionsLoading = true;
    //   const { navigationDataProvider: { cockpitType, garageId } = {} } = this;
    //   const request = {
    //     name: 'kpiByPeriodGetGaragesConversions',
    //     args: {
    //       cockpitType,
    //       garageIds: garageId,
    //     },
    //     fields: `
    //       countConvertedLeadsPct
    //       countConversionsTradeInsPct
    //       countConversionsVO
    //       countConversionsVN
    //       countConversionsLeads
    //       countConversionsTradeins
    //       countLeads
    //     `,
    //   };
    //   const { data } = await makeApolloQueries([request]);
    //   const { kpiByPeriodGetGaragesConversions } = data || {};
    //   this.garagesConversions = kpiByPeriodGetGaragesConversions;
    //   this.isGaragesConversionsLoading = false;
    // },
    // async fetchKpiData() {
    //   this.isKpiByPeriodLoading = true;
    //   const { navigationDataProvider: { cockpitType, garageId, periodId, user: userId } = {} } = this;
    //   const request = {
    //     name: 'kpiByPeriodGetKpi',
    //     args: {
    //       periodId,
    //       garageId,
    //       cockpitType,
    //       userId,
    //     },
    //     fields: `garagesKpi {
    //       countLeads
    //       countLeadsUnassigned
    //       countLeadsAssigned
    //       countLeadsUntouched
    //       countLeadsUntouchedOpen
    //       countLeadsTouched
    //       countLeadsTouchedOpen
    //       countLeadsTouchedClosed
    //       countLeadsReactive
    //       countLeadsWaitingForContact
    //       countLeadsContactPlanned
    //       countLeadsWaitingForMeeting
    //       countLeadsMeetingPlanned
    //       countLeadsWaitingForProposition
    //       countLeadsPropositionPlanned
    //       countLeadsWaitingForClosing
    //       countLeadsClosedWithoutSale
    //       countLeadsClosedWithSale
    //       countLeadsClosedWithSaleWasInterested
    //       countLeadsClosedWithSaleWasInContactWithVendor
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness
    //       countLeadsApv
    //       countLeadsUnassignedApv
    //       countLeadsAssignedApv
    //       countLeadsUntouchedApv
    //       countLeadsUntouchedOpenApv
    //       countLeadsTouchedApv
    //       countLeadsTouchedOpenApv
    //       countLeadsTouchedClosedApv
    //       countLeadsReactiveApv
    //       countLeadsWaitingForContactApv
    //       countLeadsContactPlannedApv
    //       countLeadsWaitingForMeetingApv
    //       countLeadsMeetingPlannedApv
    //       countLeadsWaitingForPropositionApv
    //       countLeadsPropositionPlannedApv
    //       countLeadsWaitingForClosingApv
    //       countLeadsClosedWithoutSaleApv
    //       countLeadsClosedWithSaleApv
    //       countLeadsClosedWithSaleWasInterestedApv
    //       countLeadsClosedWithSaleWasInContactWithVendorApv
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv
    //       countLeadsVn
    //       countLeadsUnassignedVn
    //       countLeadsAssignedVn
    //       countLeadsUntouchedVn
    //       countLeadsUntouchedOpenVn
    //       countLeadsTouchedVn
    //       countLeadsTouchedOpenVn
    //       countLeadsTouchedClosedVn
    //       countLeadsReactiveVn
    //       countLeadsWaitingForContactVn
    //       countLeadsContactPlannedVn
    //       countLeadsWaitingForMeetingVn
    //       countLeadsMeetingPlannedVn
    //       countLeadsWaitingForPropositionVn
    //       countLeadsPropositionPlannedVn
    //       countLeadsWaitingForClosingVn
    //       countLeadsClosedWithoutSaleVn
    //       countLeadsClosedWithSaleVn
    //       countLeadsClosedWithSaleWasInterestedVn
    //       countLeadsClosedWithSaleWasInContactWithVendorVn
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn
    //       countLeadsVo
    //       countLeadsUnassignedVo
    //       countLeadsAssignedVo
    //       countLeadsUntouchedVo
    //       countLeadsUntouchedOpenVo
    //       countLeadsTouchedVo
    //       countLeadsTouchedOpenVo
    //       countLeadsTouchedClosedVo
    //       countLeadsReactiveVo
    //       countLeadsWaitingForContactVo
    //       countLeadsContactPlannedVo
    //       countLeadsWaitingForMeetingVo
    //       countLeadsMeetingPlannedVo
    //       countLeadsWaitingForPropositionVo
    //       countLeadsPropositionPlannedVo
    //       countLeadsWaitingForClosingVo
    //       countLeadsClosedWithoutSaleVo
    //       countLeadsClosedWithSaleVo
    //       countLeadsClosedWithSaleWasInterestedVo
    //       countLeadsClosedWithSaleWasInContactWithVendorVo
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo
    //       countLeadsUnknown
    //       countLeadsUnassignedUnknown
    //       countLeadsAssignedUnknown
    //       countLeadsUntouchedUnknown
    //       countLeadsUntouchedOpenUnknown
    //       countLeadsTouchedUnknown
    //       countLeadsTouchedOpenUnknown
    //       countLeadsTouchedClosedUnknown
    //       countLeadsReactiveUnknown
    //       countLeadsWaitingForContactUnknown
    //       countLeadsContactPlannedUnknown
    //       countLeadsWaitingForMeetingUnknown
    //       countLeadsMeetingPlannedUnknown
    //       countLeadsWaitingForPropositionUnknown
    //       countLeadsPropositionPlannedUnknown
    //       countLeadsWaitingForClosingUnknown
    //       countLeadsClosedWithoutSaleUnknown
    //       countLeadsClosedWithSaleUnknown
    //       countLeadsClosedWithSaleWasInterestedUnknown
    //       countLeadsClosedWithSaleWasInContactWithVendorUnknown
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown
    //       countUnsatisfied
    //       countUnsatisfiedAssigned
    //       countUnsatisfiedOpenUnassigned
    //       countUnsatisfiedWaitingForContact
    //       countUnsatisfiedContactPlanned
    //       countUnsatisfiedWaitingForVisit
    //       countUnsatisfiedVisitPlanned
    //       countUnsatisfiedWaitingForClosing
    //       countUnsatisfiedClosedWithoutResolution
    //       countUnsatisfiedClosedWithResolution
    //       countUnsatisfiedUntouched
    //       countUnsatisfiedUntouchedOpen
    //       countUnsatisfiedTouched
    //       countUnsatisfiedTouchedOpen
    //       countUnsatisfiedTouchedClosed
    //       countUnsatisfiedReactive
    //       countUnsatisfiedApv
    //       countUnsatisfiedAssignedApv
    //       countUnsatisfiedOpenUnassignedApv
    //       countUnsatisfiedWaitingForContactApv
    //       countUnsatisfiedContactPlannedApv
    //       countUnsatisfiedWaitingForVisitApv
    //       countUnsatisfiedVisitPlannedApv
    //       countUnsatisfiedWaitingForClosingApv
    //       countUnsatisfiedClosedWithoutResolutionApv
    //       countUnsatisfiedClosedWithResolutionApv
    //       countUnsatisfiedUntouchedApv
    //       countUnsatisfiedUntouchedOpenApv
    //       countUnsatisfiedTouchedApv
    //       countUnsatisfiedTouchedOpenApv
    //       countUnsatisfiedTouchedClosedApv
    //       countUnsatisfiedReactiveApv
    //       countUnsatisfiedVo
    //       countUnsatisfiedAssignedVo
    //       countUnsatisfiedOpenUnassignedVo
    //       countUnsatisfiedWaitingForContactVo
    //       countUnsatisfiedContactPlannedVo
    //       countUnsatisfiedWaitingForVisitVo
    //       countUnsatisfiedVisitPlannedVo
    //       countUnsatisfiedWaitingForClosingVo
    //       countUnsatisfiedClosedWithoutResolutionVo
    //       countUnsatisfiedClosedWithResolutionVo
    //       countUnsatisfiedUntouchedVo
    //       countUnsatisfiedUntouchedOpenVo
    //       countUnsatisfiedTouchedVo
    //       countUnsatisfiedTouchedOpenVo
    //       countUnsatisfiedTouchedClosedVo
    //       countUnsatisfiedReactiveVo
    //       countUnsatisfiedVn
    //       countUnsatisfiedAssignedVn
    //       countUnsatisfiedOpenUnassignedVn
    //       countUnsatisfiedWaitingForContactVn
    //       countUnsatisfiedContactPlannedVn
    //       countUnsatisfiedWaitingForVisitVn
    //       countUnsatisfiedVisitPlannedVn
    //       countUnsatisfiedWaitingForClosingVn
    //       countUnsatisfiedClosedWithoutResolutionVn
    //       countUnsatisfiedClosedWithResolutionVn
    //       countUnsatisfiedUntouchedVn
    //       countUnsatisfiedUntouchedOpenVn
    //       countUnsatisfiedTouchedVn
    //       countUnsatisfiedTouchedOpenVn
    //       countUnsatisfiedTouchedClosedVn
    //       countUnsatisfiedReactiveVn
    //     }
    //     usersKpi {
    //       countLeads
    //       countLeadsUnassigned
    //       countLeadsAssigned
    //       countLeadsUntouched
    //       countLeadsUntouchedOpen
    //       countLeadsTouched
    //       countLeadsTouchedOpen
    //       countLeadsTouchedClosed
    //       countLeadsReactive
    //       countLeadsWaitingForContact
    //       countLeadsContactPlanned
    //       countLeadsWaitingForMeeting
    //       countLeadsMeetingPlanned
    //       countLeadsWaitingForProposition
    //       countLeadsPropositionPlanned
    //       countLeadsWaitingForClosing
    //       countLeadsClosedWithoutSale
    //       countLeadsClosedWithSale
    //       countLeadsClosedWithSaleWasInterested
    //       countLeadsClosedWithSaleWasInContactWithVendor
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusiness
    //       countLeadsApv
    //       countLeadsUnassignedApv
    //       countLeadsAssignedApv
    //       countLeadsUntouchedApv
    //       countLeadsUntouchedOpenApv
    //       countLeadsTouchedApv
    //       countLeadsTouchedOpenApv
    //       countLeadsTouchedClosedApv
    //       countLeadsReactiveApv
    //       countLeadsWaitingForContactApv
    //       countLeadsContactPlannedApv
    //       countLeadsWaitingForMeetingApv
    //       countLeadsMeetingPlannedApv
    //       countLeadsWaitingForPropositionApv
    //       countLeadsPropositionPlannedApv
    //       countLeadsWaitingForClosingApv
    //       countLeadsClosedWithoutSaleApv
    //       countLeadsClosedWithSaleApv
    //       countLeadsClosedWithSaleWasInterestedApv
    //       countLeadsClosedWithSaleWasInContactWithVendorApv
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessApv
    //       countLeadsVn
    //       countLeadsUnassignedVn
    //       countLeadsAssignedVn
    //       countLeadsUntouchedVn
    //       countLeadsUntouchedOpenVn
    //       countLeadsTouchedVn
    //       countLeadsTouchedOpenVn
    //       countLeadsTouchedClosedVn
    //       countLeadsReactiveVn
    //       countLeadsWaitingForContactVn
    //       countLeadsContactPlannedVn
    //       countLeadsWaitingForMeetingVn
    //       countLeadsMeetingPlannedVn
    //       countLeadsWaitingForPropositionVn
    //       countLeadsPropositionPlannedVn
    //       countLeadsWaitingForClosingVn
    //       countLeadsClosedWithoutSaleVn
    //       countLeadsClosedWithSaleVn
    //       countLeadsClosedWithSaleWasInterestedVn
    //       countLeadsClosedWithSaleWasInContactWithVendorVn
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVn
    //       countLeadsVo
    //       countLeadsUnassignedVo
    //       countLeadsAssignedVo
    //       countLeadsUntouchedVo
    //       countLeadsUntouchedOpenVo
    //       countLeadsTouchedVo
    //       countLeadsTouchedOpenVo
    //       countLeadsTouchedClosedVo
    //       countLeadsReactiveVo
    //       countLeadsWaitingForContactVo
    //       countLeadsContactPlannedVo
    //       countLeadsWaitingForMeetingVo
    //       countLeadsMeetingPlannedVo
    //       countLeadsWaitingForPropositionVo
    //       countLeadsPropositionPlannedVo
    //       countLeadsWaitingForClosingVo
    //       countLeadsClosedWithoutSaleVo
    //       countLeadsClosedWithSaleVo
    //       countLeadsClosedWithSaleWasInterestedVo
    //       countLeadsClosedWithSaleWasInContactWithVendorVo
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessVo
    //       countLeadsUnknown
    //       countLeadsUnassignedUnknown
    //       countLeadsAssignedUnknown
    //       countLeadsUntouchedUnknown
    //       countLeadsUntouchedOpenUnknown
    //       countLeadsTouchedUnknown
    //       countLeadsTouchedOpenUnknown
    //       countLeadsTouchedClosedUnknown
    //       countLeadsReactiveUnknown
    //       countLeadsWaitingForContactUnknown
    //       countLeadsContactPlannedUnknown
    //       countLeadsWaitingForMeetingUnknown
    //       countLeadsMeetingPlannedUnknown
    //       countLeadsWaitingForPropositionUnknown
    //       countLeadsPropositionPlannedUnknown
    //       countLeadsWaitingForClosingUnknown
    //       countLeadsClosedWithoutSaleUnknown
    //       countLeadsClosedWithSaleUnknown
    //       countLeadsClosedWithSaleWasInterestedUnknown
    //       countLeadsClosedWithSaleWasInContactWithVendorUnknown
    //       countLeadsClosedWithSaleWasAlreadyPlannedOtherBusinessUnknown
    //       countUnsatisfied
    //       countUnsatisfiedAssigned
    //       countUnsatisfiedOpenUnassigned
    //       countUnsatisfiedWaitingForContact
    //       countUnsatisfiedContactPlanned
    //       countUnsatisfiedWaitingForVisit
    //       countUnsatisfiedVisitPlanned
    //       countUnsatisfiedWaitingForClosing
    //       countUnsatisfiedClosedWithoutResolution
    //       countUnsatisfiedClosedWithResolution
    //       countUnsatisfiedUntouched
    //       countUnsatisfiedUntouchedOpen
    //       countUnsatisfiedTouched
    //       countUnsatisfiedTouchedOpen
    //       countUnsatisfiedTouchedClosed
    //       countUnsatisfiedReactive
    //       countUnsatisfiedApv
    //       countUnsatisfiedAssignedApv
    //       countUnsatisfiedOpenUnassignedApv
    //       countUnsatisfiedWaitingForContactApv
    //       countUnsatisfiedContactPlannedApv
    //       countUnsatisfiedWaitingForVisitApv
    //       countUnsatisfiedVisitPlannedApv
    //       countUnsatisfiedWaitingForClosingApv
    //       countUnsatisfiedClosedWithoutResolutionApv
    //       countUnsatisfiedClosedWithResolutionApv
    //       countUnsatisfiedUntouchedApv
    //       countUnsatisfiedUntouchedOpenApv
    //       countUnsatisfiedTouchedApv
    //       countUnsatisfiedTouchedOpenApv
    //       countUnsatisfiedTouchedClosedApv
    //       countUnsatisfiedReactiveApv
    //       countUnsatisfiedVo
    //       countUnsatisfiedAssignedVo
    //       countUnsatisfiedOpenUnassignedVo
    //       countUnsatisfiedWaitingForContactVo
    //       countUnsatisfiedContactPlannedVo
    //       countUnsatisfiedWaitingForVisitVo
    //       countUnsatisfiedVisitPlannedVo
    //       countUnsatisfiedWaitingForClosingVo
    //       countUnsatisfiedClosedWithoutResolutionVo
    //       countUnsatisfiedClosedWithResolutionVo
    //       countUnsatisfiedUntouchedVo
    //       countUnsatisfiedUntouchedOpenVo
    //       countUnsatisfiedTouchedVo
    //       countUnsatisfiedTouchedOpenVo
    //       countUnsatisfiedTouchedClosedVo
    //       countUnsatisfiedReactiveVo
    //       countUnsatisfiedVn
    //       countUnsatisfiedAssignedVn
    //       countUnsatisfiedOpenUnassignedVn
    //       countUnsatisfiedWaitingForContactVn
    //       countUnsatisfiedContactPlannedVn
    //       countUnsatisfiedWaitingForVisitVn
    //       countUnsatisfiedVisitPlannedVn
    //       countUnsatisfiedWaitingForClosingVn
    //       countUnsatisfiedClosedWithoutResolutionVn
    //       countUnsatisfiedClosedWithResolutionVn
    //       countUnsatisfiedUntouchedVn
    //       countUnsatisfiedUntouchedOpenVn
    //       countUnsatisfiedTouchedVn
    //       countUnsatisfiedTouchedOpenVn
    //       countUnsatisfiedTouchedClosedVn
    //       countUnsatisfiedReactiveVn
    //     }`,
    //   };
    //   const { data } = await makeApolloQueries([request]);
    //   const { kpiByPeriodGetKpi } = data || {};
    //   this.kpiByPeriod = kpiByPeriodGetKpi;
    //   this.isKpiByPeriodLoading = false;
    // },
    aggregateColumnsTiles(aggregatedColumnTiles, { tiles }) {
      return [...aggregatedColumnTiles, ...tiles];
    },
    aggregateRowsTiles(aggregatedRowTiles, { columns }) {
      const rowTiles = columns.reduce(this.aggregateColumnsTiles, []);
      return [...aggregatedRowTiles, ...rowTiles];
    },
    closeModal() {
      this.modalMixin.closeModal();
    },
    dashboardRowMaxColumnSize(row) {
      const defaultSize = 0;
      return row.columns.reduce(
        (maxSize, current) => {
          const currentColumnSize = current.tiles.length;
          return maxSize < currentColumnSize ? currentColumnSize : maxSize;
        },
        defaultSize,
      );
    },
    filterTileByDataNames(dataNames, tile) {
      const { props = {} } = tile || {};
      const propNames = Object.keys(props);
      return dataNames.some((dataName) => propNames.includes(dataName));
    },
    getActiveTilesFromDataNames(dataNames) {
      const { rows } = this.activeDashboardLayout;
      const allTiles = rows.reduce(this.aggregateRowsTiles, []) || [];
      return allTiles.filter(this.filterTileByDataNames.bind(this, dataNames));
    },
    getColumnClassName(column, hasSibling) {
      if (!hasSibling) {
        return '';
      }
      return this.isSingleTileColumn(column) ? 'page-welcome__item' : 'page-welcome__item page-welcome__item--split';
    },
    getColumnFirstTile(column) {
      const [firstTile] = column.tiles;
      return firstTile;
    },
    getRowClassName(row) {
      return this.isSingleColumnRow(row) ? 'page-welcome__ereputation' : 'page-welcome__stats';
    },
    getSkeletonRowQuantity(row) {
      return this.dashboardRowMaxColumnSize(row);
    },
    isSingleColumnRow({ columns }) {
      return columns?.length <= 1;
    },
    isSingleTileColumn(column) {
      return column?.tiles?.length <= 1;
    },
    openModal(payload) {
      this.modalMixin.openModal(payload);
    },
    resolveDataLoader({ props = {} }) {
      const propNames = Object.keys(props);
      for (const propName of propNames) {
        const isExpectedProp = props[propName] === null;
        const isPropInParentComponent = !!this[propName];

        if (isExpectedProp && isPropInParentComponent) {
          const [firstChar, ...remainingChars] = propName;
          const propNameFragment = remainingChars.join('');
          const capitalizedPropName = `${firstChar.toUpperCase()}${propNameFragment}`;
          const loaderName = `is${capitalizedPropName}Loading`;

          if (loaderName in this) {
            return this[loaderName];
          }
        }
      }
      return false; // otherwise, already loaded
    },
    resolvePropName(propName) {
      const propNameFragments = propName.split('.');
      const propNameFragmentSize = propNameFragments?.length || 0;
      const isNestedProp = propNameFragmentSize >= 2;

      if (isNestedProp) {
        const lastPropNameFragment = propNameFragments[propNameFragmentSize - 1];
        return lastPropNameFragment;
      }
      return propName;
    },
    resolvePropValuetoInstance(propName) {
      const propNameFragments = propName.split('.');
      const propNameFragmentSize = propNameFragments?.length || 0;
      const isNestedProp = propNameFragmentSize >= 2;
      let nestedData = this;
      if (isNestedProp) {
        for (let fragmentIndex = 0; fragmentIndex < propNameFragmentSize; fragmentIndex++) {
          const currentPropNameFragment = propNameFragments[fragmentIndex];
          nestedData = nestedData[currentPropNameFragment];
        }
        return nestedData;
      } else {
        return this[propName];
      }
    },
    resolveProps({ props = {} }) {
      const componentProps = {};

      Object.entries(props).forEach(([propName, propValue]) => {
        const hasDefaultValue = propValue !== null;
        const resolvedPropValue = hasDefaultValue ? propValue : this.resolvePropValuetoInstance(propName);
        const resolvedPropName = this.resolvePropName(propName);
        componentProps[resolvedPropName] = resolvedPropValue;
      });
      return componentProps;
    },
  },
};
</script>

<style lang='scss' scoped>
.tiles {
  display: flex;
  align-items: center;
  width: 100%;

  & > * {
    flex: 1;
    width: 100%;
  }

  & > *:not(:first-child) {
    margin-left: 1rem;
  }

  @media (max-width: 1200px) {
    flex-flow: column;

    & > *:not(:first-child) {
      margin-top: 1rem;
    }
  }
}

.page-welcome {
  position: relative;
  height: calc(100vh - 8.5rem);
  overflow-x: hidden;
  overflow-y: auto;
  top: 1rem;
  padding-top: 0.15rem;
  box-sizing: border-box;

  .tiles {
    display: flex;
    align-items: center;
    padding: 20px;

    @media (max-width: 1200px) {
      flex-flow: column;
    }
  }

  &__stats {
    display: flex;
    justify-content: flex-start;
    align-items: stretch;
    flex-flow: column;
    padding: 0 1rem 1rem 1rem;
  }

  &__subitem {
    flex: 1;
    margin-bottom: 1rem;

    &:last-child {
      margin: 0;
    }
  }

  &__item {
    width: 100%;

    &--split {
      margin-bottom: 0;
    }

    &:not(:last-child) {
      margin-bottom: 1rem;
    }
  }

  // Prevent horizontal scroll bar apparition
  &__ereputation {
    flex: 1;
    padding: 0 1rem 1rem 1rem;

    .tiles {
      padding: 0;
    }

    .tile-skeleton__body {
      padding: 20px;
    }
  }
}

@media (min-width: $breakpoint-min-md) {
  .page-welcome {
    &__stats {
      flex-flow: row;
      height: 36rem; //IE FIX
    }

    &__subitem {
      margin-bottom: 1rem;

      &:first-child {
        margin: 0 0 1rem 0;
      }

      &:last-child {
        margin: 0;
      }
    }

    &__item {
      flex: 1;
      height: 36rem; //IE FIX
      margin: 0 1rem 0 1rem;

      &--split {
        display: flex;
        flex-flow: column;
      }

      &:not(:last-child) {
        margin: 0;
      }

      &:first-child {
        margin: 0 1rem 0 0;
      }

      &:last-child {
        margin: 0 0 0 1rem;
      }

      &--twice {
        flex-direction: column;
      }
    }
  }
}

@media (max-width: $breakpoint-min-md) {
  .page-welcome {
    top: 0;
    height: calc(100vh - 8.5rem);
  }
}
</style>
