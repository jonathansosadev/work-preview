import { promisify } from "../util/promises";
import { buildQuery } from '~/util/graphql';
import UserSubscriptionStatus from '~/utils/models/user-subscription-status.js';
import Vue from 'vue';
import GarageTypes from '~/utils/models/garage.type.js';
import cookieHandler from '~/utils/cookie-handler';

export const state = () => ({
    error: '',
    errorType: 'primary',
    page: 'login',
    email: '',
    password: '',
    captcha: true,
    loading: false,
    nbError: 0,
    token: ''
});

export const mutations = {
  SET_ERROR(state, val) {
    state.error = val;
  },
  SET_ERROR_TYPE(state, val) {
    state.errorType = val;
  },
  SET_PAGE(state, val) {
    state.page = val;
  },
  SET_LOADING(state, val) {
    state.loading = val;
  },
  SET_EMAIL(state, val) {
    state.email = val;
  },
  SET_TOKEN(state, val) {
    state.token = val;
  },
};


export const actions = {
  async FETCH_CURRENT_USER_CONTEXT({ commit, dispatch }, { user }) {
  },
  SET_ERROR({ commit }, { error, errorType }) {
    commit('SET_ERROR', error);
    commit('SET_ERROR_TYPE', errorType);
  },
  SET_LOADING({ commit }, { loading }) {
    commit('SET_LOADING', loading);
  },
  CHANGE_PAGE({ commit }, { page }) {
    commit('SET_PAGE', page);
  },
  SET_EMAIL({ commit }, { email }) {
    commit('SET_EMAIL', email);
  },
  SET_TOKEN({ commit }, { token }) {
    commit('SET_TOKEN', token);
  },
  INITIALIZE_EMAIL_PASSWORD({ commit }, { route }) {
    this.email = cookieHandler.readCookie('garagescore-login') || '';
    if (route.query) {
      this.email = route.query.email || cookieHandler.readCookie('garagescore-login') || '';
      this.password = route.query.password;
    }
  }
};

export const getters = {
  error: (state) => state.error,
  errorType: (state) => state.errorType,
  page: (state) => state.page,
  email: (state) => state.email,
  password: (state) => state.password,
  captcha: (state) => state.captcha,
  loading: (state) => state.loading,
  nbError: (state) => state.nbError,
  token: (state) => state.token,
};
