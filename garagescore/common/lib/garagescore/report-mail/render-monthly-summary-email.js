/**
 * Generate Report mails Body(Html, text, subject) from templates
 */
const { ObjectId } = require('mongodb');
const app = require('../../../../server/server');
const { DataTypes, GarageSubscriptions, GarageStatuses, KpiTypes } = require('../../../../frontend/utils/enumV2');
const { getUserGarages } = require('../../../models/user/user-mongo');
const gsClient = require('../client');
const { isSubscribed } = require('../../../models/garage/garage-methods');
const KpiDictionary = require('../kpi/KpiDictionary');

/**
 * Convert a month (0-11) and a year into current and last month periods YYYYMM
 * @param {Number} baseMonth
 * @param {Number} baseYear
 * @returns {{thisMonth: Number, lastMonth: Number}} periods YYYYMM
 */
const _getPeriodTokens = (baseMonth, baseYear) => {
  const strThisMonth = `0${baseMonth + 1}`.slice(-2);
  const strLastMonth = `0${baseMonth === 0 ? 12 : baseMonth}`.slice(-2);

  return {
    thisMonth: Number(`${baseYear}${strThisMonth}`),
    lastMonth: Number(`${baseYear}${strLastMonth}`),
  };
};

/**
 * Compare performances between the 2 months
 * @param {number} thisMonth
 * @param {number} lastMonth
 * @returns {{perf: Number, evolution: String}} comparison
 */
const _compareWithLastMonth = (thisMonth, lastMonth) => {
  let evolution = 'constant';
  if (thisMonth > lastMonth) {
    evolution = 'increase';
  }
  if (thisMonth < lastMonth) {
    evolution = 'decrease';
  }
  return {
    perf: thisMonth,
    evolution,
  };
};

/**
 * Get an object with fields to project with their dataTypes acronyms
 * @param {String[]} fields
 * @param {String[]} dataTypes
 * @returns {object} fields to be projected
 */
const _projectFields = (fields, dataTypes) => {
  const dataTypesAcronyms = dataTypes.map((type) => DataTypes.getPropertyFromValue(type, 'acronym'));
  const res = {};
  dataTypesAcronyms.forEach((acronym) => {
    fields.forEach((field) => {
      res[KpiDictionary[`${field}${acronym}`]] = true;
    });
  });
  return res;
};

const _getLeadStats = async (garageList, periodTokens, dataTypes) => {
  if (!dataTypes.length) {
    return _compareWithLastMonth(null, null);
  }
  const fields = _projectFields(['countConvertedLeads', 'countConvertedTradeIns'], dataTypes);

  const garageIds = garageList
    .filter(
      ({ subscriptions }) =>
        isSubscribed(subscriptions, GarageSubscriptions.LEAD) &&
        [GarageSubscriptions.NEW_VEHICLE_SALE, GarageSubscriptions.USED_VEHICLE_SALE].some((sub) =>
          isSubscribed(subscriptions, sub)
        )
    )
    .map(({ _id }) => _id);

  const sumConversions = (kpis) => {
    if (!kpis) {
      return null;
    }
    return kpis.reduce(
      (sum, kpi) =>
        sum +
        (kpi[KpiDictionary.countConvertedLeadsVn] || 0) +
        (kpi[KpiDictionary.countConvertedTradeInsVn] || 0) +
        (kpi[KpiDictionary.countConvertedLeadsVo] || 0) +
        (kpi[KpiDictionary.countConvertedTradeInsVo] || 0),
      0
    );
  };
  const baseConditions = {
    [KpiDictionary.garageId]: { $in: garageIds },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };

  const thisMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.thisMonth,
      },
      {
        projection: fields,
      }
    )
    .toArray();

  const lastMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.lastMonth,
      },
      {
        projection: fields,
      }
    )
    .toArray();
  return _compareWithLastMonth(sumConversions(thisMonth), sumConversions(lastMonth));
};

const _getSatisfactionStats = async (garageList, periodTokens, dataTypes = []) => {
  if (!dataTypes.length) {
    return _compareWithLastMonth(null, null);
  }

  const fields = _projectFields(['satisfactionCountReviews', 'satisfactionSumRating'], dataTypes);

  const garageIds = garageList
    .filter(({ subscriptions }) =>
      [
        GarageSubscriptions.MAINTENANCE,
        GarageSubscriptions.NEW_VEHICLE_SALE,
        GarageSubscriptions.USED_VEHICLE_SALE,
      ].some((sub) => isSubscribed(subscriptions, sub))
    )
    .map(({ _id }) => _id);

  const dataTypesAcronyms = dataTypes.map((type) => DataTypes.getPropertyFromValue(type, 'acronym'));
  const avgScore = (res, kpi) => {
    if (!kpi) {
      return {};
    }

    res.totalRating =
      (res.totalRating || 0) +
      dataTypesAcronyms.reduce((r, acronym) => {
        return (r || 0) + (kpi[KpiDictionary[`satisfactionSumRating${acronym}`]] || 0);
      }, 0);
    res.totalReviews =
      (res.totalReviews || 0) +
      dataTypesAcronyms.reduce(
        (r, acronym) => (r || 0) + (kpi[KpiDictionary[`satisfactionCountReviews${acronym}`]] || 0),
        0
      );
    res.currentAvg = Math.round(10 * (res.totalRating / res.totalReviews)) / 10;
    return res;
  };

  const baseConditions = {
    [KpiDictionary.garageId]: { $in: garageIds },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.satisfactionCountReviews]: { $gt: 0 },
  };

  const thisMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.thisMonth,
      },
      { projection: fields }
    )
    .toArray();
  const lastMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.lastMonth,
      },
      { projection: fields }
    )
    .toArray();
  return _compareWithLastMonth(thisMonth.reduce(avgScore, {}).currentAvg, lastMonth.reduce(avgScore, {}).currentAvg);
};

