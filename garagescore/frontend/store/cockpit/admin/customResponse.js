import { makeApolloQueries, makeApolloMutations } from '~/util/graphql';
import { getRatingCategory } from '~/util/filters.js';
import { getDeepFieldValue as deep} from "~/utils/object";
export const state = () => ({
  configResponses: [],
  configResponsesDelay: [],
  configResponsesScore: [],
  configResponseTemp: {
    title: '',
    automated: null,
    garageIds: [],
    content: '',
    ratingCategories: [],
    sources: [],
  },
  loading: false,
  loadingMore: false,
  hasMoreTemplates: false,
  currentPage: 0,
  pageResponses: 0,
  pageDelay: 0,
  hasMoreDataDelay: false
});

export const getters = {
  configResponses: (state) => state.configResponses,
  configResponsesDelay: (state) => state.configResponsesDelay,
  configResponsesScore: (state) => state.configResponsesScore,
  currentPage: (state) => state.currentPage,
  hasMoreTemplates: (state) => state.hasMoreTemplates,
  configResponseTemp: (state) => state.configResponseTemp,
  loading: (state) => state.loading,
  loadingMore: (state) => state.loadingMore,
  hasMoreDataDelay: (state) => state.hasMoreDataDelay
};

export const mutations = {
  setConfigResponses(state, data) {
    state.configResponses = data;
  },
  setConfigResponsesDelay(state, data) {
    state.configResponsesDelay = data;
  },
  appendConfigResponsesDelay(state, data) {
    state.configResponsesDelay = [...state.configResponsesDelay, ...data];
  },
  setConfigResponsesScore(state, data) {
    state.configResponsesScore = data;
  },
  appendConfigResponses(state, data) {
    state.configResponses = [...state.configResponses, ...data];
  },
  appendConfigResponseScore(state, data) {
    state.configResponsesScore = [...state.configResponsesScore, ...data];
  },
  removeConfigResponse(state, templateId) {
    state.configResponses = state.configResponses.filter((item) => item._id !== templateId);
  },
  updateConfigResponse(
    state,
    { templateId, title, automated, garageIds, content, ratingCategories, sources, updatedBy, updatedAt }
  ) {
    state.configResponses = state.configResponses.map((item) => {
      if (item._id === templateId) {
        item.title = title;
        item.automated = automated;
        item.garageIds = garageIds;
        item.content = content;
        item.ratingCategories = ratingCategories;
        item.sources = sources;
        item.updatedAt = updatedAt;
        item.updatedBy = updatedBy;
      }
      return item;
    });
  },
  updateGarageDelay(state, { garageId, automaticReviewResponseDelay }) {
    const index = state.configResponsesDelay.findIndex((item) => item._id === garageId);
    if(index !== -1) {
       state.configResponsesDelay[index].automaticReviewResponseDelay = automaticReviewResponseDelay;
    }
  },
  setHasMoreTemplates(state, data) {
    state.hasMoreTemplates = data;
  },
  initializePage(state) {
    state.currentPage = 0;
  },
  nextPage(state) {
    state.currentPage++;
  },
  setConfigResponseTemp(state, { field, value }) {
    state.configResponseTemp[field] = value;
  },
  cleanConfigResponseTemp(state) {
    state.configResponseTemp = {
      title: '',
      automated: null,
      garageIds: [],
      content: '',
      ratingCategories: [],
      sources: [],
    };
  },
  setLoading(state, { isLoading }) {
    state.loading = isLoading;
  },
  setLoadingMore(state, { isLoading }) {
    state.loadingMore = isLoading;
  },
  setPageResponses(state, data) {
    state.pageResponses = data;
  },
  setPageDelay(state, data) {
    state.pageDelay = data
  },
  setHasMoreDataDelay(state, data) {
    state.hasMoreDataDelay = data
  }
};

