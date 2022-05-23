const util = require('util');
const async = require('async');
const Writable = require('stream').Writable;
// const debug = require('debug')('garagescore:common:lib:garagescore:data-record-statistic:TransformBlackListItemStream');
const DataTypes = require('../../../models/data/type/data-types');
const LeadSaleTypes = require('../../../models/data/type/lead-sale-types');
const LeadTradeInTypes = require('../../../models/data/type/lead-trade-in-types');
const EmailStatus = require('../../../models/data/type/email-status');
const PhoneStatus = require('../../../models/data/type/phone-status');
const CampaignContactStatus = require('../../../models/data/type/campaign-contact-status');
const unsatisfiedFollowupStatus = require('../../../models/data/type/unsatisfied-followup-status.js');
const commonTicket = require('../../../models/data/_common-ticket');

/**
 * Generic spread example prefix = 'score', value = null: { scoreAPV: null, scoreVO: null... }
 */
const _genericListGenerator = (prefix, value) => {
  // eslint-disable-line
  return DataTypes.getAcronyms().reduce((acc, job) => {
    acc[`${prefix}${job}`] = value; // eslint-disable-line
    return acc;
  }, {});
};

/**
 * Transform customer to dataRecordStatistic update
 * @param options
 * @returns {DRSAggregetorStream}
 * @constructor
 */
function DRSAggregetorStream(options) {
  if (!(this instanceof DRSAggregetorStream)) {
    return new DRSAggregetorStream(options);
  }
  if (!options) options = {}; // eslint-disable-line no-param-reassign
  options.objectMode = true; // eslint-disable-line no-param-reassign
  this.aggregationResult = {};
  this.aggregationResult['ALL_USERS'] = this.getEmptyGarageHistory();
  this.generateHistoryDetails = options.generateHistoryDetails;
  Writable.call(this, options);
}

util.inherits(DRSAggregetorStream, Writable);

function satisfiedPercent(stat) {
  if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveySatisfied)) {
    return 0;
  }
  if (stat.countSurveySatisfied === 0) return 0;
  return (stat.countSurveySatisfied / stat.countSurveysResponded) * 100;
}
function unSatisfiedPercent(stat) {
  if (isNaN(stat.countSurveysResponded) || isNaN(stat.countSurveyUnsatisfied)) {
    return 0;
  }
  if (stat.countSurveyUnsatisfied === 0) return 0;
  return (stat.countSurveyUnsatisfied / stat.countSurveysResponded) * 100;
}
function unContactablePercent(stat) {
  if (isNaN(stat.totalShouldSurfaceInCampaignStats) || isNaN(stat.countNotContactable)) {
    return 0;
  }
  if (stat.totalShouldSurfaceInCampaignStats === 0) return 0;
  return (stat.countNotContactable / stat.totalShouldSurfaceInCampaignStats) * 100;
}
function getNPS(stat) {
  if (
    typeof stat.countSurveysResponded !== 'undefined' &&
    typeof stat.countSurveySatisfied !== 'undefined' &&
    typeof stat.countSurveyUnsatisfied !== 'undefined' &&
    stat.countSurveysResponded !== 0
  ) {
    return Math.round(
      (stat.countSurveySatisfied / stat.countSurveysResponded -
        stat.countSurveyUnsatisfied / stat.countSurveysResponded) *
        100
    );
  }
  return 0;
}
function perJobNPS(stat, job) {
  if (
    typeof stat[`countSurveyResponded${job}`] !== 'undefined' &&
    typeof stat[`countSurveySatisfied${job}`] !== 'undefined' &&
    typeof stat[`countSurveyUnsatisfied${job}`] !== 'undefined' &&
    stat[`countSurveyResponded${job}`] !== 0
  ) {
    return Math.round(
      (stat[`countSurveySatisfied${job}`] / stat[`countSurveyResponded${job}`] -
        stat[`countSurveyUnsatisfied${job}`] / stat[`countSurveyResponded${job}`]) *
        100
    );
  }
  return 0;
}

DRSAggregetorStream.prototype.increment = function increment(field, job, frontDesk) {
  const aggregationResult = this.aggregationResult;

  if (frontDesk && frontDesk !== 'ALL_USERS') {
    if (!aggregationResult[frontDesk]) aggregationResult[frontDesk] = this.getEmptyGarageHistory();
    if (job) {
      aggregationResult[frontDesk].historyByType[job][field]++;
    }
    aggregationResult[frontDesk][field]++;
  }
  if (job) {
    aggregationResult['ALL_USERS'].historyByType[job][field]++;
  }
  aggregationResult['ALL_USERS'][field]++;
};

