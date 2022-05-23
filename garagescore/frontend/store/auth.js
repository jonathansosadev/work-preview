import UserSubscriptionStatus from '~/utils/models/user-subscription-status.js';
import Vue from 'vue';
import GarageTypes from '~/utils/models/garage.type.js';

export const state = () => ({
  authToken: null,
  currentUser: {},

  maintenance: false,

  isGarageScoreUser: false,
  isMaintenanceUser: false,
  isBackdoor: false,
  isManagerJob: true,
  isPriorityProfile: false,
  isConcernedByMakeSurveys: false,

  // @TODO
  // USE GETTERS PLS
  ACCESS_TO_COCKPIT : false,
  ACCESS_TO_WELCOME : false,
  ACCESS_TO_SATISFACTION : false,
  ACCESS_TO_UNSATISFIED : false,
  ACCESS_TO_LEADS: false,
  ACCESS_TO_AUTOMATION: false,
  ACCESS_TO_CONTACTS : false,
  ACCESS_TO_E_REPUTATION : false,
  ACCESS_TO_ESTABLISHMENT : false,
  ACCESS_TO_TEAM : false,
  ACCESS_TO_ADMIN : false,
  ACCESS_TO_DARKBO : false,
  ACCESS_TO_GREYBO : false,
  ACCESS_TO_GREYBO_RGPD : false,
  WIDGET_MANAGEMENT : false,
  ACCESS_TO_SOURCES: false,
  isAuthenticated: false,

  PENDING_ACCESS_TO_E_REPUTATION: false,

  FIRST_VISIT_TO_EREPUTATION: false,
});

export const mutations = {
  SET_CURRENT_USER(state, {
    id, email, role, firstName, lastName, civility, address, postCode, city, mobilePhone, phone, businessName,
    job, getGarages, allGaragesAlerts, reportConfigs, subscriptionStatus, lastCockpitOpenAt, lastOpenAt,
    isManagerJob, trolled, accessCount
  }) {
    Object.assign(state.currentUser, {
      id, email, role, firstName, lastName, civility, address, postCode, city, mobilePhone, phone, businessName,
      job, getGarages, allGaragesAlerts, reportConfigs, subscriptionStatus, lastCockpitOpenAt, lastOpenAt,
      isManagerJob, trolled, accessCount
    });
  },
  SET_IS_GARAGESCORE_USER(state, val) {
    state.isGarageScoreUser = val;
  },
  SET_MAINTENANCE(state, val) {
    state.maintenance = val;
  },
  SET_IS_MAINTENANCE_USER(state, val) {
    state.isMaintenanceUser = val;
  },
  SET_IS_CONCERNED_BY_MAKE_SURVEYS(state, val) {
    state.isConcernedByMakeSurveys = val;
  },
  SET_IS_AUTHENTICATED(state, val) {
    state.isAuthenticated = val;
  },
  SET_ACCESS(state, authorizations) {
    Object.keys(authorizations).forEach((access) => {
      Vue.set(state, access, authorizations[access]);
    });
  },
  SET_ACCESS_CONTENT(state, authorizations) {
    Object.keys(authorizations).forEach((access) => {
      Vue.set(state, `${access}_CONTENT`, authorizations[access]);
    });
  },
  SET_ACCESS_PENDING_REQUESTS(state, authorizations) {
    Object.keys(authorizations).forEach((access) => {
      Vue.set(state, `PENDING_${access}`, authorizations[access]);
    });
  },
  SET_FIRST_VISITS(state, firstVisit) {
    Object.keys(firstVisit).forEach((elem) => {
      Vue.set(state, `FIRST_VISIT_TO_${elem}`, firstVisit[elem]);
    });
  },

  updateCurrentUser(state, { role, email, firstName, lastName, civility, address, postCode, city, mobilePhone, phone, businessName, job }) {
    state.currentUser = { ...state.currentUser, ...{ role, email, firstName, lastName, civility, address, postCode, city, mobilePhone, phone, businessName, job } };
  },
  setIsManagerJob(state, value) {
    Vue.set(state, 'isManagerJob', value);
  },

  setIsPriorityProfile(state, value) {
    Vue.set(state, 'isPriorityProfile', value);
  },

  setBackdoor(state, value) {
    state.isBackdoor = value;
  },
  setAuthToken(state, val) {
    state.authToken = val;
  },
};


export const actions = {
  setAuthToken({ commit }, { token }) {
    commit('setAuthToken', token);
  },
  changeAutorization({ commit }, { authorization, val }) {
    commit('SET_ACCESS', { [authorization]: val });
  },
  changeAutorizationContent({ commit }, { authorization, val }) {
    commit('SET_ACCESS_CONTENT', { [authorization]: val });
  },
  changeFirstVisit({ commit }, { firstVisit, val }) {
    commit('SET_FIRST_VISITS', { [firstVisit]: val });
  }
};

