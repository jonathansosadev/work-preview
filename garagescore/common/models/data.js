const moment = require('moment');
const loopback = require('loopback');
const { promisify } = require('util');
const { ObjectID } = require('mongodb');

const modelDefinition = require('./data.json');
const commonTicket = require('./data/_common-ticket');
const embeddedService = require('./data/embedded-service');
const embeddedCustomer = require('./data/embedded-customer');
const embeddedVehicle = require('./data/embedded-vehicle');
const embeddedReview = require('./data/embedded-review');
const embeddedSurvey = require('./data/embedded-survey');
const embeddedCampaign = require('./data/embedded-campaign');
const embeddedDataSource = require('./data/embedded-datasource');
const embeddedLead = require('./data/embedded-lead');
const embeddedLeadTicket = require('./data/embedded-lead-ticket');
const embeddedConversion = require('./data/embedded-conversion');
const embeddedAlert = require('./data/embedded-alert');
const embeddedUnsatisfied = require('./data/embedded-unsatisfied');
const embeddedUnsatisfiedTicket = require('./data/embedded-unsatisfied-ticket');
const embeddedContactTicket = require('./data/embedded-contact-ticket');

const { JobTypes } = require('../../frontend/utils/enumV2');
const DataTypes = require('./data/type/data-types');
const GarageTypes = require('./garage.type.js');
const campaignStatus = require('./data/type/campaign-status');
const SourceTypes = require('../../common/models/data/type/source-types.js');

const ObjectUtils = require('../lib/util/object.js');
const gsEmail = require('../lib/util/email');
const Scheduler = require('../lib/garagescore/scheduler/scheduler.js');
const concurrentSaveMixin = require('../mixins/concurrent-save');
const { decodePhone } = require('../lib/garagescore/cross-leads/util');
const { BANG, MOMO, log } = require('../lib/util/log');
const timeHelper = require('../lib/util/time-helper');

/**
 *
 * Our central model
 * About the model definition
 * --------------------------
 *
 * We start with an almost empty json defining our model, containing only the required fields
 * During boot we override the model to add programaticaly every embedded submodels
 *
 * About the consistency checks
 * --------------------------
 *
 * A submodel define his model but also consistency checks, some fields are dependant between each others,
 * if we modify one field, forgetting the other, the checks can modify them to made them consistents
 *
 * About the method
 * --------------------------
 *
 * A submodel define static and dynamic (this) methods
 * Those methods are avaible with submodelName + '_' + method
 * Example: if the customer model define a method reviseData, you can access it with `this.customer_reviseData`
 * PROTIPS: do not use arrow function if you dont want to mess with `this`
 */

// store the consistency checks
const consistencyChecks = [];

