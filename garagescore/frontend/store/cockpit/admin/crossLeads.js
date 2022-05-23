import { makeApolloQueries, makeApolloMutations } from "~/util/graphql";

export const LEADS_SOURCES = {
  LE_BON_COIN: "LeBonCoin",
  LA_CENTRALE: "LaCentrale",
  L_ARGUS: "Largus",
  PARU_VENDU: "ParuVendu",
  CUSTOM_VO: "CustomVo",
  CUSTOM_VN: "CustomVn",
  CUSTOM_APV: "CustomApv",
  PROMONEUVE: "Promoneuve",
  OUEST_FRANCE_AUTO: "OuestFranceAuto",
  ZOOMCAR: "Zoomcar",
  EKONSILIO_VO: "EkonsilioVo",
  EKONSILIO_VN: "EkonsilioVn"
};

const getDefaultState = () => ({
  crossLeads: [
    {
      type: LEADS_SOURCES.LA_CENTRALE,
      sources: [],
      url: "https://pilot.lacentrale.fr/login" // Login page
    },
    {
      type: LEADS_SOURCES.LE_BON_COIN,
      sources: [],
      url: "https://www.leboncoin.fr/#login" // Login page
    },
    {
      type: LEADS_SOURCES.L_ARGUS,
      sources: [],
      url: "https://pro.largus.fr/login/" // Login page
    },
    {
      type: LEADS_SOURCES.PARU_VENDU,
      sources: [],
      url: "https://pro.paruvendu.fr/authep/default/login/" // Login page
    },
    {
      type: LEADS_SOURCES.PROMONEUVE,
      sources: [],
      url: "https://www.promoneuve.fr" // Login page
    },
    {
      type: LEADS_SOURCES.OUEST_FRANCE_AUTO,
      sources: [],
      url: "https://www.ouestfrance-auto.pro" // Login page
    },
    {
      type: LEADS_SOURCES.ZOOMCAR,
      sources: [],
      url: "https://zoomcar.pro/auth/?redirect=/" // Login page
    },
    {
      type: LEADS_SOURCES.EKONSILIO_VO,
      sources: [],
      url: "https://www.ekonsilio.fr/" // Login page
    },
    {
      type: LEADS_SOURCES.EKONSILIO_VN,
      sources: [],
      url: "https://www.ekonsilio.fr/" // Login page
    },
    {
      type: LEADS_SOURCES.CUSTOM_APV,
      sources: [],
      url: "https://your_website.com" // Login page
    },
    {
      type: LEADS_SOURCES.CUSTOM_VN,
      sources: [],
      url: "https://your_website.com" // Login page
    },
    {
      type: LEADS_SOURCES.CUSTOM_VO,
      sources: [],
      url: "https://your_website.com" // Login page
    },
  ],
  error: null
});

export const state = getDefaultState;

export const actions = {
  async fetchSources({ commit, state }) {
    const request = {
      name: 'garageGetAllSources',
      args: {},
      fields:
      `
        garageId
        garagePublicDisplayName
        type
        enabled
        phone
        email
        followed_phones
        followed_email
      `
    };
    const resp = await makeApolloQueries([request]);
    resp && resp.data && resp.data.garageGetAllSources.forEach(source => {
      commit("setSource", source);
    });
  },

  async addOrUpdateSource({ commit, state }, {mutation, payload}) {
    const request = {
        name: 'garageSetSource',
        args: payload,
        fields: ` enabled
            garageId
            garagePublicDisplayName
            type
            phone
            email
            followed_phones
            followed_email
          `,
    };
    const resp = await makeApolloMutations([request]);
    if (resp.errors && resp.errors.length > 0) {
      commit("setError", 'serverError');
      console.log(resp.errors);
    } else {
      commit(mutation, resp.data.garageSetSource);
      return resp.data.garageSetSource;
    }
  },

  async deleteSource({ commit, state }, { garageId, email, phone, type }) {
    const request = {
      name: 'garageSetRemoveCrossLeadsSource',
      args: { garageId, email, phone },
      fields: `
        message
        status
      `
    };
    await makeApolloMutations([request]);
    commit("setDeleteSource", { email, type });
  },
};

export const mutations = {
  setSource(state, data) {
    const crossLead = state.crossLeads.find(c => c.type === data.type);
    if (crossLead && !crossLead.sources.find(s => s.garageId === data.garageId)) crossLead.sources = [...crossLead.sources, data];
  },

  setUpdatedSource(state, data) {
    const crossLead = state.crossLeads.find(c => c.type === data.type);
    if (crossLead) crossLead.sources = crossLead.sources.map(s => (s.garageId === data.garageId ? data : s));
  },

  setDeleteSource(state, { email, type }) {
    const crossLead = state.crossLeads.find(c => c.type === type);
    if (crossLead) crossLead.sources = crossLead.sources.filter((s) => s.email !== email);
  },

  setError(state, data) {
    state.error = data;
  }
};

export const getters = {
  crossLeads: state => state.crossLeads,
  error: state => state.error,
  crossLeadByType: state => type => state.crossLeads.find(c => c.type === type)
};

export default {
  state,
  getters,
  actions,
  mutations
};
