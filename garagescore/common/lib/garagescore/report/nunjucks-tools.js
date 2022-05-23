const GarageHistoryPeriod = require('../../../../common/models/garage-history.period');
const leadSaleTypes = require('../../../../common/models/data/type/lead-sale-types.js');
const dataTypes = require('../../../../common/models/data/type/data-types');
const GarageSubscriptionTypes = require('../../../../common/models/garage.subscription.type.js');
const moment = require('moment');
const _ = require('lodash');

function renderNumber(value) {
  if (isNaN(value)) {
    return '-';
  }
  return value.toString().length > 3 ? value.toString().replace(/(.*)(\d{3,3}$)/, '$1.$2') : value;
}
function frenchDecimal(number) {
  return number || number === 0 ? number.toString().replace(/\./, ',') : '';
}
function addComaIntegrNumber(number) {
  const numberStr = number.toString();
  if (!numberStr) {
    return '0';
  }
  if (number && !numberStr.match(',') && !numberStr.match('.') && numberStr !== '10') {
    return `${numberStr},0`;
  }
  return numberStr;
}
function formatFloatingPercent(number) {
  if (number === 0) return '0,0';
  let result = frenchDecimal(Math.round(number < 10 ? number * 10 : number) / (number < 10 ? 10 : 1));
  if (result.length && result.indexOf(',') === -1 && number < 10) {
    result += ',0';
  }
  return result;
}
function percentCalculator(divider, factor) {
  if (isNaN(divider) || isNaN(factor)) {
    return '-';
  }
  if (divider === 0) return 0;
  const result = (factor / divider) * 100;
  return formatFloatingPercent(result);
}
function isApv(dataRecordStatistic) {
  return (
    dataRecordStatistic.type === dataTypes.MAINTENANCE ||
    // refacto 18/12/2018: surveyType=>type (wait for the next reset of ghistory before removing the next lines)
    dataRecordStatistic.surveyType === dataTypes.MAINTENANCE ||
    (dataRecordStatistic.surveyType && dataRecordStatistic.surveyType.toUpperCase() === 'APV')
  );
}
function getApv(dataRecordStatistics) {
  return _.filter(dataRecordStatistics, isApv);
}
function isVn(dataRecordStatistic) {
  return (
    dataRecordStatistic.type === dataTypes.NEW_VEHICLE_SALE ||
    // refacto 18/12/2018: surveyType=>type (wait for the next reset of ghistory before removing the next lines)
    dataRecordStatistic.surveyType === dataTypes.NEW_VEHICLE_SALE ||
    (dataRecordStatistic.surveyType && dataRecordStatistic.surveyType.toUpperCase() === 'VN')
  );
}
function getVn(dataRecordStatistics) {
  return _.filter(dataRecordStatistics, isVn);
}
function isVo(dataRecordStatistic) {
  return (
    dataRecordStatistic.type === dataTypes.USED_VEHICLE_SALE ||
    // refacto 18/12/2018: surveyType=>type (wait for the next reset of ghistory before removing the next lines)
    dataRecordStatistic.surveyType === dataTypes.USED_VEHICLE_SALE ||
    (dataRecordStatistic.surveyType && dataRecordStatistic.surveyType.toUpperCase() === 'VO')
  );
}
function getVo(dataRecordStatistics) {
  return _.filter(dataRecordStatistics, isVo);
}

function isLeadVo(dataRecordStatistic) {
  return dataRecordStatistic.leadSaleType === leadSaleTypes.USED_VEHICLE_SALE;
}
function isLeadVn(dataRecordStatistic) {
  return dataRecordStatistic.leadSaleType === leadSaleTypes.NEW_VEHICLE_SALE;
}
function isLeadUndefined(dataRecordStatistic) {
  return !isLeadVo(dataRecordStatistic) && !isLeadVn(dataRecordStatistic);
}
function getLeadVo(dataRecordStatistics) {
  return _.filter(dataRecordStatistics, isLeadVo);
}
function getLeadVn(dataRecordStatistics) {
  return _.filter(dataRecordStatistics, isLeadVn);
}
function getLeadUndefined(dataRecordStatistics) {
  return _.filter(dataRecordStatistics, isLeadUndefined);
}
function getLeadVnByGarageHistory(garageHistory) {
  return getLeadVn(_.values(garageHistory.surveysLead));
}
function getLeadVoByGarageHistory(garageHistory) {
  return getLeadVo(_.values(garageHistory.surveysLead));
}
function getLeadUndefinedByGarageHistory(garageHistory) {
  return getLeadUndefined(_.values(garageHistory.surveysLead));
}

