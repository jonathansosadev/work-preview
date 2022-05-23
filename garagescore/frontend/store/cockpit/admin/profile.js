import fields from '~/api/graphql/fields';
import { makeApolloQueries, makeApolloMutations } from '~/util/graphql';

export const state = () => ({
  garages: [],
  availableGarages: [],
  agents: [],

  user: null,
  conditions: null,

  loading: {
    garages: false,
    profile: false,
  }
});

export const actions = {
  async fetchUser({ commit }, { id }) {
    const request = {
      name: 'userGetUserById',
      args: {
        userId: id
      },
      fields:
      `id
      garageIds
      lastName
      firstName
      email
      civility
      phone
      mobilePhone
      businessName
      address
      postCode
      job
      role
      city
      subscriptionStatus
      isGod
      defaultManagerGaragesIds
      allGaragesAlerts {
        UnsatisfiedVI
        UnsatisfiedVo
        UnsatisfiedVn
        UnsatisfiedMaintenance
        LeadApv
        LeadVn
        LeadVo
        ExogenousNewReview
        EscalationUnsatisfiedMaintenance
        EscalationUnsatisfiedVn
        EscalationUnsatisfiedVo
        EscalationUnsatisfiedVi
        EscalationLeadMaintenance
        EscalationLeadVn
        EscalationLeadVo
      },
      authorization {
        ACCESS_TO_COCKPIT
        ACCESS_TO_ADMIN
        WIDGET_MANAGEMENT
        ACCESS_TO_WELCOME
        ACCESS_TO_SATISFACTION
        ACCESS_TO_UNSATISFIED
        ACCESS_TO_LEADS
        ACCESS_TO_AUTOMATION
        ACCESS_TO_CONTACTS
        ACCESS_TO_E_REPUTATION
        ACCESS_TO_ESTABLISHMENT
        ACCESS_TO_TEAM
        ACCESS_TO_DARKBO
        ACCESS_TO_GREYBO
      },
      reportConfigs {
        daily {
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          UnsatisfiedVI
          leadVn
          leadVo
        }
        weekly{
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          UnsatisfiedVI
          leadVn
          leadVo
        }
        monthly{
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          UnsatisfiedVI
          leadVn
          leadVo
        }
        monthlySummary {
          unsatisfiedApv
          unsatisfiedVn
          unsatisfiedVo
          unsatisfiedVI
          leadVn
          leadVo
          contactsApv
          contactsVn
          contactsVo
          contactsVI
        }
      }`
    };
    const resp = await makeApolloQueries([request]);
    commit('setUser', (resp.data.userGetUserById || null))
  },

  async fetchAgents({ commit, state }) {
    commit('setAgents', (state.garages || []).reduce((acc, g) => {
      acc.push(...g.agents);
      return acc;
    }, []));
  },

  async fetchGarages({ commit, state }) {
    commit('loadingGarages', true);
    const request = {
      name: 'userGetGaragesAndAgents',
      args: {
        id: state.user && state.user.id,
      },
      fields:
      `
        id
        publicDisplayName
        type
        agents {
          id
          publicDisplayName
          slug
          parent {
            garageId
            shareLeadTicket {
              enabled
              NewVehicleSale
              UsedVehicleSale
            }
          }
        }
      `
    };
    const resp = await makeApolloQueries([request]);
    const userGetGaragesAndAgents = resp && resp.data && resp.data.userGetGaragesAndAgents || [];
    commit('setAvailableGarages', userGetGaragesAndAgents);
    const userGarages = state.user.garageIds
      .map((gId) => userGetGaragesAndAgents.find((ag) => ag.id === gId))
      .filter((g) => g);
    commit('setGarages', userGarages);
    commit('loadingGarages', false);
  },

  async fetchGaragesConditions({ commit, state }) {
    const request = {
      name: 'garageGetGaragesConditions',
      args: {
        id: state.user.id,
      },
      fields:
      ` hasMaintenanceAtLeast
        hasVnAtLeast
        hasVoAtLeast
        hasViAtLeast
        hasLeadAtLeast
        hasCrossLeadsAtLeast
        hasAutomationAtLeast
        hasEReputationAtLeast
       `
    };
    const resp = await makeApolloQueries([request]);
    commit('setGarageConditions', resp.data.garageGetGaragesConditions || {});
  },

  async removeGarage({ commit, state }, { garageId }) {
    const request = {
      name: 'userSetUpdateOne',
      args: {
        id: state.user.id,
        removeGarages: [garageId]
      },
      fields:
        `
        status
      `
    };
    const res = await makeApolloMutations([request]);
    if (res && res.data && res.data.userSetUpdateOne && res.data.userSetUpdateOne.status) {
      commit('removeGarage', garageId);
    }
  },

  async addGarage({ commit, state }, { garageId }) {
    const request = {
      name: 'userSetUpdateOne',
      args: {
        id: state.user.id,
        addGarages: [garageId]
      },
      fields:
        `
        status
      `
    };
    const res = await makeApolloMutations([request]);
    if (res && res.data && res.data.userSetUpdateOne && res.data.userSetUpdateOne.status) {
      commit('addGarage', garageId);
    }
  },

  async updateAuthorization({ commit, state }, { authorization }) {
    const request = {
      name: 'userSetUpdateOne',
      args: {
        id: state.user.id,
        ...authorization
      },
      fields:
        `
        status
      `
    };
    const res = await makeApolloMutations([request]);
    if (res && res.data && res.data.userSetUpdateOne && res.data.userSetUpdateOne.status) {
      commit('updateUser', { authorization });
    }
  },

  async updateRole({ commit, state }, { role }) {
    const request = {
      name: 'userSetUpdateOne',
      args: {
        id: state.user.id,
        role
      },
      fields:
        `
        status
      `
    };
    const res = await makeApolloMutations([request]);
    if (res && res.data && res.data.userSetUpdateOne && res.data.userSetUpdateOne.status) {
      commit('updateUser', { role });
    }
  },

  async updateAlerts({ commit, state }, params) {
    const queryParams = {};
    const uncapitalize = (str) => str.charAt(0).toLowerCase() + str.slice(1);
    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

    Object.keys(params.allGaragesAlerts || []).forEach((switcher) => {
      queryParams[`alerts${switcher}`] = params.allGaragesAlerts[switcher];
    });

    if (params.reportConfigs) {
      ['Daily', 'Weekly', 'Monthly', 'MonthlySummary'].forEach((freq) => {
        Object.keys(params.reportConfigs[uncapitalize(freq)] || []).forEach((switcher) => {
          queryParams[`reportConfigs${freq}${capitalize(switcher)}`] = params.reportConfigs[uncapitalize(freq)][switcher];
        });
      });
    }
    const request = {
      name: 'userSetUpdateOne',
      args: {
        id: state.user.id,
        ...queryParams
      },
      fields:
        `
        status
      `
    };
    await makeApolloMutations([request]);
  },

  async updateUser({ commit, state, rootState }, params) {
    const request = {
      name: 'userSetUpdateOne',
      args: {
        id: state.user.id,
        ...params
      },
      fields:
        `
        status
        message
        user {
          id
          garageIds
          lastName
          firstName
          email
          civility
          phone
          mobilePhone
          businessName
          address
          postCode
          job
          role
          city
          subscriptionStatus
          isPriorityProfile
          isGod
          isDefaultTicketManagerSomewhere
          defaultManagerGaragesIds
          allGaragesAlerts  {
            UnsatisfiedVI
            UnsatisfiedVo
            UnsatisfiedVn
            UnsatisfiedMaintenance
            LeadApv
            LeadVn
            LeadVo
            ExogenousNewReview
            EscalationUnsatisfiedMaintenance
            EscalationUnsatisfiedVn
            EscalationUnsatisfiedVo
            EscalationUnsatisfiedVi
            EscalationLeadMaintenance
            EscalationLeadVn
            EscalationLeadVo
          },
          authorization  {
            ACCESS_TO_COCKPIT
            ACCESS_TO_ADMIN
            ACCESS_TO_WELCOME
            ACCESS_TO_SATISFACTION
            ACCESS_TO_UNSATISFIED
            ACCESS_TO_LEADS
            ACCESS_TO_AUTOMATION
            ACCESS_TO_CONTACTS
            ACCESS_TO_E_REPUTATION
            ACCESS_TO_ESTABLISHMENT
            ACCESS_TO_TEAM

            ACCESS_TO_DARKBO
            ACCESS_TO_GREYBO

            WIDGET_MANAGEMENT
          },
          reportConfigs  {
            daily {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              UnsatisfiedVI
              leadVn
              leadVo
            },
            weekly {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              UnsatisfiedVI
              leadVn
              leadVo
            },
            monthly {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              UnsatisfiedVI
              leadVn
              leadVo
            },
            monthlySummary  {
              unsatisfiedApv
              unsatisfiedVn
              unsatisfiedVo
              unsatisfiedVI
              leadVn
              leadVo
              contactsApv
              contactsVn
              contactsVo
              contactsVI
            }
          }
        }
      `
    };
    const res = await makeApolloMutations([request]);
    if (res && res.data && res.data.userSetUpdateOne && !res.data.userSetUpdateOne.status) {
      return res.data.userSetUpdateOne;
    } else {
      commit('updateUser', params);

      // update current user profile
      if (state.user.id === rootState.auth.currentUser.id) {
        commit('auth/updateCurrentUser', params, { root: true });
      }
    }

    commit('updateUser', res.data.userSetUpdateOne.user);
    if (state.user.id === rootState.auth.currentUser.id) {
      commit('auth/SET_CURRENT_USER', res.data.userSetUpdateOne.user, { root: true });
      commit('auth/setIsPriorityProfile', res.data.userSetUpdateOne.user && res.data.userSetUpdateOne.user.isPriorityProfile, { root: true });
    }

    return res.data.userSetUpdateOne;
  },
  async validateEmail({ commit, state, rootState }, email) {
    const request = {
      name: 'userGetEmailValidation',
      args: {
        email,
      },
      fields:
      `
        error
        message
        email
      `
    };
    const resp = await makeApolloQueries([request]);
    return resp && resp.data && resp.data.userGetEmailValidation;
  },
};

export const mutations = {
  loadingGarages(state, loading) {
    state.loading.garages = loading;
  },

  addGarage(state, garageId) {
    const garageToAdd = state.availableGarages.find((ag) => ag.id === garageId);
    if (garageToAdd) state.garages.push(garageToAdd);
  },
  setGarages(state, garages) {
    state.garages = garages;
  },
  setAvailableGarages(state, availableGarages) {
    state.availableGarages = availableGarages;
  },

  setAgents(state, agents) {
    state.agents = agents;
  },

  setGarageConditions(state, conditions) {
    state.conditions = conditions;
  },

  setUser(state, user) {
    state.user = user;
  },

  updateUser(state, user) {
    state.user = {...state.user, ...user};
  },

  removeGarage(state, garageId) {
    state.garages = state.garages.filter(i => i.id !== garageId);
  }
};

export const getters = {
  isGod: (state) => (state.user && state.user.isGod) || false,
  agents: (state) => state.agents
};
