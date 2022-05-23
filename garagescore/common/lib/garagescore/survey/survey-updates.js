// updating a survey means also potentially updating a lot of other instances (publicscore, publicreview)
// this module provide a convenient way to prepare a batch of updates and then run them
// and at the same time use the db as less as possible
// updates = prepareUpdates();....; updates.run();
// be careful, the instance given to prepareUpdates will be mutated

const debug = require('debug')('garagescore:survey:survey-updates');
const hash = require('object-hash');
const fs = require('fs');

const { JobTypes } = require('../../../../frontend/utils/enumV2');
const GarageTypes = require('../../../models/garage.type.js');
const DataTypes = require('../../../models/data/type/data-types.js');
const SurveyTypes = require('../../../../common/models/data/type/survey-types.js');
const unsatisfiedFollowupStatus = require('../../../models/data/type/unsatisfied-followup-status.js');
const reviewDetailedCriterias = require('../../../models/data/type/review-detailed-criterias.js');
const subratingLabels = require('../../../models/data/type/subrating-labels');

const promises = require('../../util/promises.js');
const timeHelper = require('../../util/time-helper.js');
const Scheduler = require('../scheduler/scheduler.js');
const { upsertAutomaticReplyJob } = require('../../../models/data/data-methods');
const commonTicket = require('../../../models/data/_common-ticket.js');
const { camelToKebab, concernedDataTypes } = require('../../util/app-config.js');
const { ANASS, log } = require('../../util/log');

// Internal events
const EventsEmitter = require('../monitoring/internal-events/events-emitter');
const internalEventsReviewContext = require('../monitoring/internal-events/contexts/review-context');

function Update(app, data, surveyType) {
  this.data = data;
  this.app = app;
  this.surveyType = surveyType;
  this.lastRespondedAt = null;
  this.recommend = null;
  this.rating = null;
  this.sharedOnGoogleClicked = null;
  this.comment = null;
  this.items = null;
  this.dataType = null;
  this.pageNumber = null;
  this.pageCount = null;
  this.isComplete = null;
  this.foreign = null;
  this.revisedTitle = null;
  this.revisedFullName = null;
  this.revisedStreet = null;
  this.revisedPostalCode = null;
  this.revisedCity = null;
  this.revisedEmail = null;
  this.revisedMobilePhone = null;
  this.lead = null;
  this.serviceCategories = null;
  this.insatisfactionReasons = null;
  this.firstRespondedAt = null;
  this.isQuote = null;
  this.middleMans = null;
  this.visitReason = null; // For VehicleInspection
  this.shareWithPartners = null;
  this.customerShareWithGarage = null;
}
// update recommandation
// @recommend : boolean
Update.prototype.updateRecommend = function (recommend, lastRespondedAt) {
  this.recommend = recommend;
  this.lastRespondedAt = lastRespondedAt || new Date();
};
// update service.isQuote
Update.prototype.updateIsQuote = function (isQuote) {
  this.isQuote = isQuote;
};
// update service.middleMan
Update.prototype.updateMiddleMan = function (middleMans) {
  if (typeof middleMans === 'string') {
    this.middleMans = [middleMans];
  } else {
    this.middleMans = middleMans;
  }
};
// update service.visitReason (Vehicle Inspection)
Update.prototype.updateVisitReason = function (visitReason) {
  this.visitReason = visitReason;
};
// update comment
Update.prototype.updateComment = function (comment, shareWithPartners, lastRespondedAt) {
  this.comment = comment;
  this.shareWithPartners = shareWithPartners || false;
  this.lastRespondedAt = lastRespondedAt || new Date();
};
// update score
// global: int (0-10)
// @items" : {
//   "Accueil et prise en charge" : 10,
//   "Écoute et conseils" : 10,
//   "Clarté et détail du devis" : 10,
//   "Respect des engagements de délai et de tarif" : 10,
//   "Qualité générale de la prestation" : 10
// }
Update.prototype.updateScore = function (rating, items, lastRespondedAt) {
  this.rating = rating;
  this.items = items;
  this.lastRespondedAt = lastRespondedAt || new Date();
};
// @items: {
//   "maintenance1": [maintenace1, maintenace8, ..],
//   "maintenance2": [maintenace1, maintenace8, ..],
//   "maintenance3": [maintenace1, maintenace8, ..],
//   "maintenance4": [maintenace1, maintenace8, ..],
//   "maintenance5": [maintenace1, maintenace8, ..],
Update.prototype.updateUnsatisfactionReasons = function (items) {
  this.insatisfactionReasons = items;
};
// update data Type (vn or vo)
Update.prototype.updateDataType = function (dataType) {
  this.dataType = dataType;
};
// update progress
// @pageNumber: int
// @pageCount: int
// @isComplete: boolean
// }
Update.prototype.updateProgress = function (pageNumber, pageCount, isComplete, lastRespondedAt) {
  this.lastRespondedAt = lastRespondedAt || new Date();
  this.pageNumber = pageNumber;
  this.pageCount = pageCount;
  this.isComplete = isComplete;
};
// update lead data
Update.prototype.updateLead = function (lead) {
  // eslint-disable-line max-len
  this.lead = lead;
};

