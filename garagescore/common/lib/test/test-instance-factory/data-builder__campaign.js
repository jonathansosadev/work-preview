const timeHelper = require('../../util/time-helper');

const baseCampaign = {
  status: 'WithoutCampaign',
  contactStatus: {
    hasBeenContactedByPhone: false,
    hasBeenContactedByEmail: false,
    status: 'Blocked',
    phoneStatus: 'Empty',
    emailStatus: 'Empty',
    previouslyContactedByPhone: false,
    previouslyContactedByEmail: false,
    previouslyDroppedEmail: false,
    previouslyDroppedPhone: false,
    previouslyUnsubscribedByEmail: false,
    previouslyUnsubscribedByPhone: false,
    previouslyComplainedByEmail: false,
  },
};
const lightCampaign = {
  status: 'WithoutCampaign',
};
const nullContactScenario = {
  firstContactedAt: null,
  firstSmsDisabled: null,
  firstEmailDisabled: null,
  nextCampaignReContactDay: null,
  nextCampaignContact: null,
  nextCampaignContactDay: null,
  lastCampaignContactSent: null,
  lastCampaignContactSentAt: null,
  nextCheckSurveyUpdatesDecaminute: null,
  firstContactByEmailDay: null,
  firstContactByPhoneDay: null,
  campaignNextCampaignContactId: null,
};

