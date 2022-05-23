import { buildQuery, makeApolloQueries } from '~/util/graphql';

import fields from '~/api/graphql/fields';
export const state = () => ({
  locale: '',
  home: {
    reviewsCount: 0,
    captchaSiteKey: '',
    reviews: []
  },
  siteindex: {
    garages: []
  }
});

export const getters =  {
  locale(state) {
    return state.locale;
  }
}
export const mutations = {
  SET_B2C_LOCALE(state, { locale }) {
    state.locale = locale;
  },
  SET_B2C_HOME_DATA(state, { captchaSiteKey, reviewsCount, reviews }) {
    Object.assign(state.home, { captchaSiteKey, reviewsCount, reviews });
  },
  SET_B2C_SITEINDEX_DATA(state, { garages }) {
    Object.assign(state.siteindex, { garages });
  },
};


export const actions = {
  // homepage data
  async FETCH_HOME_B2C({ commit, state }) {
        let partial = false;
    const fields = `
    reviewsCount
    captchaSiteKey
    reviews {
      customerName
      customerCity
      transaction
      model
      rating
      garage
      comment
      date
    }
`;
    const dataGetHomeB2C = {
      name: 'dataGetHomeB2C',
      args: { },
      fields
    };
    let res = await makeApolloQueries([dataGetHomeB2C]);
    res = res.data;
    commit('SET_B2C_HOME_DATA', {
      captchaSiteKey: res && res.dataGetHomeB2C && res.dataGetHomeB2C.captchaSiteKey,
      reviewsCount: res && res.dataGetHomeB2C && res.dataGetHomeB2C.reviewsCount,
      reviews: res && res.dataGetHomeB2C && res.dataGetHomeB2C.reviews
    });
  },
  // /siteindex data
  async FETCH_SITEINDEX_B2C({ commit, state }) {
    const garageGetB2CSiteIndex = {
      name: 'garageGetB2CSiteIndex',
      args: { 
        locale: state.locale 
      },
      fields : `
          slug
          publicDisplayName
          type
          locale
      `
    };
    let resp = await makeApolloQueries([garageGetB2CSiteIndex]);
    commit('SET_B2C_SITEINDEX_DATA', {
      garages: resp && resp.data && resp.data.garageGetB2CSiteIndex
    });
  },

};