function _addGlobalCounterFields(aggregationResult) {
  aggregationResult.surveySatisfiedPercent = satisfiedPercent(aggregationResult); // eslint-disable-line no-param-reassign
  aggregationResult.surveyUnsatisfiedPercent = unSatisfiedPercent(aggregationResult); // eslint-disable-line no-param-reassign
  aggregationResult.surveyUncontactablePercent = unContactablePercent(aggregationResult); // eslint-disable-line no-param-reassign
  aggregationResult.scoreNPS = getNPS(aggregationResult); // eslint-disable-line no-param-reassign
  DataTypes.getAcronyms().forEach((job) => {
    aggregationResult[`scoreNPS${job}`] = perJobNPS(aggregationResult, job); // eslint-disable-line no-param-reassign
  });
}

DRSAggregetorStream.prototype.getAggregationResult = function getAggregationResult() {
  return this.aggregationResult;
};

DRSAggregetorStream.prototype.meanScore = function meanScore(job, frontDesk, singleData, countField, scoreField) {
  if (singleData.get('review.rating.value') || singleData.get('review.rating.value') === 0) {
    const frontDesks = ['ALL_USERS'];
    if (frontDesk && frontDesk !== 'ALL_USERS') frontDesks.push(frontDesk);
    for (const fDesk of frontDesks) {
      const aggregationResults = [this.aggregationResult[fDesk]];
      if (job) aggregationResults.push(this.aggregationResult[fDesk].historyByType[job]);
      for (const aggregationResult of aggregationResults) {
        if (aggregationResult[countField] === 0) {
          aggregationResult[scoreField] = parseFloat(singleData.get('review.rating.value'), 10);
        } else {
          const numerator =
            parseFloat(singleData.get('review.rating.value'), 10) +
            aggregationResult[countField] * aggregationResult[scoreField];
          const newValue = numerator / (aggregationResult[countField] + 1);
          aggregationResult[scoreField] = newValue;
        }
      }
    }
    this.increment(countField, job, frontDesk);
  }
};

DRSAggregetorStream.prototype.getEmptyGarageHistory = function getEmptyGarageHistory() {
  const history = {
    ..._genericListGenerator('countShouldReceiveSurveys', 0),
    ..._genericListGenerator('countSurvey', 0),
    ..._genericListGenerator('countSurveySatisfied', 0),
    ..._genericListGenerator('countSurveyUnsatisfied', 0),
    ..._genericListGenerator('countSurveyResponded', 0),
    ..._genericListGenerator('score', 0),
    countBlocked: 0,
    countBlockedByEmail: 0,
    countBlockedByPhone: 0,
    countCustomers: 0,
    countEmails: 0,
    countFollowup: 0,
    countFollowupResponded: 0,
    countFollowupResponseQid122: 0,
    countHavingAdditionalInfo: 0,
    countHavingContacts: 0,
    countNotContactable: 0,
    countScheduledContacts: 0,
    countNotPresentEmails: 0,
    countNotPresentPhones: 0,
    countPhones: 0,
    countReceivedSurveys: 0,
    countShouldReceiveSurveys: 0,
    countShouldReceiveSurveysByEmail: 0,
    countShouldReceiveSurveysByPhone: 0,
    countSurveyLead: 0,
    countSurveyLeadNoTrade: 0,
    countSurveyLeadTrade: 0,
    countSurveyLeadUnknownSale: 0,
    countSurveyLeadUnknownTrade: 0,
    countSurveyLeadVn: 0,
    countSurveyLeadVo: 0,
    countSurveyNotRecommand: 0,
    countSurveyRecommand: 0,
    countSurveySatisfied: 0,
    countSurveyUnsatisfied: 0,
    countSurveyPromotor: 0,
    countSurveyDetractor: 0,
    countSurveyDetractorsWithResponse: 0,
    countSurveyResponded: 0,
    countSurveys: 0,
    countSurveysResponded: 0,
    countValidEmails: 0,
    countValidPhones: 0,
    countWrongEmails: 0,
    countWrongPhones: 0,
    countUnsubscribedByPhone: 0,
    countUnsubscribedByEmail: 0,
    countBlockedLastMonthEmail: 0,
    countBlockedLastMonthPhone: 0,
    countModifiedEmail: 0,
    countModifiedPhone: 0,
    countNotModifiedEmail: 0,
    countNotModifiedPhone: 0,
    score: 0,
    countPotentialSales: 0,
    // For garage histories
    countConversions: 0,
    countConversionsVO: 0,
    countConversionsVN: 0,
    countConversionsTradeins: 0,
    countSolvedAPVUnsatisfied: 0,
    countSolvedVNUnsatisfied: 0,
    countSolvedVOUnsatisfied: 0,
    countUnsatisfiedYear: 0,
    countLeadToRecontact: 0,
    countLeadClosedTicket: 0,
    countLeadActiveTicket: 0,
    countLeadTicketTransformedToSale: 0,
    countLeadTicket: 0,
    countLeadWaitingForContact: 0,
    countLeadWaitingForMeeting: 0,
    countLeadWaitingForProposition: 0,
    countLeadWaitingForClosing: 0,
    countUnsatisfiedTicket: 0,
    countUnsatisfiedActiveTicket: 0,
    countUnsatisfiedToRecontact: 0,
    countUnsatisfiedClosedTicket: 0,
    countUnsatisfiedTicketSatisfied: 0,
    total: 0,
    totalShouldSurfaceInCampaignStats: 0,
  };
  const emptyGHistory = {
    historyByType: {},
  };
  Object.assign(emptyGHistory, history);
  DataTypes.getJobs().forEach((job) => {
    // aggregationResult by job
    emptyGHistory.historyByType[job] = {};
    Object.assign(emptyGHistory.historyByType[job], history);
  });
  emptyGHistory.historyByType.other = {};
  Object.assign(emptyGHistory.historyByType.other, history);
  return emptyGHistory;
};

