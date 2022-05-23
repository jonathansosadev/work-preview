const contactsConfigs = require('../../common/lib/garagescore/data-campaign/contacts-config.js');
const timeHelper = require('../../common/lib/util/time-helper');
const runEvents = require('../lib/garagescore/data-campaign/run/run-events');
const SourceTypes = require('./data/type/source-types');
const { log, JS } = require('../lib/util/log');

module.exports = function campaignScenarioDefinition(CampaignScenario) {
  // eslint-disable-line
  const _getContactPosition = (contacts, contactKeyToFind) => {
    for (let i = 0; i < contacts.length; i++) {
      if (contacts[i].key === contactKeyToFind) return i;
    }
    return -1;
  };
  const _isAGoodContact = (contactKey, coordValidity, disableSmsWithValidEmails) => {
    if (coordValidity.email && coordValidity.phone) {
      if (contactsConfigs.isEmail(contactKey)) return true;
      if (coordValidity.phone && !disableSmsWithValidEmails) return true;
    } else if (coordValidity.email && contactsConfigs.isEmail(contactKey)) {
      return true;
    } else if (coordValidity.phone && contactsConfigs.isSms(contactKey)) {
      return true;
    }
    return false;
  };

  CampaignScenario.prototype.getFollowupAndEscalateConfig = function getFollowupAndEscalateConfig(
    sourceType,
    ticketType
  ) {
    if (!sourceType) throw new Error('getFollowupAndEscalateConfig: SourceType not found');
    if (!ticketType) throw new Error('getFollowupAndEscalateConfig: TicketType not found');
    let source = sourceType;
    if (SourceTypes.supportedCrossLeadsSources().includes(sourceType)) {
      source = SourceTypes.XLEADS;
    } else if (SourceTypes.supportedDealershipSources().includes(sourceType)) {
      source = SourceTypes.DATAFILE;
    } else if (SourceTypes.supportedManualSources().includes(sourceType) || !SourceTypes.keys().includes(sourceType)) {
      source = SourceTypes.MANUAL;
    }
    return this.followupAndEscalate[source][ticketType];
  };

  CampaignScenario.prototype.formatContact = function formatContact(contact, importedDayNumber, delta) {
    /* BEWARE !!! For tests : this function is stubbed in common/lib/test/test-app.js @ _momo */
    if (!contact) return null;
    let day = importedDayNumber + contact.delay + (delta || 0); // transform delay to day number
    if (day < 0) {
      day = 0;
    }
    if (contactsConfigs.isSms(contact.key)) while (timeHelper.isDayNumberAWeekEnd(day)) day++; // we jump weekend for sms
    return { day, key: contact.key };
  };
  // list all different contacts a scenario has
  CampaignScenario.prototype.listContacts = function listContacts() {
    const contactsKeys = {};
    if (this.chains) {
      Object.values(this.chains).forEach((service) => {
        if (service.contacts) {
          service.contacts.forEach((c) => {
            contactsKeys[c.key] = true;
          });
        }
        if (service.thanks) {
          Object.values(service.thanks).forEach((t) => {
            if (t) {
              contactsKeys[t] = true;
            }
          });
        }
        if (service.recontacts) {
          if (service.recontacts.respondents.email) {
            contactsKeys[service.recontacts.respondents.email] = true;
          }
          if (service.recontacts.respondents.sms) {
            contactsKeys[service.recontacts.respondents.sms] = true;
          }
          if (service.recontacts.nonRespondents.email) {
            contactsKeys[service.recontacts.nonRespondents.email] = true;
          }
          if (service.recontacts.nonRespondents.sms) {
            contactsKeys[service.recontacts.nonRespondents.sms] = true;
          }
        }
      });
    }
    // add by default all the followups
    contactsKeys.maintenance_email_followup = true;
    contactsKeys.maintenance_sms_followup = true;
    contactsKeys.sale_email_followup = true;
    contactsKeys.sale_sms_followup = true;
    contactsKeys.vehicle_inspection_email_followup = true;
    contactsKeys.vehicle_inspection_sms_followup = true;

    return Object.keys(contactsKeys);
  };
  CampaignScenario.prototype.getContact = async function getContact(
    importedAt,
    lastContactKey,
    runevent,
    coordValidity,
    data,
    garageFirstContactDelay
  ) {
    // eslint-disable-line max-len
    const dataType = data.type; // This made to transform campaignType to data type for now that campaignType is vehicle sale
    if (!this.chains[dataType] || !this.chains[dataType].contacts || !this.chains[dataType].contacts.length) {
      log.error(JS, `campaign-scenario - getContact error Contacts of ${dataType} not found`);
      return null;
    }
    const contacts = this.chains[dataType].contacts;
    const thanks = this.chains[dataType].thanks;
    const importedDayNumber = timeHelper.dayNumber(importedAt);
    let contact = null;
    const onlyPhoneValid = coordValidity.phone && !coordValidity.email;
    if (!lastContactKey) {
      // let's get the first contact
      if (!contacts[0]) {
        console.error(`There is no first contact in the scenario ${this.name}`);
        return null;
      }
      if (runevent !== runEvents.CAMPAIGN_STARTED) {
        console.error('--------> There is no last contact and we are not at the CAMPAIGN START state...');
        console.error(`********* There is something wrong, runevent shouldn't be : ${runevent}`);
        return null;
      }
      contact = Object.assign({}, contacts[0]);
      /** Adding delay to the data if the scenario has been modified by the end user **/
      if (
        (garageFirstContactDelay || garageFirstContactDelay === 0) &&
        !data.get('campaign.contactScenario.deltaContact')
      ) {
        data.set('campaign.contactScenario.deltaContact', garageFirstContactDelay - contact.delay);
        await data.save();
      }
      /** IF only Phone is Valid AND THERE IS A EQUIVALENT SMS
       * ANDDD THIS CONTACT IS ALSO IN THE CONTACTS CHAIN
       * SEND THE SMS NOW
       **/
      if (
        onlyPhoneValid &&
        contactsConfigs[contact.key].sms &&
        _getContactPosition(contacts, contactsConfigs[contact.key].sms) > 0
      ) {
        contact.key = contactsConfigs[contact.key].sms;
      }
      return this.formatContact(contact, importedDayNumber, data.get('campaign.contactScenario.deltaContact'));
    }
    const lastContact = {
      // Last contact information
      key: lastContactKey, // His key
      config: contactsConfigs[lastContactKey], // His configuration
      position: _getContactPosition(contacts, lastContactKey), // His position in the scenario chain
    };
    if (lastContact.config.isThank) return null; // End of the chain
    // If it's a SURVEY_UPDATE we send a thank email
    if (runevent === runEvents.SURVEY_UPDATE) {
      // We skip chain and go directly at thanks emails
      if (onlyPhoneValid) return null; // WE Don't thanks for sms
      const isCompleted = data.get('survey.progress.isComplete');
      const isUnsatisfied = data.review_isDetractor();
      const thankKey = contactsConfigs.getThankKey(thanks, isCompleted, isUnsatisfied);
      return { key: thankKey, day: timeHelper.todayDayNumber() }; // we send thanks now
    }
    // If it's a CONTACT_SENT the next contact in the chain (example: email number 2 or 3 to ask the customer his review again)
    if (runevent === runEvents.CONTACT_SENT) {
      if (lastContact.position === -1 || !contacts[lastContact.position + 1]) return null; // lastContact not found or NO next contact found
      do {
        contact = this.getNextContact(contacts, (contact && contact.key) || lastContact.key);
      } while (contact && !_isAGoodContact(contact.key, coordValidity, this.disableSmsWithValidEmails));
      if (contact)
        return this.formatContact(contact, importedDayNumber, data.get('campaign.contactScenario.deltaContact'));
    }
    return null;
  };

  // first contact sent By Email after a campaign run
  CampaignScenario.prototype.firstContactByEmailDay = function firstContactByEmailDay(
    dataType,
    importedAt,
    garageDelay
  ) {
    if (!this.chains[dataType] || !this.chains[dataType].contacts || !this.chains[dataType].contacts.length) {
      console.error('firstContactByEmailDay ERROR Contacts not found');
      return null;
    }
    const firstEmail = this.chains[dataType].contacts.find((contact) => contactsConfigs.isEmail(contact.key));
    if (firstEmail) {
      // The delay coming from the garage overrides the delay coming from the scenario
      const firstEmailDelay = garageDelay || garageDelay === 0 ? garageDelay : firstEmail.delay;
      return timeHelper.dayNumber(importedAt) + firstEmailDelay;
    }
    return null;
  };

  CampaignScenario.prototype.firstContactByPhoneDay = function firstContactByPhoneDay(
    dataType,
    importedAt,
    garageDelay
  ) {
    if (!this.chains[dataType] || !this.chains[dataType].contacts || !this.chains[dataType].contacts.length) {
      console.error('firstContactByPhoneDay ERROR Contacts not found');
      return null;
    }
    const firstSms = this.chains[dataType].contacts.find((contact) => contactsConfigs.isSms(contact.key));
    if (firstSms) {
      // The delay coming from the garage overrides the delay coming from the scenario
      const firstSmsDelay = garageDelay || garageDelay === 0 ? garageDelay : firstSms.delay;
      return timeHelper.dayNumber(importedAt) + firstSmsDelay;
    }
    return null;
  };
  // // contact sent after another one has been sent
  CampaignScenario.prototype.getNextContact = function nextContactFunc(contacts, lastContactSentKey) {
    let i = 0;
    while (i < contacts.length && contacts[i].key !== lastContactSentKey) i++;
    return contacts[++i] || null;
  };
  // returns the day when the campaign must be complete
  CampaignScenario.prototype.completeScheduledAt = function completeScheduledAt(campaign, garageMakeSurveyDelta = 0) {
    return timeHelper.dayNumber(campaign.createdAt) + this.duration + garageMakeSurveyDelta; // default
  };
  // // returns the day when a recontact sms must be send
  CampaignScenario.prototype.recontactAt = function recontactAt(data) {
    if (!this.chains[data.type]) return null;
    if (!this.chains[data.type].contacts) return null;
    if (!this.chains[data.type].recontacts) return null;
    if (!this.chains[data.type].recontacts.enabled) return null;
    // we send recontact Google after the last contact scenario
    const contactsSize = this.chains[data.type].contacts.length;
    if (contactsSize === 0) {
      return null;
    }
    const lastContactScenario = this.chains[data.type].contacts[contactsSize - 1];
    const delay = lastContactScenario ? lastContactScenario.delay : 0;
    return timeHelper.todayDayNumber() + this.chains[data.type].recontacts.dayOfNextMonth + delay;
  };
  /**
   * Test if the campaignScenario is used by some garages before deleting it
   * @param id
   * @param callback
   */
  CampaignScenario.controlledDestroyById = function controlledDestroyById(id, callback) {
    CampaignScenario.app.models.Garage.find({ where: { campaignScenarioId: id } }, (err, garages) => {
      if (err || garages.length > 0) {
        callback(err || new Error(`This scenario couldn't be removed it is used by ${garages.length} garages`));
        return;
      }
      CampaignScenario.destroyById(id, callback);
    });
  };

  CampaignScenario.prototype.recontacts = function recontacts(data) {
    const campaignType = data.type;
    if (
      !this.chains[campaignType] ||
      !this.chains[campaignType].contacts ||
      !this.chains[campaignType].contacts.length
    ) {
      log.error(JS, `campaign-scenario - getContact error Contacts of ${campaignType} not found`);
      return null;
    }
    const type = data.get('survey.firstRespondedAt') ? 'respondents' : 'nonRespondents';
    const contacts = [];
    const recontact = this.chains[campaignType].recontacts;
    if (recontact[type] && recontact[type].email) {
      contacts.push(recontact[type].email);
    }
    if (recontact[type] && recontact[type].sms) {
      contacts.push(recontact[type].sms);
    }
    // only target customer satisfied
    const isSharedOnGoogleClicked = data.get('review.sharedOnGoogleClicked');
    const rating = data.get('review.rating.value');
    if (typeof rating !== 'undefined' && rating > 6 && !isSharedOnGoogleClicked) {
      if (recontact.enabled && recontact.google && recontact.google.email) {
        contacts.push(recontact.google.email);
      }
      if (recontact.enabled && recontact.google && recontact.google.sms) {
        contacts.push(recontact.google.sms);
      }
    }
    return contacts;
  };
};
