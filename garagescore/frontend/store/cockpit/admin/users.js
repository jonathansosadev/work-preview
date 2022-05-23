import { buildQuery, makeApolloQueries, makeApolloMutations } from '~/util/graphql';
import fields from '~/api/graphql/fields';

export const state = () => ({
  pageParameters: {
    garages: {
      pageSize: 10,
      search: '',
      currentPage: 1,
      hasMore: true,
    },
    users: {
      pageSize: 10,
      search: '',
      currentPage: 1,
      hasMore: true,
      filters: {
        adminFilterRole: null,
        adminFilterJob: null,
        adminFilterLastCockpitOpenAt: null
      }
    }
  },
  view: 'users',

  rowSubview: {
    user: [],
  },
  garages: [],
  users: [],
  loading: false,
});

export const actions = {
  refreshRouteParameters({ rootState, state, dispatch, getters }) {
    const filters = getters["filters"];
    const urlParams = {
      adminFilterRole: filters.adminFilterRole || undefined,
      adminFilterJob: filters.adminFilterJob || undefined,
      adminFilterLastCockpitOpenAt: filters.adminFilterLastCockpitOpenAt || undefined,
      search: state.pageParameters.users.search || undefined
    };
    dispatch("cockpit/refreshRouteParameters", urlParams, { root: true });
  },
  async refreshView({ dispatch }) {
    await dispatch('fetchUsers', { page: 1, append: false });
  },

  changeUserSearch({ commit }, { search }) {
    commit('setUserSearch', { search });
  },

  changeFilters({ commit, dispatch }, { filters }) {
    commit("setFilters", { filters });
    dispatch("refreshRouteParameters");
  },

  changeGarageSearch({ commit }, { search }) {
    commit('setGarageSearch', { search });
  },

  changeView({ commit, state, rootState }, { view }) {
    commit('setView', { view });
    this.$router.push({ name: `cockpit-admin-${view}` });
  },

  async fetchNextUsersPage({ state, dispatch }) {
    await dispatch('fetchUsers', { page: state.pageParameters.users.currentPage + 1, append: true });
  },
  async fetchUsers({ commit, state, rootState, getters }, { page, append }) {
    if (page <= 1) commit('setLoading', { isLoading: true });
    const { adminFilterRole: role, adminFilterJob: job, adminFilterLastCockpitOpenAt: lastCockpitOpenAt } = getters["filters"];
    const resp = await makeApolloQueries([{
      name: 'userGetUsers',
      args: {
        limit: state.pageParameters.users.pageSize,
        skip: (page - 1) * state.pageParameters.users.pageSize,
        search: state.pageParameters.users.search,
        role,
        job,
        lastCockpitOpenAt
      },
      fields:
        `
          id
          email
          firstName
          lastName
          job
          role
          garagesCount
          lastCockpitOpenAt
          isDefaultTicketManagerSomewhere
          resetPasswordVeryRecent
        `
    }]);
    if (append) {
      commit('appendUsers', resp.data.userGetUsers)
    } else {
      commit('setUsers', resp.data.userGetUsers)
    }

    commit('setUsersCurrentPage', { page });
    commit('setUsersHasMore', resp.data.userGetUsers && resp.data.userGetUsers.length % 10 === 0);
    commit('setLoading', { isLoading: false });
  },

  changeUserRowSubview({ commit }, { id, view }) {
    commit('setUserRowSubview', { id, view });
  },

  async fetchNextGaragesPage({ state, dispatch }) {
    await dispatch('fetchAdminGarages', { page: state.pageParameters.garages.currentPage + 1, append: true });
  },
  async fetchAdminGarages({ commit, state, rootState }, { page, append }) {
    if (page <= 1) commit('setLoading', { isLoading: true });
    const garagesWithUsersRequest = {
      name: 'userGetGaragesWithUsers',
      args: {
        limit: state.pageParameters.garages.pageSize,
        skip: (page - 1) * state.pageParameters.garages.pageSize,
        search: state.pageParameters.garages.search,
      },
      fields:
      `id
        externalId
        usersQuota
        countAllSubscribedUsers
        publicDisplayName
        ticketsConfiguration {
          Unsatisfied_Maintenance
          Unsatisfied_NewVehicleSale
          Unsatisfied_UsedVehicleSale
          Lead_Maintenance
          Lead_NewVehicleSale
          Lead_UsedVehicleSale
          VehicleInspection
        }
        users {
          job
          role
          fullName
          email
          id
          reportConfigs {
            daily {
              enable
              generalVue
              lead
              leadVn
              leadVo
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
            }
            weekly {
              enable
              generalVue
              lead
              leadVn
              leadVo
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
            }
            monthly {
              enable
              generalVue
              lead
              leadVn
              leadVo
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
            }
            monthlySummary {
              enable
              generalVue
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              unsatisfiedVI
              lead
              leadVn
              leadVo
              contactsApv
              contactsVn
              contactsVo
              contactsVI
            }
          }
          allGaragesAlerts {
            Lead
            LeadVn
            LeadVo
            UnsatisfiedFollowup
            UnsatisfiedMaintenance
            UnsatisfiedVn
            UnsatisfiedVo
            ExogenousNewReview
            EscalationUnsatisfiedMaintenance
            EscalationUnsatisfiedVn
            EscalationUnsatisfiedVo
            EscalationUnsatisfiedVi
            EscalationLeadMaintenance
            EscalationLeadVn
            EscalationLeadVo
          }
        }
        subscriptions {
          Maintenance
          NewVehicleSale
          UsedVehicleSale
          Lead
        }`,
    };

    const resp = await makeApolloQueries([garagesWithUsersRequest]);
    if (resp.data.userGetGaragesWithUsers) {
      for (let i = 0; i < resp.data.userGetGaragesWithUsers.length; i++) {
        resp.data.userGetGaragesWithUsers[i].displaySubView = false;
      }
      append ? commit('appendGarages', resp.data.userGetGaragesWithUsers) : commit('setGarages', resp.data.userGetGaragesWithUsers);
    }

    commit('setGaragesCurrentPage', { page });
    commit('setGaragesHasMore', resp.data.userGetGaragesWithUsers && resp.data.userGetGaragesWithUsers.length % 10 === 0);
    commit('setLoading', { isLoading: false });
  },

  async connectAs({ commit, dispatch, state, rootState }, { id, userEmail }) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'userGetUserTemporaryPassword',
      args: {
        id
      },
      fields: `
        password
      `
    };
    const resp = await makeApolloQueries([request]);
    if (resp && resp.data && resp.data.userGetUserTemporaryPassword && resp.data.userGetUserTemporaryPassword.password) {
      const userPassword = resp.data.userGetUserTemporaryPassword.password;
      commit('setLoading', { isLoading: false });
      dispatch('openModal', { component: 'ModalConnectAs', props: { userEmail, userPassword } }, { root: true });
    }
  },

  async deleteChild({ commit, dispatch, state, rootState }, { userId, userEmail }) {
    commit('setLoading', { isLoading: true });
    const request = {
        name: 'userSetDeleteUser',
        args: {
            userId
        },
        fields: `
          status
          statusReason
        `
    };
    const resp = await makeApolloMutations([request]);
    if (resp && resp.data && resp.data.userSetDeleteUser) {
      commit('setLoading', { isLoading: false });
      dispatch('openModal', { component: 'ModalDeleteChildUserStatus', props: { status: resp.data.userSetDeleteUser.status, statusReason: resp.data.userSetDeleteUser.statusReason, email: userEmail } }, { root: true });
    }
  },

  async sendPasswordRequest({ commit, dispatch }, { id }) {
    commit('setLoading', { isLoading: true });
    const request = {
      name: 'userSetUserPasswordReset',
      args: { id },
      fields: `
        status
        statusMessage
      `
    };
    const resp = await makeApolloMutations([request]);
    if (resp && resp.data && resp.data.userSetUserPasswordReset) {
      commit('setLoading', { isLoading: false });
      dispatch('openModal', { component: 'ModalPasswordRequestStatus', props: { status: resp.data.userSetUserPasswordReset.status } }, { root: true });
    }
  },

  async updateTicketsConfiguration({ commit }, { garageId, userId, oldUserId, alertType }) {
    const request = {
      name: 'garageSetTicketsConfiguration',
      args: { garageId, userId, oldUserId, alertType },
      fields: `
        message
        status
      `
    };
    const res = await makeApolloMutations([request]);
    commit('setTicketsConfiguration', { garageId, userId, alertType });
  }
};