DRSAggregetorStream.prototype._fillAggregationResult = function _fillAggregationResult(job, singleData, frontDesk, cb) {
  this.increment('totalShouldSurfaceInCampaignStats', job, frontDesk);
  switch (singleData.get('campaign.contactStatus.emailStatus')) {
    case EmailStatus.VALID:
      this.increment('countValidEmails', job, frontDesk);
      if (singleData.get('customer.contact.email.revisedAt')) {
        this.increment('countModifiedEmail', job, frontDesk);
      } else {
        this.increment('countNotModifiedEmail', job, frontDesk);
      }
      break;
    case EmailStatus.WRONG:
      this.increment('countWrongEmails', job, frontDesk);
      break;
    case EmailStatus.DROPPED:
      this.increment('countBlockedByEmail', job, frontDesk);
      break;
    case EmailStatus.UNSUBSCRIBED:
      this.increment('countBlockedByEmail', job, frontDesk);
      this.increment('countUnsubscribedByEmail', job, frontDesk);
      break;
    case EmailStatus.RECENTLY_CONTACTED:
      this.increment('countBlockedByEmail', job, frontDesk);
      this.increment('countBlockedLastMonthEmail', job, frontDesk);
      break;
    case EmailStatus.EMPTY:
      this.increment('countNotPresentEmails', job, frontDesk);
      break;
    case EmailStatus.NOT_TO_SURFACE:
      break;
    default:
      cb(new Error(`unsupported email status : ${singleData.get('campaign.contactStatus.emailStatus')}`));
  }
  // }
  switch (singleData.get('campaign.contactStatus.phoneStatus')) {
    case PhoneStatus.VALID:
      this.increment('countValidPhones', job, frontDesk);
      if (singleData.get('customer.contact.mobilePhone.revisedAt')) {
        this.increment('countModifiedPhone', job, frontDesk);
      } else {
        this.increment('countNotModifiedPhone', job, frontDesk);
      }
      break;
    case PhoneStatus.WRONG:
      this.increment('countWrongPhones', job, frontDesk);
      break;
    case EmailStatus.UNSUBSCRIBED:
      this.increment('countBlockedByPhone', job, frontDesk);
      this.increment('countUnsubscribedByPhone', job, frontDesk);
      break;
    case EmailStatus.RECENTLY_CONTACTED:
      this.increment('countBlockedByPhone', job, frontDesk);
      this.increment('countBlockedLastMonthPhone', job, frontDesk);
      break;
    case PhoneStatus.EMPTY:
      this.increment('countNotPresentPhones', job, frontDesk);
      break;
    case PhoneStatus.NOT_TO_SURFACE:
      break;
    default:
      cb(new Error(`unsupported phone status : ${singleData.get('campaign.contactStatus.phoneStatus')}`));
  }
  switch (singleData.get('campaign.contactStatus.status')) {
    case CampaignContactStatus.SCHEDULED:
      this.increment('countScheduledContacts', job, frontDesk);
      break;
    case CampaignContactStatus.RECEIVED:
      this.increment('countReceivedSurveys', job, frontDesk);
      break;
    case CampaignContactStatus.NOT_RECEIVED:
    case CampaignContactStatus.IMPOSSIBLE:
      this.increment('countNotContactable', job, frontDesk);
      break;
    case CampaignContactStatus.BLOCKED:
      this.increment('countBlocked', job, frontDesk);
      break;
    case CampaignContactStatus.NOT_TO_SURFACE:
      break;
    default:
      cb(new Error(`unsupported contactStatus status : ${singleData.get('campaign.contactStatus.status')}`));
  }
  if (singleData.customer) {
    this.increment('countCustomers', job, frontDesk);
  }
  if (
    singleData.get('customer.contact.email.value') &&
    singleData.get('campaign.contactStatus.status') !== CampaignContactStatus.NOT_TO_SURFACE
  ) {
    this.increment('countEmails', job, frontDesk);
  }
  if (singleData.get('surveyFollowupUnsatisfied')) {
    this.increment('countFollowup', job, frontDesk);
  }
  if (singleData.get('surveyFollowupUnsatisfied.firstRespondedAt')) {
    this.increment('countFollowupResponded', job, frontDesk);
  }
  if (singleData.get('unsatisfied.isRecontacted') === true) {
    this.increment('countFollowupResponseQid122', job, frontDesk);
  }
  if (singleData.get('review.recommend')) {
    this.increment('countSurveyRecommand', job, frontDesk);
  }
  if (singleData.get('customer.isRevised')) {
    this.increment('countHavingAdditionalInfo', job, frontDesk);
  }
  if (
    (singleData.get('customer.contact.mobilePhone.isSyntaxOK') ||
      singleData.get('customer.contact.email.isSyntaxOK')) &&
    singleData.get('campaign.contactStatus.status') !== CampaignContactStatus.NOT_TO_SURFACE
  ) {
    this.increment('countHavingContacts', job, frontDesk);
  }
  if (
    singleData.get('customer.contact.mobilePhone.value') &&
    singleData.get('campaign.contactStatus.status') !== CampaignContactStatus.NOT_TO_SURFACE
  ) {
    this.increment('countPhones', job, frontDesk);
  }
  const jobAcronym = DataTypes.getJobs().includes(singleData.type) ? DataTypes.getAcronymFromJob(singleData.type) : '';
  if (singleData.get('survey.sendAt')) {
    this.increment('countShouldReceiveSurveys', job, frontDesk);
    if (jobAcronym) this.increment(`countShouldReceiveSurveys${jobAcronym}`, job, frontDesk);

    if ([EmailStatus.UNSUBSCRIBED, EmailStatus.VALID].includes(singleData.get('campaign.contactStatus.emailStatus'))) {
      this.increment('countShouldReceiveSurveysByEmail', job, frontDesk);
    }
    if ([PhoneStatus.UNSUBSCRIBED, PhoneStatus.VALID].includes(singleData.get('campaign.contactStatus.emailStatus'))) {
      this.increment('countShouldReceiveSurveysByPhone', job, frontDesk);
    }
  }

  if (singleData.get('lead.potentialSale')) {
    this.increment('countSurveyLead', job, frontDesk);
    if (singleData.get('lead.tradeIn') === LeadTradeInTypes.NO) {
      this.increment('countSurveyLeadNoTrade', job, frontDesk);
    }
    if (singleData.get('lead.tradeIn') === LeadTradeInTypes.YES) {
      this.increment('countSurveyLeadTrade', job, frontDesk);
    }
    if (singleData.get('lead.tradeIn') === LeadTradeInTypes.UNKNOWN) {
      this.increment('countSurveyLeadUnknownTrade', job, frontDesk);
    }
    if (
      singleData.get('lead.saleType') !== LeadSaleTypes.NEW_VEHICLE_SALE &&
      singleData.get('lead.saleType') !== LeadSaleTypes.USED_VEHICLE_SALE
    ) {
      this.increment('countSurveyLeadUnknownSale', job, frontDesk);
    }
    if (singleData.get('lead.saleType') === LeadSaleTypes.NEW_VEHICLE_SALE) {
      this.increment('countSurveyLeadVn', job, frontDesk);
    }
    if (singleData.get('lead.saleType') === LeadSaleTypes.USED_VEHICLE_SALE) {
      this.increment('countSurveyLeadVo', job, frontDesk);
    }
  }
  if (
    singleData.get('survey.firstRespondedAt') &&
    (singleData.get('review.rating') || singleData.get('review.rating') === 0) &&
    singleData.get('campaign.contactStatus.status') !== CampaignContactStatus.NOT_TO_SURFACE
  ) {
    this.increment('countSurveysResponded', job, frontDesk); // WAS aggregationResult.countSurveysResponded++;
    if (jobAcronym) {
      this.meanScore(job, frontDesk, singleData, `countSurveyResponded${jobAcronym}`, `score${jobAcronym}`); // WAS (with the '1') meanScore(aggregationResult, singleData, `countSurveyResponded${job}1`, `score${job}`);
      // this.increment(`countSurveyResponded${jobAcronym}`, job, frontDesk); // WAS aggregationResult[`countSurveyResponded${job}`]++;
    }
    this.meanScore(job, frontDesk, singleData, 'countSurveyResponded', 'score'); // WAS (with the '1') meanScore(aggregationResult, singleData, 'countSurveyResponded1', 'score');
  }
  if (jobAcronym && singleData.get('campaign.contactStatus.status') !== CampaignContactStatus.NOT_TO_SURFACE) {
    this.increment(`countSurvey${jobAcronym}`, job, frontDesk);
  }
  if (singleData.get('survey')) {
    this.increment('countSurveys', job, frontDesk);
    if (singleData.review_isPromoter()) {
      this.increment('countSurveySatisfied', job, frontDesk);
      this.increment('countSurveyPromotor', job, frontDesk);
      if (jobAcronym) this.increment(`countSurveySatisfied${jobAcronym}`, job, frontDesk);
    }
    if (singleData.review_isDetractor()) {
      this.increment('countSurveyUnsatisfied', job, frontDesk);
      this.increment('countSurveyDetractor', job, frontDesk);
      if (singleData.review_hasAnApprovedReply()) {
        this.increment('countSurveyDetractorsWithResponse', job, frontDesk);
      }
      if (jobAcronym) this.increment(`countSurveyUnsatisfied${jobAcronym}`, job, frontDesk);
    }
  }
};