function leadVoNumber(garageHistory) {
  return getLeadVo(_.values(garageHistory.surveysLead)).length;
}
function leadVnNumber(garageHistory) {
  return getLeadVn(_.values(garageHistory.surveysLead)).length;
}

function unSatisfiedApvNumber(garageHistory) {
  return getApv(_.values(garageHistory.surveysUnsatisfied)).length;
}
function unSatisfiedVnNumber(garageHistory) {
  return getVn(_.values(garageHistory.surveysUnsatisfied)).length;
}
function unSatisfiedVoNumber(garageHistory) {
  return getVo(_.values(garageHistory.surveysUnsatisfied)).length;
}

function isDisplayableUnsatisfiedApv(garageHistory, report) {
  return (
    garageHistory.garagePublicSubscriptions &&
    garageHistory.garagePublicSubscriptions.Maintenance &&
    report.config &&
    report.config.unsatisfiedApv
  );
}

function isDisplayableUnsatisfiedVn(garageHistory, report) {
  return (
    garageHistory.garagePublicSubscriptions &&
    garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.NEW_VEHICLE_SALE] &&
    report.config &&
    report.config.unsatisfiedVn
  );
}

function isDisplayableUnsatisfiedVo(garageHistory, report) {
  return (
    garageHistory.garagePublicSubscriptions &&
    garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.USED_VEHICLE_SALE] &&
    report.config &&
    report.config.unsatisfiedVo
  );
}

function isDisplayableUnsatisfiedByType(garageHistory, report, type) {
  switch (type) {
    case 'Maintenance':
      return isDisplayableUnsatisfiedApv(garageHistory, report);
    case 'vn':
    case 'NewVehicleSale':
      return isDisplayableUnsatisfiedVn(garageHistory, report);
    case 'vo':
    case 'UsedVehicleSale':
      return isDisplayableUnsatisfiedVo(garageHistory, report);
    default:
      return false;
  }
}

function formatType(type) {
  switch (type) {
    case 'Maintenance':
      return 'Atelier';
    case 'vn':
    case 'NewVehicleSale':
      return 'VN';
    case 'vo':
    case 'UsedVehicleSale':
      return 'VO';
    default:
      return '';
  }
}

function isDisplayableLeadVn(garageHistory, report) {
  return (
    garageHistory.garagePublicSubscriptions &&
    garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.LEAD] &&
    report.config &&
    report.config.leadVn
  );
}

function isDisplayableLeadVo(garageHistory, report) {
  return (
    garageHistory.garagePublicSubscriptions &&
    garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.LEAD] &&
    report.config &&
    report.config.leadVo
  );
}

function isDisplayableLeadByDRS(dataRecordStatistic, report) {
  return (
    report.config.lead ||
    (!isLeadVo(dataRecordStatistic) && report.config.leadVn) ||
    (isLeadVo(dataRecordStatistic) && report.config.leadVo)
  );
}

