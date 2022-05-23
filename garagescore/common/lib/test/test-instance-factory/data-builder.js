const LeadTicketStatuses = require('../../../models/data/type/lead-ticket-status');
const ModerationStatuses = require('../../../models/data/type/moderation-status');
const GarageTypes = require('../../../models/garage.type');
const UnsatisfiedTicketStatuses = require('../../../models/data/type/unsatisfied-ticket-status');
const UnsatisfiedFollowUpStatuses = require('../../../models/data/type/unsatisfied-followup-status');
const reviewDetailsCriterias = require('../../../models/data/type/review-detailed-criterias');
const reviewDetailsSubCriterias = require('../../../models/data/type/review-detailed-subcriterias');
const RejectedReason = require('../../../models/data/type/rejected-reasons');
const ModerationStatus = require('../../../models/data/type/moderation-status');
const Campaign = require('./data-builder__campaign');
const { ObjectId } = require('mongodb');

class DataBuilder {
  constructor(app) {
    if (app) {
      this.Data = app.server.models.Data;
      this.dataObj = {};
    }
    return this;
  }
  /**
   * Creates the **Data** in the DB using this instance
   * @returns {models/Data} data : the document that has just been created
   * */
  create() {
    return this.Data.create(this.dataObj);
  }
  /**
   * Creates a **Data** document using this instance and generates the campaign statuses
   * @param {Boolean} [email] Whether to generate the email status or not
   * @param {Boolean} [phone] Whether to generate the phone status or not
   * @param {Boolean} [campaignContact] Whether to generate the campaign contact status or not
   * @returns {models/Data} data : The document given as first parameter
   */
  async createAndGenerateStatus(email, phone, campaignContact) {
    let data = await this.create();
    this.generateStatus(data, email, phone, campaignContact);
    return data;
  }

  /**
   * Sets the garageId property
   * @param {String} [garageId]
   * @returns {DataBuilder} This instance
   */
  garage(garageId) {
    this.dataObj.garageId = garageId || '12345678';
    return this;
  }

  /**
   * Sets the garageType property
   * @param {String} [garageType]
   * @returns {DataBuilder} This instance
   */
  garageType(garageType) {
    this.dataObj.garageType = garageType || GarageTypes.DEALERSHIP;
    return this;
  }
  /**
   * Sets the type property
   * @param {String} [type]
   * @returns {DataBuilder} This instance
   */
  type(type) {
    this.dataObj.type = type || 'Maintenance';
    return this;
  }
  /**
   * Sets source and rawSource properties
   * @param {*} [source]
   * @param {*} [rawSource]
   * @returns {DataBuilder} This instance
   */
  source(source, rawSource) {
    if (source) {
      this.dataObj.source = {
        ...this.dataObj.source,
        type: source,
      };
    }
    if (rawSource) {
      this.dataObj.source = {
        ...this.dataObj.source,
        raw: rawSource,
      };
    }

    return this;
  }
  /**
   * Sets the shouldSurfaceInStatistics to true unless told otherwise
   * @param {Boolean} [force] If false forces the property to be false
   * @returns {DataBuilder} This instance
   */
  shouldSurfaceInStatistics(force) {
    this.dataObj.shouldSurfaceInStatistics = !(force === false);
    return this;
  }
  /**
   * Sets the service property and its subproperties
   * @param {String} [frontDeskUserName]
   * @param {String} [frontDeskGarageId]
   * @param {String} [frontDeskCustomerId]
   * @param {Date} [providedAt]
   * @param {(String[] | String)} [categories]
   * @param {Boolean} [isQuote]
   * @returns {DataBuilder} This instance
   */
  service(options) {
    const possibleOptions = [
      'frontDeskUserName',
      'frontDeskGarageId',
      'frontDeskCustomerId',
      'providedAt',
      'middleMans',
      'categories',
      'isQuote',
    ];
    for (let option of Object.keys(options)) {
      if (options.hasOwnProperty(option) && !possibleOptions.includes(option)) {
        delete options[options];
      }
    }
    options.providedAt = new Date(options.providedAt);
    if (typeof options.categories === 'string') {
      options.categories = [options.categories];
    }
    this.dataObj.service = options;
    return this;
  }
  /* Customer contacts */
  /**
   * Sets the customers email
   * @param {String}   options.value
   * @param {String}  [options.original]
   * @param {Boolean} [options.isSyntaxOK]
   * @param {Boolean} [options.isEmpty]
   * @param {Boolean} [options.isValidated]
   * @param {Boolean} [options.isUnsubscribed]
   * @param {Boolean} [options.isComplained]
   * @param {Boolean} [options.isDropped]
   * @returns {DataBuilder} This instance
   */
  email(options) {
    const possibleOptions = [
      'value',
      'original',
      'isSyntaxOK',
      'isEmpty',
      'isValidated',
      'isUnsubscribed',
      'isComplained',
      'isDropped',
    ];
    for (let option of Object.keys(options)) {
      if (options.hasOwnProperty(option) && !possibleOptions.includes(option)) {
        delete options[option];
      }
    }
    this.dataObj.customer = this.dataObj.customer || {};
    this.dataObj.customer.contact = this.dataObj.customer.contact || {};
    this.dataObj.customer.contact.email = {
      ...this.dataObj.customer.contact.email,
      ...options,
    };
    return this;
  }

