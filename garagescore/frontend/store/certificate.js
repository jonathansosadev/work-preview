import Vue from 'vue';
import async from 'async';
import GarageTypes from '~/utils/models/garage.type.js';
import DataTypes from '~/utils/models/data/type/data-types.js';

///
/// STATE
///
export const state = () => ({
    garage: {},
    mapboxApiToken: process.env.MAPBOX_API_TOKEN || '',
    selectedServiceType: DataTypes.MAINTENANCE,
    reviewsByType: {},
    scores: [],
    isOpen: false,
    rightBlock: 'top',
    mapVisible: false,
    scrollRef: 400,
    basicScrollRef: 400,
    modalHelpVisible: false,
    pageCache: {}
});

///
/// MUTATIONS
///
export const mutations =  {
  SET_GARAGE: (state, { garage }) => {
    Vue.set(state, 'garage', garage); /* false means garage not found */
  },
  SET_SERVICE_TYPE: (state, serviceType) => {
    Vue.set(state, 'selectedServiceType', serviceType);
  },

  SET_REVIEWS: (state, { type, reviews }) => {
    if (!reviews || reviews.length === 0) { return; }
    if (type) {
      state.reviewsByType[type] = reviews;
    } else {
      DataTypes.getJobs().forEach((j) => (state.reviewsByType[j] = []));
      reviews.forEach(r => {
        state.reviewsByType[r.type] = state.reviewsByType[r.type] || [];
        state.reviewsByType[r.type].push(r);
      });
    }
  },
  SET_SCORES(state, { scores }) {
    if (scores) {
      Vue.set(state, 'scores', scores);
    }
  },
  SET_IS_OPEN: (state, isOpen) => {
    Vue.set(state, 'isOpen', isOpen);
  },
  SET_RIGHT_BLOCK: (state, rb) => {
    Vue.set(state, 'rightBlock', rb);
  },
  SET_MAP_VISIBLE: (state, visible) => {
    Vue.set(state, 'mapVisible', visible);
  },
  SET_SCROLL_REF: (state, scrollRef) => {
    Vue.set(state, 'scrollRef', scrollRef);
  },
  SET_MODAL_HELP_VISIBLE: (state, visible) => {
    Vue.set(state, 'modalHelpVisible', visible);
  },
  BUILD_PAGE_CACHE: (state, {garage}) => {
    const pageSize = 50;
    let pageCache = state.pageCache;
    pageCache[garage.slug] = pageCache[garage.slug] || {};
    pageCache[garage.slug][pageSize] = pageCache[garage.slug][pageSize] || {};
    // pageCache[slug][pageSize][type][page]
    for (let type in state.reviewsByType) {
      if (!state.reviewsByType.hasOwnProperty(type)) continue;
      // With this code we'll discard incomplete pages after the first. Indeed, those extra reviews would mess up with page fetching
      if (state.reviewsByType[type].length > pageSize) {
        const newLen = state.reviewsByType[type].length - state.reviewsByType[type].length % pageSize;
        state.reviewsByType[type].length = newLen;
      }
      pageCache[garage.slug][pageSize][type] = pageCache[garage.slug][pageSize][type] || {};
      for (let pageNum = 0; pageNum < Math.ceil(state.reviewsByType[type].length / pageSize); pageNum++) {
        pageCache[garage.slug][pageSize][type][pageNum + 1] = state.reviewsByType[type].slice(pageNum * pageSize, (1 + pageNum) * pageSize);
      }
    }
    //console.log(pageCache[garage.slug][pageSize]);
  }
};

