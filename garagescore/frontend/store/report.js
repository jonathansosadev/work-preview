import { buildQuery } from '~/util/graphql';
import fields from '~/api/graphql/fields';
import { makeApolloQueries } from '../util/graphql';
import DataTypes from '~/utils/models/data/type/data-types';
import Vue from 'vue';

const loadingStatuses = {
  EMPTY: 'EMPTY', 
  LOADING: 'LOADING', 
  LOADED: 'LOADED',
  FORBIDDEN: 'FORBIDDEN'
}

export const state = () => ({
  month: null, // Starting from January = 0 to December = 11 because we're working with arrays afterwards
  year: null,
  tab: 'leads',
  garages: [],
  loadingStatus: loadingStatuses.EMPTY,
  monthlySummary: [
    { 
      id: 'leads', title: 'leads', type: "number", icon: 'icon-gs-car-repair',
      perf12M: null, perfM: null, perfM1: null, bestGaragesPerf12M: null, averageGaragesPerf12M: null,
      availableDataTypes: [], currentDataType: null,
      data: {
        allServices: [], NewVehicleSale: [], UsedVehicleSale: []
      },
      employeesRanking: {
        allServices: [], NewVehicleSale: [], UsedVehicleSale: []
      }
    },
    { 
      id: 'satisfaction', title: 'satisfaction', type: "score", icon: 'icon-gs-gauge-dashboard',
      perf12M: null, perfM: null, perfM1: null, bestGaragesPerf12M: null, averageGaragesPerf12M: null,
      availableDataTypes: [], currentDataType: null,
      data: {
        allServices: [], Maintenance: [], NewVehicleSale: [], UsedVehicleSale: []
      },
      employeesRanking: {
        allServices: [], Maintenance: [], NewVehicleSale: [], UsedVehicleSale: []
      }
    },
    { 
      id: 'problemResolution', title: 'problemResolution', type: "percentage", icon: 'icon-gs-sad',
      perf12M: null, perfM: null, perfM1: null, bestGaragesPerf12M: null, averageGaragesPerf12M: null,
      availableDataTypes: [], currentDataType: null,
      data: {
        allServices: [], Maintenance: [], NewVehicleSale: [], UsedVehicleSale: []
      },
      employeesRanking: {
        allServices: [], Maintenance: [], NewVehicleSale: [], UsedVehicleSale: []
      }
    },
    { 
      id: 'validEmails', title: 'validEmails', type: "percentage", icon: 'icon-gs-at-symbol',
      perf12M: null, perfM: null, perfM1: null, bestGaragesPerf12M: null, averageGaragesPerf12M: null,
      availableDataTypes: [], currentDataType: null,
      data: {
        allServices: [], Maintenance: [], NewVehicleSale: [], UsedVehicleSale: []
      },
      employeesRanking: {
        allServices: [], Maintenance: [], NewVehicleSale: [], UsedVehicleSale: []
      }
    }
  ]
});

export const modules = {
  
};