  customerField(field, options = {}) {
    const possibleField = [
      'gender',
      'title',
      'firstName',
      'lastName',
      'fullName',
      'street',
      'postalCode',
      'city',
      'countryCode',
    ];
    if (!field || !possibleField.includes(field)) {
      return this;
    }

    const possibleOptions = [
      'value',
      'original',
      'isSyntaxOK',
      'isEmpty',
      'isValidated',
      'isUnsubscribed',
      'isComplained',
      'isDropped',
    ];
    for (let option of Object.keys(options)) {
      if (options.hasOwnProperty(option) && !possibleOptions.includes(option)) {
        delete options[option];
      }
    }
    this.dataObj.customer = this.dataObj.customer || {};

    this.dataObj.customer[field] = {
      ...options,
    };
    return this;
  }
  /**
   * Sets the customers phone
   * @param {String}   options.value
   * @param {String}  [options.original]
   * @param {Boolean} [options.isSyntaxOK]
   * @param {Boolean} [options.isEmpty]
   * @param {Boolean} [options.isValidated]
   * @param {Boolean} [options.isUnsubscribed]
   * @param {Boolean} [options.isComplained]
   * @param {Boolean} [options.isDropped]
   * @returns {DataBuilder} This instance
   */
  phone(options) {
    const possibleOptions = [
      'value',
      'original',
      'isSyntaxOK',
      'isEmpty',
      'isValidated',
      'isUnsubscribed',
      'isComplained',
      'isDropped',
    ];
    for (let option of Object.keys(options)) {
      if (options.hasOwnProperty(option) && !possibleOptions.includes(option)) {
        delete options[option];
      }
    }
    this.dataObj.customer = this.dataObj.customer || {};
    this.dataObj.customer.contact = this.dataObj.customer.contact || {};
    this.dataObj.customer.contact.phone = {
      ...this.dataObj.customer.contact.phone,
      ...options,
    };
    return this;
  }
  /**
   * Sets the customers mobilePhone
   * @param {String}   options.value
   * @param {String}  [options.original]
   * @param {Boolean} [options.isSyntaxOK]
   * @param {Boolean} [options.isEmpty]
   * @param {Boolean} [options.isValidated]
   * @param {Boolean} [options.isUnsubscribed]
   * @param {Boolean} [options.isComplained]
   * @param {Boolean} [options.isDropped]
   * @returns {DataBuilder} This instance
   */
  mobilePhone(options) {
    const possibleOptions = [
      'value',
      'original',
      'isSyntaxOK',
      'isEmpty',
      'isValidated',
      'isUnsubscribed',
      'isComplained',
      'isDropped',
    ];
    for (let option of Object.keys(options)) {
      if (options.hasOwnProperty(option) && !possibleOptions.includes(option)) {
        delete options[option];
      }
    }
    this.dataObj.customer = this.dataObj.customer || {};
    this.dataObj.customer.contact = this.dataObj.customer.contact || {};
    this.dataObj.customer.contact.mobilePhone = {
      ...this.dataObj.customer.contact.mobilePhone,
      ...options,
    };
    return this;
  }
  /**
   * Sets isValidated property of customer subdocument
   * @param {Boolean} force Forces the isValidated to be false if false
   */
  validateCustomer(force) {
    this.dataObj.customer = this.dataObj.customer || {};
    this.dataObj.customer.isValidated = force !== false;
    return this;
  }

  /**
   * Review
   */
  review() {
    this.dataObj.review = this.dataObj.review || {};
    this.dataObj.review.createdAt = new Date();
    return this;
  }