///
/// GETTERS
///
export const getters =  {
  locale(state) {
    return (state.garage && state.garage.locale) || 'fr_FR';
  },
  respondentsCount(state) {
    let result = 0;
    DataTypes.getJobs().forEach((job) => {
      if (state.garage[job] && state.garage[job].respondentsCount) {
        result += state.garage[job].respondentsCount;
      }
    });
    return result;
  },
  garageType(state) {
    const prefixGender = (prefixType, male = true) => { // male by default
      switch (prefixType) {
        case 1: return male ? 'le ' : 'la ';
        case 2:return male ? 'du ' : 'de la ';
        case 3: return male ? 'ce ' : 'cette ';
        default: return '';
      }
    };
    return (prefixType) => {
      if (state.garage.type === GarageTypes.VEHICLE_INSPECTION) { // Test the garage type first
        return `${prefixGender(prefixType)}centre`;
      }
      if (state.garage.NewVehicleSale || state.garage.UsedVehicleSale) { // then test what job are available
        return `${prefixGender(prefixType, false)}concession`;
      } else if (state.garage.Maintenance) {
        return `${prefixGender(prefixType)}garage`;
      }
    };
  }
};

///
/// ACTIONS
///

export const actions =  {
  BUILD_CONTEXT({ commit }, context) {
    commit('SET_GARAGE', context);
    commit('SET_REVIEWS', context);
    commit('BUILD_PAGE_CACHE', context);
    commit('SET_SCORES', context);
    if (context && context.garage && context.garage.type && context.garage.type === GarageTypes.VEHICLE_INSPECTION) {
      commit('SET_SERVICE_TYPE', DataTypes.VEHICLE_INSPECTION);
    } else commit('SET_SERVICE_TYPE', context.selectedServiceType);
  },
  CHANGE_SERVICE_TYPE({ commit, state }, serviceType) {
    return Promise.resolve(commit('SET_SERVICE_TYPE', serviceType));
  },
  FETCH_GARAGE({ commit, state, dispatch }, { slug }) {
    return (state.garages[slug]
      ? Promise.resolve(state.garages[slug])
      : dispatch('FIND_GARAGE_BY_SLUG', (slug).then(garage => commit('SET_GARAGE', { slug, garage }))));
  },
  FETCH_REVIEWS({ commit, state, dispatch }, { slug, type, page, pageSize }) {
    return new Promise((resolve, reject) => {
      async.times(page, (n, next) => {
        dispatch('FIND_REVIEWS', { slug, type, page: n + 1, pageSize }).then(reviews => next(null, reviews)).catch(next);
      }, (err, reviewChuncks) => {
        if (err) { reject(err); return; }
        let reviews = [];
        reviewChuncks.forEach(rch => {
          reviews = reviews.concat(rch);
        });
        commit('SET_REVIEWS', { type, reviews });
        resolve();
      });
    });
  },
  FIND_REVIEWS({ state }, { slug, type, page, pageSize }) {
    let pageCache = state.pageCache;
    if (pageCache[slug] && pageCache[slug][pageSize] && pageCache[slug][pageSize][type] &&
        pageCache[slug][pageSize][type][page] && pageCache[slug][pageSize][type][page].length === pageSize) {
      return Promise.resolve(pageCache[slug][pageSize][type][page]);
    }
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      const url = `/garage/${slug}/comments/${type}/page/${page}/${pageSize}`; // should we add a new route for VI ?
      request.open('GET', url);
      request.send();
      request.onload = () => {
        if (request.status !== 200 && request.status !== 304) {
          console.error('Erreur sur le serveur');
          reject('Erreur sur le serveur');
          return;
        }
        const results = JSON.parse(request.responseText);
        if (!pageCache[slug]) {
          pageCache[slug] = {};
        }
        if (!pageCache[slug][pageSize]) {
          pageCache[slug][pageSize] = {};
        }
        if (!pageCache[slug][pageSize][type]) {
          pageCache[slug][pageSize][type] = {};
        }
        pageCache[slug][pageSize][type][page] = results;
        resolve(results);
      };
    });
  },
  FIND_GARAGE_BY_SLUG({}, slug) {
    return new Promise((resolve) => {resolve({ publicDisplayName: `Garage ${slug}` })});
  }
};