export const getters = {
  getMonth:              (state) => state.month,
  getYear:               (state) => state.year,
  getGarages:            (state) => state.garages,
  getMonthlySummaryTabs: (state) => state.monthlySummary,
  getCurrentTabName:     (state) => state.tab,
  getCurrentTab:         (state) => state.monthlySummary.find(t => t.id === state.tab) || state.monthlySummary[0],
  getCurrentDataType(state, getters) {
    return getters.getCurrentTab.currentDataType || 'allServices';
  },
  getAvailableDataTypes(state, getters) {
    return getters.getCurrentTab.availableDataTypes.filter((type) => (
      [DataTypes.MAINTENANCE, DataTypes.NEW_VEHICLE_SALE, DataTypes.USED_VEHICLE_SALE].includes(type)
    ));
  },
  getMonthlySummaryData(state, getters) {
    return (getters.getCurrentTab && getters.getCurrentTab.data[getters.getCurrentDataType]) || [];
  },
  getEmployeesRanking(state, getters) {
    return (getters.getCurrentTab && getters.getCurrentTab.employeesRanking[getters.getCurrentDataType]) || [];
  },
  getMonthlySummaryStatus(state) {
    return state.loadingStatus;
  },
  isTabForbidden(state) {
    return (tabName) => {
      const tab = state.monthlySummary.find(t => t.id === tabName) || state.monthlySummary[0];
      return !tab.availableDataTypes.length;
    };
  },
  isCurrentTabForbidden(state, getters) { // Mettre param tab
    return !getters.getCurrentTab.availableDataTypes.length;
  },
  getTabUnsubscribedGarages(state, getters) {
    return (tabName) => {
      tabName = state.monthlySummary.find(t => t.id === tabName) ? tabName : state.monthlySummary[0].id;
      const dataType = getters.getCurrentDataType;
      if (!state.tab || !state.garages.length) return [];
      return state.garages.filter((g) => g.authorizations && (dataType === 'allServices' ? !g.authorizations[tabName].length : !g.authorizations[tabName].includes(dataType)));
    };
  },
  /**
   * Gets data displayed in the "Summary of this month" table at the end of the report 
   * Will output an array with 1 element per garage 
   * { garageName, leads, satisfaction, problemResolution, validEmails}
   */
  getSummaryByGarage(state) {
    const temp = {};
    const dataType = 'allServices';
    const hasLeads = (converted) => [converted.newProjects, converted.knownProjects, converted.wonFromCompetition].some(e => e !== null);
    const leadsPerf = (convertedLeads) => convertedLeads.newProjects + convertedLeads.knownProjects + convertedLeads.wonFromCompetition;

    for (const tab of state.monthlySummary) {
      tab.data[dataType].forEach(garagePerf => {
        switch (tab.id) {
          case 'leads':
            temp[garagePerf.garageName] = { 
              ...temp[garagePerf.garageName],
              leads: hasLeads(garagePerf.convertedLeads12M) ? leadsPerf(garagePerf.convertedLeadsM) : 'unsubscribed'
            };
            break;
          case 'satisfaction':
            temp[garagePerf.garageName] = { 
              ...temp[garagePerf.garageName],
              satisfaction: garagePerf.surveysRespondedM ? (garagePerf.ponderatedScoreM / garagePerf.surveysRespondedM) : 'notAvailable'
            };
            break;
          case 'problemResolution':
            temp[garagePerf.garageName] = { 
              ...temp[garagePerf.garageName],
              problemResolution: garagePerf.countUnsatisfiedM ? (100 * garagePerf.unsatisfiedSolvedM / garagePerf.countUnsatisfiedM) : 'notAvailable'
            };
            break;
          case 'validEmails':
            temp[garagePerf.garageName] = { 
              ...temp[garagePerf.garageName],
              validEmails: garagePerf.totalForEmailsM ? (100 * garagePerf.validEmailsM / garagePerf.totalForEmailsM) : 'notAvailable'
            };
            break;
        }
      });
    }
    
    return Object.keys(temp).map(garageName => ({
      garageName, ...temp[garageName]
    }));
  },
  /**
   * Gets average numbers for the top 20% displayed in the "Summary of this month" table at the end of the report
   */
  getSummaryBestGarages(state) {
    const leadsTab = state.monthlySummary.find(tab => tab.id === 'leads');
    const satisfactionTab = state.monthlySummary.find(tab => tab.id === 'satisfaction');
    const problemResolutionTab = state.monthlySummary.find(tab => tab.id === 'problemResolution');
    const validEmailsTab = state.monthlySummary.find(tab => tab.id === 'validEmails');
    return {
      garageName: 'top20',
      leads: leadsTab ? leadsTab.bestGaragesPerf12M : 0,
      satisfaction: satisfactionTab ? satisfactionTab.bestGaragesPerf12M : 0,
      problemResolution: problemResolutionTab ? problemResolutionTab.bestGaragesPerf12M : 0,
      validEmails: validEmailsTab ? validEmailsTab.bestGaragesPerf12M : 0,
    };
  },
  /**
   * Gets the average figures of the garages of the report "Summary of this month" table at the end of the report
   */
  getSummaryMyAverage(state) {
    const averageRate = (arr, numKey, denKey, percentage = false) => {
      return (percentage ? 100 : 1) * arr.reduce((sum, e) => sum += e[numKey], 0) / arr.reduce((sum, e) => sum += e[denKey], 0);
    };
    const sumConvertedLeads = (arr, key) => {
      return arr.reduce((sum, e) => {
        const convertedLeads = e.convertedLeadsM;
        return sum += convertedLeads.newProjects + convertedLeads.knownProjects + convertedLeads.wonFromCompetition;
      }, null);
    }
    const garageHasLeads = (g) => g && g.authorizations && g.authorizations.leads && g.authorizations.leads.length;
    const nbGaragesLeads = (state.garages && state.garages.filter(garageHasLeads).length) || 1;

    let leadsData = state.monthlySummary.find(tab => tab.id === 'leads' && tab.availableDataTypes.length);
    leadsData = (leadsData && leadsData.data && leadsData.data.allServices) || null;
    const leadsStat = leadsData ? (sumConvertedLeads(leadsData) / nbGaragesLeads) : null;

    let satisfactionData = state.monthlySummary.find(tab => tab.id === 'satisfaction' && tab.availableDataTypes.length);
    satisfactionData = (satisfactionData && satisfactionData.data && satisfactionData.data.allServices) || null;
    const satisfactionStat = satisfactionData ? averageRate(satisfactionData, 'ponderatedScoreM', 'surveysRespondedM') : null;

    let problemResolutionData = state.monthlySummary.find(tab => tab.id === 'problemResolution' && tab.availableDataTypes.length);
    problemResolutionData = (problemResolutionData && problemResolutionData.data && problemResolutionData.data.allServices) || null;
    const problemResolutionStat = problemResolutionData ? averageRate(problemResolutionData, 'unsatisfiedSolvedM', 'countUnsatisfiedM', true) : null;

    let validEmailsData = state.monthlySummary.find(tab => tab.id === 'validEmails' && tab.availableDataTypes.length);
    validEmailsData = (validEmailsData && validEmailsData.data && validEmailsData.data.allServices) || null;
    const validEmailsStat = validEmailsData ? averageRate(validEmailsData, 'validEmailsM', 'totalForEmailsM', true) : null;

    return {
      garageName: 'myGarages',
      leads: leadsStat !== null ? leadsStat : 'notAvailable',
      satisfaction: satisfactionStat !== null ? satisfactionStat : 'notAvailable',
      problemResolution: problemResolutionStat !== null ? problemResolutionStat : 'notAvailable',
      validEmails: validEmailsStat !== null ? validEmailsStat : 'notAvailable'
    };
  },
  /**
   * Gets average figures of top 20% and all GS garages for the current tab to be reminded in the recommandation section 
   */
  getAverageAndBestPerfs(state, getters) {
    return {
      avgPerf12M: getters.getCurrentTab.averageGaragesPerf12M,
      bestPerf12M: getters.getCurrentTab.bestGaragesPerf12M
    };
  }
};

