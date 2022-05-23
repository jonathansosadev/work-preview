import Vue from 'vue';

///
/// STATE
///
export const state = () => ({
    data: {},
});

///
/// MUTATIONS
///
export const mutations =  {
  SET_DATA: (state, { data }) => {
    Vue.set(state, 'data', data); /* false means data not found */
  },
};

///
/// GETTERS
///
export const getters =  {
  data(state) {
    return state.data;
  }
};

///
/// ACTIONS
///

export const actions =  {
  BUILD_CONTEXT({ commit }, data) {
    commit('SET_DATA', { data });
  },
};