export const mutations = {
  setUsers(state, data) {
    state.users = data;
  },

  setUserRowSubview(state, { id, view }) {
    const item = state.rowSubview.user.find(i => i.id === id);

    !item ? state.rowSubview.user.push({ id, view }) : (item.view = view === item.view && item.view !== null ? null : view);
  },

  setGarages(state, data) {
    state.garages = data;
  },

  setTicketsConfiguration(state, { garageId, userId, alertType }) {
    state.garages = state.garages.map(garage => {
      if (garage.id === garageId) {
        garage.ticketsConfiguration[alertType] = userId;
      }
      return garage;
    });
  },

  setUserSearch(state, { search }) {
    state.pageParameters.users.search = search;
  },

  setFilters(state, { filters }) {
    state.pageParameters.users.filters = filters;
  },

  setGarageSearch(state, { search }) {
    state.pageParameters.garages.search = search;
  },

  appendUsers(state, data) {
    state.users = state.users.concat(data);
  },

  appendGarages(state, data) {
    state.garages = state.garages.concat(data);
  },

  setUsersCurrentPage(state, { page }) {
    state.pageParameters.users.currentPage = page;
  },
  setUsersHasMore(state, data) {
    state.pageParameters.users.hasMore = data;
  },

  setGaragesCurrentPage(state, { page }) {
    state.pageParameters.garages.currentPage = page;
  },
  setGaragesHasMore(state, data) {
    state.pageParameters.garages.hasMore = data;
  },

  setLoading(state, { isLoading }) {
    state.loading = isLoading;
  },

  setView(state, { view }) {
    state.view = view;
  },
};

export const getters = {
  users: state => state.users,
  garages: state => state.garages,
  loading: state => state.loading,
  view: state => state.view,
  hasMoreUsers: state => state.pageParameters.users.hasMore,
  usersSearch: state => state.pageParameters.users.search,
  hasMoreGarages: state => state.pageParameters.garages.hasMore,
  garagesSearch: state => state.pageParameters.garages.search,
  getUserRowSubview: state => id => {
    const item = state.rowSubview.user.find(i => i.id === id);
    return item ? item.view : null;
  },
  filters: state => {
    return {...state.pageParameters.users.filters}
  }
};

export default {
  state,
  getters,
  actions,
  mutations,
};
