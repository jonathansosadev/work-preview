import axios from 'axios';
import GarageTypes from '~/utils/models/garage.type.js';

export const state = () => ({
  id: null,
  config: {},
  progression: {
    sections: ['contact', 'services', 'invoice', 'sepa', 'final'],
    section: 'contact',
    done: []
  },
  user: {
    gender: '',
    name: '',
    firstName: '',
    email: '',
    phoneNumber: '',
    occupation: '',
    group: '',
    codePromo: '',
    DMS: '',
    precisionDMS: '',
    phoneNumberTechnicalManager: '',
    phoneNumberBillingManager: '',
    sponsor: '',
    recontact: false,
  },
  randomData: {},
  garages: [emptyGarage()],
  services: {
    maintenance: false,
    sales: false,
    leads: false,
    analytics: false,
    data: false,
    eReputation: false,
  },
  invoice: {
    type: 'individual',
    groups: [emptyInvoiceGroup()]
  }
});

export const mutations = {
  fillUpData(state, prefetch) {
    if (prefetch.id) state.id = prefetch.id;
    if (prefetch.user) state.user = prefetch.user;
    if (prefetch.garages) state.garages = prefetch.garages;
    if (prefetch.services) state.services = prefetch.services;
    if (prefetch.invoice) state.invoice = prefetch.invoice;
    if (prefetch.config) {
      state.config = prefetch.config;
      if (!prefetch.services) state.services = prefetch.config.services;
    }
  },
  fillUpRandomData(state, data) {
    state.randomData = data;
  },
  prefillcontact(state) {
    if (state.randomData) {
      state.user = state.randomData.user;
      state.garages.pop();
      state.garages.push(...state.randomData.garages);
    } else {
      state.user = {
        gender: 'madame',
        name: 'Curie',
        firstName: 'Marie',
        email: 'mc@nobel.fr',
        phoneNumber: '0194326548',
        occupation: 'Génie',
        group: 'Physique',
        DMS: '',
        precisionDMS: '',
        phoneNumberTechnicalManager: '0194326542',
        phoneNumberBillingManager: '0194326547',
        sponsor: 'x@garagescore.com',
        recontact: false
      };
      state.garages.pop();
      state.garages.push({
        name: 'Institut Pasteur',
        address: '25-28, rue du Docteur-Roux',
        siret: '77568489700017',
        city: 'Paris',
        postCode: '75015',
        primaryMake: 'Abarth',
        secondaryMakes: []
      });
      state.garages.push({
        name: 'Institut Max Planck',
        address: '25-28, rue du Docteur-Roux',
        siret: '77568489703017',
        city: 'Göttingen',
        postCode: '75015',
        primaryMake: 'Audi',
        secondaryMakes: []
      });
    }
  },
  goTo(state, section) {
    state.progression.section = section;
    gtag('event', 'page_view', {
      page_path: document.location.pathname + '#' + section,
    });
  },
  setSectionToDone(state, section) {
    state.progression.done.push(section);
  },
  removeSectionFromDone(state, section) {
    const i = state.progression.done.indexOf(section);
    if (i >= 0) {
      state.progression.done.splice(i, 1);
    }
  },
  update(state, payload) {
    setDeepFieldValue(state, payload.path, payload.value);
  },
  updateGarage(state, payload) {
    state.garages[payload.garageId][payload.field] = payload.value;
  },
  addGarage(state) {
    state.garages.push(emptyGarage());
  },
  removeGarage(state, n) {
    if (state.garages.length === 1) { return; }
    state.garages.splice(n, 1);
  },
  updateInvoiceGroup(state, payload) {
    state.invoice.groups[payload.groupId][payload.field] = payload.value;
  },
  addInvoiceGroup(state) {
    state.invoice.groups.push(emptyInvoiceGroup());
  },
  removeInvoiceGroup(state, n) {
    state.invoice.groups.splice(n, 1);
  }
};