Update.prototype.updateFollowupUnsatisfied = function (followupStatus, isRecontacted, unsatisfactionComment) {
  if (!this.data.isFollowupUnsatisfiedInProgress()) {
    throw new Error(
      `updateFollowupUnsatisfied not to be used if the followupUnsatisfied is not open dataId ${this.data.getId()}`
    );
  }
  if (!unsatisfiedFollowupStatus.hasValue(followupStatus)) {
    throw new Error(`Unsupported followupStatus : ${followupStatus} for dataId ${this.data.getId()}`);
  }
  this.followupUnsatisfied = { followupStatus, isRecontacted, unsatisfactionComment };
};

Update.prototype.updateFollowupLead = function (updates) {
  if (!this.data.isFollowupLeadInProgress())
    throw new Error(`${this.data.getId()} FollowupLead is not in progress for this data`);
  this.followupLead = updates;
};
// revise customer data
Update.prototype.updateCustomer = function (
  revisedTitle,
  revisedFullName,
  revisedStreet,
  revisedPostalCode,
  revisedCity,
  revisedEmail,
  revisedMobilePhone
) {
  this.revisedTitle = revisedTitle;
  this.revisedFullName = revisedFullName;
  this.revisedStreet = revisedStreet;
  this.revisedPostalCode = revisedPostalCode;
  this.revisedCity = revisedCity;
  this.revisedEmail = revisedEmail;
  this.revisedMobilePhone = revisedMobilePhone;
};
// update service cats
Update.prototype.updateCategories = function (serviceCategories) {
  this.serviceCategories = serviceCategories;
};
// update service providedGarageId
Update.prototype.updateProvidedGarageId = function (providedGarageId) {
  this.serviceProvidedGarageId = providedGarageId;
};

// run update(s)
const runSurveyUpdateData = async (update, data) => {
  let fireAutomaticReplyJob = false;
  let eventsEmitter;
  data.set('service.isQuote', update.isQuote);

  const isReviewExisting = [data.get('review.comment.text'), data.get('review.rating.value')].some((e) => e !== null);
  let isReviewUpdated = false;
  if (update.rating !== null) {
    data.set('review.rating.value', update.rating);
    fireAutomaticReplyJob = true;
    isReviewUpdated = true;
  }
  if (update.comment !== null) {
    if (data.get('review.comment.text') !== update.comment) {
      data.set('review.comment.text', update.comment);
      data.set('review.comment.updatedAt', new Date());
      await data.review_moderateComment();
      isReviewUpdated = true;
    }
  }
  if (!isReviewExisting && isReviewUpdated) {
    // Internal event review created
    const eventsEmitterContext = internalEventsReviewContext.create(data.garageId, data.get('source.type'));
    eventsEmitter = new EventsEmitter(eventsEmitterContext);
    eventsEmitter.accumulatorAdd(internalEventsReviewContext.EVENTS.ADD_REVIEW, { review: true });
  }
  if (update.shareWithPartners != null) {
    data.set('review.shareWithPartners', update.shareWithPartners);
  }
  if (update.shareWithPartners) {
    data.set('review.sharedWithPartnersAt', new Date());
  }

  if (update.items !== null) {
    const items = update.items;
    const labels = Object.keys(items);
    if (labels.length > 0) {
      let subRatings = data.get('review.subRatings') || [];
      labels.forEach((label) => {
        if (subratingLabels.hasValue(label)) {
          subRatings = subRatings.filter((o) => o.label !== label);
          subRatings.push({ label, value: items[label] });
        }
      });
      data.set('review.subRatings', subRatings);
    }
  }
  if (update.insatisfactionReasons !== null) {
    const itemsIR = update.insatisfactionReasons;
    const labelsIR = Object.keys(itemsIR);
    if (labelsIR.length > 0) {
      let instatisfactionReasons = data.get('unsatisfied.criteria') || [];
      labelsIR.forEach((label) => {
        if (reviewDetailedCriterias.hasValue(label)) {
          instatisfactionReasons = instatisfactionReasons.filter((o) => o.label !== label);
          instatisfactionReasons.push({ label, values: itemsIR[label] });
        }
      });
      data.set('unsatisfied.criteria', instatisfactionReasons);
    }
  }
  return { fireAutomaticReplyJob, eventsEmitter };
};