export const getters = {
  authToken: (state) => state.authToken,
  currentUser: (state, getters) => {
    return {
      ...state.currentUser,
      hasAccessToSatisfaction: !!getters.hasAccessToSatisfaction,
      hasAccessToUnsatisfied: !!getters.hasAccessToUnsatisfied,
      hasAccessToLeads: !!getters.hasAccessToLeads,
      hasAccessToCrossLeads: !!getters.hasAccessToCrossLeads,
      hasAccessToSources: !!getters.hasAccessToSources,
      hasAccessToAutomation: !!getters.hasAccessToAutomation,
      hasAccessToContacts: !!getters.hasAccessToContacts,
      hasAccessToEstablishment: !!getters.hasAccessToEstablishment,
      hasAccessToTeam: !!getters.hasAccessToTeam,
      hasAccessToEreputation: !!getters.hasAccessToEreputation
    };
  },
  currentUserSubscriptionStatus: (state) => state.currentUser.subscriptionStatus,
  currentUserId: (state) => state.currentUser.id,
  currentUserEmail: (state) => state.currentUser.email,
  isBackdoor: (state) => state.isBackdoor,
  garageTicketDisplay: (state, getters, rootState, rootGetters) => {
    return `Passage ${GarageTypes.displayName(rootGetters['cockpit/cockpitType'] || GarageTypes.DEALERSHIP, 'fr', 'TICKET')}`
  },
  isProfileComplete: (state) => {
    if (state.currentUser.email && state.currentUser.email.match(/@garagescore\.com|@custeed\.com/)) {
      return true;
    }
    return state.currentUser.subscriptionStatus === UserSubscriptionStatus.TERMINATED;
  },
  hasAccessToSurveys(state) {
    return state.isConcernedByMakeSurveys
  },
  isEreputationFirstVisit(state) {
    return state.FIRST_VISIT_TO_EREPUTATION;
  },
  hasAccessToWelcome(state) {
    return state.ACCESS_TO_WELCOME;
  },
  hasAccessToSatisfaction(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_SATISFACTION &&
      (rootGetters['cockpit/authorizations'].hasMaintenanceAtLeast ||
        rootGetters['cockpit/authorizations'].hasVnAtLeast ||
        rootGetters['cockpit/authorizations'].hasVoAtLeast ||
        rootGetters['cockpit/authorizations'].hasViAtLeast);
  },
  hasAccessToUnsatisfied(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_UNSATISFIED &&
      (rootGetters['cockpit/authorizations'].hasMaintenanceAtLeast ||
        rootGetters['cockpit/authorizations'].hasVnAtLeast ||
        rootGetters['cockpit/authorizations'].hasVoAtLeast ||
        rootGetters['cockpit/authorizations'].hasViAtLeast);
  },
  hasAccessToLeads(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_LEADS && rootGetters['cockpit/authorizations'].hasLeadAtLeast;
  },
  hasAccessToCrossLeads(state, getters, rootState, rootGetters) {
    return rootGetters['cockpit/authorizations'].hasCrossLeadsAtLeast;
  },
  hasAccessToSources(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_LEADS && (rootGetters['cockpit/authorizations'].hasCrossLeadsAtLeast);
  },
  hasAccessToAutomation(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_AUTOMATION && rootGetters['cockpit/authorizations'].hasAutomationAtLeast;
  },
  hasAccessToContacts(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_CONTACTS &&
      (rootGetters['cockpit/authorizations'].hasMaintenanceAtLeast ||
        rootGetters['cockpit/authorizations'].hasVnAtLeast ||
        rootGetters['cockpit/authorizations'].hasVoAtLeast ||
        rootGetters['cockpit/authorizations'].hasViAtLeast);
  },
  hasAccessToEstablishment(state) {
    return state.ACCESS_TO_ESTABLISHMENT;
  },
  hasAccessToTeam(state) {
    return state.ACCESS_TO_TEAM;
  },
  hasAccessToEreputation(state, getters, rootState, rootGetters) {
    return state.ACCESS_TO_E_REPUTATION && rootGetters['cockpit/authorizations'].hasEReputationAtLeast;
  },
  isPriorityProfile(state) {
    return state.isPriorityProfile;
  },
  hasAccessToDarkbo(state) {
    return state.ACCESS_TO_DARKBO;
  },
  hasAccessToGreybo(state) {
    return state.ACCESS_TO_GREYBO;
  },
  /*
  * this method is when you need to know if you have ACCESS_TO_E_REPUTATION but don't need the subscription 
  */
  hasAccessToEreputationPage(state) {
    return state.ACCESS_TO_E_REPUTATION;
  },
  hasAccessToGreyboRGPD(state) {
    return state.ACCESS_TO_GREYBO_RGPD;
  },
  isGaragescoreUser(state) {
    return state.isGarageScoreUser;
  },
  isManager(state) {
    return state.isManagerJob || state.currentUser.isManagerJob || state.currentUser.email.match(/@garagescore\.com|@custeed\.com/);
  }
};