export const actions = {
  async saveModelResponse({ commit, dispatch }, { title, automated, garageIds, content, ratingCategories, sources }) {
    const request = {
      name: 'reviewReplyTemplateSetAddTemplate',
      args: { title, content, garageIds, sources, ratingCategories, automated },
      fields: `
        message
        status
        template{
          title
          content
          garageIds
          sources
          ratingCategories
          automated
        }
      `,
    };
    
    try {
      const resp = await makeApolloMutations([request]);
      const template = deep(resp, 'data.reviewReplyTemplateSetAddTemplate')
      if (template) {
        commit('initializePage');
        await dispatch('fetchModelResponse', false);
        dispatch('cleanConfigResponseTemp');
      } else {
        throw new Error;
      }
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } 
  },
  async updateModelResponse(
    { commit, dispatch },
    { templateId, title, automated, garageIds, content, ratingCategories, sources }
  ) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'reviewReplyTemplateSetUpdateTemplate',
      args: { templateId, title, content, garageIds, sources, ratingCategories, automated },
      fields: `
        message
        status
        template{
          _id
          sources
          ratingCategories
          title
          content
          garageIds
          automated
          updatedBy
          updatedAt
        }
      `,
    };
    try {
      const resp = await makeApolloMutations([request]);
      const template = deep(resp, 'data.reviewReplyTemplateSetUpdateTemplate.template')
      if (
        template
      ) {
        commit('updateConfigResponse', {
          ...template,
          templateId: template._id
        });
      } else {
        throw new Error;
      }
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } finally { 
      commit('setLoading', { isLoading: false });
    }
  },
  async updateModelResponseDelay({ commit, dispatch }, { garageId, automaticReviewResponseDelay }) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'garageSetAutomaticReviewResponseDelay',
      args: { garageId, automaticReviewResponseDelay },
      fields: `
      message
      status
      automaticReviewResponseDelay
      `,
    };
    
    try {
      const resp = await makeApolloMutations([request]);
      const responseDelay = deep(resp, 'data.garageSetAutomaticReviewResponseDelay.status')
      if (responseDelay==='OK') {
        commit('updateGarageDelay', { garageId, automaticReviewResponseDelay });
      } else {
        throw new Error;
      }
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } finally {
      commit('setLoading', { isLoading: false });
    }

  },
  async deleteModelResponse({ commit, dispatch }, templateId) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'reviewReplyTemplateSetDeleteTemplate',
      args: {
        templateId: templateId,
      },
      fields: `
        message
        status
      `,
    };
    try {
      const resp = await makeApolloMutations([request]);
      const template = deep(resp, 'data.reviewReplyTemplateSetDeleteTemplate.status')
      if (template === 'OK') {
        commit('removeConfigResponse', templateId);
      }
      
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } finally {
      commit('setLoading', { isLoading: false });
    }
  },
  initialPage({ commit }) {
    commit('initializePage');
  },
  async fetchNextModelResponse({ commit, dispatch }) {
    commit('setLoadingMore', { isLoading: true });
    commit('nextPage');
    await dispatch('fetchModelResponse', true);
    commit('setLoadingMore', { isLoading: false });
  },
  async fetchModelResponse({ dispatch, commit, state }, append) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'reviewReplyTemplateGetTemplates',
      args: {
        page: state.currentPage,
      },
      fields: `
        hasMore
        templates{
          _id
          title
          content
          garageIds
          sources
          ratingCategories
          automated
          createdAt
          createdBy
          updatedAt
          updatedBy
        }
      `,
    };
    try {
      const resp = await makeApolloQueries([request]);
      const { hasMore, templates } = deep(resp, 'data.reviewReplyTemplateGetTemplates')
      if (templates) {
        append
          ? commit('appendConfigResponses', templates)
          : commit('setConfigResponses', templates);
      }
      commit('setHasMoreTemplates', hasMore);
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } finally {
      commit('setLoading', { isLoading: false });
    }
    
  },
  async fetchModelResponseDelay({ dispatch, commit }, { page, append}) {
    const request = {
      name: 'garagesGetAutomaticReviewResponseDelay',
      args: {
        page: page,
        limit: 100
      },
      fields: `
        message
        status
        hasMore
        garages {
          _id
          automaticReviewResponseDelay
          publicDisplayName
        }
      `,
    };
    try {
      const resp = await makeApolloQueries([request]);
      const { garages, hasMore } = deep(resp, 'data.garagesGetAutomaticReviewResponseDelay')
      if (garages) {
        append ? commit('appendConfigResponsesDelay', garages) :
                 commit('setConfigResponsesDelay', garages);
      }
      commit('setHasMoreDataDelay', hasMore);
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } 
  },

  async fetchResponsesDelay({ dispatch, commit, state }) {
    commit('setPageDelay', 0)
    await dispatch('fetchModelResponseDelay', { page: state.pageDelay, append: false })
  },

  async appendResponsesDelay({ dispatch, commit, state }) {
    commit('setPageDelay', state.pageDelay + 1)
    await dispatch('fetchModelResponseDelay', { page: state.pageDelay, append: true })
  },
  
  async appendResponsesByScore({ dispatch, commit, state }, rating) {
    commit('setPageResponses', state.pageResponses + 1);

    const parameters = {
      ratingCategory: getRatingCategory(rating),
      queryText: '',
      page: state.pageResponses,
      append: true,
    };

    await dispatch('fetchModelResponseByScore', parameters);
  },
  async fetchModelResponseByScore({dispatch, commit }, { ratingCategory, garageId, queryText, page, append }) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'reviewReplyTemplateGetTemplates',
      args: {
        ratingCategory,
        garageId,
        queryText,
        page,
        limit: 100,
      },
      fields: `
        hasMore
        templates{
          _id
          title
          ratingCategories
          content
        }
      `,
    };
    try {
      const resp = await makeApolloQueries([request]);
      const { templates, hasMore } = deep(resp, 'data.reviewReplyTemplateGetTemplates')
      if (templates) {
        append
          ? commit('appendConfigResponseScore', templates)
          : commit('setConfigResponsesScore', templates);
      }
      commit('setHasMoreTemplates', hasMore);
    } catch (error) {
      dispatch(
        'openModal',
        {
          component: 'ModalMessage',
          props: {
            message: `Erreur sur le serveur: `,
            type: 'danger',
          },
        },
        { root: true }
      );
    } finally {
      commit('setLoading', { isLoading: false });
    }
  },
  saveConfigResponseTemp({ commit }, { field, value }) {
    commit('setConfigResponseTemp', { field, value });
  },
  cleanConfigResponseTemp({ commit }) {
    commit('cleanConfigResponseTemp');
  },
  async fetchResponses({ dispatch, commit, state }, { rating, garageId }) {
    commit('setPageResponses', 0);

    const parameters = {
      ratingCategory: getRatingCategory(rating),
      garageId,
      queryText: '',
      page: state.pageResponses,
      append: false,
    };
    await dispatch('fetchModelResponseByScore', parameters);
  },
};

export default {
  state,
  actions,
  mutations,
  getters,
};