// run on boot, create our Data model
const _onBoot = function _onBoot(app) {
  const definition = JSON.parse(JSON.stringify(modelDefinition));

  /** Add properties to the base model*/
  const initModel = function initModel(fieldName, field) {
    if (field.model) {
      const model = field.model();
      if (model.properties) {
        definition.properties[fieldName] = JSON.parse(JSON.stringify(model.properties));
      }
    }
  };
  // add definitions
  initModel('service', embeddedService);
  initModel('customer', embeddedCustomer);
  initModel('vehicle', embeddedVehicle);
  initModel('review', embeddedReview);
  initModel('survey', embeddedSurvey);
  initModel('surveyFollowupUnsatisfied', embeddedSurvey);
  initModel('surveyFollowupLead', embeddedSurvey);
  initModel('campaign', embeddedCampaign);
  initModel('source', embeddedDataSource);
  initModel('lead', embeddedLead);
  initModel('leadTicket', embeddedLeadTicket);
  initModel('conversion', embeddedConversion);
  initModel('alert', embeddedAlert);
  initModel('unsatisfied', embeddedUnsatisfied);
  initModel('unsatisfiedTicket', embeddedUnsatisfiedTicket);
  initModel('contactTicket', embeddedContactTicket);
  // initModel('migration', embeddedMigration);
  // console.log(definition);

  // if you want to add strictObjectIDCoercion, use this code
  // we store all the anonymous fields already created
  const alreadyCreatedAnonymous = Object.values(app.models.User.modelBuilder.models)
    .filter((m) => m.name.indexOf('Anonymous') === 0)
    .map((m) => m.name);
  // create the model
  const Data = loopback.createModel(definition);
  // new anonymous models should be embedded data fields, we give to a selection of them the strictObjectIDCoercion setting
  const embeddedWithCoercion = (m) => {
    const has = Object.prototype.hasOwnProperty;
    // ticket
    if (has.call(m.prototype, 'manager') && has.call(m.prototype, 'touched')) {
      return true;
    }
    return false;
  };
  Object.values(Data.modelBuilder.models)
    .filter((m) => m.name.indexOf('Anonymous') === 0 && alreadyCreatedAnonymous.indexOf(m.name) < 0)
    .filter(embeddedWithCoercion)
    .forEach((m) => {
      m.definition.settings.strictObjectIDCoercion = true;
    });
  app.model(Data, { dataSource: 'garagescoreMongoDataSource', public: true });

  /* Add consistency checks */
  const addChecks = function addChecks(checks) {
    Object.keys(checks).forEach((c) => {
      consistencyChecks.push(checks[c]);
    });
  };
  /* Add embedded methods */
  const addMethods = function addMethods(fieldName, methods) {
    Object.keys(methods).forEach((m) => (Data[`${fieldName}_${m}`] = methods[m].bind(Data)));
  };
  /* Add embedded methods */
  const addPrototypeMethods = function addPrototypeMethods(fieldName, methods) {
    Object.keys(methods).forEach((m) => (Data.prototype[`${fieldName}_${m}`] = methods[m]));
  };
  /** Sum everything to add an embedded field*/
  const initMethods = function initMethods(fieldName, field) {
    if (field.consistencyChecks) {
      addChecks(field.consistencyChecks);
    }
    if (field.staticMethods) {
      addMethods(fieldName, field.staticMethods);
    }
    if (field.prototypeMethods) {
      addPrototypeMethods(fieldName, field.prototypeMethods);
    }
  };

  // add methods
  initMethods('service', embeddedService);
  initMethods('customer', embeddedCustomer);
  initMethods('vehicle', embeddedVehicle);
  initMethods('review', embeddedReview);
  initMethods('survey', embeddedSurvey);
  initMethods('surveyFollowupUnsatisfied', embeddedSurvey);
  initMethods('surveyFollowupLead', embeddedSurvey);
  initMethods('campaign', embeddedCampaign);
  initMethods('source', embeddedDataSource);
  initMethods('lead', embeddedLead);
  initMethods('leadTicket', embeddedLeadTicket);
  initMethods('conversion', embeddedConversion);
  initMethods('unsatisfied', embeddedUnsatisfied);
  initMethods('unsatisfiedTicket', embeddedUnsatisfiedTicket);
  initMethods('contactTicket', embeddedContactTicket);
  // initMethods('migration', embeddedMigration);

  // add specific mixins
  concurrentSaveMixin(app.models.Data);
  return app.models.Data;
};
module.exports = function DataDefinition(app) {
  const Data = _onBoot(app, consistencyChecks);
  /* ***********/
  /* METHODS */
  /* ***********/
  /* return app.models if needed in the embedded fields */
  Data.prototype.models = function models() {
    return app.models;
  };
  /* return app if needed in the embedded fields */
  Data.prototype.app = function app1() {
    return app;
  };
  /* return garage from garageId */
  Data.prototype.garage = function garage(cb) {
    app.models.Garage.findById(this.garageId, cb);
  };
  /* Returns all data linked to a datafile */
  Data.getDataFromDataFile = function getDataFromDataFile(dataFileId, cb) {
    const id = typeof dataFileId === 'string' ? new ObjectID(dataFileId) : dataFileId;
    app.models.Data.find({ where: { 'source.sourceId': id } }, cb);
  };
  /* Returns all data linked to a campaign */
  Data.getDataFromCampaign = function getDataFromCampaign(campaignId, cb) {
    const id = typeof campaignId === 'string' ? new ObjectID(campaignId) : campaignId;
    app.models.Data.find({ where: { 'campaign.campaignId': id } }, cb);
  };

  Data.init = async function init(
    garageId,
    { type, raw, sourceId, sourceType, sourceBy, lead, customer, automation, vehicle, garageType }
  ) {
    type = type || DataTypes.MAINTENANCE;
    // Error cases bacause mandatory argument is missing or invalid
    if (!garageId) {
      throw new Error('Cannot create Data with empty garageId');
    }
    if (!garageType) {
      throw new Error('Cannot create Data without garageType');
    }
    if (!raw) {
      throw new Error('Cannot create Data with empty rawRow');
    }
    if (!DataTypes.isSupported(type)) {
      throw new Error(`Cannot create Data with empty or unsupported type (${type})`);
    }
    if (garageType && !GarageTypes.isSupported(garageType)) {
      throw new Error(`Cannot create Data with empty or unsupported garageType (${garageType})`);
    }
    if (sourceType && type != DataTypes.MANUAL_LEAD && !SourceTypes.hasValue(sourceType)) {
      throw new Error(`(${sourceType}) is not in SourceTypes values`);
    }

    const data = new app.models.Data({
      garageId,
      type,
      garageType,
      shouldSurfaceInStatistics: type !== DataTypes.UNKNOWN,
      source: {
        type: sourceType,
        sourceId,
        by: sourceBy || undefined,
        raw,
        importedAt: new Date(),
      },
      // [Scopes POC] add a field scopes if the garage is VI
      ...(garageType === GarageTypes.VEHICLE_INSPECTION && { scopes: [] }),
    });

    if (automation) data.set('automation', automation);
    if (lead) data.addLead(lead);
    if (vehicle)
      data.addVehicle(
        vehicle.make,
        vehicle.model,
        vehicle.mileage,
        vehicle.plate,
        vehicle.countryCode,
        vehicle.registrationDate,
        vehicle.vin
      );
    if (customer) {
      // So I tried to rework addCustomer so that it accepts an object but it messes with the tests
      // Test => Get review from the api: whenever checking changes.updated.length
      // Maybe I know what happened but after a revert I'm getting a bit lazy
      data.addCustomer(
        ...[
          'email',
          'mobilePhone',
          'gender',
          'title',
          'firstName',
          'lastName',
          'fullName',
          'street',
          'postalCode',
          'city',
          'countryCode',
          'optOutMailing',
          'optOutSMS',
        ].map((f) => customer[f] || '')
      );
    }

    // [Scopes POC]
    if (garageType === GarageTypes.VEHICLE_INSPECTION) {
      try {
        await assignScope(data, garageId);
      } catch (error) {
        log.error(MOMO, `assignScope failed : ${error}`);
      }
    }

    return data;
  };

  /* assign scopes to data */
  async function assignScope(dataModel, garageId = null) {
    if (!garageId || !ObjectID.isValid(garageId)) {
      log.error(MOMO, 'missing or invalid garageId');
      return dataModel;
    }
    const scopes = await app.models.Scope.getScopeIdsFromGarageId(garageId);
    if (scopes.length) {
      dataModel.set('scopes', scopes);
    }
  }

  /* Init customer data
    Every parameter can be
    - null (no data)
    - a string (data ok)
    - an object {value, isValid} (data ok or not)
  */
  Data.prototype.addCustomer = function addCustomer(
    email,
    mobilePhone,
    gender,
    title,
    firstName,
    lastName,
    fullName,
    street,
    postalCode,
    city,
    countryCode,
    optOutMailing,
    optOutSMS
  ) {
    const rev = function rev(o) {
      if (!o) {
        return { isEmpty: true };
      }
      if (typeof o === 'object') {
        if (o.isNC) {
          // yes we can have isEmpty and isSyntaxOK that's the specs...
          return { original: o.value, isSyntaxOK: !!o.isValid, isEmpty: true, isNC: true };
        }
        if (typeof o.isValid !== 'undefined' && o.isValid === false && !o.value) {
          return { original: o.value, isSyntaxOK: false, isEmpty: false };
        }
        if (!o.value) {
          return { isEmpty: true };
        }
        if (!o.isValid) {
          return { original: o.value, isSyntaxOK: false, isEmpty: false };
        }
        return { value: o.value, original: o.value, isSyntaxOK: true, isEmpty: false };
      }
      return { value: o, original: o, isSyntaxOK: true, isEmpty: false };
    };
    // email cleaning
    if (email && email.value) {
      email.value = email.value.replace(gsEmail.removalOfUnauthorizedCharactersRegexp, '');
    }
    // format phone number before save
    if (
      mobilePhone &&
      /\d/.test(mobilePhone.value) &&
      mobilePhone.value.length > 5 &&
      !mobilePhone.isValid &&
      countryCode &&
      countryCode.value
    ) {
      try {
        mobilePhone.value = mobilePhone.value.replace(/ |\./g, '');
        mobilePhone.value = decodePhone(mobilePhone.value.match(/[\d]+/)[0], countryCode.value);
        mobilePhone.isValid = mobilePhone.value[0] === '+';
      } catch (err) {
        log.error(BANG, `${err.message}, mobilePhone.value: ${mobilePhone.value}`);
      }
    }
    this.set('customer.contact.email', rev(email));
    this.set('customer.contact.mobilePhone', rev(mobilePhone));
    this.set('customer.gender', rev(gender));
    this.set('customer.title', rev(title));
    this.set('customer.firstName', rev(firstName));
    this.set('customer.lastName', rev(lastName));
    this.set('customer.fullName', rev(fullName));
    this.set('customer.street', rev(street));
    this.set('customer.postalCode', rev(postalCode));
    this.set('customer.city', rev(city));
    this.set('customer.countryCode', rev(countryCode));
    this.set('customer.rgpd.optOutMailing', rev(optOutMailing));
    this.set('customer.rgpd.optOutSMS', rev(optOutSMS));
    return this;
  };
  /* Init vehicle data
    Every parameter can be
    - null (no data)
    - a string (data ok)
    - an object {value, isValid} (data ok or not)
  */
  Data.prototype.addVehicle = function addVehicle(make, model, mileage, plate, countryCode, registrationDate, vin) {
    const rev = function rev(o) {
      if (!o) {
        return { isEmpty: true };
      }
      if (typeof o === 'object') {
        if (!o.value) {
          return { isEmpty: true };
        }
        if (!o.isValid) {
          return { original: o.value, isSyntaxOK: false, isEmpty: false };
        }
        return { value: o.value, original: o.value, isSyntaxOK: true, isEmpty: false };
      }
      return { value: o, original: o, isSyntaxOK: true, isEmpty: false };
    };
    this.vehicle = {
      make: rev(make),
      model: rev(model),
      mileage: rev(mileage),
      plate: rev(plate),
      countryCode: rev(countryCode),
      registrationDate: rev(registrationDate),
      vin: rev(vin),
    };
    return this;
  };
  Data.prototype.addReview = function addReview(
    rating,
    comment,
    createdAt,
    serviceProvidedAt,
    shareWithPartners = false,
    replyText = null,
    replyDate = null,
    originalRating = null,
    originalScale = null,
    recommend = null
  ) {
    this.review = {
      createdAt: createdAt || null,
      rating: { value: rating },
      comment: {
        text: comment,
        status: 'Approved',
        updatedAt: createdAt || null,
        approvedAt: createdAt || null,
        rejectedReason: null,
      },
      shareWithPartners: shareWithPartners || false,
    };
    this.service = {
      providedAt: serviceProvidedAt || null,
    };
    if (replyText) {
      this.review.reply = {
        text: replyText,
        status: 'Approved',
        approvedAt: replyDate || null,
        rejectedReason: null,
      };
    }
    if (originalRating) {
      this.review.rating.original = originalRating;
    }
    if (originalScale) {
      this.review.rating.originalScale = originalScale;
    }
    if (typeof recommend === 'boolean') {
      this.review.rating.recommend = recommend;
    }
    return this;
  };

  function _noFacebookCommentWithoutResponse(replies, authorizeNoResponseAtAll) {
    if (!replies || !replies.length) {
      return authorizeNoResponseAtAll;
    }
    for (const reply of replies) {
      if (!_noFacebookCommentWithoutResponse(reply.replies, true)) {
        return false;
      }
    }
    return replies[replies.length - 1].isFromOwner;
  }

  Data.prototype.addReviewReplies = function addReviewReplies(replies) {
    if (replies && Array.isArray(replies) && replies.length) {
      this.review.reply = {};
      this.review.reply.thread = replies.map((reply) => ({
        text: reply.text || '',
        status: 'Approved',
        approvedAt: reply.date || null,
        rejectedReason: null,
        author: reply.author || '',
        id: reply.id || '',
        authorId: reply.authorId || '',
        attachment: reply.attachment || '',
        isFromOwner: reply.isFromOwner || false,
        replies:
          reply.replies && reply.replies.length
            ? reply.replies.map((subReply) => ({
                text: subReply.text || '',
                status: 'Approved',
                approvedAt: subReply.date || null,
                rejectedReason: null,
                author: subReply.author || '',
                id: subReply.id || '',
                authorId: subReply.authorId || '',
                attachment: subReply.attachment || '',
                isFromOwner: subReply.isFromOwner || false,
              }))
            : [],
      }));
      this.review.reply.text = replies[0].text || '';
      this.review.reply.status = 'Approved';
      this.review.reply.approvedAt = replies[0].date || null;
      this.review.reply.rejectedReason = null;
      if (this.get('source.type') === 'Facebook' && !_noFacebookCommentWithoutResponse(replies, false)) {
        this.review.reply.status = 'NoResponse';
      }
    }
    return this;
  };

  Data.prototype.detectChanges = function detectChanges(review) {
    return (
      (review.score !== this.get('review.rating.value') && review.score) ||
      (review.text !== this.get('review.comment.text') && review.text) ||
      (review.author !== this.get('customer.fullName') && review.author) ||
      this.detectThreadChanges(review.replies)
    );
  };

  Data.prototype.detectThreadChanges = function detectThreadChanges(replies) {
    if (replies && Array.isArray(replies)) {
      if (replies.length && (!this.review.reply || !this.review.reply.thread)) {
        return true;
      }
      if (replies.length !== (this.review.reply && this.review.reply.thread ? this.review.reply.thread.length : 0)) {
        return true;
      }
      for (let i = 0; i < replies.length; ++i) {
        const a = this.review.reply.thread[i];
        const b = replies[i];
        if (a.text !== b.text) {
          return true;
        }
        if (b.replies.length && !a.replies) {
          return true;
        }
        if (b.replies.length !== a.replies.length) {
          return true;
        }
        for (let j = 0; j < b.replies.length; ++j) {
          const c = a.replies[j];
          const d = b.replies[j];
          if (c.text !== d.text) {
            return true;
          }
        }
      }
    }
    return false;
  };
  /*
    Init service data
  */
  Data.prototype.addService = function addService(
    isQuote,
    frontDeskUserName,
    frontDeskUserTeam,
    frontDeskGarageId,
    frontDeskCustomerId,
    providedAt,
    billedAt,
    price
  ) {
    this.service = {
      frontDeskUserName,
      frontDeskUserTeam,
      frontDeskGarageId,
      frontDeskCustomerId,
      isQuote,
      providedAt,
      billedAt,
      price,
    };
    this.generateShouldSurfaceInStatistics();
    return this;
  };
  /* Init campaign Data */
  Data.prototype.addCampaign = function addCampaign(
    campaignId,
    previouslyContactedByEmail,
    previouslyContactedByPhone,
    previouslyDroppedEmail,
    previouslyDroppedPhone,
    previouslyUnsubscribedByEmail,
    previouslyUnsubscribedByPhone,
    previouslyComplainedByEmail,
    firstContactByEmailDay,
    firstContactByPhoneDay,
    blockedCampaign,
    unknownType
  ) {
    const campaign = {
      status: campaignStatus.WITHOUTCAMPAIGN,
      contactStatus: {
        previouslyContactedByPhone,
        previouslyContactedByEmail,
        previouslyDroppedEmail,
        previouslyDroppedPhone,
        previouslyUnsubscribedByEmail,
        previouslyUnsubscribedByPhone,
        previouslyComplainedByEmail,
      },
    };
    if (campaignId) {
      campaign.campaignId = campaignId;
      campaign.status = campaignStatus.NEW;
      campaign.importedAt = new Date();
      campaign.contactScenario = {
        firstContactByEmailDay,
        firstContactByPhoneDay,
      };
    }
    if (blockedCampaign) {
      campaign.status = campaignStatus.BLOCKED;
    }
    if (unknownType) {
      campaign.status = campaignStatus.UNKNOWN_TYPE;
    }
    this.campaign = campaign;
    // this fields are required to display data on cockpit contact qualification
    this.campaign_generateEmailStatus();
    this.campaign_generatePhoneStatus();
    this.campaign_generateCampaignContactStatus();
  };
  /* Init survey Data */
  Data.prototype.addSurvey = function addSurvey(urls) {
    this.survey = { type: this.type, urls };
  };
  Data.prototype.createFollowupAndEscalateJob = async function createFollowupAndEscalateJob(
    type,
    {
      googlePlace,
      timezone,
      subscriptions = { Lead: { enabled: false }, CrossLeads: { enabled: false }, Automation: { enabled: false } },
    }
  ) {
    if (!type) throw new Error('createFollowupAndEscalateJob: NO type given !');
    const scenario = await promisify(this.app().models.Garage.getCampaignScenario)(this.garageId);
    try {
      const followupAndEscalateConfig = scenario.getFollowupAndEscalateConfig(this.get('source.type'), type);
      if (followupAndEscalateConfig) {
        const { followup, escalate } = followupAndEscalateConfig;
        const hoursPerDay = this.app().models.Garage.defaultWorkingHoursPerDay;
        const delayInDays = Math.round(followup.delay / hoursPerDay); // db store the delay in hours (9 per day)
        const targetedDate = timeHelper.addDays(new Date(), delayInDays);
        if (followup && followup.enabled) {
          // Used in user notifications  J+10 :  Le client est invité..., Should be deleted...
          this.set(`${type}Ticket.followUpDelayDays`, delayInDays);
          await Scheduler.upsertJob(
            type === 'lead' ? JobTypes.SEND_LEAD_FOLLOWUP : JobTypes.SEND_UNSATISFIED_FOLLOWUP,
            { dataId: this.getId().toString() },
            targetedDate,
            {}
          );
        }
        if (escalate && escalate.enabled) {
          let alertedUser = await app.models.User.findOne({
            where: { id: this.get(`${type}Ticket.manager`) },
            fields: { firstName: 1, lastName: 1, email: 1, id: 1 },
          });
          if (alertedUser)
            alertedUser = {
              id: alertedUser.getId().toString(),
              name: alertedUser.getFullName(),
            };
          if (type === 'unsatisfied' || (type === 'lead' && subscriptions.Lead.enabled)) {
            const hoursPerDay = this.app().models.Garage.defaultWorkingHoursPerDay;
            const delayInDays = Math.round(escalate.stage_1 / hoursPerDay); // db store the delay in hours (9 per day)
            const targetedDate = timeHelper.addDays(new Date(), delayInDays);
            await Scheduler.upsertJob(
              JobTypes.ESCALATE,
              {
                dataId: this.getId().toString(),
                type,
                stage: 1,
                alertedUser,
                nextStageDelay: escalate.stage_2,
              },
              targetedDate,
              {
                noWeekEnd: true,
                saturdayOk: type === 'lead',
                planJobAfterXHoursOfOpeningHours: {
                  googleOpeningHours: (googlePlace && googlePlace.openingHours) || null,
                  timezone,
                  minimumScheduledHour: 9,
                },
              }
            );
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };
  /**
   * Since we don't have surveyTypes anymore, we need to know what survey is in progress to know what survey to display
   */
  Data.prototype.getSurveyInProgress = function getSurveyInProgress() {
    // Returns should be change to a array [] of opened surveys. surveyFollowupUnsatisfied and surveyFollowupLead can be opened together
    if (this.get('surveyFollowupUnsatisfied.acceptNewResponses')) return 'surveyFollowupUnsatisfied';
    if (this.get('surveyFollowupLead.acceptNewResponses')) return 'surveyFollowupLead';
    if (this.get('survey.acceptNewResponses')) return 'survey';
    return null;
  };
  Data.prototype.isFollowupUnsatisfiedInProgress = function isFollowupUnsatisfiedInProgress() {
    return this.get('surveyFollowupUnsatisfied.acceptNewResponses');
  };
  Data.prototype.isFollowupLeadInProgress = function isFollowupLeadInProgress() {
    return this.get('surveyFollowupLead.acceptNewResponses');
  };
  /* Init/replace lead data */
  Data.prototype.addLead = function addLead(lead) {
    /** type, timing, saleType, tradeIn, knowVehicle, vehicle, brands, energyType, bodyType, financing, cylinder */
    lead = JSON.parse(JSON.stringify(lead)); // remove empty;
    lead.reportedAt = lead.reportedAt || new Date();
    if (lead.forwardedAt) {
      lead.forwardedAt = new Date(lead.forwardedAt);
    }
    lead.potentialSale = Data.lead_isPotentialSale(lead.type);
    this.lead = lead;
    if (!lead.potentialSale) {
      delete this.leadTicket;
    }
    return this;
  };

  Data.prototype.addLeadTicket = async function addLeadTicket(garage, { rawManagerId, source, sourceData }) {
    if (this.get('leadTicket') && this.get('leadTicket.createdAt')) {
      return this;
    }
    return commonTicket.initLeadTicket(this, garage, { rawManagerId, source, sourceData });
  };

  Data.prototype.addUnsatisfiedTicket = async function (garage, { source, sourceData, rawManagerId }) {
    if (this.get('unsatisfiedTicket') && this.get('unsatisfiedTicket.createdAt')) {
      return this;
    }
    return commonTicket.initUnsatisfiedTicket(this, garage, { source, sourceData, rawManagerId });
  };

  Data.prototype.get = function get(fieldName) {
    if (!fieldName) throw Error('a field is required for the getter');
    const v = ObjectUtils.getDeepFieldValue(this, fieldName);
    if (v && typeof v.value !== 'undefined') {
      return v.value; // if v is revisable just returns its value (we cant test the typeof(v)
    }
    if (v && v.isEmpty) {
      return null; // if v is revisable but empty
    }
    return v;
  };

  Data.prototype.set = function set(fieldName, value) {
    if (!this.concurrentSave) {
      this.concurrentSave = {
        original: JSON.parse(JSON.stringify(this)),
      };
    }
    if (!fieldName) throw Error('a field is required for the getter');
    ObjectUtils.setDeepFieldValue(this, fieldName, value);
    // #3480 update customer too, not only leadTicket or unsatisfiedTicket
    if (value && fieldName.match(/[\w]+\.customer/)) {
      const updateCustomer = fieldName.match(/customer\.[\w.]+/)[0];
      if (updateCustomer) this.set(`${updateCustomer}.value`, value);
    }
    if (fieldName.match(/^customer\..+\.isValidated$/)) {
      this.set('customer.isValidated', value);
    }
    if (fieldName.match(/^customer\..+\.revised$/) && fieldName !== 'customer.title.revised') {
      // #1764 don't 'isRevised' when it's 'title'
      this.set('customer.isRevised', true);
    }
    if (fieldName.match(/^review/) && !this.get('review.createdAt')) {
      this.set('review.createdAt', this.get('survey.firstRespondedAt') || new Date());
    }
    if (fieldName === 'unsatisfied.followupStatus' && !this.get('unsatisfied.detectedAt')) {
      this.set('unsatisfied.detectedAt', new Date());
    }
    if (fieldName.match(/^source/) || fieldName.match(/^service/)) {
      this.generateShouldSurfaceInStatistics();
    }
    if (fieldName.match(/^customer.contact.email/)) {
      this.campaign_generateEmailStatus();
      this.campaign_generateCampaignContactStatus();
    }
    if (fieldName.match(/^customer.contact.mobilePhone/)) {
      this.campaign_generatePhoneStatus();
      this.campaign_generateCampaignContactStatus();
    }
    switch (fieldName) {
      case 'campaign.contactScenario.firstContactByEmailDay':
      case 'campaign.contactStatus.hasBeenContactedByEmail':
      case 'campaign.contactStatus.hasOriginalBeenContactedByEmail':
        this.campaign_generateEmailStatus();
        this.campaign_generateCampaignContactStatus();
        break;
      case 'campaign.contactScenario.firstContactByPhoneDay':
      case 'campaign.contactStatus.hasBeenContactedByPhone':
      case 'campaign.contactStatus.hasOriginalBeenContactedByPhone':
        this.campaign_generatePhoneStatus();
        this.campaign_generateCampaignContactStatus();
        break;
      case 'review.comment.reports':
        this.set('review.comment.isReported', true);
        break;
    }
    this.concurrentSave.current = JSON.parse(JSON.stringify(this));
  };

  Data.prototype.generateShouldSurfaceInStatistics = function generateShouldSurfaceInStatistics() {
    if ([DataTypes.MANUAL_LEAD, DataTypes.MANUAL_UNSATISFIED].includes(this.type)) {
      this.set('shouldSurfaceInStatistics', true);
      return;
    }

    if (this.type === DataTypes.UNKNOWN) {
      this.set('shouldSurfaceInStatistics', false);
      return;
    }
    if (this.get('source.type') === SourceTypes.AGENT) {
      this.set('shouldSurfaceInStatistics', true);
      return;
    }
    if (!this.get('service.providedAt')) {
      this.set('shouldSurfaceInStatistics', false);
      return;
    }
    if (this.get('source.raw.cells.WorkFileState')) {
      this.set('shouldSurfaceInStatistics', this.get('source.raw.cells.WorkFileState').toString() === '10');
      return;
    }
    if (
      this.get('source.raw.cells') &&
      typeof this.get('source.raw.cells')['RdvStateList．[last]．RdvState'] !== 'undefined'
    ) {
      this.set(
        'shouldSurfaceInStatistics',
        this.get('source.raw.cells')['RdvStateList．[last]．RdvState'].toString() === '10'
      );
      return;
    }
    this.shouldSurfaceInStatistics = true;
  };

  /** Return a list a datas used to compute a score */
  Data.getDatasForScore = function getDatasForScore(garageId, dataType, callback) {
    const periodInDays = 365 * 2;
    const lowerBoundaryDate = moment(new Date()).subtract(periodInDays, 'days').toDate();
    // in memory bug with date
    const source = Data.getDataSource().connector.name;
    if (source === 'memory') {
      Data.find(
        {
          where: {
            garageId,
            type: dataType,
            shouldSurfaceInStatistics: true,
          },
        },
        callback
      );
    } else {
      const datas = [];

      // only return some fileds because we can return A LOT of reviews
      app.models.Data.findWithProjection(
        {
          garageId: garageId.toString(),
          type: dataType,
          shouldSurfaceInStatistics: true, // Exogenous excluded by data.type 👌
          'review.createdAt': { $gt: lowerBoundaryDate },
        },
        {
          garageId: 1,
          'review.rating.value': 1,
          'review.subRatings': 1,
          'vehicle.make.value': 1,
          'service.categories': 1,
        }
      )
        .forEach(async (data) => {
          datas.push(data);
        })
        .then(() => {
          callback(null, datas);
        })
        .catch((err) => {
          console.error('Data.getDatasForScore - error during findWithProjection');
          callback(err);
        });
    }
  };
};
