import Vue from 'vue';

export const state = () => ({
  garages: {
    orderBy: 'KPI_automationCountConverted',
    order: 'DESC',
    search: '',
    liveSearch: ''
  },
  campaigns: {
    orderBy: 'KPI_automationTotalConverted',
    order: 'DESC',
    search: '',
    liveSearch: '',
  }
});

export const getters = {
  // For garages
  garagesOrderBy: (state) => state.garages.orderBy,
  garagesOrder: (state) => state.garages.order,
  garagesSearch: (state) => state.garages.search,
  garagesLiveSearch: (state) => state.garages.liveSearch,
  // For campaigns
  campaignsOrderBy: (state) => state.campaigns.orderBy,
  campaignsOrder: (state) => state.campaigns.order,
  campaignsSearch: (state) => state.campaigns.search,
  campaignsLiveSearch: (state) => state.campaigns.liveSearch,
};

export const mutations = {
  // For garages
  setGaragesOrder(state, { orderBy, order }) {
    Vue.set(state.garages, 'order', order);
    Vue.set(state.garages, 'orderBy', orderBy);
  },
  setGaragesSearch(state, search) {
    Vue.set(state.garages, 'search', search);
  },
  setGaragesLiveSearch(state, search) {
    Vue.set(state.garages, 'liveSearch', search);
  },
  // For campaigns
  setCampaignsOrder(state, { orderBy, order }) {
    Vue.set(state.campaigns, 'order', order);
    Vue.set(state.campaigns, 'orderBy', orderBy);
  },
  setCampaignsSearch(state, search) {
    Vue.set(state.campaigns, 'search', search);
  },
  setCampaignsLiveSearch(state, search) {
    Vue.set(state.campaigns, 'liveSearch', search);
  },
};

export const actions = {
  // For garages
  setGaragesOrder({ commit }, { orderBy, order }) {
    commit('setGaragesOrder', { orderBy, order });
  },
  setGaragesSearch({ commit }, search) {
    commit('setGaragesSearch', search);
  },
  setGaragesLiveSearch({ commit }, search) {
    commit('setGaragesLiveSearch', search);
  },
  // For campaigns
  setCampaignsOrder({ commit }, { orderBy, order }) {
    commit('setCampaignsOrder', { orderBy, order });
  },
  setCampaignsSearch({ commit }, search) {
    commit('setCampaignsSearch', search);
  },
  setCampaignsLiveSearch({ commit }, search) {
    commit('setCampaignsLiveSearch', search);
  },
};