const _getProblemResolutionStats = async (garageList, periodTokens, dataTypes) => {
  if (!dataTypes.length) {
    return _compareWithLastMonth(null, null);
  }

  const fields = _projectFields(['countUnsatisfied', 'countUnsatisfiedClosedWithResolution'], dataTypes);

  const garageIds = garageList.map(({ _id }) => _id);
  const avgRate = (res, kpi) => {
    res.countUnsatisfiedClosedWithResolution =
      (res.countUnsatisfiedClosedWithResolution || 0) +
      (kpi[KpiDictionary.countUnsatisfiedClosedWithResolutionApv] || 0) +
      (kpi[KpiDictionary.countUnsatisfiedClosedWithResolutionVn] || 0) +
      (kpi[KpiDictionary.countUnsatisfiedClosedWithResolutionVo] || 0);
    res.countUnsatisfied =
      (res.countUnsatisfied || 0) +
      (kpi[KpiDictionary.countUnsatisfiedApv] || 0) +
      (kpi[KpiDictionary.countUnsatisfiedVn] || 0) +
      (kpi[KpiDictionary.countUnsatisfiedVo] || 0);
    res.currentRate = res.countUnsatisfied
      ? Math.round(100 * (res.countUnsatisfiedClosedWithResolution / res.countUnsatisfied))
      : 0;
    return res;
  };

  const baseConditions = {
    [KpiDictionary.garageId]: { $in: garageIds },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
  };

  const thisMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.thisMonth,
      },
      { projection: fields }
    )
    .toArray();
  const lastMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.lastMonth,
      },
      { projection: fields }
    )
    .toArray();

  return _compareWithLastMonth(thisMonth.reduce(avgRate, {}).currentRate, lastMonth.reduce(avgRate, {}).currentRate);
};

const _getValidEmailsStats = async (garageList, periodTokens, dataTypes) => {
  if (!dataTypes.length) {
    return _compareWithLastMonth(null, null);
  }

  const fields = _projectFields(
    [
      'contactsCountValidEmails',
      'contactsCountBlockedLastMonthEmail',
      'contactsCountUnsubscribedByEmail',
      'contactsCountTotalShouldSurfaceInCampaignStats',
    ],
    dataTypes
  );

  const garageIds = garageList
    .filter(({ subscriptions }) =>
      [
        GarageSubscriptions.MAINTENANCE,
        GarageSubscriptions.NEW_VEHICLE_SALE,
        GarageSubscriptions.USED_VEHICLE_SALE,
      ].some((sub) => isSubscribed(subscriptions, sub))
    )
    .map(({ _id }) => _id);

  const dataTypesAcronyms = dataTypes.map((type) => DataTypes.getPropertyFromValue(type, 'acronym'));
  const sumKey = (kpi, key) =>
    dataTypesAcronyms.reduce((r, acronym) => (r || 0) + (kpi[KpiDictionary[`${key}${acronym}`]] || 0), 0);
  const avgRate = (res, kpi) => {
    res.countValidEmails =
      (res.countValidEmails || 0) +
      sumKey(kpi, 'contactsCountValidEmails') +
      sumKey(kpi, 'contactsCountBlockedLastMonthEmail') +
      sumKey(kpi, 'contactsCountUnsubscribedByEmail');
    res.totalForEmails = (res.totalForEmails || 0) + sumKey(kpi, 'contactsCountTotalShouldSurfaceInCampaignStats');
    res.currentRate = Math.round(100 * (res.countValidEmails / res.totalForEmails));
    return res;
  };

  const baseConditions = {
    [KpiDictionary.garageId]: { $in: garageIds },
    [KpiDictionary.kpiType]: KpiTypes.GARAGE_KPI,
    [KpiDictionary.contactsCountTotalShouldSurfaceInCampaignStats]: { $gt: 0 },
  };

  const thisMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.thisMonth,
      },
      { projection: fields }
    )
    .toArray();
  const lastMonth = await app.models.KpiByPeriod.getMongoConnector()
    .find(
      {
        ...baseConditions,
        [KpiDictionary.period]: periodTokens.lastMonth,
      },
      { projection: fields }
    )
    .toArray();
  return _compareWithLastMonth(thisMonth.reduce(avgRate, {}).currentRate, lastMonth.reduce(avgRate, {}).currentRate);
};

