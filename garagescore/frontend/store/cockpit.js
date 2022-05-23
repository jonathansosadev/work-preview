import * as analytics from './cockpit/analytics';
import * as automation from './cockpit/automation';

import { ExportFrequencies, ExportTypes } from '~/utils/enumV2';
import { cloneDeep, groupBy } from 'lodash';
import { isEqual, sortArrayObject } from '~/util/arrayTools.js';
import { makeApolloMutations, makeApolloQueries, post } from '~/util/graphql';

import AutomationCampaignTypes from '~/utils/models/automation-campaign.type';
import ChartConfig from '~/utils/charts/configuration';
import ChartHelper from '~/utils/charts/helper';
import DataTypes from '~/utils/models/data/type/data-types';
import ExportHelper from '~/utils/exports/helper';
import GarageTypes from '~/utils/models/garage.type.js';
import KpiTypes from '~/utils/models/kpi.type.js';
import LeadSaleTypes from '~/utils/models/data/type/lead-sale-types';
import LocalStorageHelper from '~/utils/charts/localStorage';
import Vue from 'vue';
import { getDeepFieldValue as deep } from '~/utils/object';
// TODO roger, could you check if not using this methods break anything ? thanks !
import { getGaragesIdsFromTags } from '~/util/filters.js'

/**
 * Generic spread example prefix = 'score', value = null: { scoreAPV: null, scoreVO: null... }
 */
const _jobAcronyms = ['APV', 'VN', 'VO', 'VI'];
const _genericListGenerator = (prefix, value) => {
  return _jobAcronyms.reduce((acc, job) => {
    acc[`${ prefix }${ job }`] = value;
    return acc;
  }, {});
};

export const state = () => ({
  current: {
    periodId: "lastQuarter",
    garageIds: null,
    dataTypeId: null,
    automationCampaignType: AutomationCampaignTypes.AUTOMATION_MAINTENANCE,
    cockpitType: GarageTypes.DEALERSHIP,
    dms: { frontDeskUserName: 'ALL_USERS', garageId: null },
    leadSaleType: null,
    user: null,
    lastChanged: null,
    loadingForAutomationCustomContent: true,
    garageFilterMode: 'garages',
  },

  fromRowClick: null,

  kpiByPeriodSingle: {
    loading: false,
    error: '',
    data: {
      score: null,
      countSurveysResponded: 0,
      ..._genericListGenerator('score', null),
      ..._genericListGenerator('countSurveyResponded', null),
      countBlockedByEmail: 0,
      countContacts: 0,
      countScheduledContacts: 0,
      countSurveyUnsatisfied: 0,
      countSurveyLead: 0,
      countSurveyLeadTrade: 0,
      countSurveySatisfied: 0,
      countValidEmails: 0,
    },
  },

  kpi: {
    loading: true,
    data: {
      garagesKpi: {},
      usersKpi: {},
    },
  },

  chat: false,

  filters: {
    loading: true,
  },

  availablePeriods: [
    {
      id: 'lastQuarter',
    },
    {
      id: 'CURRENT_YEAR',
    },
    {
      id: 'ALL_HISTORY',
    },
  ],

  allGarages: [],
  availableGarages: [],
  availableCockpitTypes: [],
  availableDms: [],
  availableUsers: [],
  availableDataTypes: DataTypes.values(),
  availableLeadSaleTypes: [],
  availableAutomationCampaignTypes: [],

  userGroups: [],

  widgetShowCase: {
    show: false,
    item: {},
  },

  generalStats: null,
  origin: 'browser',

  //[ Analytics-v2 ]
  chart: {
    ...ChartConfig,
  },
  isLocalStorageEnabled: null,
  customExports: [],
  availableFrontDeskUsers: [],
  garageSignatures: [],
});

export const modules = {
  automation,
  analytics,
};