module.exports = {
  renderNumber,
  frenchDecimal,
  formatType,
  getGarageGlobalScore: (stat) => {
    if (stat.score) {
      return addComaIntegrNumber(Math.round(stat.score * 10) / 10);
    }
    const divider =
      (stat.scoreAPV || stat.scoreAPV === 0 ? stat.countSurveyRespondedAPV : 0) +
      (stat.scoreVN || stat.scoreVN === 0 ? stat.countSurveyRespondedVN : 0) +
      (stat.scoreVO || stat.scoreVO === 0 ? stat.countSurveyRespondedVO : 0);
    const score =
      stat.scoreAPV * stat.countSurveyRespondedAPV +
      stat.scoreVN * stat.countSurveyRespondedVN +
      stat.scoreVO * stat.countSurveyRespondedVO;
    return addComaIntegrNumber(frenchDecimal(divider ? Math.round((score * 10) / divider) / 10 : 0));
  },
  getObjValues: (obj) => _.values(obj),
  formatdate: (date, format) => moment(date).format(format),
  formatFloatingPercent,
  followupRectonactedPercent: (stat) => {
    if (isNaN(stat.countFollowupResponseQid122) || isNaN(stat.countFollowupResponded)) {
      return '-';
    }
    if (stat.countFollowupResponseQid122 === 0) return 0;
    const result = (stat.countFollowupResponseQid122 / stat.countFollowupResponded) * 100;
    return formatFloatingPercent(result);
  },
  followupRectonactedNumber: (stat) => renderNumber(stat.countFollowupResponseQid122),
  satisfiedPercent: (stat) => {
    if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveySatisfied)) {
      return '-';
    }
    if (stat.countSurveySatisfied === 0) return 0;
    const result = (stat.countSurveySatisfied / stat.countSurveysResponded) * 100;
    return formatFloatingPercent(result);
  },
  satisfiedNumber: (stat) => renderNumber(stat.countSurveySatisfied),
  unSatisfiedPercent: (stat) => {
    if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveyUnsatisfied)) {
      return '-';
    }
    if (stat.countSurveysResponded === 0) return 0;
    const result = (stat.countSurveyUnsatisfied / stat.countSurveysResponded) * 100;
    return formatFloatingPercent(result);
  },
  unSatisfiedNumber: (garageHistory) => renderNumber(garageHistory.countSurveyUnsatisfied),
  unSatisfiedFollowupNumber: (garageHistory) =>
    garageHistory.surveysUnsatisfiedFollowup ? Object.keys(garageHistory.surveysUnsatisfiedFollowup).length : 0,
  unSatisfiedFollowupNumberNotContacted: (garageHistory) =>
    garageHistory.surveysUnsatisfiedFollowup
      ? _.filter(garageHistory.surveysUnsatisfiedFollowup, (gh) => !gh.unsatisfactionIsRecontacted).length
      : 0,
  unSatisfiedFollowupNumberNotResolved: (garageHistory) =>
    garageHistory.surveysUnsatisfiedFollowup
      ? _.filter(
          garageHistory.surveysUnsatisfiedFollowup,
          (gh) => gh.unsatisfactionIsRecontacted && !gh.unsatisfactionIsResolved
        ).length
      : 0,
  getUnSatisfiedFollowupNotContacted: (garageHistory, type) =>
    garageHistory.surveysUnsatisfiedFollowup
      ? _.filter(garageHistory.surveysUnsatisfiedFollowup, (gh) => !gh.unsatisfactionIsRecontacted && gh.type === type)
      : [],
  getUnSatisfiedFollowupNotResolved: (garageHistory, type) =>
    garageHistory.surveysUnsatisfiedFollowup
      ? _.filter(
          garageHistory.surveysUnsatisfiedFollowup,
          (gh) => gh.unsatisfactionIsRecontacted && !gh.unsatisfactionIsResolved && gh.type === type
        )
      : [],
  listSubscribedTo: (garageHistory) => {
    const results = [];
    if (!garageHistory.garagePublicSubscriptions) {
      return '';
    }
    if (garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.MAINTENANCE]) {
      results.push('Atelier');
    }
    if (garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.LEAD]) {
      results.push('Projet véhicule');
    }
    if (garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.NEW_VEHICLE_SALE]) {
      results.push('Vn');
    }
    if (garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.USED_VEHICLE_SALE]) {
      results.push('Vo');
    }
    if (garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.E_REPUTATION]) {
      results.push('E-reputation');
    }
    return results.join(', ');
  },
  listNotSubscribedTo: (garageHistory) => {
    const results = [];
    if (
      !garageHistory.garagePublicSubscriptions ||
      !garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.MAINTENANCE]
    ) {
      results.push('Atelier');
    }
    if (
      !garageHistory.garagePublicSubscriptions ||
      !garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.LEAD]
    ) {
      results.push('Projet véhicule');
    }
    if (
      !garageHistory.garagePublicSubscriptions ||
      !garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.NEW_VEHICLE_SALE]
    ) {
      results.push('Vn');
    }
    if (
      !garageHistory.garagePublicSubscriptions ||
      !garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.USED_VEHICLE_SALE]
    ) {
      results.push('Vo');
    }
    if (
      !garageHistory.garagePublicSubscriptions ||
      !garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.E_REPUTATION]
    ) {
      results.push('E-reputation');
    }
    return results.join(', ');
  },
  leadVoNumber,
  leadVnNumber,
  getLeadVnByGarageHistory,
  getLeadVoByGarageHistory,
  getLeadUndefinedByGarageHistory,
  unSatisfiedApvNumber,
  unSatisfiedVnNumber,
  unSatisfiedVoNumber,
  unSatisfiedApvPercent: (garageHistory) => {
    if (!unSatisfiedApvNumber(garageHistory) || !garageHistory.countSurveyRespondedAPV) {
      return 0;
    }
    return formatFloatingPercent((unSatisfiedApvNumber(garageHistory) * 100) / garageHistory.countSurveyRespondedAPV);
  },
  unSatisfiedVnPercent: (garageHistory) => {
    if (!unSatisfiedVnNumber(garageHistory) || !garageHistory.countSurveyRespondedVN) {
      return 0;
    }
    return formatFloatingPercent((unSatisfiedVnNumber(garageHistory) * 100) / garageHistory.countSurveyRespondedVN);
  },
  unSatisfiedVoPercent: (garageHistory) => {
    if (!unSatisfiedVoNumber(garageHistory) || !garageHistory.countSurveyRespondedVO) {
      return 0;
    }
    return formatFloatingPercent((unSatisfiedVoNumber(garageHistory) * 100) / garageHistory.countSurveyRespondedVO);
  },
  recommandPercent: (stat) => {
    if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveyRecommand)) {
      return '-';
    }
    if (stat.countSurveyRecommand === 0) return 0;
    const result = (stat.countSurveyRecommand / stat.countSurveysResponded) * 100;
    return formatFloatingPercent(result);
  },
  getNPS: (stat) => {
    if (isNaN(stat.scoreNPS) || stat.scoreNPS === null) {
      if (
        isNaN(stat.countSurveysResponded) ||
        stat.countSurveysResponded === 0 ||
        stat.countSurveysResponded === null
      ) {
        return '-';
      }
      return Math.round(
        (stat.countSurveyPromotor / stat.countSurveysResponded -
          stat.countSurveyDetractor / stat.countSurveysResponded) *
          100
      );
    }
    return stat.scoreNPS;
  },
  getNPSFromSeveralGarages: (garageHistoriesArray) => {
    let NPS = '-';
    let responded = 0;
    let promotor = 0;
    let detractor = 0;
    garageHistoriesArray.forEach((garageHistory) => {
      if (
        !(
          isNaN(garageHistory.countSurveysResponded) ||
          garageHistory.countSurveysResponded === 0 ||
          garageHistory.countSurveysResponded === null ||
          isNaN(garageHistory.countSurveyPromotor) ||
          isNaN(garageHistory.countSurveyDetractor)
        )
      ) {
        responded += garageHistory.countSurveysResponded;
        promotor += garageHistory.countSurveyPromotor;
        detractor += garageHistory.countSurveyDetractor;
      }
    });
    if (responded !== 0) {
      NPS = Math.round((promotor / responded - detractor / responded) * 100);
    }
    return NPS;
  },
  recommandNumber: (stat) => renderNumber(stat.countSurveyRecommand),
  leadNumber: (stat) => {
    if (isNaN(stat.countSurveyLead)) {
      return '-';
    }
    return renderNumber(stat.countSurveyLead);
  },
  respondedPercent: (stat) => {
    if (
      (isNaN(stat.countHavingContacts) && isNaN(stat.countShouldReceiveSurveys)) ||
      isNaN(stat.countSurveysResponded)
    ) {
      return '-';
    }
    if (stat.countSurveysResponded === 0) return 0;
    const result =
      (stat.countSurveysResponded /
        (stat.countShouldReceiveSurveys ? stat.countShouldReceiveSurveys : stat.countHavingContacts)) *
      100;
    return formatFloatingPercent(result);
  },
  havingValidMailsNumber: (stat) => renderNumber(stat.countValidEmails + stat.countBlockedByEmail),
  havingValidMailsPercent: (stat) =>
    percentCalculator(stat.totalShouldSurfaceInCampaignStats, stat.countValidEmails + stat.countBlockedByEmail),
  havingPhonesPercent: (stat) => {
    if (isNaN(stat.totalShouldSurfaceInCampaignStats) || isNaN(stat.countPhones)) {
      return '-';
    }
    if (stat.countPhones === 0) return 0;
    const result = (stat.countPhones / stat.totalShouldSurfaceInCampaignStats) * 100;
    return formatFloatingPercent(result);
  },
  countNotContactable: (stat) => renderNumber(stat.countNotContactable),
  percentNotContactable: (stat) => percentCalculator(stat.totalShouldSurfaceInCampaignStats, stat.countNotContactable),
  isPromotor: (stat) => {
    if (stat.surveyScore) {
      return stat.surveyScore >= 9;
    }
    return false;
  },
  isDetractor: (stat) => {
    if (stat.surveyScore || stat.surveyScore === 0) {
      return stat.surveyScore <= 6;
    }
    return false;
  },
  isPassive: (stat) => {
    if (stat.surveyScore) {
      return stat.surveyScore > 6 && stat.surveyScore < 9;
    }
    return false;
  },
  isApv,
  isVn,
  isVo,
  getPrestaType: (dataRecordStatistic) => {
    if (isApv(dataRecordStatistic)) {
      return 'Atelier';
    }
    if (isVn(dataRecordStatistic)) {
      return 'Achat Vn';
    }
    if (isVo(dataRecordStatistic)) {
      return 'Achat Vo';
    }
    return '';
  },
  isDisplayableUnsatisfiedApv,
  isDisplayableUnsatisfiedVn,
  isDisplayableUnsatisfiedVo,
  isDisplayableUnsatisfiedByType,
  isDisplayableLeadVn,
  isDisplayableLeadVo,
  isDisplayableLeadByDRS,
  subscribedTo: (garageHistory, subscription) =>
    garageHistory.garagePublicSubscriptions && garageHistory.garagePublicSubscriptions[subscription],
  isDisplayableLead: (garageHistory, report) =>
    garageHistory.garagePublicSubscriptions &&
    garageHistory.garagePublicSubscriptions[GarageSubscriptionTypes.LEAD] &&
    report.config &&
    (report.config.lead || report.config.leadVo || report.config.leadVn),
  isDisplayableUnsatisfied: (garageHistory, report, dataRecordStatistic) => {
    if (!dataRecordStatistic) {
      return (
        isDisplayableUnsatisfiedApv(garageHistory, report) ||
        isDisplayableUnsatisfiedVn(garageHistory, report) ||
        isDisplayableUnsatisfiedVo(garageHistory, report)
      );
    }
    if (isApv(dataRecordStatistic) && isDisplayableUnsatisfiedApv(garageHistory, report)) {
      return true;
    }
    if (isVn(dataRecordStatistic) && isDisplayableUnsatisfiedVn(garageHistory, report)) {
      return true;
    }
    if (isVo(dataRecordStatistic) && isDisplayableUnsatisfiedVo(garageHistory, report)) {
      return true;
    }
    return false;
  },
  hasOnePrestaType: (dataRecordStatistic) =>
    (dataRecordStatistic.countSurveyAPV > 0) +
      (dataRecordStatistic.countSurveyVN > 0) +
      (dataRecordStatistic.countSurveyVO > 0) ===
    1,
  getReviewClass: (dataRecordStatistic) => {
    if (dataRecordStatistic.publicReviewStatus === 'Approved') return 'green-gs';
    if (dataRecordStatistic.publicReviewStatus === 'Rejected') return 'red-gs';
    if (dataRecordStatistic.publicReviewStatus === 'Pending') return 'orange-gs';
    return 'grey-gs';
  },
  getReviewTitle: (dataRecordStatistic) => {
    if (dataRecordStatistic.publicReviewStatus === 'Approved') return 'Avis publié';
    if (dataRecordStatistic.publicReviewStatus === 'Rejected') return 'Avis refusé';
    if (dataRecordStatistic.publicReviewStatus === 'Pending') return 'Contrôle en cours';
    return "Pas d'avis";
  },
  getReviewCommentClass: (dataRecordStatistic) => {
    if (dataRecordStatistic.publicReviewCommentStatus === 'Approved') return 'green-gs';
    if (dataRecordStatistic.publicReviewCommentStatus === 'Rejected') return 'red-gs';
    if (dataRecordStatistic.publicReviewCommentStatus === 'Pending') return 'orange-gs';
    return 'grey-gs';
  },
  getReviewCommentTitle: (dataRecordStatistic) => {
    if (dataRecordStatistic.publicReviewCommentStatus === 'Approved') return 'Réponse publiée';
    if (dataRecordStatistic.publicReviewCommentStatus === 'Rejected') return 'Réponse refusée';
    if (dataRecordStatistic.publicReviewCommentStatus === 'Pending') return 'Contrôle en cours';
    return 'Pas de réponse';
  },
  getScoreColorClass: (dataRecordStatistic) => {
    if (dataRecordStatistic.surveyScore >= 9) return 'green-gs';
    if (dataRecordStatistic.surveyScore <= 6) return 'red-gs';
    if (dataRecordStatistic.surveyScore > 6 && dataRecordStatistic.surveyScore < 9) return 'orange-gs';
    return 'grey-gs';
  },
  getFollowUpClass: (dataRecordStatistic) => {
    if (dataRecordStatistic.unsatisfactionIsResolved === true) return 'green-gs';
    if (dataRecordStatistic.unsatisfactionIsResolved === false) return 'red-gs';
    if (dataRecordStatistic.unsatisfactionIsResolutionInProgress) return 'orange-gs';
    return 'grey-gs';
  },
  getFollowUpTitle: (dataRecordStatistic) => {
    if (dataRecordStatistic.unsatisfactionIsResolved === true) return 'Problème résolu';
    if (dataRecordStatistic.unsatisfactionIsResolved === false) return 'Problème non résolu';
    if (dataRecordStatistic.unsatisfactionIsResolutionInProgress) return 'En cours';
    return 'Pas de problème';
  },
  scoreAPV: (stat) => {
    if (isNaN(stat.scoreAPV)) {
      return '-';
    }
    return frenchDecimal(Math.round(stat.scoreAPV * 10) / 10);
  },
  scoreVN: (stat) => {
    if (isNaN(stat.scoreVN)) {
      return '-';
    }
    return frenchDecimal(Math.round(stat.scoreVN * 10) / 10);
  },
  scoreVO: (stat) => {
    if (isNaN(stat.scoreVO)) {
      return '-';
    }
    return frenchDecimal(Math.round(stat.scoreVO * 10) / 10);
  },
  getDisplayablePeriod: (report) => GarageHistoryPeriod.getDisplayableDate(report),
  getSurveyResponse: (survey, qid, filter, filtred) => {
    if (survey && survey.results && survey.results.responses && survey.results.responses[`qid:${qid}`]) {
      const response = survey.results.responses[`qid:${qid}`];
      if (filter && response && response.indexOf(`${filter}:`) === 0) {
        return filtred ? response.replace(`${filter}:`, '') : filter;
      }
      return this.getQuestionOptionLabel(qid, survey.type, response);
    }
    return '';
  },
  filterApv: (stats) => _.filter(stats, isApv),
  filterVn: (stats) => _.filter(stats, isVn),
  filterVo: (stats) => _.filter(stats, isVo),
  // filterByType: (stats, type) => _.filter(stats, (o) => o.type === type),
  orderBySurveyUpdatedAt: (stats) =>
    _.orderBy(
      stats,
      (stat) => {
        if (stat.surveyUpdatedAt && moment(stat.surveyUpdatedAt).isValid()) {
          return moment(stat.surveyUpdatedAt).format('X');
        }
        return 0;
      },
      'desc'
    ),
};