const _getUserReportConfig = async (user, garages) => {
  const userReportConfig = { leads: [], satisfaction: [], problemResolution: [], validEmails: [] };
  if (!user.reportConfigs || !user.reportConfigs.monthlySummary) {
    return userReportConfig;
  }

  const monthlySummaryConfig = user.reportConfigs.monthlySummary;
  const hasLeads = garages.some(({ subscriptions }) => isSubscribed(subscriptions, GarageSubscriptions.MAINTENANCE));
  const hasApv = garages.some(({ subscriptions }) => isSubscribed(subscriptions, GarageSubscriptions.MAINTENANCE));
  const hasVn = garages.some(({ subscriptions }) => isSubscribed(subscriptions, GarageSubscriptions.NEW_VEHICLE_SALE));
  const hasVo = garages.some(({ subscriptions }) => isSubscribed(subscriptions, GarageSubscriptions.USED_VEHICLE_SALE));
  /** Determining user authorizations, dataType per dataType & tab per tab */
  if (hasApv) {
    // Nothing for Leads as it does not have APV
    if (monthlySummaryConfig.unsatisfiedApv) {
      userReportConfig.satisfaction.push(DataTypes.MAINTENANCE);
      userReportConfig.problemResolution.push(DataTypes.MAINTENANCE);
    }
    if (monthlySummaryConfig.contactsApv) {
      userReportConfig.validEmails.push(DataTypes.MAINTENANCE);
    }
  }
  if (hasVn) {
    if (hasLeads && monthlySummaryConfig.leadVn) {
      userReportConfig.leads.push(DataTypes.NEW_VEHICLE_SALE);
    }
    if (monthlySummaryConfig.unsatisfiedVn) {
      userReportConfig.satisfaction.push(DataTypes.NEW_VEHICLE_SALE);
      userReportConfig.problemResolution.push(DataTypes.NEW_VEHICLE_SALE);
    }
    if (monthlySummaryConfig.contactsVn) {
      userReportConfig.validEmails.push(DataTypes.NEW_VEHICLE_SALE);
    }
  }
  if (hasVo) {
    if (hasLeads && monthlySummaryConfig.leadVo) {
      userReportConfig.leads.push(DataTypes.USED_VEHICLE_SALE);
    }
    if (monthlySummaryConfig.unsatisfiedVo) {
      userReportConfig.satisfaction.push(DataTypes.USED_VEHICLE_SALE);
      userReportConfig.problemResolution.push(DataTypes.USED_VEHICLE_SALE);
    }
    if (monthlySummaryConfig.contactsVo) {
      userReportConfig.validEmails.push(DataTypes.USED_VEHICLE_SALE);
    }
  }

  return userReportConfig;
};

const getMonthlySummaryPayload = async (contact) => {
  let report;
  try {
    if (contact.payload.reportId === 'TEST_MONTHLY') {
      // For DarkBO's preview, we'll take any available monthly summary
      report = await app.models.Report.getMongoConnector().findOne({ reportConfigId: 'monthlySummary' });
    } else {
      report = await app.models.Report.getMongoConnector().findOne({ _id: ObjectId(contact.payload.reportId) });
    }
    const { month, year, userId, erratum } = report;

    const garagesWhere = { status: { $in: [GarageStatuses.RUNNING_AUTO, GarageStatuses.RUNNING_MANUAL] } };
    const garagesFields = {
      _id: true,
      type: true,
      publicDisplayName: true,
      subscriptions: true,
      locale: true,
      timezone: true,
      status: true,
    };
    const reportUser = await app.models.User.getMongoConnector().findOne({ _id: ObjectId(userId) });
    const periodTokens = _getPeriodTokens(month, year);
    const garageList = await getUserGarages(app, reportUser._id, garagesFields, [{ $match: garagesWhere }]);
    const userReportConfig = await _getUserReportConfig(reportUser, garageList);

    const satisfactionStats = await _getSatisfactionStats(garageList, periodTokens, userReportConfig.satisfaction);
    const leadStats = await _getLeadStats(garageList, periodTokens, userReportConfig.leads);
    const problemResolutionStats = await _getProblemResolutionStats(
      garageList,
      periodTokens,
      userReportConfig.problemResolution
    );
    const validEmailsStats = await _getValidEmailsStats(garageList, periodTokens, userReportConfig.validEmails);
    return {
      month,
      year,
      reportLink: `${gsClient.appUrl()}${gsClient.url.getShortUrl('MONTLHY_SUMMARY')}/${contact.payload.reportId}`,
      garages: garageList.map(({ publicDisplayName }) => ({ publicDisplayName })),
      leads: leadStats,
      satisfaction: satisfactionStats,
      problemResolution: problemResolutionStats,
      validEmails: validEmailsStats,
      erratum,
      locale: contact.payload.locale || (garageList && garageList[0] && garageList[0].locale) || null,
      timezone: contact.payload.timezone || (garageList && garageList[0] && garageList[0].timezone) || null,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
};

module.exports = {
  getMonthlySummaryPayload,
};