DRSAggregetorStream.prototype._write = function _write(singleData, encoding, callback) {
  const frontDesk = singleData.get('service.frontDeskUserName');
  const frontDesks = ['ALL_USERS'];
  if (frontDesk && frontDesk !== 'ALL_USERS') {
    frontDesks.push(frontDesk);
    if (!this.aggregationResult[frontDesk]) this.aggregationResult[frontDesk] = this.getEmptyGarageHistory();
  }

  if (!singleData.get('campaign.contactStatus.emailStatus')) {
    singleData.campaign_generateEmailStatus();
  }
  if (!singleData.get('campaign.contactStatus.phoneStatus')) {
    singleData.campaign_generatePhoneStatus();
  }
  if (!singleData.get('campaign.contactStatus.status')) {
    singleData.campaign_generateCampaignContactStatus();
  }
  async.series(
    [
      (cb) => {
        if (!singleData.get('shouldSurfaceInStatistics')) {
          cb();
          return;
        }
        if (
          singleData.get('type') === DataTypes.MANUAL_UNSATISFIED ||
          singleData.get('type') === DataTypes.MANUAL_LEAD
        ) {
          cb();
          return;
        }
        if (DataTypes.getJobs().includes(singleData.type)) {
          this._fillAggregationResult(singleData.type, singleData, frontDesk, cb);
        } else this._fillAggregationResult('other', singleData, frontDesk, cb);
        cb();
      },
      (cb) => {
        if (!this.generateHistoryDetails) {
          cb();
          return;
        }
        if (singleData.get('lead.potentialSale')) {
          for (const fDesk of frontDesks) {
            const aggregationResult = this.aggregationResult[fDesk];
            if (!aggregationResult.surveysLead) {
              aggregationResult.surveysLead = {};
            }
            aggregationResult.surveysLead[singleData.getId().toString()] = {
              dataId: singleData.getId().toString(),
              completedAt: singleData.get('service.providedAt'),
              customerFullName: singleData.get('customer.fullName.value'),
              customerEmail: singleData.get('customer.contact.email.value'),
              customerPhone: singleData.get('customer.contact.mobilePhone.value'),
              surveyUpdatedAt: singleData.get('survey.firstRespondedAt'),
              vehiculeRegistrationPlate: singleData.get('vehicle.plate.value'),
              vehiculeRegistrationDate: singleData.get('vehicle.registrationDate.value'),
              vehiculeModel: singleData.get('vehicle.model.value'),
              vehiculeMake: singleData.get('vehicle.make.value'),
              vehiculeCategoryId: singleData.get('vehicle.categoryId.value'),
              leadTiming: singleData.get('lead.timing'),
              leadType: singleData.get('lead.type'),
              leadSaleType: singleData.get('lead.saleType'),
              leadKnowVehicle: singleData.get('lead.knowVehicle'),
              leadVehicle: singleData.get('lead.vehicle'),
              leadVehicleModel: singleData.get('lead.vehicleModel'),
              leadTradeIn: singleData.get('lead.tradeIn'),
              leadBrands: Array.isArray(singleData.get('lead.brands'))
                ? commonTicket.formatBrandModel(singleData.get('lead.brands'), false)
                : 'undefined',
              leadEnergyType: singleData.get('lead.energyType') || null,
              leadBodyType: singleData.get('lead.bodyType') || null,
              leadFinancing: singleData.get('lead.financing') || null,
            };
          }
          cb();
          return;
        }
        cb();
      },
      (cb) => {
        if (!this.generateHistoryDetails) {
          cb();
          return;
        }
        if (singleData.review_isDetractor()) {
          for (const fDesk of frontDesks) {
            const aggregationResult = this.aggregationResult[fDesk];
            if (!aggregationResult.surveysUnsatisfied) {
              aggregationResult.surveysUnsatisfied = {};
            }
            aggregationResult.surveysUnsatisfied[singleData.getId().toString()] = {
              dataId: singleData.getId().toString(),
              completedAt: singleData.get('service.providedAt'),
              customerFullName: singleData.get('customer.fullName.value'),
              customerCity: singleData.get('customer.city.value'),
              surveyUpdatedAt: singleData.get('survey.firstRespondedAt'),
              surveyScore: singleData.get('review.rating.value'),
              type: singleData.get('type'),
              surveyComment: singleData.get('review.comment.text'),
              vehicleMakePublicDisplayName: singleData.get('vehicle.make.value'),
              vehicleModelPublicDisplayName: singleData.get('vehicle.model.value'),
              transactionPublicDisplayName: singleData.get('service.transactions'),
              publicReviewStatus: singleData.get('review.comment.status'),
              publicReviewCommentStatus: singleData.get('review.rightOfReply.status'),
            };
          }
        }
        cb();
      },
      (cb) => {
        if (!this.generateHistoryDetails || !singleData.get('surveyFollowupUnsatisfied.firstRespondedAt')) {
          cb();
          return;
        }
        if (!singleData.get('unsatisfied.isRecontacted') || !singleData.get('unsatisfied.isResolved')) {
          for (const fDesk of frontDesks) {
            const aggregationResult = this.aggregationResult[fDesk];
            if (!aggregationResult.surveysUnsatisfiedFollowup) {
              aggregationResult.surveysUnsatisfiedFollowup = {};
            }
            aggregationResult.surveysUnsatisfiedFollowup[singleData.getId().toString()] = {
              dataId: singleData.getId().toString(),
              completedAt: singleData.get('service.providedAt'),
              customerFullName: singleData.get('customer.fullName.value'),
              garageProvidedFrontDeskUserName: singleData.get('service.frontDeskUserName'),
              type: singleData.get('type'),
              surveyUpdatedAt: singleData.get('survey.firstRespondedAt'),
              followupSurveyUpdatedAt: singleData.get('surveyFollowupUnsatisfied.firstRespondedAt'),
              unsatisfactionIsRecontacted: singleData.get('unsatisfied.isRecontacted'),
              unsatisfactionIsResolved:
                singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.RESOLVED,
              unsatisfactionIsResolutionInProgress:
                singleData.get('unsatisfied.followupStatus') === unsatisfiedFollowupStatus.IN_PROGRESS,
              unsatisfiedIsEvaluationChanged: singleData.review_isEvaluationChanged(),
              followupUnsatisfiedComment: singleData.get('review.followupUnsatisfiedComment.text'),
            };
          }
        }
        cb();
      },
      (cb) => {
        for (const fDesk of frontDesks) {
          const aggregationResult = this.aggregationResult[fDesk];
          _addGlobalCounterFields(aggregationResult);
          DataTypes.getJobs().forEach((job) => {
            // aggregationResult by job
            _addGlobalCounterFields(aggregationResult.historyByType[job]);
          });
          _addGlobalCounterFields(aggregationResult.historyByType.other);
        }
        cb();
      },
    ],
    callback
  );
};
module.exports = DRSAggregetorStream;