export const actions = {
  async getRandomData({ commit }) {
    const res = await axios.get('https://randomuser.me/api/?nat=fr&results=2');
    const data = res && res.data && res.data.results && res.data.results[0];
    const data2 = res && res.data && res.data.results && res.data.results[1];
    let finalData = null;
    if (data && data2) {
      finalData = {};
      finalData.user = {
        gender: {male: 'monsieur', female: 'madame'}[data.gender],
        name: data.name.last.toUpperCase(),
        firstName: data.name.first.charAt(0).toUpperCase() + data.name.first.slice(1),
        email: 'demo-' + Math.floor((Math.random() * 100) + 1).toString() + data.name.last + '@example.com',
        phoneNumber: data.cell.replace(/-/g, ''),
        occupation: 'Génie',
        group: 'GROUP-' + data.name.last.toUpperCase(),
        DMS: '',
        precisionDMS: '',
        phoneNumberTechnicalManager: data.cell.replace(/-/g, ''),
        phoneNumberBillingManager: data.phone.replace(/-/g, ''),
        sponsor: 'x@garagescore.com',
        recontact: false
      };
      finalData.garages = [];
      finalData.garages.push({
        name: 'Institut ' + data.name.last.toUpperCase(),
        address: data.location.street,
        siret: data.phone.replace(/-/g, '').split("").reverse().join("") + Math.floor((Math.random() * 999) + 1000).toString(),
        city: data.location.city,
        postCode: data.location.postcode,
        dms: 'dms-' + data.id.name,
        type: GarageTypes.values()[Math.floor((Math.random() * GarageTypes.values().length))],
        primaryMake: 'Toyota',
        secondaryMakes: []
      });
      finalData.garages.push({
        name: 'Institut ' + data2.name.last.toUpperCase(),
        address: data2.location.street,
        siret: data2.phone.replace(/-/g, '').split("").reverse().join("") + Math.floor((Math.random() * 999) + 1000).toString(),
        city: data2.location.city,
        postCode: data2.location.postcode,
        type: GarageTypes.values()[Math.floor((Math.random() * GarageTypes.values().length))],
        dms: 'dms-' + data2.id.name,
        primaryMake: 'Opel',
        secondaryMakes: []
      });
    }
    if (finalData) commit('fillUpRandomData', finalData);
  },
  goToEnd({ commit }, payload) {
    if (payload.recontact) {
      commit('update', { path: 'recontact', value: payload.recontact });
    }
    commit('goTo', 'final');
  },
  goToNext({ commit, state }) {
    console.log(state.progression.section);
    if (state.progression.section === 'contact') {
      commit('setSectionToDone', 'contact');
      commit('goTo', 'services');
    } else if (state.progression.section === 'services') {
      if (state.garages.length === 1) {
        commit('setSectionToDone', 'services');
        commit('setSectionToDone', 'invoice');
        commit('goTo', 'sepa');
      } else {
        commit('setSectionToDone', 'services');
        commit('goTo', 'invoice');
      }
    } else if (state.progression.section === 'invoice') {
      commit('setSectionToDone', 'invoice');
      commit('goTo', 'sepa');
    }
  },
  goToPrevious({ commit, state }) {
    if (state.progression.section === 'services') {
      commit('removeSectionFromDone', 'services');
      commit('goTo', 'contact');
    } else if (state.progression.section === 'invoice') {
      commit('removeSectionFromDone', 'invoice');
      commit('goTo', 'services');
    } else if (state.progression.section === 'sepa') {
      commit('removeSectionFromDone', 'sepa');
      if (state.garages.length === 1){
        commit('removeSectionFromDone', 'invoice');
        commit('goTo', 'services');
      } else commit('goTo', 'invoice');
    }
  }
};

function setDeepFieldValue(srcObject, fieldName, value) {
  let result = srcObject;
  const fieldParts = fieldName.split('.');
  for (let i = 0; i < fieldParts.length - 1; i++) {
    if (typeof result[fieldParts[i]] === 'undefined') { result[fieldParts[i]] = {}; }
    result = result[fieldParts[i]];
  }
  result[fieldParts[fieldParts.length - 1]] = value;
}
function emptyGarage() {
  return {
    name: '',
    type: '',
    address: '',
    dms: '',
    siret: '',
    city: '',
    postCode: '',
    primaryMake: '',
    secondaryMakes: [],
    dealer: ''
  };
}
function emptyInvoiceGroup() {
  return {
    name: '',
    garages: []
  };
}

export const getters = {
  secondaryMakes: (state) => garageId => state.garages[garageId].secondaryMakes,
  invoiceGroupeGarages: (state) => groupId => state.invoice.groups[groupId].garages,
  currentSection: (state) => state.progression.section,
  shouldRecontact: (state) => state.recontact
};