  /**
   * Review
   */
  reviewFollowupUnsatisfiedComment(followupUnsatisfiedComment) {
    if (followupUnsatisfiedComment) {
      this.dataObj.review = this.dataObj.review || {};
      this.dataObj.review.followupUnsatisfiedComment = { text: followupUnsatisfiedComment };
    }
    return this;
  }

  /**
   * Review
   */
  reviewRating(score) {
    this.dataObj.review = this.dataObj.review || {};
    this.dataObj.review.rating = { value: score };
    return this;
  }

  reviewComment(commentText) {
    this.dataObj.review = this.dataObj.review || {};
    this.dataObj.review.comment = this.dataObj.review.comment || {};
    this.dataObj.review.comment.text = commentText;
    this.dataObj.review.comment.status = ModerationStatuses.APPROVED;
    return this;
  }

  reviewReply({
    status = ModerationStatus.APPROVED,
    text = 'une reponse',
    rejectedReason = RejectedReason.AUTHOR_IS_NOT_INDIVIDUAL,
  } = {}) {
    this.dataObj.review = this.dataObj.review || {};
    this.dataObj.review.reply = {
      ...this.dataObj.review.reply,
      status,
      text,
      rejectedReason,
    };
    return this;
  }
  /**
   * Creates a lead in this instance
   * @param {String} type
   * @param {Boolean} knownVehicle
   * @param {Boolean} isConverted
   * @param {Date} reportedAt
   * @returns {DataBuilder} This instance
   */

  lead(leadObject) {
    this.dataObj.lead = { ...this.dataObj.lead, ...leadObject };
    if (leadObject.reportedAt) {
      leadObject.reportedAt = new Date(leadObject.reportedAt);
    }
    return this;
  }
  /**
   * Sets the alert.checkAlertHour property
   * @param {Integer} checkAlertHour
   */
  alert(checkAlertHour) {
    if (Number.isInteger(checkAlertHour)) {
      this.dataObj.alert = { checkAlertHour };
    }
  }

  leadTicket(
    {
      createdAt = new Date(),
      manager,
      status = LeadTicketStatuses.WAITING_FOR_CONTACT,
      actions = [],
      wasTransformedToSale,
      recontacted,
      satisfied,
      satisfiedReasons,
      notSatisfiedReasons,
      appointment,
    } = {},
    createIt = true
  ) {
    if (createIt) {
      this.dataObj.leadTicket = {
        ...this.dataObj.leadTicket,
        createdAt,
        customer: this.dataObj.customer,
        manager,
        status,
        actions,
        wasTransformedToSale,
        recontacted,
        satisfied,
        satisfiedReasons,
        notSatisfiedReasons,
        appointment,
      };
    }
    return this;
  }

  unsatisfiedTicket(
    { createdAt = new Date(), customer = {}, actions = [], userId = new ObjectId() } = {},
    createIt = true
  ) {
    if (createIt) {
      this.dataObj.unsatisfiedTicket = {
        createdAt,
        closedAt: new Date(),
        comment: '',
        type: 'Maintenance',
        status: 'ClosedWithResolution',
        frontDeskUserName: null,
        actions,
        customer,
        manager: userId,
        ...this.dataObj.unsatisfiedTicket,
      };
    }
    return this;
  }

  /**
   * Creates an unsatisfied in this instance
   * @param {Array} criteria
   * @returns {DataBuilder} This instance
   */
  unsatisfied({
    criteria = [
      {
        label: reviewDetailsCriterias.MAINTENANCE_CRITERIA_1,
        values: [reviewDetailsSubCriterias.MAINTENANCE_SUB_CRITERIA_22],
      },
    ],
  } = {}) {
    this.dataObj.unsatisfied = {
      ...this.dataObj.unsatisfied,
      criteria,
    };
    return this;
  }

  vehicle(vehicleObj = {}) {
    this.dataObj.vehicle = { ...this.dataObj.vehicle, ...vehicleObj };
    return this;
  }

  surveyFollowupUnsatisfied({ created = new Date(), sendAt = new Date() } = {}) {
    this.dataObj.surveyFollowupUnsatisfied = { ...this.dataObj.surveyFollowupUnsatisfied, created, sendAt };
    return this;
  }
}

// Including sub modules here
Object.assign(DataBuilder.prototype, Campaign);

module.exports = DataBuilder;