const runFollowupUnsatisfiedUpdate = async (update, data) => {
  if (update.followupUnsatisfied) {
    data.set('unsatisfied.followupStatus', update.followupUnsatisfied.followupStatus);
    data.set('unsatisfied.isRecontacted', update.followupUnsatisfied.isRecontacted);
    data.set('unsatisfied.comment.text', update.followupUnsatisfied.unsatisfactionComment);
    data.set('unsatisfied.comment.updatedAt', new Date());
    await data.unsatisfied_moderateComment();
    await commonTicket.updateUnsatisfiedTicketFromFollowup(data);
  }
  if (update.rating !== null) {
    data.set('review.followupUnsatisfiedRating.value', update.rating);
  }
  if (update.comment !== null) {
    if (data.get('review.followupUnsatisfiedComment.text') !== update.comment) {
      data.set('review.followupUnsatisfiedComment.text', update.comment);
      data.set('review.followupUnsatisfiedComment.updatedAt', new Date());
      await data.review_moderateComment();
    }
  }
};

const runFollowupLeadUpdate = async (update, data) => {
  for (const [key, value] of Object.entries(update.followupLead)) {
    data.set(`leadTicket.followup.${key}`, value);
  }
  await commonTicket.updateLeadTicketFromFollowup(data, update.followupLead);
};

const runSurveyFieldsUpdate = async (update, surveyType, data) => {
  if (update.pageNumber !== null) {
    data.set(`${surveyType}.progress.pageNumber`, update.pageNumber);
  }
  if (update.pageCount !== null) {
    data.set(`${surveyType}.progress.pageCount`, update.pageCount);
  }
  if (update.sharedOnGoogleClicked) {
    data.set('review.sharedOnGoogleClicked', update.sharedOnGoogleClicked);
  }
  if (update.isComplete !== null) {
    if (update.isComplete && data.get(`${surveyType}.progress.isComplete`) !== update.isComplete) {
      const dataId = data.getId().toString();
      await Scheduler.upsertJob(JobTypes.AUTOMATION_CHECK_CONTACT_MODIFICATION, { dataId }, new Date());
    }
    data.set(`${surveyType}.progress.isComplete`, update.isComplete);
    data.set(`${surveyType}.acceptNewResponses`, !update.isComplete);
  }
  if (update.firstRespondedAt !== null) {
    if (!data.get(`${surveyType}.lastRespondedAt`)) {
      data.set(`${surveyType}.lastRespondedAt`, update.firstRespondedAt);
    }
    data.set(`${surveyType}.firstRespondedAt`, update.firstRespondedAt);
  }
  if (update.lastRespondedAt !== null) {
    if (!data.get(`${surveyType}.firstRespondedAt`)) {
      data.set(`${surveyType}.firstRespondedAt`, update.lastRespondedAt);
    }
    data.set(`${surveyType}.lastRespondedAt`, update.lastRespondedAt);
    data.set('alert.checkAlertHour', timeHelper.hourAfterNow(1));
  }
};

const runCustomerFieldsUpdate = async (update, data, garage) => {
  if (update.revisedTitle) {
    data.customer_revise('title', update.revisedTitle);
  }
  if (update.revisedFullName) {
    data.customer_revise('fullName', update.revisedFullName);
    // we shouldn't revise firstName and lastNAme if fullName wasn't effectively revised
    // covered by unit test in test/data/customer
    if (data.get('customer.fullName.revised')) {
      const split = update.revisedFullName.split(' ');
      if (split.length === 1) {
        data.customer_revise('firstName', '');
        data.customer_revise('lastName', update.revisedFullName);
      } else {
        const lastName = split[split.length - 1];
        const firstName = update.revisedFullName.replace(lastName, '').trim();
        data.customer_revise('firstName', firstName);
        data.customer_revise('lastName', lastName);
      }
    }
  }
  if (update.revisedStreet) {
    data.customer_revise('street', update.revisedStreet);
  }
  if (update.revisedPostalCode) {
    data.customer_revise('postalCode', update.revisedPostalCode);
  }
  if (update.revisedCity) {
    data.customer_revise('city', update.revisedCity);
  }
  if (update.revisedEmail) {
    data.customer_revise('contact.email', update.revisedEmail);
  }
  if (update.revisedMobilePhone) {
    data.customer_revise('contact.mobilePhone', update.revisedMobilePhone, {
      country: (garage && garage.locale) || 'fr_FR',
    });
  }
  if (update.customerShareWithGarage !== null) {
    data.set('customer.shareWithGarage', update.customerShareWithGarage);
  }
};