module.exports = {
  /* Campaign subdocument */
  /**
   * Generates the campaign statuses of a given **Data** document
   * @param {models/Data} data A document of the data collection
   * @param {Boolean} [email] Whether to generate the email status or not
   * @param {Boolean} [phone] Whether to generate the phone status or not
   * @param {Boolean} [campaignContact] Whether to generate the campaign contact status or not
   * @returns {models/Data} data : The document given as first parameter
   */
  generateStatus(data, email, phone, campaignContact) {
    if (!data instanceof this.Data) return data;
    if (email) data.campaign_generateEmailStatus();
    if (phone) data.campaign_generatePhoneStatus();
    if (campaignContact) data.campaign_generateCampaignContactStatus();
    return data;
  },

  /**
   * Sets the campaignId
   * @param {String} id
   * @returns {DataBuilder} This instance
   */
  campaignId(id) {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.campaignId = id;
    return this;
  },
  /**
   * Sets the campaign status
   * @param {String} status
   * @returns {DataBuilder} This instance
   */
  campaignStatus(status) {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.status = status;
    return this;
  },
  /**
   * Sets the import date of the campaign
   * @param {Date} date
   * @returns {DataBuilder} This instance
   */
  campaignImportedAt(date) {
    date = new Date(date);
    if (date.toString() !== 'Invalid Date') {
      this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
      this.dataObj.campaign.importedAt = date instanceof Date ? date : new Date(date);
    }
    return this;
  },
  /**
   * Sets hasBeenContacted properties in campaign.contactStatus
   * @param {Boolean} [email] Sets hasBeenContactedByEmail
   * @param {Boolean} [phone] Sets hasBeenContactedByPhone
   * @returns {DataBuilder} This instance
   */
  hasBeenContacted(email, phone) {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactStatus = this.dataObj.campaign.contactStatus || {};
    if (email !== null && email !== undefined) {
      this.dataObj.campaign.contactStatus.hasBeenContactedByEmail = email !== false;
    }
    if (phone !== null && phone !== undefined) {
      this.dataObj.campaign.contactStatus.hasBeenContactedByPhone = phone !== false;
    }
    return this;
  },
  /**
   * Sets previouslyContacted properties in campaign.contactStatus
   * @param {Boolean} [email] Sets previouslyContactedByEmail
   * @param {Boolean} [phone] Sets previouslyContactedByPhone
   * @returns {DataBuilder} This instance
   */
  previouslyContacted(email, phone) {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactStatus = this.dataObj.campaign.contactStatus || {};
    if (email !== null && email !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyContactedByEmail = email !== false;
    }
    if (phone !== null && phone !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyContactedByPhone = phone !== false;
    }
    return this;
  },
  /**
   * Sets previouslyUnsubscribed properties in campaign.contactStatus
   * @param {Boolean} [email] Sets previouslyUnsubscribedByEmail
   * @param {Boolean} [phone] Sets previouslyUnsubscribedByPhone
   * @returns {DataBuilder} This instance
   */
  previouslyUnsubscribed(email, phone) {
    this.dataObj.campaign = this.dataObj.campaign || {};
    this.dataObj.campaign.contactStatus = this.dataObj.campaign.contactStatus || {};
    if (email !== null && email !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyUnsubscribedByEmail = email !== false;
    }
    if (phone !== null && phone !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyUnsubscribedByPhone = phone !== false;
    }
    return this;
  },
  /**
   * Sets the previouslyComplainedByEmail property in campaign.contactStatus
   * @param {Boolean} [force] forces previouslyComplainedByEmail to be false if false
   * @returns {DataBuilder} This instance
   */
  previouslyComplained(email, phone) {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactStatus = this.dataObj.campaign.contactStatus || {};
    if (email !== null && email !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyComplainedByEmail = email !== false;
    }
    if (phone !== null && phone !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyComplainedByPhone = phone !== false;
    }
    return this;
  },
  /**
   * Sets the previouslyDropped properties in campaign.contactStatus
   * @param {Boolean} [email]
   * @param {Boolean} [phone]
   * @returns {DataBuilder} This instance
   */
  previouslyDropped(email, phone) {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactStatus = this.dataObj.campaign.contactStatus || {};
    if (email !== null && email !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyDroppedEmail = email !== false;
    }
    if (phone !== null && phone !== undefined) {
      this.dataObj.campaign.contactStatus.previouslyDroppedPhone = phone !== false;
    }
    return this;
  },
  /**
   * Fills the contact statuses with the provided value
   * @param {Boolean} value
   * @returns This instance
   */
  fillContactStatuses(value) {
    return this.hasBeenContacted(value, value)
      .previouslyContacted(value, value)
      .previouslyDropped(value, value)
      .previouslyUnsubscribed(value, value)
      .previouslyComplained(value);
  },
  /**
   * Sets the email as blocked in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  emailBlocked() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ status: 'Blocked', emailStatus: 'RecentlyContacted', previouslyContactedByEmail: true },
    };
    return this;
  },
  /**
   * Sets the phone as blocked in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  phoneBlocked() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ status: 'Blocked', phoneStatus: 'RecentlyContacted', previouslyContactedByPhone: true },
    };
    return this;
  },
  /**
   * Sets the email as received in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  emailReceived() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ status: 'Received', emailStatus: 'Valid', hasBeenContactedByEmail: true },
    };
    return this;
  },
  /**
   * Sets the phone as received in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  phoneReceived() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ status: 'Received', phoneStatus: 'Valid', hasBeenContactedByPhone: true },
    };
    return this;
  },
  /**
   * Sets the email as wrong in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  emailWrong() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ emailStatus: 'Wrong', previouslyContactedByEmail: true },
    };
    return this;
  },
  /**
   * Sets the phone as wrong in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  phoneWrong() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ phoneStatus: 'Wrong', previouslyContactedByPhone: true },
    };
    return this;
  },
  /**
   * Sets the email as empty in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  emailEmpty() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ emailStatus: 'Empty', previouslyContactedByEmail: false },
    };
    return this;
  },
  /**
   * Sets the phone as empty in campaign.contactStatus
   * @returns {DataBuilder} This instance
   */
  phoneEmpty() {
    this.dataObj.campaign = this.dataObj.campaign || baseCampaign;
    this.dataObj.campaign.contactStatus = {
      ...this.dataObj.campaign.contactStatus,
      ...{ phoneStatus: 'Empty', previouslyContactedByPhone: false },
    };
    return this;
  },

  /* ContactScenario subdocument */
  /**
   * Fills all undefined fields of campaign.contactScenario with null
   * @returns {DataBuilder} This instance
   */
  fillContactScenario() {
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactScenario = {
      ...this.dataObj.campaign.contactScenario,
      ...nullContactScenario,
    };
    return this;
  },
  /**
   * Sets the first contacted at Date
   * @param {Date} date
   * @returns {DataBuilder} This instance
   */
  firstContactedAt(date) {
    date = new Date(date);
    if (date.toString() !== 'Invalid Date') {
      this.dataObj.campaign = this.dataObj.campaign || {};
      this.dataObj.campaign.contactScenario = this.dataObj.campaign.contactScenario || {};
      this.dataObj.campaign.contactScenario.firstContactedAt = date;
    }
    return this;
  },
  /**
   * Sets the date at which the latest contact has been made
   * @param {String} contactType
   * @param {Date} date
   * @returns {DataBuilder} This instance
   */
  lastCampaignContact(contactType, date) {
    date = new Date(date);
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactScenario = this.dataObj.campaign.contactScenario || {};
    if (date.toString() !== 'Invalid Date') {
      this.dataObj.campaign.contactScenario.lastCampaignContactSent = contactType;
      this.dataObj.campaign.contactScenario.lastCampaignContactSentAt = date;
    }
    return this;
  },
  /**
   * Sets contactScenario.firstContact Day
   * @param {Number} [email] Amount of days to wait before contacting with an email
   * @param {Number} [phone] Amount of days to wait before contacting by phone
   * @param {Date} [forcedDate=today] Date to be taken as reference
   * @returns {DataBuilder} This instance
   */
  firstContactDay(email, phone, forcedDate) {
    const today = timeHelper.dayNumber(forcedDate || new Date());
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactScenario = this.dataObj.campaign.contactScenario || {};
    if (Number.isInteger(email)) {
      this.dataObj.campaign.contactScenario.firstContactByEmailDay = today + email;
    }
    if (Number.isInteger(phone)) {
      this.dataObj.campaign.contactScenario.firstContactByPhoneDay = today + phone;
    }
    return this;
  },
  /**
   * Sets contactScenario.nextCampaignContactDay & nextCampaignReContactDay
   * @param {String} [contactType] Type of contact, e.g. *SMS Contact #1*
   * @param {Number} [contactDay] Number of days after which the nextCampaignContact should take place
   * @param {Number} [recontactDay] Number of days after which the nextCampaignReContact should take place
   * @param {Date} [forcedDate=today] Date to be taken as reference
   * @returns {DataBuilder} This instance
   */
  nextCampaignContact(contactType, contactDay, recontactDay, forcedDate) {
    const today = timeHelper.dayNumber(forcedDate || new Date());
    this.dataObj.campaign = this.dataObj.campaign || lightCampaign;
    this.dataObj.campaign.contactScenario = this.dataObj.campaign.contactScenario || {};
    if (contactType) {
      this.dataObj.campaign.contactScenario.nextCampaignContact = contactType;
    }
    if (Number.isInteger(contactDay)) {
      this.dataObj.campaign.contactScenario.nextCampaignContactDay = today + contactDay;
    }
    if (Number.isInteger(recontactDay)) {
      this.dataObj.campaign.contactScenario.nextCampaignReContactDay = today + recontactDay;
    }
    return this;
  },
};
