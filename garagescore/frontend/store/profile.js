import { makeApolloMutations } from "~/util/graphql";
import GarageTypes from "~/utils/models/garage.type.js";

export const state = () => ({
  userJobs: {},
  garages: [],
  usersCache: {},
});

export const actions = {
  async addUser({ commit, dispatch, state }, { newUser, garages }) {
    const request = {
        name: 'userSetAddUser',
        args: {
            newUserEmail: newUser.email,
            newUserFirstName: newUser.firstName,
            newUserLastName: newUser.lastName,
            newUserJob: newUser.job,
            newUserRole: newUser.role,
            garages
        },
        fields:
        ` message
          status
          emailSentTo
          user {
            id
            email
          }
        `
    };
    const resp = await makeApolloMutations([request]);

    return { data: resp.data.userSetAddUser };
  }
};

export const getters = {
  availableUserCockpitTypes: (state, getters, rootState) => {
    const profile = rootState.cockpit.admin.profile;
    if(!profile.garages || profile.garages.length === 0) { // god mode
      return [GarageTypes.DEALERSHIP, GarageTypes.MOTORBIKE_DEALERSHIP, GarageTypes.VEHICLE_INSPECTION];
    }
    const userCockpitTypes = [];
    for (const garage of profile.garages) {
      if (!userCockpitTypes.includes(GarageTypes.getCockpitType(garage.type)))
        userCockpitTypes.push(GarageTypes.getCockpitType(garage.type));
    }
    return userCockpitTypes;
  },
  jobs: (state, getters) => {
    const jobs = [];
    for (const cockpitType of getters["availableUserCockpitTypes"]) {
      if (state.userJobs[cockpitType]) {
        for (const job of state.userJobs[cockpitType])
          if (!jobs.includes(job.name)) {
            jobs.push(job.name);
          }
      }

    }
    return jobs;
  },
  jobsByCockpitType: state => cockpitType => {
    if (!cockpitType || !state.userJobs[cockpitType]) {
      return [];
    }
    return state.userJobs[cockpitType];
  },
  hasDealershipGarages: (state, getters) => {
    return getters["availableUserCockpitTypes"].find(cockpitType => cockpitType !== GarageTypes.VEHICLE_INSPECTION);
  },
  hasVehicleInspectionGarages: (state, getters) => {
    return getters["availableUserCockpitTypes"].find(cockpitType => cockpitType === GarageTypes.VEHICLE_INSPECTION);
  },
  hasEscalationGarages: (state, getters, rootState, rootGetters) => {
    return (
      rootGetters['cockpit/authorizations'].hasMaintenanceAtLeast ||
      rootGetters['cockpit/authorizations'].hasVnAtLeast ||
      rootGetters['cockpit/authorizations'].hasVoAtLeast
    );
  },
  isMotorbikeOnly: (state, getters) => {
    return !getters["availableUserCockpitTypes"].find(
      t => t !== GarageTypes.MOTORBIKE_DEALERSHIP
    );
  }
};

export const mutations = {
  SET_USER_JOBS(state, jobs) {
    const safe = JSON.parse(JSON.stringify(jobs));
    safe.forEach(job => {
      const type = GarageTypes.getCockpitType(job.garageType);
      if (!state.userJobs[type]) state.userJobs[type] = [];
      if (type === GarageTypes.DEALERSHIP) {
        /** COPY THE SAME JOBS FOR MOTORBIKE_DEALERSHIP and DEALERSHIP **/
        if (!state.userJobs[GarageTypes.MOTORBIKE_DEALERSHIP])
          state.userJobs[GarageTypes.MOTORBIKE_DEALERSHIP] = [];
        state.userJobs[GarageTypes.MOTORBIKE_DEALERSHIP].push(job);
      }
      state.userJobs[type].push(job);
    });
  },
  SET_GARAGES(state, res) {
    state.garages = res;
  }
};

export default {
  state,
  actions,
  mutations,
  getters
};