export const actions = {
  /**
   * Executes GraphQL query to get the report data 
   */
  async fetchMonthlySummary({ commit, state, getters }, { reportId, tabName }) {
    const currentTab = state.monthlySummary.find(t => t.id === (tabName ? tabName : state.tab)) || state.monthlySummary[0];
    const dataType = getters.getCurrentDataType;
    commit('setReportLoading', true);
    // Sometimes we already have the data so doing a GraphQL request is useless.
    const needsQuery = tabName ? (!currentTab.data[dataType] || !currentTab.data[dataType].length) : state.monthlySummary.some((tab) => !tab.data[dataType] || !tab.data[dataType].length);
    if (needsQuery) {
      const request = {
        name: 'reportKpiGetMonthlySummary',
        args: {
          reportId,
          dataType,
        },
        fields: ` id
            month
            year
            garages {
              garageId
              garageName
              group
              authorizations {
                leads
                satisfaction
                problemResolution
                validEmails
              }
            }
            availableDataTypes {
              leads
              satisfaction
              problemResolution
              validEmails
            }
            bestLeadsPerf
            bestSatisfactionPerf
            bestProblemResolutionPerf
            bestValidEmailsPerf
            averageLeadsPerf
            averageSatisfactionPerf
            averageProblemResolutionPerf
            averageValidEmailsPerf
            leads {
              garageId
              garageName
              convertedLeads12M {
                newProjects
                knownProjects
                wonFromCompetition
              }
              convertedLeadsM {
                newProjects
                knownProjects
                wonFromCompetition
              }
              convertedLeadsM1 {
                newProjects
                knownProjects
                wonFromCompetition
              }
              convertedLeadsM2
              convertedLeadsM3
              detailsUrl
            }
            satisfaction {
              garageId
              garageName
              surveysResponded12M
              surveysRespondedM
              surveysRespondedM1
              surveysRespondedM2
              surveysRespondedM3
              ponderatedScore12M
              ponderatedScoreM
              ponderatedScoreM1
              ponderatedScoreM2
              ponderatedScoreM3
              satisfaction12M {
                promotors
                passives
                detractors
              }
              satisfactionM {
                promotors
                passives
                detractors
              }
              satisfactionM1 {
                promotors
                passives
                detractors
              }
              detailsUrl
            }
            problemResolution {
              garageId
              garageName
              countUnsatisfied12M
              countUnsatisfiedM
              countUnsatisfiedM1
              countUnsatisfiedM2
              countUnsatisfiedM3
              unsatisfiedSolved12M
              unsatisfiedSolvedM
              unsatisfiedSolvedM1
              unsatisfiedSolvedM2
              unsatisfiedSolvedM3
              problemProcessing12M {
                noAction
                contacted
                closedWithResolution
              }
              problemProcessingM {
                noAction
                contacted
                closedWithResolution
              }
              problemProcessingM1 {
                noAction
                contacted
                closedWithResolution
              }
              detailsUrl
            }
            validEmails {
              garageId
              garageName
              totalForEmails12M
              totalForEmailsM
              totalForEmailsM1
              totalForEmailsM2
              totalForEmailsM3
              validEmails12M
              validEmailsM
              validEmailsM1
              validEmailsM2
              validEmailsM3
              emailQuality12M {
                validEmails
                wrongEmails
                missingEmails
              }
              emailQualityM {
                validEmails
                wrongEmails
                missingEmails
              }
              emailQualityM1 {
                validEmails
                wrongEmails
                missingEmails
              }
              detailsUrl
            }
            employeesRanking {
              leads {
                employeeName
                garageName
                convertedLeads12M
                convertedLeadsM
                convertedLeadsM1
              }
              problemResolution {
                employeeName
                garageName
                solvingRate12M
                solvingRateM
                solvingRateM1
              }
            }
          `
      };
      const resp = await makeApolloQueries([request]);
      // We have this new object so that we're not risking overriding existing data when retreiving a specific dataType
      let dataToTreat = {
        garages: resp.data.reportKpiGetMonthlySummary.garages,
        year: resp.data.reportKpiGetMonthlySummary.year,
        month: resp.data.reportKpiGetMonthlySummary.month,
        employeesRanking: resp.data.reportKpiGetMonthlySummary.employeesRanking,
        dataType
      }

      if (tabName) dataToTreat[tabName] = resp.data.reportKpiGetMonthlySummary[tabName];
      else dataToTreat = resp.data.reportKpiGetMonthlySummary;
      commit('setPeriod', dataToTreat);
      commit('setGarageList', dataToTreat.garages);
      commit('setAverageAndBestGaragesPerf', resp.data.reportKpiGetMonthlySummary);
      commit('setMonthlySummary', dataToTreat);
      commit('setEmployeesRanking', dataToTreat)
      commit('setAvailableDataTypes', resp.data.reportKpiGetMonthlySummary.availableDataTypes);
      if (!tabName) {
        commit('setCurrentTab', { availableDataTypes: resp.data.reportKpiGetMonthlySummary.availableDataTypes });
      }
    }
    commit('setTabsPerfs', { tabName });
    commit('setReportLoading', false);
  },
  // Changes dataType and issues a query to retreive the 
  changeCurrentDataTypeId({ commit, dispatch, rootState, state, getters }, { dataTypeId }) {
    commit('setCurrentDataTypeId', { dataTypeId, currentTab: getters.getCurrentTab });
    dispatch('fetchMonthlySummary', { reportId: rootState.route.params.id, tabName: state.tab });
  },
  changeCurrentTab({ commit }, { tab }) {
    commit('setCurrentTab', { tab });
  },
};

