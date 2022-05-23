const moment = require('moment');
const garageStatuses = require('../../../../../../common/models/garage.status');
const { getUserGarages } = require('../../../../../../common/models/user/user-mongo');
const { isSubscribed } = require('../../../../../../common/models/garage/garage-methods');
const garageSubscriptions = require('../../../../../../common/models/garage.subscription.type');

module.exports = {
  /**
   * Get the past months tokens
   * @param {Number} baseMonth
   * @param {Number} baseYear
   * @returns {{'12M' : Number[], M: Number, M1: Number,  M2: Number, M3: Number,}} Period tokens
   */
  getPeriods: (baseMonth, baseYear) => {
    const now = moment().utc().month(baseMonth).year(baseYear);
    const res = [];
    for (let i = 0; i < 12; i++) {
      const d = now.clone().subtract(i, 'month');
      res.push(Number(`${d.year()}${`0${d.month() + 1}`.slice(-2)}`));
    }
    return {
      '12M': res,
      M: res[0],
      M1: res[1],
      M2: res[2],
      M3: res[3],
    };
  },

  fillConversionZeros(leadsKpis, garageList) {
    /*
    This fills in zeros for the garages that don't have any KPI for the periods but have the required subscriptions
    It happens mostly for recent garages, that didn't have enough time to gather relevant data.
    In those cases there's no leadTicket, nor unsatisfiedTicket nor conversion, thus no KPI
  */
    const existingGaragesKpis = leadsKpis.map((kpi) => kpi._id.toString());
    garageList
      .filter((garage) => !existingGaragesKpis.includes(garage.garageId.toString()))
      .forEach((garage) =>
        leadsKpis.push({
          _id: garage.garageId,
          convertedLeads: 0,
          convertedTradeIns: 0,
          convertedLeadsNewProjects: 0,
          convertedTradeInsNewProjects: 0,
          convertedLeadsKnownProjects: 0,
          convertedTradeInsKnownProjects: 0,
          convertedLeadsWonFromCompetition: 0,
          convertedTradeInsWonFromCompetition: 0,
        })
      );
  },
  /**
   * Returns an object with information about the authorizations for the given report
   * {
   *    userAccesses: {
   *      // reflects the values of the switches on the cockpit/admin page of the user
   *      // authorizations given tab by tab resulting in an array containing the dataTypes available
   *      leads: ['APV', 'VN', 'VO'], satisfaction: [], problemResolution: [], validEmails: []
   *    },
   *    garagesAccesses: [{
   *       // reflects the values of the garages' subscriptions which are found in GreyBO/billing
   *       // same thing as above, for each tab, an array contains the dataTypes available
   *       leads: ['APV', 'VN', 'VO'], satisfaction: [], problemResolution: [], validEmails: []
   *    }]
   * }
   */
  async getGaragesAndUserAccesses(app, reportId) {
    const userAccesses = { leads: [], satisfaction: [], problemResolution: [], validEmails: [] };
    const emptyAccesses = { garageList: [], userAccesses, garagesAccesses: [] };

    // Getting info about the report, user and garages
    const report = await app.models.Report.findById(reportId);
    if (!report || !report.user) return emptyAccesses;
    const user = await app.models.User.findById(report.user() || report.userId);
    if (!user.reportConfigs || !user.reportConfigs.monthlySummary) return emptyAccesses;

    const $match = {
      status: { $in: [garageStatuses.RUNNING_AUTO, garageStatuses.RUNNING_MANUAL] },
      $or: [
        { 'subscriptions.Maintenance.enabled': true },
        { 'subscriptions.NewVehicleSale.enabled': true },
        { 'subscriptions.UsedVehicleSale.enabled': true },
      ],
    };
    const $project = { _id: true, type: true, publicDisplayName: true, group: true, subscriptions: true, status: true };
    const garages = await getUserGarages(app, user.getId(), $project, [{ $match }]);

    const config = user.reportConfigs.monthlySummary;
    const hasLeads = garages.some(({ subscriptions }) => isSubscribed(subscriptions, garageSubscriptions.LEAD));
    const hasApv = garages.some(({ subscriptions }) => isSubscribed(subscriptions, garageSubscriptions.MAINTENANCE));
    const hasVn = garages.some(({ subscriptions }) =>
      isSubscribed(subscriptions, garageSubscriptions.NEW_VEHICLE_SALE)
    );
    const hasVo = garages.some(({ subscriptions }) =>
      isSubscribed(subscriptions, garageSubscriptions.USED_VEHICLE_SALE)
    );

    /** Determining user authorizations, dataType per dataType & tab per tab */
    if (hasApv) {
      // Nothing for Leads as it does not have APV
      if (config.unsatisfiedApv) userAccesses.satisfaction.push('Maintenance'); // Satisfaction & ProblemResolution follow switch Mécontents
      if (config.unsatisfiedApv) userAccesses.problemResolution.push('Maintenance'); // Satisfaction & ProblemResolution follow switch Mécontents
      if (config.contactsApv) userAccesses.validEmails.push('Maintenance'); // Follows the new switch for Contacts
    }
    if (hasVn) {
      if (hasLeads && config.leadVn) userAccesses.leads.push('NewVehicleSale'); // Follows switch "Projet d'achats"
      if (config.unsatisfiedVn) userAccesses.satisfaction.push('NewVehicleSale');
      if (config.unsatisfiedVn) userAccesses.problemResolution.push('NewVehicleSale');
      if (config.contactsVn) userAccesses.validEmails.push('NewVehicleSale');
    }
    if (hasVo) {
      if (hasLeads && config.leadVo) userAccesses.leads.push('UsedVehicleSale');
      if (config.unsatisfiedVo) userAccesses.satisfaction.push('UsedVehicleSale');
      if (config.unsatisfiedVo) userAccesses.problemResolution.push('UsedVehicleSale');
      if (config.contactsVo) userAccesses.validEmails.push('UsedVehicleSale');
    }

    /** Determining authorization for each garage */
    const garagesAccesses = garages.map(({ _id, subscriptions }) => {
      const gHasLeads = isSubscribed(subscriptions, garageSubscriptions.LEAD);
      const gHasApv = isSubscribed(subscriptions, garageSubscriptions.MAINTENANCE);
      const gHasVn = isSubscribed(subscriptions, garageSubscriptions.NEW_VEHICLE_SALE);
      const gHasVo = isSubscribed(subscriptions, garageSubscriptions.USED_VEHICLE_SALE);
      const leads = [];
      const satisfaction = [];
      const problemResolution = [];
      const validEmails = [];
      if (gHasApv) {
        satisfaction.push('Maintenance');
        problemResolution.push('Maintenance');
        validEmails.push('Maintenance');
      }
      if (gHasVn) {
        if (gHasLeads) leads.push('NewVehicleSale');
        satisfaction.push('NewVehicleSale');
        problemResolution.push('NewVehicleSale');
        validEmails.push('NewVehicleSale');
      }
      if (gHasVo) {
        if (gHasLeads) leads.push('UsedVehicleSale');
        satisfaction.push('UsedVehicleSale');
        problemResolution.push('UsedVehicleSale');
        validEmails.push('UsedVehicleSale');
      }
      return { leads, satisfaction, problemResolution, validEmails, garageId: _id };
    });

    /** Formatting a list of all garages available to the user, formerly given by getGargagesListFromReportId */
    const garageList = this.formatGarages(garages, garagesAccesses);

    return { garageList, userAccesses, garagesAccesses };
  },
  formatGarages(garageList, garagesAccesses) {
    return garageList.map(({ _id, publicDisplayName, group }) => ({
      garageId: _id.toString(),
      garageName: publicDisplayName,
      group,
      authorizations: garagesAccesses.find((a) => a.garageId === _id),
    }));
  },
  async getPeriodFromReportId(app, reportId) {
    const report = await app.models.Report.findById(reportId);
    return report ? [report.month, report.year] : [];
  },
  /**
   * There's a huge difference between what we get from the aggregate and what we'll display in terms of data organization
   * So this function aims to transform the output of Mongo's aggregate into something that will be returned by graphQL
   * MongoDB Aggregate Output Format:
   * {
   *   Period: [{
   *      garageId, ...fields returned by aggregate
   *   }]
   * }
   * GraphQL expected format:
   * {
   *   leads: [{
   *      garageId, garageName,
   *      ...fields that will be displayed with suffixes to differentiate periods
   *   }],
   *   satisfaction, problemResolution, validEmails  // same thing for those 3
   * }
   */
  formatKpis(datas, garageList) {
    const convertedLeads = (obj, token, suffix) => {
      if (
        Number.isInteger(obj[token][`convertedLeads${suffix}`]) ||
        Number.isInteger(obj[token][`convertedTradeIns${suffix}`])
      ) {
        return (obj[token][`convertedLeads${suffix}`] || 0) + (obj[token][`convertedTradeIns${suffix}`] || 0);
      }
      return null;
    };
    const tmp = {};
    const intermediary = {};
    const finalResult = {
      leads: [],
      satisfaction: [],
      problemResolution: [],
      validEmails: [],
    };
    for (const period of Object.keys(datas)) {
      for (const garageDatas of datas[period]) {
        tmp[garageDatas._id] = { ...tmp[garageDatas._id] };
        tmp[garageDatas._id][period] = garageDatas;
      }
    }
    for (const garageId of Object.keys(tmp)) {
      const tmpKpis = tmp[garageId];
      /**
       * The object below is really close to what we'll have with GraphQL, to be taken tab per tab
       */
      intermediary[garageId] = {
        leads: {
          convertedLeads12M: {
            newProjects: tmpKpis['12M'] && convertedLeads(tmpKpis, '12M', 'NewProjects'),
            knownProjects: tmpKpis['12M'] && convertedLeads(tmpKpis, '12M', 'KnownProjects'),
            wonFromCompetition: tmpKpis['12M'] && convertedLeads(tmpKpis, '12M', 'WonFromCompetition'),
          },
          convertedLeadsM: {
            newProjects: tmpKpis.M && convertedLeads(tmpKpis, 'M', 'NewProjects'),
            knownProjects: tmpKpis.M && convertedLeads(tmpKpis, 'M', 'KnownProjects'),
            wonFromCompetition: tmpKpis.M && convertedLeads(tmpKpis, 'M', 'WonFromCompetition'),
          },
          convertedLeadsM1: {
            newProjects: tmpKpis.M1 && convertedLeads(tmpKpis, 'M1', 'NewProjects'),
            knownProjects: tmpKpis.M1 && convertedLeads(tmpKpis, 'M1', 'KnownProjects'),
            wonFromCompetition: tmpKpis.M1 && convertedLeads(tmpKpis, 'M1', 'WonFromCompetition'),
          },
          convertedLeadsM2: tmpKpis.M2 && convertedLeads(tmpKpis, 'M2', ''),
          convertedLeadsM3: tmpKpis.M3 && convertedLeads(tmpKpis, 'M3', ''),
        },
        satisfaction: {
          surveysResponded12M: tmpKpis['12M'] && tmpKpis['12M'].countSurveysResponded,
          surveysRespondedM: tmpKpis.M && tmpKpis.M.countSurveysResponded,
          surveysRespondedM1: tmpKpis.M1 && tmpKpis.M1.countSurveysResponded,
          surveysRespondedM2: tmpKpis.M2 && tmpKpis.M2.countSurveysResponded,
          surveysRespondedM3: tmpKpis.M3 && tmpKpis.M3.countSurveysResponded,
          ponderatedScore12M: tmpKpis['12M'] && tmpKpis['12M'].ponderatedScore,
          ponderatedScoreM: tmpKpis.M && tmpKpis.M.ponderatedScore,
          ponderatedScoreM1: tmpKpis.M1 && tmpKpis.M1.ponderatedScore,
          ponderatedScoreM2: tmpKpis.M2 && tmpKpis.M2.ponderatedScore,
          ponderatedScoreM3: tmpKpis.M3 && tmpKpis.M3.ponderatedScore,
          satisfaction12M: {
            promotors: tmpKpis['12M'] && tmpKpis['12M'].countSurveyPromotor,
            passives: tmpKpis['12M'] && tmpKpis['12M'].countSurveyPassive,
            detractors: tmpKpis['12M'] && tmpKpis['12M'].countSurveyDetractor,
          },
          satisfactionM: {
            promotors: tmpKpis.M && tmpKpis.M.countSurveyPromotor,
            passives: tmpKpis.M && tmpKpis.M.countSurveyPassive,
            detractors: tmpKpis.M && tmpKpis.M.countSurveyDetractor,
          },
          satisfactionM1: {
            promotors: tmpKpis.M1 && tmpKpis.M1.countSurveyPromotor,
            passives: tmpKpis.M1 && tmpKpis.M1.countSurveyPassive,
            detractors: tmpKpis.M1 && tmpKpis.M1.countSurveyDetractor,
          },
        },
        problemResolution: {
          countUnsatisfied12M: tmpKpis['12M'] && tmpKpis['12M'].countUnsatisfied,
          countUnsatisfiedM: tmpKpis.M && tmpKpis.M.countUnsatisfied,
          countUnsatisfiedM1: tmpKpis.M1 && tmpKpis.M1.countUnsatisfied,
          countUnsatisfiedM2: tmpKpis.M2 && tmpKpis.M2.countUnsatisfied,
          countUnsatisfiedM3: tmpKpis.M3 && tmpKpis.M3.countUnsatisfied,
          unsatisfiedSolved12M: tmpKpis['12M'] && tmpKpis['12M'].countUnsatisfiedResolved,
          unsatisfiedSolvedM: tmpKpis.M && tmpKpis.M.countUnsatisfiedResolved,
          unsatisfiedSolvedM1: tmpKpis.M1 && tmpKpis.M1.countUnsatisfiedResolved,
          unsatisfiedSolvedM2: tmpKpis.M2 && tmpKpis.M2.countUnsatisfiedResolved,
          unsatisfiedSolvedM3: tmpKpis.M3 && tmpKpis.M3.countUnsatisfiedResolved,
          problemProcessing12M: {
            noAction: tmpKpis['12M'] && tmpKpis['12M'].countUnsatisfiedNoAction,
            contacted: tmpKpis['12M'] && tmpKpis['12M'].countUnsatisfiedContacted,
            closedWithResolution: tmpKpis['12M'] && tmpKpis['12M'].countUnsatisfiedResolved,
          },
          problemProcessingM: {
            noAction: tmpKpis.M && tmpKpis.M.countUnsatisfiedNoAction,
            contacted: tmpKpis.M && tmpKpis.M.countUnsatisfiedContacted,
            closedWithResolution: tmpKpis.M && tmpKpis.M.countUnsatisfiedResolved,
          },
          problemProcessingM1: {
            noAction: tmpKpis.M1 && tmpKpis.M1.countUnsatisfiedNoAction,
            contacted: tmpKpis.M1 && tmpKpis.M1.countUnsatisfiedContacted,
            closedWithResolution: tmpKpis.M1 && tmpKpis.M1.countUnsatisfiedResolved,
          },
        },
        validEmails: {
          totalForEmails12M: tmpKpis['12M'] && tmpKpis['12M'].totalForEmails,
          totalForEmailsM: tmpKpis.M && tmpKpis.M.totalForEmails,
          totalForEmailsM1: tmpKpis.M1 && tmpKpis.M1.totalForEmails,
          totalForEmailsM2: tmpKpis.M2 && tmpKpis.M2.totalForEmails,
          totalForEmailsM3: tmpKpis.M3 && tmpKpis.M3.totalForEmails,
          validEmails12M: tmpKpis['12M'] && tmpKpis['12M'].countValidEmails,
          validEmailsM: tmpKpis.M && tmpKpis.M.countValidEmails,
          validEmailsM1: tmpKpis.M1 && tmpKpis.M1.countValidEmails,
          validEmailsM2: tmpKpis.M2 && tmpKpis.M2.countValidEmails,
          validEmailsM3: tmpKpis.M3 && tmpKpis.M3.countValidEmails,
          emailQuality12M: {
            validEmails: tmpKpis['12M'] && tmpKpis['12M'].countValidEmails,
            wrongEmails: tmpKpis['12M'] && tmpKpis['12M'].countWrongEmails,
            missingEmails: tmpKpis['12M'] && tmpKpis['12M'].countNotPresentEmails,
          },
          emailQualityM: {
            validEmails: tmpKpis.M && tmpKpis.M.countValidEmails,
            wrongEmails: tmpKpis.M && tmpKpis.M.countWrongEmails,
            missingEmails: tmpKpis.M && tmpKpis.M.countNotPresentEmails,
          },
          emailQualityM1: {
            validEmails: tmpKpis.M1 && tmpKpis.M1.countValidEmails,
            wrongEmails: tmpKpis.M1 && tmpKpis.M1.countWrongEmails,
            missingEmails: tmpKpis.M1 && tmpKpis.M1.countNotPresentEmails,
          },
        },
      };
    }
    for (const gId of Object.keys(intermediary)) {
      const garageName = garageList.find((g) => g.garageId == gId).garageName;
      for (const category of Object.keys(intermediary[gId])) {
        intermediary[gId][category].garageId = gId;
        intermediary[gId][category].garageName = garageName;
        finalResult[category].push(intermediary[gId][category]);
      }
    }
    return finalResult;
  },
  async getAverageAndBestGaragesPerf(app, month, year) {
    // eslint-disable-line arrow-body-style
    return new Promise((res) => {
      app.models.Configuration.getMonthlySummary(true, (err, bestGaragesPerfs) => {
        if (!err && bestGaragesPerfs && bestGaragesPerfs[year] && bestGaragesPerfs[year][month]) {
          return res(bestGaragesPerfs[year][month]);
        }
        return res({});
      });
    });
  },
};