export const getters = {
  availableDataTypes: state => state.availableDataTypes,
  availablePeriods: state => state.availablePeriods,
  getOrigin: state => state.origin,
  isLoading: state => state.kpi.loading || state.kpiByPeriodSingle.loading,
  isFiltersLoading: state => state.filters.loading,
  isFiltersDisabled: (state, getters) => {
    return !getters.selectedGarageId
      && getters.availableGarages.length > 100
      && !getters.isSelectedPeriodLight;
  },
  availableLeadSaleTypes: state => state.availableLeadSaleTypes,
  selectedGarageId: state => state.current.garageIds,
  loadingForAutomationCustomContent : state => state.current.loadingForAutomationCustomContent,
  userGroups: state => state.userGroups,
  generalStats: state => state.generalStats,
  widgetShowCase: state => state.widgetShowCase,
  selectedGarage: state =>
    state.availableGarages.filter(e => state?.current?.garageIds?.includes(e.id)),
  availableGarages: state => (
    (
      state?.availableGarages?.filter(
        g => (
          GarageTypes.getCockpitType(g.type) === state.current.cockpitType
        )
      )
    )
    || []
  ),
  availableCrossLeadsGarages: state => (
    (
      state?.availableGarages?.filter(
        g => (
          g?.subscriptions?.active
          && g?.subscriptions?.CrossLeads
        )
      )
    )
    || []
  ),
  allGaragesNotFiltered: state => state.availableGarages || [],
  MaintenanceIcon: state => "icon-gs-repair",
  NewVehicleSaleIcon: state =>
    state.current.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP
      ? "icon-gs-moto"
      : "icon-gs-car",
  UsedVehicleSaleIcon: state =>
    state.current.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP
      ? "icon-gs-moto-old"
      : "icon-gs-car-old",
  vehiclePlusIcon: state =>
    state.current.cockpitType === GarageTypes.MOTORBIKE_DEALERSHIP
      ? "icon-gs-moto-checked"
      : "icon-gs-car-repair-checked",
  cockpitType: state => state.current.cockpitType,
  kpiByPeriodSingle: state => state.kpiByPeriodSingle.data,
  kpiByPeriodSingleLoading: state => state.kpiByPeriodSingle.loading,
  selectedPeriod: state => state.current.periodId,
  isSelectedPeriodLight: (state) => {
    if (state.current.periodId === 'lastQuarter') {
      return true;
    }
    return /20[0-9]{2}-month[01][1-9]/.test(state.current.periodId);
  },
  selectedDataType: state => state.current.dataTypeId,
  selectedLeadSaleType: (state) => state.current.leadSaleType,
  currentLeadSaleTypeSuffix: (state, getters) => {
    const suffixes = {
      [DataTypes.MAINTENANCE]: 'Apv',
      [DataTypes.NEW_VEHICLE_SALE]: 'Vn',
      [DataTypes.USED_VEHICLE_SALE]: 'Vo',
      [DataTypes.UNKNOWN]: 'Unknown',
    };
    return suffixes[getters.selectedLeadSaleType] || '';
  },
  selectedAutomationCampaignType: state => state.current.automationCampaignType,
  // For KPI we use this getter.
  authorizations: (state, getters) => {
    const garages = state.availableGarages;

    return {
      hasMaintenanceAtLeast: garages.some(
        g => g?.subscriptions?.Maintenance === true),
      hasLeadAtLeast: garages.some(
        g => g?.subscriptions?.Lead === true),
      hasCrossLeadsAtLeast: garages.some(
        g => g?.subscriptions?.CrossLeads === true),
      hasVnAtLeast: garages.some(
        g => g?.subscriptions?.NewVehicleSale === true),
      hasVoAtLeast: garages.some(
        g => g?.subscriptions?.UsedVehicleSale === true),
      hasViAtLeast: garages.some(
        g => g?.subscriptions?.VehicleInspection === true),
      hasEReputationAtLeast: garages.some(
        g => g?.subscriptions.EReputation === true),
      hasAutomationAtLeast: garages.some(
        g => g?.subscriptions?.Automation === true),
      currentHasEreputation:
        getters?.selectedGarage?.some(g=>g.subscriptions?.EReputation===true),
      currentHasCrossLeads:
        getters?.selectedGarage?.some(g=>g.subscriptions?.CrossLeads===true),
    };
  },
  canSubscribeToCrossLeads: state => {
    return state.availableGarages.filter(
      g => (
        (
          !g.subscriptions
          || (
            !g.subscriptions.CrossLeads
            && g.subscriptions.active
          )
        )
        && g.locale === 'fr_FR'
        && GarageTypes.hasAccessToCrossLeads(g.type)
      )
    );
  },
  canSubscribeToAutomation: state => (
    state.availableGarages.filter(
      g => (
        (
          !g.subscriptions
          || (
            !g.subscriptions.Automation
            && g.subscriptions.active
          )
        )
        && ['fr_FR', 'es_ES', 'ca_ES'].includes(g.locale)
        && GarageTypes.hasAccessToAutomation(g.type)
      )
    )
  ),
  canAccessToAutomation: state => {
    return state.availableGarages.filter(g => (
      ['fr_FR', 'es_ES', 'ca_ES'].includes(g.locale)
      && GarageTypes.hasAccessToAutomation(g.type)
    ));
  },

  kpi: state => state.kpi.data,
  garagesKpi: state => state?.kpi?.data?.garagesKpi || {},
  usersKpi: state => state?.kpi?.data?.usersKpi || {},
  garagesLeadsKpi: (state, getters) => {
    if (!getters.selectedLeadSaleType) {
      return getters.garagesKpi;
    }
    const keyHasNoSuffix = (key) => ['Apv', 'Vn', 'Vo', 'Unknown'].every(
      (s) => !key.includes(s)
    );

    return Object.fromEntries(
      Object.keys(getters.garagesKpi)
        .filter((key) => (
          key.includes('countLeads')
          && keyHasNoSuffix(key)
        ))
        .map((key) => [
          key,
          getters.garagesKpi[key + getters.currentLeadSaleTypeSuffix]
        ]),
    );
  },
  usersLeadsKpi: (state, getters) => {
    if (!getters.selectedLeadSaleType) {
      return getters.usersKpi;
    }
    const keyHasNoSuffix = (key) => ['Apv', 'Vn', 'Vo', 'Unknown'].every(
      (s) => !key.includes(s)
    );
    return Object.fromEntries(
      Object.keys(getters.usersKpi)
        .filter(
          (key) => (
            key.includes('countLeads')
            && keyHasNoSuffix(key)
          )
        )
        .map((key) => [
          key,
          getters.usersKpi[key + getters.currentLeadSaleTypeSuffix]
        ]),
    );
  },
  garagesUnsatisfiedKpi: (state, getters) => {
    const result = {};

    if (!getters.selectedDataType) {
      return getters.garagesKpi;
    }
    for (const key of Object.keys(getters.garagesKpi)) {
      if (
        key.includes('countUnsatisfied')
        && !key.includes('Apv')
        && !key.includes('Vn')
        && !key.includes('Vo')
      ) {
        if (getters.selectedDataType === 'Maintenance') {
          result[key] = getters.garagesKpi[`${ key }Apv`];
        } else if (getters.selectedDataType === 'NewVehicleSale') {
          result[key] = getters.garagesKpi[`${ key }Vn`];
        } else if (getters.selectedDataType === 'UsedVehicleSale') {
          result[key] = getters.garagesKpi[`${ key }Vo`];
        }
      }
    }
    return result;
  },
  usersUnsatisfiedKpi: (state, getters) => {
    const result = {};

    if (!getters.selectedDataType) {
      return getters.usersKpi;
    }
    for (const key of Object.keys(getters.usersKpi)) {
      if (
        key.includes('countUnsatisfied')
        && !key.includes('Apv')
        && !key.includes('Vn')
        && !key.includes('Vo')
      ) {
        if (getters.selectedDataType === 'Maintenance') {
          result[key] = getters.usersKpi[`${ key }Apv`];
        } else if (getters.selectedDataType === 'NewVehicleSale') {
          result[key] = getters.usersKpi[`${ key }Vn`];
        } else if (getters.selectedDataType === 'UsedVehicleSale') {
          result[key] = getters.usersKpi[`${ key }Vo`];
        }
      }
    }
    return result;
  },
  fromRowClickName: (state) => state?.fromRowClick?.name,
  cockpitTypeIsVI: (state) => state.current.cockpitType ===
    GarageTypes.VEHICLE_INSPECTION,
  selectedFrontDeskUserName: (state) => {
    return (
      state?.current?.dms?.garageId
      && state?.current?.dms?.frontDeskUserName !== 'ALL_USERS'
      && state?.current?.dms?.frontDeskUserName
    ) || null;
  },
  chart: state => cloneDeep(state.chart),
  componentsView: (state, getters, rootState) => (
    state.chart.components[rootState.route.name]
  ),
  pageHasActiveChartView: (state, getters, rootState) => {
    if (ChartHelper.isPageNameValid(rootState.route.name)) {
      return Object.values(state.chart.components[rootState.route.name]).some(
        component => component.view === 'chart'
      );
    }
    return false;
  },
  chartShouldRefreshData: state => state.chart.shouldRefreshData,
  generalStatsDatatype: (state, getters, rootState) => {
    const route = rootState.route.name;

    if (route.includes('automation')) {
      return state.current.automationCampaignType || 'ALL';
    } else if (route.includes('leads')) {
      return state.current.leadSaleType || 'ALL';
    }
    return state.current.dataTypeId || 'ALL';
  },
  customExports: (state) => state.customExports,
  availableFrontDeskUsers: (state) => state.availableFrontDeskUsers || [],
  availableDms: (state) => state.availableDms,
  garageSignatures: (state) => state.garageSignatures,
  selectedUser: (state) => state.current.user || 'ALL_USERS',
  getCurrentGarageId: (state) => state.current.garageIds,
  getCurrentPeriodId: (state) => state.current.periodId,
  getCurrentDMS: (state) => state.current.dms,
  availableUsers: (state) => state.availableUsers || [],
  getCurrentUser: (state) => state.current.user,
  getGarageFilterMode: (state)=> state.current.garageFilterMode
};