export const mutations = {
  setCurrentDataTypeId(state, { dataTypeId, currentTab }) {
    currentTab.currentDataType = dataTypeId;
  },
  setCurrentTab(state, { tab, availableDataTypes }) {
    if (tab) {
      state.tab = tab;
    } else {
      state.tab = (availableDataTypes.leads.length) ? 'leads' : 'satisfaction';
    }
  },
  setReportLoading(state, loading) {
    state.loadingStatus = loading ? 'LOADING' : 'LOADED'
  },
  setAverageAndBestGaragesPerf(state, monthlySummary) {
    const findTab = (tabName) => state.monthlySummary.find(t => t.id === tabName);
    findTab('leads').bestGaragesPerf12M = monthlySummary.bestLeadsPerf;
    findTab('leads').averageGaragesPerf12M = monthlySummary.averageLeadsPerf;
    findTab('satisfaction').bestGaragesPerf12M = monthlySummary.bestSatisfactionPerf;
    findTab('satisfaction').averageGaragesPerf12M = monthlySummary.averageSatisfactionPerf;
    findTab('problemResolution').bestGaragesPerf12M = monthlySummary.bestProblemResolutionPerf;
    findTab('problemResolution').averageGaragesPerf12M = monthlySummary.averageProblemResolutionPerf;
    findTab('validEmails').bestGaragesPerf12M = monthlySummary.bestValidEmailsPerf;
    findTab('validEmails').averageGaragesPerf12M = monthlySummary.averageValidEmailsPerf;
  },
  /**
   * After the GraphQL request has been completed, this setter is called. 
   * It will sort garages for all tabs (from the best to the worst) and put it in the relevant obj in state 
   */
  setMonthlySummary(state, { leads, satisfaction, problemResolution, validEmails, dataType }) {
    dataType = dataType || 'allServices'
    const findTab = (tabName) => state.monthlySummary.find(t => t.id === tabName);
    if (leads && leads.length) {
      findTab('leads').data[dataType] = leads.sort((a, b) => {// Sorting in desc order, so (a,b) => b - a
        const sumA = a.convertedLeadsM.newProjects + a.convertedLeadsM.knownProjects + a.convertedLeadsM.wonFromCompetition;
        const sumB = b.convertedLeadsM.newProjects + b.convertedLeadsM.knownProjects + b.convertedLeadsM.wonFromCompetition;
        if (Number.isNaN(sumA)) return 1;
        if (Number.isNaN(sumB)) return -1;
        return sumB - sumA;
      });
    }
    if (satisfaction && satisfaction.length) {
      findTab('satisfaction').data[dataType] = satisfaction.sort((a, b) => {
        const scoreA = a.ponderatedScoreM / a.surveysRespondedM;
        const scoreB = b.ponderatedScoreM / b.surveysRespondedM;
        if (Number.isNaN(scoreA)) return 1;
        if (Number.isNaN(scoreB)) return -1;
        return scoreB - scoreA;
      });
    }
    if (problemResolution && problemResolution.length) {
      findTab('problemResolution').data[dataType] = problemResolution.sort((a, b) => {
        const rateA = a.unsatisfiedSolvedM / a.countUnsatisfiedM;
        const rateB = b.unsatisfiedSolvedM / b.countUnsatisfiedM;
        if (Number.isNaN(rateA)) return 1;
        if (Number.isNaN(rateB)) return -1;
        return rateB - rateA;
      });
    }
    if (validEmails && validEmails.length) {
      findTab('validEmails').data[dataType] = validEmails.sort((a, b) => {
        const rateA = a.validEmailsM / a.totalForEmailsM;
        const rateB = b.validEmailsM / b.totalForEmailsM;
        if (Number.isNaN(rateA)) return 1;
        if (Number.isNaN(rateB)) return -1;
        return rateB - rateA;
      });
    }
  },
  setEmployeesRanking(state, { employeesRanking, dataType }) {
    dataType = dataType || 'allServices'
    const findTab = (tabName) => state.monthlySummary.find(t => t.id === tabName);
    if (employeesRanking) {
      if (employeesRanking.leads && employeesRanking.leads.length) {
        findTab('leads').employeesRanking[dataType] = employeesRanking.leads;
      }
      if (employeesRanking.satisfaction && employeesRanking.satisfaction.length) {
        findTab('satisfaction').employeesRanking[dataType] = employeesRanking.satisfaction;
      }
      if (employeesRanking.problemResolution && employeesRanking.problemResolution.length) {
        findTab('problemResolution').employeesRanking[dataType] = employeesRanking.problemResolution;
      }
      if (employeesRanking.validEmails && employeesRanking.validEmails.length) {
        findTab('validEmails').employeesRanking[dataType] = employeesRanking.validEmails;
      }
    }
  },
  /**
   * Computes combined performances for each tab and stores the result in state variable
   */
  setTabsPerfs(state, { tabName }) {
    const findTab = (tabName) => state.monthlySummary.find(t => t.id === tabName);
    const isSubscribed = (tab) => state.garages && state.garages.some(g => g.authorizations && g.authorizations[tab] && g.authorizations[tab].length);
    const averageRate = (arr, numKey, denKey, percentage = false) => {
      return (percentage ? 100 : 1) * arr.reduce((sum, e) => sum += e[numKey], 0) / arr.reduce((sum, e) => sum += e[denKey], 0);
    };
    const sumConvertedLeads = (arr, key) => {
      return arr.reduce((sum, e) => {
        const convertedLeads = e[key];
        return sum += convertedLeads.newProjects + convertedLeads.knownProjects + convertedLeads.wonFromCompetition;
      }, null);
    }
    const dataType = tabName && findTab(tabName) ? ( findTab(tabName).currentDataType || 'allServices' ) : 'allServices';
    if (tabName === 'leads' || !tabName) {
      const leadsData = findTab('leads').data[dataType];
      findTab('leads').perf12M = isSubscribed('leads') ? sumConvertedLeads(leadsData, 'convertedLeads12M') : null;
      findTab('leads').perfM = isSubscribed('leads') ? sumConvertedLeads(leadsData, 'convertedLeadsM') : null;
      findTab('leads').perfM1 = isSubscribed('leads') ? sumConvertedLeads(leadsData, 'convertedLeadsM1') : null;
    }
    if (tabName === 'satisfaction' || !tabName) {
      const satisfactionData = findTab('satisfaction').data[dataType];
      findTab('satisfaction').perf12M = averageRate(satisfactionData, 'ponderatedScore12M', 'surveysResponded12M');
      findTab('satisfaction').perfM = averageRate(satisfactionData, 'ponderatedScoreM', 'surveysRespondedM');
      findTab('satisfaction').perfM1 = averageRate(satisfactionData, 'ponderatedScoreM1', 'surveysRespondedM1');
    }
    if (tabName === 'problemResolution' || !tabName) {
      const problemResolutionData = findTab('problemResolution').data[dataType];
      findTab('problemResolution').perf12M = averageRate(problemResolutionData, 'unsatisfiedSolved12M', 'countUnsatisfied12M', true);
      findTab('problemResolution').perfM = averageRate(problemResolutionData, 'unsatisfiedSolvedM', 'countUnsatisfiedM', true);
      findTab('problemResolution').perfM1 = averageRate(problemResolutionData, 'unsatisfiedSolvedM1', 'countUnsatisfiedM1', true);
    }
    if (tabName === 'validEmails' || !tabName) {
      const validEmailsData = findTab('validEmails').data[dataType];
      findTab('validEmails').perf12M = averageRate(validEmailsData, 'validEmails12M', 'totalForEmails12M', true);
      findTab('validEmails').perfM = averageRate(validEmailsData, 'validEmailsM', 'totalForEmailsM', true);
      findTab('validEmails').perfM1 = averageRate(validEmailsData, 'validEmailsM1', 'totalForEmailsM1', true);
    }
  },
  /**
   * For each tab of our summary, we're setting the dataTypes available 
   */
  setAvailableDataTypes(state, availableDataTypesPerTab) {
    state.monthlySummary.forEach((tab) => {
      if (tab.id && availableDataTypesPerTab[tab.id]) {
        tab.availableDataTypes = availableDataTypesPerTab[tab.id];
        if (availableDataTypesPerTab[tab.id].length === 1) {
          tab.currentDataType = availableDataTypesPerTab[tab.id][0];
          tab.data[availableDataTypesPerTab[tab.id][0]] = tab.data.allServices;
        }
      }
    });
  },
  setGarageList(state, garages) {
    state.garages = garages;
  },
  setPeriod(state, { month, year }) {
    state.month = month;
    state.year = year;
  },
}