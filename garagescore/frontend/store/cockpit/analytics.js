export const state = () => ({
  // BIME
  tabsConfig: {},
  accessToken: '',
});

export const mutations = {
  setConfig(state, { analyticsTabsConfig, analyticsAccessToken }) {
    state.accessToken = analyticsAccessToken;
    state.tabsConfig = analyticsTabsConfig;
  }
};

export const actions = {};