const runServiceFieldsUpdate = (update, data) => {
  if (update.serviceCategories) {
    data.set('service.categories', update.serviceCategories);
  }
  if (update.serviceProvidedGarageId) {
    data.set('service.frontDeskGarageId', update.serviceProvidedGarageId);
  }
  if (update.middleMans) {
    data.set('service.middleMans', update.middleMans);
  }
  if (update.visitReason) {
    data.set('service.visitReason', update.visitReason);
  }
};

const runSurveyUpdate = async (update, data, garage) => {
  const { fireAutomaticReplyJob, eventsEmitter } = await runSurveyUpdateData(update, data, garage);
  if (fireAutomaticReplyJob) {
    try {
      await upsertAutomaticReplyJob(update, garage, data, eventsEmitter);
    } catch (err) {
      log.warn(ANASS, err);
    } finally {
      if (eventsEmitter) {
        eventsEmitter.accumulatorEmit();
      }
      // eslint-disable-next-line no-unsafe-finally
      return;
    }
  }
};
Update.prototype.run = async function run(callback) {
  const data = this.data;
  const surveyType = this.surveyType;
  if (!surveyType && !process.env.MIGRATION_IN_PROGRESS) {
    callback();
    return;
  }
  const oldChecksum = hash(JSON.parse(JSON.stringify(data)));
  const oldRating = data.get('review.rating.value');
  const garage = await promises.wait((cb) => data.garage(cb));

  if (surveyType === 'survey') {
    await runSurveyUpdate(this, data, garage);
  } else if (surveyType === 'surveyFollowupUnsatisfied') {
    await runFollowupUnsatisfiedUpdate(this, data);
  } else if (surveyType === 'surveyFollowupLead' && this.followupLead) {
    await runFollowupLeadUpdate(this, data);
  }
  await runSurveyFieldsUpdate(this, surveyType, data);
  await runCustomerFieldsUpdate(this, data, garage);

  if (this.lead) {
    if (data.get('lead.forwardedAt')) {
      this.lead.forwardedAt = data.get('lead.forwardedAt');
      this.lead.forwardedTo = data.get('lead.forwardedTo');
    }
    data.addLead(this.lead);
  }

  runServiceFieldsUpdate(this, data);

  // to save or not to save
  const newChecksum = hash(JSON.parse(JSON.stringify(data)));
  if (newChecksum === oldChecksum) {
    callback();
    return;
  }
  if (process.env.MIGRATION_IN_PROGRESS) {
    callback();
    return;
  }
  data.save((errSave, d) => {
    if (errSave) {
      callback(errSave);
      return;
    }
    // do not fail on score error
    const scoreUpdated = function (e) {
      if (e) {
        console.error(`ERROR scoreUpdated: ${e}`);
      }
      data.campaign_handleSurveyResultsProgress(callback);
    };
    if (oldRating !== d.get('review.rating.value')) {
      d.app().models.PublicScore.updateScore(data.garageId, data.type, scoreUpdated);
    } else {
      scoreUpdated();
    }
  });
};

/**
 * Initialisation of parsers which will find the available list of survey update functions in garagescore/survey/configs/...
 * Depending on the garageConfigs
 */
const parsers = {};
for (const garageType of GarageTypes.values()) {
  parsers[garageType] = {};
  // manually add followups too all
  for (const dataType of [...concernedDataTypes(garageType), 'followupUnsatisfied', 'followupLead']) {
    const path = `${__dirname}/responses-parser/${camelToKebab(garageType)}/${camelToKebab(dataType)}.js`;
    if (fs.existsSync(path)) parsers[garageType][dataType] = require(path);
    // eslint-disable-line
    else {
      // FALLBACK config (COULD BE WANTED)
      debug(`Couln't find config: '${path}', falling back to DEALERSHIP ${dataType} configuration.`);
      parsers[garageType][dataType] = parsers[GarageTypes.DEALERSHIP][dataType];
    }
  }
}

module.exports = {
  newUpdaterObject: (app, data, surveyType) => new Update(app, data, surveyType),
  fillUpdatesSurvey: (surveyType, data) => {
    /** UPDATE FUNCTIONS BY TYPE DEPENDING ON WHAT SURVEY IS OPENED **/
    const updates = data.survey_prepareUpdates(surveyType);
    let parserType = data.type;
    const garageType = data.get('garageType') || DataTypes.DEALERSHIP;
    const foreignResponses = data.get(`${surveyType}.foreignResponses`);
    if (surveyType !== SurveyTypes.SURVEY) {
      // Mean that we are looking for a followup
      parserType = surveyType.replace('survey', '');
      parserType = parserType[0].toLowerCase() + parserType.slice(1); // surveyFollowupUnsatisfied -> followupUnsatisfied
    }
    if (!parsers[garageType][parserType]) return null;
    for (const updateFunc of parsers[garageType][parserType]) updateFunc(foreignResponses, updates, data.type);
    return updates;
  },
};