export const actions = {
  async sendContact({ state }, { form, context }) {
    const request = {
      name: 'contactSetContactToBeSent',
      args: {
        ...form,
        context,
      },
      fields: `
        status
        error
      `
    };
    const { data } = await makeApolloMutations([request]);
    return data.contactSetContactToBeSent.status;
  },
  async setLoading({ commit }, loading) {
    commit('setFiltersLoading', loading);
    commit('setKpiByPeriodSingleLoading', loading);
  },

  setLoadingForAutomationCustomContent({ state }, loading) {
    state.current.loadingForAutomationCustomContent = loading.value;
  },
  async syncRouteToState({ commit, state }, route) {
    if (route.query) {
      commit('cockpit/setCurrentCockpitType',
        route.query.cockpitType || GarageTypes.DEALERSHIP, { root: true });
      commit('cockpit/setCurrentDataTypeId', route.query.dataTypeId || null,
        { root: true });
      commit('cockpit/setCurrentLeadSaleType', route.query.leadSaleType || null,
        { root: true });
      commit('cockpit/setCurrentAutomationCampaignType',
        route.query.automationCampaignType || null, { root: true });
      commit('cockpit/setCurrentPeriodId',
        route.query.periodId || 'lastQuarter', { root: true });

      const currentDmsToSet = route.query.dms
        ? {
          frontDeskUserName: route.query.dms,
          garageId: route.query.garageId || null,
        }
        : { frontDeskUserName: 'ALL_USERS', garageId: null };
      commit('cockpit/setCurrentDms', currentDmsToSet, { root: true });

      commit(
        'cockpit/setCurrentUser',
        route.query.user || null,
        { root: true },
      );

      if (route.query.garageId) {
        commit(
          'cockpit/setCurrentGarageId',
          route.query.garageId,
          { root: true },
        );
        const currentGarage = state.availableGarages.find(
          (g) => g.id === route.query.garageId
        );
        if (currentGarage) {
          commit(
            'cockpit/setCurrentCockpitType',
            GarageTypes.getCockpitType(currentGarage.type),
            { root: true },
          );
        }
      } else {
        commit('cockpit/setCurrentGarageId', null, { root: true });
      }
    }
  },

  async initCockpit(
    { commit },
    { app, user, authToken, refresh, isCockpit, timeLog }
  ) {
    try {
      if (user) {
        /** Commits from FETCH_CURRENT_USER_CONTEXT */
        commit('auth/SET_IS_AUTHENTICATED', true, { root: true });
        // @TODO use getter, is a derivate state about data
        commit('auth/SET_IS_GARAGESCORE_USER',
          user?.email?.match(/@garagescore\.com|@custeed\.com/),
          { root: true });
        commit('auth/SET_IS_MAINTENANCE_USER',
          user?.email?.match(/hackers@(garagescore|custeed)\.com/),
          { root: true });
        if (user.authorization)
          commit('auth/SET_ACCESS', user.authorization, { root: true });

        if (isCockpit) {
          if (user.authRequest) {
            commit(
              'auth/SET_ACCESS_PENDING_REQUESTS',
              user.authRequest,
              { root: true },
            );
          }
          if (user.firstVisit) {
            commit('auth/SET_FIRST_VISITS', user.firstVisit, { root: true });
          }

          const context = await post(
            app,
            authToken,
            '/auth/fetchContext',
            { userId: user.id, refresh, timeLog },
            process.env.FFEUC_URL,
          );

          commit('auth/setIsManagerJob', context.isManagerJob, { root: true });
          commit(
            'auth/setIsPriorityProfile',
            context.isPriorityProfile,
            { root: true },
          );
          commit(
            'auth/SET_IS_CONCERNED_BY_MAKE_SURVEYS',
            context.isConcernedByMakeSurveys,
            { root: true },
          );
          commit('auth/SET_MAINTENANCE', !!context.maintenance, { root: true });

          commit(
            'profile/SET_GARAGES',
            context.allGarages.slice(0, 10),
            { root: true },
          );

          commit('profile/SET_USER_JOBS', context.userJobs, { root: true });

          if (context.analyticsConfig)
            commit('analytics/setConfig', { ...context.analyticsConfig });

          // So... allGarages & availableGarages are the same thing... lol
          commit('setAllGarages', context.allGarages);
          commit('setAvailableGarages', [...context.allGarages]);
          commit('setAvailablePeriods', context.periods);
          commit('setGeneralStats', context.generalStats);
        }
      }
    } catch (e) {
      console.error(e);
      return false;
    }
    return true;
  },

  setFromRowClick({ commit }, route) {
    commit('setFromRowClick', route);
  },


  async fetchKpiByPeriodSingle({ commit, state, rootState }) {
    commit('setKpiByPeriodSingleLoading', true);
    const garageIdTemp = state.current.dms.garageId || state.current.garageIds;
    const request = {
      name: 'kpiByPeriodGetSingle',
        args: {
          periodId: state.current.periodId,
          garageId: garageIdTemp,
          type: state.current.dataTypeId,
          cockpitType: rootState.cockpit.current.cockpitType,
          frontDesk: state.current.dms.frontDeskUserName
        },
        fields:
        ` totalShouldSurfaceInCampaignStats
            countEmails
            countSurveys
            countReceivedSurveys
            countSurveysResponded
            countSurveySatisfied
            countSurveyUnsatisfied
            countSurveyLead
            countSurveyLeadVo
            countSurveyLeadVn
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
        `,
    };
    const resp = await makeApolloQueries([request]);

    commit('setKpiByPeriodSingle', resp.data.kpiByPeriodGetSingle);
    commit('setKpiByPeriodSingleLoading', false);
  },

  async fetchSingleFilter(
    { commit, state },
    {
      filterToFetch,
      garageIds,
      cockpitType,
      type,
      source,
      leadSaleType,
      ticketType,
    },
  ) {
    const request = {
      name: 'cockpitTopFiltersGetCockpitFilters',
      fields:
        `
          garageId
          garageType
          type
          source
          automationCampaignType
          frontDeskUserName {
            frontDeskUserName
            garageId
            type
          }
          leadSaleType
          manager {
            name
            userId
          }
        `,
      args: {
        filterToFetch,
        garageId: garageIds,
        cockpitType,
        type,
        source,
        leadSaleType,
        ticketType,
      },
    };

    const resp = await makeApolloQueries([request]);
    const result = resp.data.cockpitTopFiltersGetCockpitFilters;
    switch (filterToFetch) {
      case 'garageId':
        if (result.garageId.length > 0) {
          commit('setAvailableGarages',
            state.allGarages.filter(g => result.garageId.includes(g.id)));
        } else {
          commit('setAvailableGarages', [...state.allGarages]);
        }
        break;
      case 'cockpitType':
        break;
      case 'source':
        break;
      case 'frontDeskUserName':
        commit('setAvailableDms', result.frontDeskUserName);
        break;
      case 'manager':
        result.manager =
          (result.manager && result.manager.filter(e => e.name)) || [];
        commit('setAvailableUsers', result.manager);
        if (result.manager.length === 0) {
          commit('setCurrentUser', null);
        }
        break;
    }
  },

  async fetchFilters({ commit, state, rootState, dispatch }) {
    // We first gather all arguments
    let garageIds = null;

    garageIds = state.current.dms.garageId || state.current.garageIds || undefined;
    garageIds = Array.isArray(garageIds) ? garageIds : [garageIds]

    const cockpitType = rootState.cockpit.current.cockpitType || undefined;
    // dataTypeId is null when 'All' is selected, do not fallback to undefined
    const type = state.current.dataTypeId;
    const leadSaleType = state.current.leadSaleType || undefined;
    const ticketType = rootState.route.name.includes('cockpit-leads')
      ? 'lead'
      : 'unsatisfied';
    // filterToFetch: { type: graphql.GraphQLString } // garageId, garageType, type, frontDeskUserName, leadSaleType, manager, source
    const actions = [];
    switch (rootState.route.name) {
      //-----------
      // Satisfaction
      case "cockpit-satisfaction-reviews":
      case "cockpit-satisfaction-team":
        actions.push(
          dispatch(
            "fetchSingleFilter",
            {
              filterToFetch: "frontDeskUserName",
              garageIds,
              cockpitType,
              type,
            },
          )
        );
        break;
      // ------------------
      // Unsatisfied
      case "cockpit-unsatisfied-reviews":
      case "cockpit-unsatisfied-team":
        actions.push(
          dispatch(
            "fetchSingleFilter",
            {
              filterToFetch: "manager",
              garageIds,
              cockpitType,
              type,
              ticketType,
            },
          )
        );
        break;
      // ------------------
      // Leads
      case "cockpit-leads-reviews":
      case "cockpit-leads-team":
      case "cockpit-leads-followed":
        actions.push(
          dispatch(
            "fetchSingleFilter",
            {
              filterToFetch: "manager",
              garageIds,
              cockpitType,
              leadSaleType,
              ticketType,
            },
          )
        );
        break;
      // Contacts
      case "cockpit-contacts-team":
      case "cockpit-contacts-reviews":
        actions.push(
          dispatch(
            "fetchSingleFilter",
            {
              filterToFetch: "frontDeskUserName",
              garageIds,
              cockpitType,
              type,
            },
          )
        );
        break;
    }
    return new Promise(resolve => {
      commit('setFiltersLoading', true);
      Promise.all(actions).then(() => {
        commit('setFiltersLoading', false);
        resolve();
      }).catch((e) => {
        console.error('FiltersLoading error', e);
        commit('setFiltersLoading', false);
        resolve();
      });
    });
  },

  async fetchKpi({ commit, state }, followed) {
    commit('setKpiLoading', true);
    const request = {
        name: 'kpiByPeriodGetKpi',
        args: {
            periodId: state.current.periodId,
            garageId: state.current.garageIds,
            cockpitType: state.current.cockpitType,
            userId: state.current.user,
            ...(followed ? { kpiType: KpiTypes.AGENT_GARAGE_KPI } : {})
        },
        fields:
        `garagesKpi {
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
            usersKpi {
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
            }`,
    };
    const { data } = await makeApolloQueries([request]);
    commit('setKpi', data.kpiByPeriodGetKpi);
    commit('setKpiLoading', false);
  },

  async fetchChartData({ rootState, commit, state, getters }, route) {

    /*
      if no chart is displayed, we don't fetch. However we indicate that the data needs to be fetched again when a chart is displayed
      because it has been called from a refreshView function (top filters has changed)
    */
    const pageHasActiveChartView = getters['pageHasActiveChartView'];
    if (!pageHasActiveChartView) {
      return commit('setChartShouldRefreshData', true);
    }

    /* set loading status for charts in current page */
    const currentRoute = route || rootState.route.name;
    commit('setChartComponentsLoading', { currentRoute, loading: true });

    try {
      /* leads pages */
      if (currentRoute.startsWith('cockpit-leads')) {

        const request = ChartHelper.buildRequestLeads(currentRoute,
          state.current);
        const res = await makeApolloQueries([request]);
        commit('updatePageChartData', {
          page: currentRoute,
          data: res.data.kpiByPeriodGetChartData.lead.data,
          generalStatsDataType: getters['generalStatsDatatype'],
        });
      }
      /* unsatisfied pages */
      else if (currentRoute.startsWith('cockpit-unsatisfied')) {

        const request = ChartHelper.buildRequestUnsatisfied(currentRoute,
          state.current);
        const res = await makeApolloQueries([request]);

        commit('updatePageChartData', {
          page: currentRoute,
          data: res.data.kpiByPeriodGetChartData.unsatisfied.data,
          generalStatsDataType: getters['generalStatsDatatype'],
        });
      }
      /* satisfaction pages */
      else if (currentRoute.startsWith('cockpit-satisfaction')) {

        const request = ChartHelper.buildRequestSatisfaction(currentRoute,
          state.current, getters['selectedFrontDeskUserName']);
        const res = await makeApolloQueries([request]);

        commit('updatePageChartData', {
          page: currentRoute,
          data: res.data.kpiByPeriodGetChartData.satisfaction.data,
          generalStatsDataType: getters['generalStatsDatatype'],
        });
      }
      /* contacts pages */
      else if (currentRoute.startsWith('cockpit-contacts')) {

        const request = ChartHelper.buildRequestContact(currentRoute,
          state.current, getters['selectedFrontDeskUserName']);
        const res = await makeApolloQueries([request]);

        commit('updatePageChartData', {
          page: currentRoute,
          data: res.data.kpiByPeriodGetChartData.contacts.data,
          generalStatsDataType: getters['generalStatsDatatype'],
        });
      }
      /* eReputation pages */
      else if (currentRoute.startsWith('cockpit-e-reputation')) {
        const request = ChartHelper.buildRequestEreputation(
          currentRoute,
          state.current,
        );
        if (request) {
          const res = await makeApolloQueries([request]);
          const erepData = res?.data?.kpiByPeriodGetChartData?.ereputation?.data;
          if (erepData) {
            commit('updatePageChartData', {
              page: currentRoute,
              data: erepData,
              generalStatsDataType: getters['generalStatsDatatype'],
            });
          }
        }
      }
      /* automation pages */
      else if (currentRoute.startsWith('cockpit-automation')) {

        const request = ChartHelper.buildRequestAutomation(currentRoute,
          state.current);
        const res = await makeApolloQueries([request]);

        commit('updatePageChartData', {
          page: currentRoute,
          data: res.data.kpiByPeriodGetChartData.automation.data,
          generalStatsDataType: getters['generalStatsDatatype'],
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      commit('setChartShouldRefreshData', false);
      commit('setChartComponentsLoading', { currentRoute, loading: false });
    }
  },

  changeCurrentCockpitType(
    { commit, dispatch, getters },
    cockpitType,
  ) {
    commit('setCurrentCockpitType', cockpitType);
    const newAvailableGarages = getters.availableGarages;
    commit(
      'setCurrentGarageId',
      newAvailableGarages.length === 1 ? newAvailableGarages[0].id : null,
    );
    commit('setCurrentDataTypeId', null);
    dispatch('refreshRouteParameters');
  },

  changeCurrentDataTypeId({ commit, dispatch, state }, dataTypeId) {
    commit('setLastFilterChange', 'type');
    commit('setCurrentDataTypeId', dataTypeId);

    if (dataTypeId === null) {
      state.current.dms = { frontDeskUserName: 'ALL_USERS', garageId: null };
    }

  },
  changeCurrentLeadSaleType({ commit, dispatch }, leadSaleType) {
    commit('setLastFilterChange', 'leadSaleType');
    commit('setCurrentLeadSaleType', leadSaleType);
  },
  changeCurrentAutomationCampaignType(
    { commit, dispatch }, automationCampaignType) {
    commit('setLastFilterChange', 'automationCampaignType');
    commit('setCurrentAutomationCampaignType', automationCampaignType);
  },

  changeCurrentDms({ commit, dispatch }, dms) {
    commit('setLastFilterChange', 'frontDeskUserName');
    commit('setCurrentDms', dms);
  },

  changeCurrentUser({ commit, dispatch }, userId, blockLastFilterChange) {
    if (!blockLastFilterChange) {
      commit('setLastFilterChange', 'manager');
    }
    commit('setCurrentUser', userId);
  },

  changeCurrentPeriod({ commit, dispatch, getters }, periodId) {
    commit('setLastFilterChange', 'period');
    commit('setCurrentPeriodId', periodId);
    // if (!getters.isSelectedPeriodLight) {
    //   dispatch('flushBottomFilters');
    // }
    dispatch('refreshRouteParameters');
  },

  changeCurrentGarage({ commit, dispatch, getters }, garageIds) {
    commit("setLastFilterChange", "garageId");
    commit("setCurrentGarageId", garageIds);
    commit("setCurrentUser", null);
    // if (garageIds === null && getters.availableGarages.length > 10) {
    //   dispatch("flushBottomFilters");
    // }
    dispatch('refreshRouteParameters');
  },

  async changeCurrentFrontDeskUserName(
    { commit, dispatch },
    frontDeskUserName,
  ) {
    commit('setLastFilterChange', 'frontDeskUserName');
    commit('setCurrentFrontDeskUserName', frontDeskUserName);
  },

  refreshRouteParameters({ state, dispatch }, queryParameters) {
    const garageIdsTemp = (state.current.dms && state.current.dms.garageId && [state.current.dms.garageId]) || state.current.garageIds || undefined;

    let urlParams = {
      cockpitType: state.current.cockpitType || undefined,
      periodId: state.current.periodId || undefined,
      garageIds: garageIdsTemp,
      dataTypeId: state.current.dataTypeId || undefined,
      leadSaleType: state.current.leadSaleType || undefined,
      automationCampaignType: state.current.automationCampaignType || undefined,
      dms: (state.current.dms && state.current.dms.frontDeskUserName) ||
        undefined,
      user: state.current.user || undefined,
      startDate: state.current.startDate || undefined,
      endDate: state.current.endDate || undefined,
    };
    try {
      this.$router.replace({
        query: { ...urlParams, ...(queryParameters ? queryParameters : {}) },
      });
    } catch (e) {
      console.error(e);
    }
  },

  async addTicketAction( // Only unsatisfied now
    { dispatch, rootState, state },
    { id, action, comment, reminder, transferTo, closeReason },
  ) {
    const ticket = state.unsatisfied.unsatisfiedTicket;

    const args = {
      id,
      name: action,
      createdAt: new Date(),
      type: 'unsatisfied',
      assignerUserId: rootState.auth.currentUser.id,
      comment: comment,
      alertContributors: false,
    };

    // transfer
    if (action === 'transfer') {
      args.previousTicketManagerId = ticket.manager ? ticket.manager.id : null;
      args.ticketManagerId = transferTo;
    }

    // first action assign people
    if (!ticket.manager && !args.ticketManagerId) {
      args.ticketManagerId = rootState.auth.currentUser.id;
    }

    // closing details
    if (action === 'unsatisfiedClosed') {
      const solution = state.unsatisfied.solutionOptions.find(
        e => e.value === closeReason,
      );
      const claim = state.unsatisfied.claimOptions.find(
        e => e.value === closeReason,
      );

      args.unsatisfactionResolved = solution !== undefined;
      args.providedSolutions = solution ? [solution.value] : null;
      args.claimReasons = claim ? [claim.value] : null;
    }

    // reminder management
    if (reminder &&
      !['transfer', 'unsatisfiedClosed', 'unsatisfiedReopened'].includes(
        action)) {
      args.name = 'reminder';
      args.reminderFirstDay = Math.floor(
        this.$moment.duration(this.$moment(reminder).valueOf()).asDays(),
      );
      args.reminderNextDay = Math.floor(
        this.$moment.duration(this.$moment(reminder).valueOf()).asDays(),
      );
      args.reminderActionName = action;
      args.reminderStatus = 'NotResolved';
      args.reminderDate = reminder;
    }

    const request = {
      name: 'dataSetAction',
      args,
      fields: `
        message
        status
      `,
    };
    const resp = await makeApolloMutations([request]);

    if (resp.data.dataSetAction.status === 'OK') {
      dispatch(`unsatisfied/onAfterAddTicketAction`, {
        id: args.id,
        fetchTicketManager: args.ticketManagerId !== null,
        fetchTicketStatus: [
          'unsatisfiedClosed',
          'unsatisfiedReopened'].includes(action),
      });
    }
    return resp.data.dataSetAction.status === 'OK';
  },

  async cancelReminder({ dispatch, rootState }, { id, type, actionCreatedAt }) {
    const request = {
      name: 'dataSetCancelReminder',
      args: {
        id,
        userId: rootState.auth.currentUser.id,
        createdAt: actionCreatedAt,
        ticketType: type,
      },
      fields: `
        status
      `,
    };
    const resp = await makeApolloMutations([request]);

    if (resp.data.dataSetCancelReminder.status) {
      const actionPrefix = type === 'lead' ? 'leads' : 'unsatisfied';
      dispatch(`${ actionPrefix }/onAfterCancelReminder`, { id });
    }

    return resp.data.dataSetCancelReminder.status;
  },

  changeGaragesSubscription({ commit }, { authorization, val }) {
    commit('setGaragesSubscription', { [authorization]: val });
  },

  async startExport(
    { state, rootState },
    {
      exportName = '',
      selectedExportType,
      selectedDataTypes,
      selectedGarages,
      selectedPeriod,
      selectedStartPeriod,
      selectedEndPeriod,
      selectedFields,
      selectedRecipients,
      selectedFrontDeskUsers,
      adminFilterRole,
      adminFilterJob,
      adminFilterLastCockpitOpenAt,
      adminSearch,
      exportConfigurationId = null,
      selectedFrequency,
      selectedAutomationCampaigns
    },
  ) {
    const exportRequest = {
      name: 'CockpitExport',
      fields:
        `
          status
          message
          data {
            recipients
          }
        `,
      args: {
        exportName,
        exportType: selectedExportType,
        dataTypes: selectedDataTypes,
        garageIds: selectedGarages,
        periodId: selectedPeriod,
        startPeriodId: selectedStartPeriod,
        endPeriodId: selectedEndPeriod,
        fields: selectedFields,
        recipients: selectedRecipients,
        ...(ExportHelper.exportTypeIsFrontDeskUsers(selectedExportType) && {
          frontDeskUsers: selectedFrontDeskUsers,
          cockpitType: state.current.cockpitType,
        }),
        ...(selectedExportType === ExportTypes.ADMIN_USERS &&
          { adminFilterRole, adminFilterJob, adminFilterLastCockpitOpenAt }),
        ...([ExportTypes.ADMIN_USERS, ExportTypes.ADMIN_GARAGES].includes(
          selectedExportType) && { adminSearch }),
        exportConfigurationId,
        frequency: selectedFrequency,
        isBackdoor: rootState.auth.isBackdoor,
        ...(ExportHelper.exportTypeIsAutomation(selectedExportType) && {
          selectedAutomationCampaigns,
          automationCampaignType: state.current.automationCampaignType,
        }),
      }
    };

    const res = await makeApolloQueries([exportRequest]);
    const { status, message, data } = res.data[exportRequest.name];

    if (res.errors || status === 'error') {
      throw new Error(`[${ exportRequest.name }] : ${ message }`);
    }
    return data;
  },

  initChartComponentsView({ rootState, state, commit, dispatch }) {
    // TODO removed this when all charts migrated of store
    /* check if localStorage can be used */
    let enabled;
    if (state.isLocalStorageEnabled === null) {
      enabled = LocalStorageHelper.isEnabled();
      commit('setLocalStorageEnabled', enabled);
    }

    /* if localStorage can be used, we validate it then use it to set the components view */
    if (enabled) {
      const localStorageContent = LocalStorageHelper.getConfigFromLocalStorage();
      /* compare currentState vs localStorage, if the view is different , we switch the component view */
      for (const route in localStorageContent) {
        for (const componentName in localStorageContent[route]) {
          const view = deep(localStorageContent,
            `${ route }.${ componentName }.view`);

          if (deep(state.chart.components, `${ route }.${ componentName }.view`) !==
            view) {
            commit('setComponentView', { route, componentName, view });
          }
        }
      }
      /* fetch chart data for current route */
      dispatch('fetchChartData', rootState.route.name);
    }
  },

  async changeComponentView(
    { commit, rootState, getters, dispatch, state },
    { route, componentName, view }) {
    const shouldRefreshData = getters['chartShouldRefreshData'];
    const currentRoute = route || rootState.route.name;
    commit('setComponentView', { route: currentRoute, componentName, view });
    if (state.isLocalStorageEnabled) {
      LocalStorageHelper.setChartConfigInLocalStorage(getters['chart']);
    }
    /* fetch data only if the view is switched to chart and data needs to be updated (topFilters has changed) */
    if (view === 'chart' && shouldRefreshData) {
      await dispatch('fetchChartData', currentRoute);
    }
  },

  async fetchCustomExports({ state, commit }) {
    const requestName = 'cockpitExportsConfigurationGet';
    const request = {
      name: requestName,
      fields: `
        status
        message
        data {
          id
          userId
          exportType
          periodId
          startPeriodId
          endPeriodId
          frequency
          dataTypes
          garageIds
          fields
          name
          recipients
          frontDeskUsers {
            id
            frontDeskUserName
            garageId
            garagePublicDisplayName
          }
        }
      `,
      args: {
        userId: state.current.user,
      },
    };

    const res = await makeApolloQueries([request]);

    const { status, message, data } = res.data[requestName];

    if (res.errors || status === 'error') {
      throw new Error(`[${ requestName }] : ${ message }`);
    }
    commit('setCustomExports', { data });
    commit('updateModalProp', { name: 'customExports', value: data },
      { root: true });
  },

  async saveCustomExport(
    { commit, state },
    {
      userId,
      name,
      exportType,
      dataTypes,
      garageIds,
      periodId,
      startPeriodId,
      endPeriodId,
      frequency,
      fields,
      recipients,
      frontDeskUsers,
    },
  ) {

    let fallbackDataTypes = dataTypes;
    if (dataTypes && Array.isArray(dataTypes) && !dataTypes.length) {
      fallbackDataTypes = ['All'];
    }

    const requestName = 'cockpitExportsConfigurationAddOne';
    const request = {
      name: requestName,
      fields:
        `
        status
        message
        data {
          id
        }
      `,
      args: {
        userId,
        name,
        exportType,
        dataTypes: fallbackDataTypes,
        garageIds,
        periodId,
        startPeriodId,
        endPeriodId,
        frequency: frequency || ExportFrequencies.NONE,
        fields,
        recipients,
        ...(ExportHelper.exportTypeIsFrontDeskUsers(exportType) &&
          { frontDeskUsers }),
      },
    };

    const res = await makeApolloMutations([request]);
    const { status, message, data } = res.data[requestName];

    if (res.errors || status === 'error') {
      throw new Error(`[${ requestName }] : ${ message }`);
    }

    commit('setCustomExports', {
      data: [
        ...state.customExports, {
          userId,
          name,
          exportType,
          dataTypes: fallbackDataTypes,
          garageIds,
          periodId,
          startPeriodId,
          endPeriodId,
          frequency: frequency || ExportFrequencies.NONE,
          fields,
          recipients,
          ...(ExportHelper.exportTypeIsFrontDeskUsers(exportType) &&
            { frontDeskUsers }),
          id: data.id,
        }],
    });
  },

  async updateCustomExport(
    { commit, state },
    {
      id,
      userId,
      name,
      exportType,
      dataTypes,
      garageIds,
      periodId,
      startPeriodId,
      endPeriodId,
      frequency,
      fields,
      recipients,
      frontDeskUsers,
    },
  ) {
    let fallbackDataTypes = dataTypes;
    if (dataTypes && Array.isArray(dataTypes) && !dataTypes.length) {
      fallbackDataTypes = ['All'];
    }

    const requestName = 'cockpitExportsConfigurationUpdateOne';
    const request = {
      name: requestName,
      fields:
        `
        status
        message
        data {
          id
        }
      `,
      args: {
        id,
        userId,
        name,
        exportType,
        dataTypes: fallbackDataTypes,
        garageIds,
        periodId: periodId === 'CustomPeriod' ? null : periodId,
        startPeriodId,
        endPeriodId,
        frequency: frequency || ExportFrequencies.NONE,
        fields,
        recipients,
        ...(ExportHelper.exportTypeIsFrontDeskUsers(exportType) &&
          { frontDeskUsers }),
      },
    };

    const res = await makeApolloMutations([request]);
    const { status, message } = res.data[requestName];

    if (res.errors || status === 'error') {
      throw new Error(`[${ requestName }] : ${ message }`);
    }

    commit('deleteCustomExports', { id });
    commit('setCustomExports', {
      data: [
        ...state.customExports, {
          userId,
          name,
          exportType,
          dataTypes: fallbackDataTypes,
          garageIds,
          periodId,
          startPeriodId,
          endPeriodId,
          frequency: frequency || ExportFrequencies.NONE,
          fields,
          recipients,
          ...(ExportHelper.exportTypeIsFrontDeskUsers(exportType) &&
            { frontDeskUsers }),
          id,
        }],
    });
  },

  async deleteCustomExport({ commit }, { id }) {
    const requestName = 'cockpitExportsConfigurationDeleteOne';
    const request = {
      name: requestName,
      fields: `
        status
        message
        data {
          id
        }
      `,
      args: {
        id: id,
      },
    };

    const res = await makeApolloMutations([request]);
    const { status, message, data } = res.data[requestName];

    if (res.errors || status === 'error') {
      throw new Error(`[${ requestName }] : ${ message }`);
    }

    commit('deleteCustomExports', { id: data.id });
  },

  async exportGetAvailableFrontDeskUsers(
    { commit }, { garageIds = [], dataTypes = [], frontDeskUsersType = null }) {

    const names = {
      [ExportTypes.FRONT_DESK_USERS_DMS]: 'cockpitTopFiltersGetFrontDeskUsersDms',
      [ExportTypes.FRONT_DESK_USERS_CUSTEED]: 'cockpitTopFiltersGetFrontDeskUsersCusteed',
    };

    const queryName = names[frontDeskUsersType] || '';

    const request = {
      name: queryName,
      fields:
        `
            id
            frontDeskUserName
            garageId
            garagePublicDisplayName
        `,
      args: {
        garageIds: garageIds,
        dataTypes: dataTypes,
      },
    };
    const resp = await makeApolloQueries([request]);
    const groupedByFrontDeskUserName = groupBy(resp.data[queryName], 'id');

    const formated = [];
    for (const frontDeskUserName in groupedByFrontDeskUserName) {
      groupedByFrontDeskUserName[frontDeskUserName].forEach(
        (frontDesk, i, arr) => {
          frontDesk && formated.push({
            value: {
              id: frontDesk.id,
              frontDeskUserName: frontDesk.frontDeskUserName,
              garageId: frontDesk.garageId,
              garagePublicDisplayName: frontDesk.garagePublicDisplayName,
            },
            label: `${ frontDesk.frontDeskUserName }${ arr.length > 1
              ? ` - ${ frontDesk.garagePublicDisplayName }`
              : '' }`,
            $isDisabled: false,
            trackId: ExportHelper.buildTrackId(frontDesk.id,
              frontDesk.garageId),
          });
        });
    }

    commit('setAvailableFrontDeskUsers', { data: formated });
    commit('updateModalProp',
      { name: 'availableFrontDeskUsers', value: formated }, { root: true });
  },

  async createTag({ state, commit, dispatch }, { garageIds = [], tag = '' }) {
    const requestName = 'garageSetTag';
    const request = {
      name: requestName,
      fields:
        `
          status
          message
        `,
      args: {
        garageIds,
        tag
      }
    };
    const resp = await makeApolloMutations([request]);
    const { status, message } = resp.data[requestName];
    if (resp.errors || status === 'error') {
      throw new Error(`[${requestName}] : ${message}`);
    }

    commit('addTag', { tag, garageIds })

    dispatch('setCurrentFiltersGaragesSelected', { garageIds });
  },
  async updateTag({ commit }, { garageIds = [], currentTag = '', newTag = '' }) {
    const requestName = 'garageUpdateTag';
    const request = {
      name: requestName,
      fields:
        `
          status
          message
        `,
      args: {
        garageIds,
        currentTag,
        newTag
      }
    };

    const resp = await makeApolloMutations([request]);
    const { status, message } = resp.data[requestName];

    if (resp.errors || status === 'error') {
      throw new Error(`[${requestName}] : ${message}`);
    }

    commit('updateTag', { garageIds, currentTag, newTag });
  },
  async deleteTag({ commit }, tag) {
    const requestName = 'garageRemoveTag'
    const request = {
      name: requestName,
      fields:
        `
          status
          message
        `,
      args: {
        tag
      }
    };
    const resp = await makeApolloMutations([request]);
    const { status, message } = resp.data[requestName];

    if (resp.errors || status === 'error') {
      throw new Error(`[${requestName}] : ${message}`);
    }
    commit('deleteTag', tag)
  },
  setCurrentFiltersGaragesSelected({ commit, state, dispatch, getters }, { garageIds}) {
    let garageIdsTemp = null;
    let garagesSelectedTemp = [];

    if (garageIds?.length) {
      const areAllGaragesSelected = (
        garageIds === null
        || garageIds?.length === 0
        ||garageIds.length === getters.availableGarages?.length
      );
      garageIdsTemp = areAllGaragesSelected
        ? null
        : garageIds;
      garagesSelectedTemp = garageIds;
    }
    dispatch("changeCurrentGarage", garageIdsTemp);
  },
  async fetchGarageSignatures({ commit } ) {
    const request = {
      name: 'garageGetGaragesSignatures',
      fields: `
        _id
        lastName
        firstName
        job
        group
      `,
    };
    const resp = await makeApolloQueries([request]);
    if (resp && resp.data && resp.data.garageGetGaragesSignatures)
      commit('setGarageSignatures', resp.data.garageGetGaragesSignatures);
  },
  async setCurrentGarageFilterMode({ commit }, value) {
    commit('setGarageFilterMode', value)
  },
};

export const mutations = {
  setFromRowClick(state, value) {
    state.fromRowClick = value;
  },

  setAvailablePeriods(state, availablePeriods) {
    availablePeriods = availablePeriods || [];
    state.availablePeriods = availablePeriods.filter(p => p && p.id !== '2018'); // Quick filter to hide 2018 for now (lag)
  },

  setGeneralStats(state, generalStats) {
    state.generalStats = generalStats;
  },

  setAvailableDms(state, availableDms) {
    availableDms = availableDms || [];
    // state.availableDms = [...availableDms, {frontDeskUserName: 'ALL_USERS', garageId: null}]
    state.availableDms = availableDms;
    if (
      !state.availableDms.find(
        e => e.frontDeskUserName === state.current.dms.frontDeskUserName,
      )
    ) {
      state.current.dms = { frontDeskUserName: 'ALL_USERS', garageId: null };
    }
  },

  setAvailableUsers(state, availableUsers) {
    availableUsers = availableUsers || [];
    state.availableUsers = [...availableUsers];
    if (!state.availableUsers.find(e => e.userId === state.current.user)) {
      state.current.user = null;
    }
  },

  setAvailableDataTypes(state, availableDataTypes) {
    availableDataTypes = availableDataTypes || [];
    state.availableDataTypes = availableDataTypes.map(e => {
      return { id: e };
    });
    const OptionsLeadSaleTypes = state.availableDataTypes.filter(type =>
      [
        DataTypes.MAINTENANCE,
        DataTypes.NEW_VEHICLE_SALE,
        DataTypes.USED_VEHICLE_SALE,
      ].includes(type.id),
    );
    if (
      !state.availableDataTypes.find(e => e.id === state.current.dataTypeId)
    ) {
      state.current.dataTypeId = null;
    }
    if (OptionsLeadSaleTypes.length === 1) {
      state.current.dataTypeId = OptionsLeadSaleTypes[0].id;
    }
  },
  setAvailableLeadSaleTypes(state, availableLeadSaleTypes = []) {

    state.availableLeadSaleTypes = availableLeadSaleTypes.map(
      (type) => ({ id: type }));
    const OptionsLeadSaleTypes = state.availableLeadSaleTypes.filter(
      (type) => LeadSaleTypes.hasValue(type.id));
    if (!state.availableLeadSaleTypes.find(
      (type) => type.id === state.current.leadSaleType)) {
      state.current.leadSaleType = null;
    }
    if (OptionsLeadSaleTypes.length === 1) {
      state.current.leadSaleType = OptionsLeadSaleTypes[0].id;
    }
  },
  setAvailableAutomationCampaignTypes(state, availableAutomationCampaignTypes) {
    availableAutomationCampaignTypes = availableAutomationCampaignTypes || [];
    state.availableAutomationCampaignTypes = availableAutomationCampaignTypes.map(
      e => {
        return { id: e };
      });
    const OptionsLeadSaleTypes = state.availableAutomationCampaignTypes.filter(
      type =>
        [
          AutomationCampaignTypes.AUTOMATION_MAINTENANCE,
          AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE,
          AutomationCampaignTypes.AUTOMATION_NEW_VEHICLE_SALE,
          AutomationCampaignTypes.AUTOMATION_USED_VEHICLE_SALE,
          AutomationCampaignTypes.AUTOMATION_VEHICLE_INSPECTION,
        ].includes(type.id),
    );
    if (!state.availableAutomationCampaignTypes.find(
      e => e.id === state.current.automationCampaignType)) {
      state.current.automationCampaignType = null;
    }
    if (OptionsLeadSaleTypes.length === 1) {
      state.current.automationCampaignType = OptionsLeadSaleTypes[0].id;
    }
  },

  setAllGarages(state, garages) {
    garages = garages || [];
    state.allGarages = garages;
  },

  setAvailableGarages(state, garages) {
    state.availableGarages = garages;
    if (garages[0])
      state.current.cockpitType = GarageTypes.getCockpitType(garages[0].type);
    const newAvailableGarages =
      (garages &&
        garages.filter(
          g => GarageTypes.getCockpitType(g.type) === state.current.cockpitType,
        )) ||
      [];
    if (newAvailableGarages.length === 1) {
      state.current.garageIds = [garages[0].id];
      state.current.garageType = garages[0].type;
    }
    state.availableCockpitTypes = [];
    for (const garage of garages) {
      /** If it's not a valid cockpit type, fallback to dealership. Example: "Agent" will use a "Dealership" cockpit **/
      const type = GarageTypes.getCockpitType(garage.type);
      if (!state.availableCockpitTypes.includes(type))
        state.availableCockpitTypes.push(type);
    }
  },

  setCurrentPeriodId(state, periodId) {
    state.current.periodId = periodId;
  },

  setCurrentGarageId(state, garageIds) {
    const garageTemp = !garageIds || Array.isArray(garageIds) ? garageIds : [garageIds];
    const allGarages = !garageIds
    const isDifferentGarageIds = garageIds && garageIds.length && !isEqual(state.current.garageIds, garageTemp);

    if (!state.current.garageIds || allGarages || isDifferentGarageIds) {
      state.current.dms = { frontDeskUserName: "ALL_USERS", garageId: null };
      state.current.garageIds = garageTemp;
    }
  },
  setCurrentFrontDeskUserName(state, frontDeskUserName) {
    state.current.dms = {
      ...state.current.dms,
      frontDeskUserName: frontDeskUserName,
    };
  },

  setLastFilterChange(state, change) {
    state.current.lastChanged = change;
  },

  /*  setCurrentDateFilter(state, data) {
      state.current.startDate = data.startDate;
      state.current.endDate = data.endDate;
    },*/

  setCurrentOrigin(state, origin) {
    state.origin = origin;
  },

  setCurrentCockpitType(state, cockpitType) {
    state.current.cockpitType = cockpitType;
  },

  setCurrentDataTypeId(state, dataTypeId) {
    state.current.dataTypeId = dataTypeId;
  },
  setCurrentLeadSaleType(state, leadSaleType) {
    state.current.leadSaleType = leadSaleType;
  },
  setCurrentAutomationCampaignType(state, automationCampaignType) {
    state.current.automationCampaignType = automationCampaignType;
  },

  setCurrentDms(state, dms) {
    state.current.dms = dms;
    if (dms.garageId) {
      const garageTemp = Array.isArray(dms.garageId) ? dms.garageId : [dms.garageId]
      state.current.garageIds = garageTemp;
    }
  },

  setCurrentUser(state, userId) {
    state.current.user = userId; // state.availableUsers.find((user) => user.userId === userId) || { name: 'ALL', userId: null };
  },

  setUserGroups(state, userGroups) {
    state.userGroups = userGroups;
  },

  setShowCase(state, widgetShowCase) {
    state.widgetShowCase = widgetShowCase;
  },

  setKpiByPeriodSingle(state, data) {
    state.kpiByPeriodSingle.data = data;
  },

  setKpi(state, data) {
    Vue.set(state.kpi, 'data', data);
  },

  setKpiByPeriodSingleLoading(state, loading) {
    state.kpiByPeriodSingle.loading = loading;
  },

  setFiltersLoading(state, loading) {
    state.filters.loading = loading;
  },

  setKpiLoading(state, loading) {
    state.kpi.loading = loading;
  },

  setGaragesSubscription(state, authorizations) {
    for (const garage of state.availableGarages) {
      if (!garage.subscriptions) {
        Vue.set(garage, 'subscriptions', {});
      }
      for (const authorization of Object.keys(authorizations)) {
        Vue.set(
          garage.subscriptions,
          authorization,
          authorizations[authorization],
        );
      }
    }
  },
  setLocalStorageEnabled(state, value = false) {
    state.isLocalStorageEnabled = !!value;
  },
  setComponentView(state, { route, componentName, view }) {
    if (ChartHelper.isPageComponentNameValid(route, componentName)) {
      Vue.set(state.chart.components[route][componentName], 'view', view);
    }
  },
  setChartComponentsLoading(state, { currentRoute, loading }) {
    const components = Object.keys(state.chart.components[currentRoute]);
    for (const component of components) {
      Vue.set(state.chart.components[currentRoute][component], 'loading',
        loading);
    }
  },
  setChartShouldRefreshData(state, shouldRefreshData = false) {
    state.chart.shouldRefreshData = !!shouldRefreshData;
  },
  updatePageChartData(state, { page, data, generalStatsDataType }) {
    const selectedPeriod = state.current.periodId;
    /* always display 12months in the chart */
    const queryData = ChartHelper.addMissingPeriod(data, selectedPeriod);

    //set chart periods (axis x)
    const periods = ChartHelper.getPeriodsInGHFormat(queryData);
    Vue.set(state.chart.config, 'labels', periods);

    //set colors for chart labels
    const labelsColors = ChartHelper.getChartColors(periods, selectedPeriod);
    Vue.set(state.chart.config, 'labelsColors', labelsColors);

    /* we retrieve every component name along with it's fieldName */
    const currentPageComponents = Object.keys(state.chart.components[page]);
    const fieldNames = currentPageComponents.map((component) => {
      return {
        component,
        field: ChartHelper.suffixedField(
          page,
          state.chart.components[page][component].field,
          state.current.leadSaleType,
          state.current.dataTypeId,
        ),
      };
    });

    const cockpitType = state.current.cockpitType;
    // Set datasets for target, top200 and global
    for (const { component, field } of fieldNames) {
      //target field
      const dataSet = queryData.map(periodData => {
        const format = state.chart.components[page][component]['format'];
        return ChartHelper.formatValue(periodData[field], format);
      });
      Vue.set(state.chart.components[page][component]['target'], 'dataSet',
        dataSet);
      Vue.set(state.chart.components[page][component]['target'],
        'backgroundColor', [...labelsColors]);

      //global & top200: generalStats for every period
      const generalStatsLabel = state.chart.components[page][component].generalStatsLabel;
      if (generalStatsLabel) {
        const globalDataSet = [];
        const top200DataSet = [];

        for (const period of periods) {
          const generalStats = deep(state.generalStats,
            `${ period }.${ cockpitType }`) || {};

          const { allGarages = {}, top = {} } = cockpitType ===
          GarageTypes.VEHICLE_INSPECTION ?
            deep(generalStats, `${ generalStatsLabel }`) || {} :
            deep(generalStats,
              `${ generalStatsDataType }.${ generalStatsLabel }`) || {};

          globalDataSet.push(Math.round(allGarages.rate || 0));
          top200DataSet.push(Math.round(top.rate || 0));
        }
        Vue.set(state.chart.components[page][component], 'global',
          { dataSet: globalDataSet });
        Vue.set(state.chart.components[page][component], 'top200',
          { dataSet: top200DataSet });
      }
    }
  },
  setCustomExports(state, { data }) {
    state.customExports = data;
  },
  deleteCustomExports(state, { id }) {
    state.customExports = [...state.customExports].filter(
      customExport => customExport.id !== id);
  },
  setAvailableFrontDeskUsers(state, { data }) {
    state.availableFrontDeskUsers = data;
  },
  addTag(state, { tag, garageIds }) {
    state.availableGarages = state.availableGarages.map(garage => {
      if (garageIds.includes(garage.id)) {
        garage.tags = garage?.tags?.length ?  [...garage.tags, tag] :  [tag]
      }
      return garage;
    })
  },
  updateTag(state, { garageIds, currentTag, newTag }) {
    state.availableGarages = state.availableGarages.map(garage => {
      if (garageIds.includes(garage.id)) {
        garage.tags = garage.tags.map(tag => {
          if (tag === currentTag) {
            return newTag;
          }
          return tag;
        })
      }
      return garage;
    })
  },
  deleteTag(state, tag) {
    state.availableGarages = state.availableGarages.map(garage => {
      if (garage?.tags?.includes(tag)) {
        garage.tags = garage.tags.filter(item => item !== tag);
      }
      return garage;
    })
  },

  setGarageSignatures(state, value){
    state.garageSignatures = value
  },
  setGarageFilterMode(state, value){
    state.current.garageFilterMode = value
  }
};
