const async = require('async');
const campaignStatus = require('./type/campaign-status');
const EmailStatus = require('./type/email-status');
const PhoneStatus = require('./type/phone-status');
const CampaignContactStatus = require('./type/campaign-contact-status');
const timeHelper = require('../../lib/util/time-helper');
const runCampaign = require('../../lib/garagescore/data-campaign/run-schema/run-campaign');
const completeCampaign = require('../../lib/garagescore/data-campaign/run-schema/complete-campaign');
const cancelCampaign = require('../../lib/garagescore/data-campaign/run-schema/cancel-campaign');
const schemaSendNextContact = require('../../lib/garagescore/data-campaign/run-schema/send-next-campaign-contact');
const schemaSendReContact = require('../../lib/garagescore/data-campaign/run-schema/send-recontact');
const schemaCheckSurveyUdpates = require('../../lib/garagescore/data-campaign/run-schema/check-survey-updates');

const schemaHandleSurveyResultsProgress = require('../../lib/garagescore/data-campaign/run-schema/handle-survey-result-progress');
const GsSupervisor = require('../../lib/garagescore/supervisor/service');
const SupervisorMessageType = require('../supervisor-message.type');
const dataTypes = require('../../models/data/type/data-types');
const gsCampaignType = require('../../../common/models/campaign.type.js');
const { promisify } = require('util');
const { concurrentpromiseAll } = require('../../lib/util/concurrentpromiseAll');

const _campaignTypeByDataType = {};
_campaignTypeByDataType[dataTypes.MAINTENANCE] = gsCampaignType.MAINTENANCE;
_campaignTypeByDataType[dataTypes.NEW_VEHICLE_SALE] = gsCampaignType.VEHICLE_SALE;
_campaignTypeByDataType[dataTypes.USED_VEHICLE_SALE] = gsCampaignType.VEHICLE_SALE;
_campaignTypeByDataType[dataTypes.VEHICLE_INSPECTION] = gsCampaignType.VEHICLE_INSPECTION;

/**
 * A garagescore campaign
 */
const model = () => ({
  properties: {
    /* campaign Id  */
    campaignId: {
      type: 'string',
      required: true,
    },
    /* running, complete, cancel */
    status: {
      type: campaignStatus.type,
      required: true,
      default: campaignStatus.WITHOUTCAMPAIGN,
    },
    /* When the campaign was created */
    importedAt: {
      type: 'date',
      required: true,
    },
    /* was the campaign not send and why */
    contactStatus: {
      hasBeenContactedByPhone: { type: 'boolean', required: true, default: false },
      hasBeenContactedByEmail: { type: 'boolean', required: true, default: false },
      hasOriginalBeenContactedByPhone: { type: 'boolean', required: true, default: false },
      hasOriginalBeenContactedByEmail: { type: 'boolean', required: true, default: false },
      status: { type: CampaignContactStatus.type },
      phoneStatus: { type: PhoneStatus.type },
      emailStatus: { type: EmailStatus.type },
      previouslyContactedByPhone: { type: 'boolean', required: true },
      previouslyContactedByEmail: { type: 'boolean', required: true },
      previouslyDroppedEmail: { type: 'boolean', required: true },
      previouslyDroppedPhone: { type: 'boolean', required: true },
      previouslyUnsubscribedByEmail: { type: 'boolean', required: true },
      previouslyUnsubscribedByPhone: { type: 'boolean', required: true },
      previouslyComplainedByEmail: { type: 'boolean', required: true },
    },
    /* contact send calendar and config */
    contactScenario: {
      deltaContact: { type: 'number' },
      firstContactedAt: { type: 'Date' },
      firstSmsDisabled: { type: 'boolean' },
      firstEmailDisabled: { type: 'boolean' },
      nextCampaignReContactDay: { type: 'number' },
      recontactedAt: { type: 'date' },
      recontactFailedAt: { type: 'date' },
      nextCampaignContact: { type: 'string' },
      nextCampaignContactDay: { type: 'number' },
      lastCampaignContactSent: { type: 'string' },
      nextCampaignContactFailedAt: { type: 'date' },
      lastCampaignContactSentAt: { type: 'date' },
      nextCheckSurveyUpdatesDecaminute: { type: 'number' },
      firstContactByEmailDay: { type: 'number' },
      firstContactByPhoneDay: { type: 'number' },
      lastErrorCheckSurveyUpdatesDecaminute: { type: 'number' }, // Not used now
      lastErrorCheckSurveyUpdatesMessage: { type: 'string' }, // Not used now
      lastSuccessCheckSurveyUpdatesDecaminute: { type: 'number' }, // Not used now
      lastSuccessCheckSurveyUpdatesMessage: { type: 'string' }, // Not used now
    },
  },
});

/**
 * generate the campaign.contactStatus.emailStatus field
 */
function generateEmailStatus() {
  if (!this.campaign) {
    this.campaign = {};
  }
  if (!this.campaign.contactStatus) {
    this.campaign.contactStatus = {};
  }
  if (!this.get('shouldSurfaceInStatistics')) {
    this.campaign.contactStatus.emailStatus = EmailStatus.NOT_TO_SURFACE;
    return;
  }
  if (!this.get('customer.contact.email') || this.get('customer.contact.email.isEmpty')) {
    this.campaign.contactStatus.emailStatus = EmailStatus.EMPTY;
    return;
  }
  if (!this.get('customer.contact.email.isSyntaxOK')) {
    this.campaign.contactStatus.emailStatus = EmailStatus.WRONG;
    return;
  }
  if (this.get('customer.contact.email.isDropped') || this.get('campaign.contactStatus.previouslyDroppedEmail')) {
    this.campaign.contactStatus.emailStatus = EmailStatus.DROPPED;
    return;
  }
  if (this.get('campaign.contactStatus.previouslyContactedByEmail')) {
    this.campaign.contactStatus.emailStatus = EmailStatus.RECENTLY_CONTACTED;
    return;
  }
  if (
    this.get('campaign.contactStatus.previouslyUnsubscribedByEmail') ||
    this.get('customer.contact.email.isUnsubscribed') ||
    this.get('campaign.contactStatus.previouslyComplainedByEmail') ||
    this.get('customer.contact.email.isComplained')
  ) {
    this.campaign.contactStatus.emailStatus = EmailStatus.UNSUBSCRIBED;
    return;
  }
  this.campaign.contactStatus.emailStatus = EmailStatus.VALID;
}

/**
 * generate the campaign.contactStatus.phoneStatus field
 */
function generatePhoneStatus() {
  if (!this.campaign) {
    this.campaign = {};
  }
  if (!this.campaign.contactStatus) {
    this.campaign.contactStatus = {};
  }
  if (this.get('shouldSurfaceInStatistics')) {
    // That's weird, shouldn't it be !this.get('shouldSurfaceInStatistics') ? And then a return
    this.campaign.contactStatus.phoneStatus = PhoneStatus.NOT_TO_SURFACE;
  }
  if (!this.get('customer.contact.mobilePhone') || this.get('customer.contact.mobilePhone.isEmpty')) {
    this.campaign.contactStatus.phoneStatus = PhoneStatus.EMPTY;
    return;
  }
  if (
    !this.get('customer.contact.mobilePhone.isSyntaxOK') ||
    this.get('customer.contact.mobilePhone.isDropped') ||
    this.get('campaign.contactStatus.previouslyDroppedPhone')
  ) {
    this.campaign.contactStatus.phoneStatus = PhoneStatus.WRONG;
    return;
  }
  if (this.get('campaign.contactStatus.previouslyContactedByPhone')) {
    this.campaign.contactStatus.phoneStatus = PhoneStatus.RECENTLY_CONTACTED;
    return;
  }
  if (
    this.get('campaign.contactStatus.previouslyUnsubscribedByPhone') ||
    this.get('customer.contact.mobilePhone.isUnsubscribed')
  ) {
    this.campaign.contactStatus.phoneStatus = PhoneStatus.UNSUBSCRIBED;
    return;
  }
  this.campaign.contactStatus.phoneStatus = PhoneStatus.VALID;
}

/**
 * generate the campaign.contactStatus.status field
 */
function generateCampaignContactStatus() {
  if (!this.get('shouldSurfaceInStatistics')) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.NOT_TO_SURFACE);
    return;
  }
  if (!this.get('campaign.status')) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.NO_CAMPAIGN);
    return;
  }
  if (!this.get('customer.contact')) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.IMPOSSIBLE);
    return;
  }
  /* Variables that will be used in the conditions.
   * Doing it like this to improve readability since we won't have ifs spreading over 4 lines anymore
   */
  const phoneStatus = this.get('campaign.contactStatus.phoneStatus');
  const emailStatus = this.get('campaign.contactStatus.emailStatus');
  const hasBeenContactedByEmail =
    this.get('campaign.contactStatus.hasBeenContactedByEmail') ||
    this.get('campaign.contactStatus.hasOriginalBeenContactedByEmail');
  const hasBeenContactedByPhone =
    this.get('campaign.contactStatus.hasBeenContactedByPhone') ||
    this.get('campaign.contactStatus.hasOriginalBeenContactedByPhone');
  const hasBeenContacted = hasBeenContactedByPhone || hasBeenContactedByEmail;
  const isEmailDropped = this.get('customer.contact.email.revised')
    ? !!this.get('customer.contact.email.isDropped') && !!this.get('customer.contact.email.isOriginalDropped')
    : !!this.get('customer.contact.email.isDropped');
  const isPhoneDropped = this.get('customer.contact.mobilePhone.revised')
    ? !!this.get('customer.contact.mobilePhone.isDropped') &&
      !!this.get('customer.contact.mobilePhone.isOriginalDropped')
    : !!this.get('customer.contact.mobilePhone.isDropped');

  /* Now we can determine the campaign contact status */
  if (!hasBeenContacted) {
    if (
      [PhoneStatus.EMPTY, PhoneStatus.WRONG].includes(phoneStatus) &&
      [EmailStatus.EMPTY, EmailStatus.WRONG].includes(emailStatus)
    ) {
      if (this.get('customer.contact.mobilePhone.isDropped') || this.get('customer.contact.email.isDropped')) {
        // gotta avoid this one
        this.set('campaign.contactStatus.status', CampaignContactStatus.NOT_RECEIVED);
        return;
      }
      this.set('campaign.contactStatus.status', CampaignContactStatus.IMPOSSIBLE);
      return;
    }
  }
  if (
    [PhoneStatus.EMPTY, PhoneStatus.WRONG].includes(phoneStatus) &&
    [EmailStatus.UNSUBSCRIBED, EmailStatus.RECENTLY_CONTACTED].includes(emailStatus)
  ) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.BLOCKED);
    return;
  }
  if (
    [PhoneStatus.UNSUBSCRIBED, PhoneStatus.RECENTLY_CONTACTED].includes(phoneStatus) &&
    [EmailStatus.EMPTY, EmailStatus.WRONG].includes(emailStatus)
  ) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.BLOCKED);
    return;
  }
  if (
    [PhoneStatus.UNSUBSCRIBED, PhoneStatus.RECENTLY_CONTACTED].includes(phoneStatus) &&
    [EmailStatus.UNSUBSCRIBED, EmailStatus.RECENTLY_CONTACTED].includes(emailStatus)
  ) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.BLOCKED);
    return;
  }
  if (this.get('campaign.status') === campaignStatus.WITHOUTCAMPAIGN) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.BLOCKED);
    return;
  }
  if ([campaignStatus.NEW, campaignStatus.STARTING, campaignStatus.WAITING].includes(this.get('campaign.status'))) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.SCHEDULED);
    return;
  }
  if (hasBeenContacted) {
    if (
      (isEmailDropped && !hasBeenContactedByPhone) ||
      (isPhoneDropped && !hasBeenContactedByEmail) ||
      (isEmailDropped && isPhoneDropped)
    ) {
      if (phoneStatus === PhoneStatus.VALID) {
        this.set('campaign.contactStatus.status', CampaignContactStatus.SCHEDULED);
        return;
      }
      if (emailStatus === EmailStatus.VALID) {
        this.set('campaign.contactStatus.status', CampaignContactStatus.SCHEDULED);
        return;
      }
      // gotta avoid this too
      this.set('campaign.contactStatus.status', CampaignContactStatus.NOT_RECEIVED);
      return;
    }
    // my goal is to reach here
    this.set('campaign.contactStatus.status', CampaignContactStatus.RECEIVED);
    return;
  }
  const currentDayNumber = timeHelper.dayNumber(new Date());
  // from here the campaign is not send so it must be Impossible or blocked or scheduled in the future
  if (
    (!hasBeenContactedByEmail && this.get('campaign.contactScenario.firstContactByEmailDay') > currentDayNumber) ||
    (!hasBeenContactedByPhone && this.get('campaign.contactScenario.firstContactByPhoneDay') > currentDayNumber)
  ) {
    this.set('campaign.contactStatus.status', CampaignContactStatus.SCHEDULED);
    return;
  }
  this.set('campaign.contactStatus.status', CampaignContactStatus.BLOCKED);
}

function explainEmailStatus() {
  switch (this.get('campaign.contactStatus.emailStatus')) {
    case EmailStatus.VALID:
      return '';
    case EmailStatus.WRONG:
      if (!this.get('customer.contact.email.isSyntaxOK')) {
        return 'erreur de saisie';
      }
      if (this.get('customer.contact.email.isDropped')) {
        return 'cette adresse email ne répond pas / NPAI';
      }
      if (this.get('campaign.contactStatus.previouslyDroppedEmail')) {
        return 'cette adresse email est injoignable';
      }
      return '-';
    case EmailStatus.UNSUBSCRIBED:
      if (
        this.get('campaign.contactStatus.previouslyComplainedByEmail') ||
        this.get('customer.contact.email.isComplained')
      ) {
        return "client ne souhaitant plus recevoir d'enquête GS : mise en spam";
      }
      return "client ne souhaitant plus recevoir d'enquête GS";
    case EmailStatus.RECENTLY_CONTACTED:
      return 'Email envoyé dans les 30 derniers jours';
    case EmailStatus.EMPTY:
      return '';
    case EmailStatus.NOT_TO_SURFACE:
      return '';
    default:
      return '';
  }
}

function explainPhoneStatus() {
  switch (this.get('campaign.contactStatus.phoneStatus')) {
    case PhoneStatus.VALID:
      return '';
    case PhoneStatus.WRONG:
      if (!this.get('customer.contact.mobilePhone.isSyntaxOK')) {
        return 'erreur de saisie';
      }
      if (this.get('customer.contact.mobilePhone.isDropped')) {
        return 'ce téléphone ne répond pas / NPAI';
      }
      if (this.get('campaign.contactStatus.previouslyDroppedPhone')) {
        return 'ce téléphone est injoignable';
      }
      return '-';
    case PhoneStatus.UNSUBSCRIBED:
      return "client ne souhaitant plus recevoir d'enquête GS";
    case PhoneStatus.RECENTLY_CONTACTED:
      return 'SMS envoyé dans les 30 derniers jours';
    case PhoneStatus.EMPTY:
      return '';
    case PhoneStatus.NOT_TO_SURFACE:
      return '';
    default:
      return '';
  }
}
// use by common/models/data/embedded-customer.js
function explainCampaignContactStatus() {
  switch (this.get('campaign.contactStatus.status')) {
    case CampaignContactStatus.SCHEDULED:
      return '';
    case CampaignContactStatus.RECEIVED:
      return '';
    case CampaignContactStatus.NOT_RECEIVED:
      if (this.get('campaign.contactStatus.phoneStatus') === PhoneStatus.WRONG) {
        return this.campaign_explainPhoneStatus();
      }
      if (this.get('campaign.contactStatus.emailStatus') === EmailStatus.WRONG) {
        return this.campaign_explainEmailStatus();
      }
      return '';
    case CampaignContactStatus.IMPOSSIBLE:
      return 'erreur de coordonnées Email et Mobile';
    case CampaignContactStatus.BLOCKED:
      if (
        !this.get('campaign.contactStatus.previouslyContactedByPhone') &&
        !this.get('campaign.contactStatus.previouslyContactedByEmail') &&
        !this.get('campaign.contactStatus.previouslyUnsubscribedByPhone') &&
        !this.get('campaign.contactStatus.previouslyUnsubscribedByEmail')
      ) {
        if (
          this.get('campaign.contactStatus.hasBeenContactedByEmail') === false &&
          this.get('campaign.contactScenario.firstContactByPhoneDay') === false &&
          this.get('campaign.contactStatus.phoneStatus') === PhoneStatus.VALID
        ) {
          return 'Campagne SMS désactivée dans la configuration garage';
        }
        if (
          this.get('campaign.contactStatus.hasBeenContactedByPhone') === false &&
          this.get('campaign.contactScenario.firstContactByEmailDay') === false &&
          this.get('campaign.contactStatus.emailStatus') === EmailStatus.VALID
        ) {
          return 'Campagne Email désactivée dans la configuration garage';
        }
      }
      if (!this.get('service.providedAt')) {
        return "date d'intervention non renseignée";
      }
      if (
        [PhoneStatus.UNSUBSCRIBED, PhoneStatus.RECENTLY_CONTACTED].includes(
          this.get('campaign.contactStatus.phoneStatus')
        )
      ) {
        return this.campaign_explainPhoneStatus();
      }
      if (
        [EmailStatus.UNSUBSCRIBED, EmailStatus.RECENTLY_CONTACTED].includes(
          this.get('campaign.contactStatus.emailStatus')
        )
      ) {
        return this.campaign_explainEmailStatus();
      }
      return this.campaign_explainEmailStatus() || this.campaign_explainPhoneStatus();
    case CampaignContactStatus.NOT_TO_SURFACE:
      return '';
    default:
      return '';
  }
}
// return the campaign type we must use for this data instance
const campaignType = function campaignType() {
  return _campaignTypeByDataType[this.type]; // TODO _campaignTypeByDataType not used anymore cause datatype should be the campaignType also
};
// try to run (or retry to run) a the campaign
const run = function run(campaign, retry, callback) {
  runCampaign(campaign, this, { retry }, callback);
};

// try to cancel the campaign
const cancel = async function cancel() {
  return new Promise((resolve, reject) => {
    cancelCampaign(this, (err, response) => (err ? reject(err) : resolve(response)));
  });
};
// try to complete the campaign
const complete = function complete(callback) {
  completeCampaign(this, callback);
};

// force send next contact
const sendNextContact = function sendNextContact(callback) {
  schemaSendNextContact(this, callback);
};
// force send next REcontact
const sendReContact = async function sendReContact() {
  const limit = timeHelper.todayDayNumber() - 7;
  const nextCampaignReContactDay = this.get('campaign.contactScenario.nextCampaignReContactDay');
  if (nextCampaignReContactDay < limit) {
    throw new Error(`Cannot send recontact, too old - ${nextCampaignReContactDay}`);
  } else if (this.get('campaign.contactScenario.recontactedAt')) {
    throw new Error('Cannot send a recontact twice');
  }
  return schemaSendReContact(this);
};
// check if the survey responses have been updated and mark the data to be handled
const checkSurveyUdpates = function checkSurveyUdpates(callback) {
  schemaCheckSurveyUdpates(this, callback);
};
// handle marked survey updates
const handleSurveyResultsProgress = function handleSurveyResultsProgress(callback) {
  schemaHandleSurveyResultsProgress(this, callback);
};
const determineDataCoordsValidity = function determineDataCoordsValidity(data) {
  const validity = {
    phone: false,
    email: false,
  };
  if (
    data &&
    data.campaign &&
    data.campaign.contactStatus &&
    data.campaign.contactStatus.phoneStatus &&
    data.campaign.contactStatus.emailStatus
  ) {
    if (data.campaign.contactStatus.phoneStatus === PhoneStatus.VALID) {
      validity.phone = true;
    }
    if (data.campaign.contactStatus.emailStatus === EmailStatus.VALID) {
      validity.email = true;
    }
  }
  return validity;
};
// get contact name and day after an campaign event (run, email sent...)
const determineNextCampaignContact = function determineNextCampaignContact(currentRunEvent, data, callback) {
  const promise = new Promise((resolve, reject) => {
    const lastCampaignContactSent = this.get('campaign.contactScenario.lastCampaignContactSent');
    const importedAt = this.get('campaign.importedAt') || new Date();
    const validity = determineDataCoordsValidity(data);
    this.garage((errGarage, garage) => {
      if (errGarage) {
        reject(errGarage);
        return;
      }
      garage.getCampaignScenario((errScenario, scenario) => {
        if (errScenario) {
          reject(errScenario);
          return;
        }
        if (!scenario) {
          reject(new Error(`No scenario found for ${garage.getId()}`));
          return;
        }
        const garageFirstContactDelay =
          garage.firstContactDelay &&
          garage.firstContactDelay[data.get('type')] &&
          (garage.firstContactDelay[data.get('type')].value || garage.firstContactDelay[data.get('type')].value === 0)
            ? garage.firstContactDelay[data.get('type')].value
            : null;
        if (validity.phone || validity.email) {
          scenario
            .getContact(importedAt, lastCampaignContactSent, currentRunEvent, validity, data, garageFirstContactDelay)
            .then((contact) => {
              if (!contact) {
                resolve({});
                return;
              }
              resolve({ key: contact.key, day: contact.day });
            })
            .catch((e) => {
              reject(e);
            });
        } else {
          resolve({}); // new Error('validity.phone and validity.email are false ! We can\'t go further.')
        }
      });
    });
  });
  if (!callback) return promise;
  promise
    .then((args) => {
      callback(null, args.key || null, args.day || null);
    })
    .catch(callback);
  return null;
};
// send next campaign contact for a specific decaminute
const checkSurveyUdpatesForDecaMinute = function checkSurveyUdpatesForDecaMinute(decamin, callback) {
  // Udpate :-D
  const where = decamin
    ? { 'campaign.contactScenario.nextCheckSurveyUpdatesDecaminute': decamin }
    : { 'campaign.contactScenario.nextCheckSurveyUpdatesDecaminute': { neq: null } };

  this.find({ where }, (errFind, datas) => {
    if (errFind) {
      callback(errFind, 0);
      return;
    }
    if (datas.length === 0) {
      callback(null, 0);
      return;
    }
    if (!decamin) {
      console.log(`${datas.length} surveyUdpates to process`);
    }

    async.eachSeries(
      datas,
      (data, next) => {
        if (!decamin) {
          // in review mode, we want to wait at least 10 minutes
          const now = timeHelper.decaMinuteNumber(new Date());
          const nextCheckSurveyUpdatesDecaminute = data.get(
            'campaign.contactScenario.nextCheckSurveyUpdatesDecaminute'
          );
          const diff = nextCheckSurveyUpdatesDecaminute - now;
          if (diff > 2 && !data.get('survey.progress.isComplete')) {
            next();
            return;
          }
        }
        data.campaign_checkSurveyUdpates((errCheckSurveyUdpates) => {
          if (errCheckSurveyUdpates) {
            console.error(errCheckSurveyUdpates);
            data.set('campaign.contactScenario.nextCheckSurveyUpdatesDecaminute', null);
            data.save(next);
            return;
          }
          next();
        });
      },
      (err) => {
        callback(err, datas.length);
      }
    );
  });
};

const nextContact = function nextContact() {
  return this.get('campaign.contactScenario.nextCampaignContact');
};

// send next campaign contact for a specific pair of contactName/date, garageId can be omitted
const sendNextCampaignContactForDay = async function sendNextCampaignContactForDay(contactKey, day, garageId) {
  const where = {};
  if (garageId) {
    where.garageId = garageId;
  }
  if (day) {
    where['campaign.contactScenario.nextCampaignContactDay'] = day;
  } else {
    where['campaign.contactScenario.nextCampaignContactDay'] = { neq: null };
  }
  if (contactKey) {
    where['campaign.contactScenario.nextCampaignContact'] = contactKey;
  } else {
    where['campaign.contactScenario.nextCampaignContact'] = { neq: null };
  }
  const processData = (data) => new Promise((resolveData) => {
      data.campaign_sendNextContact((errorSendOneContact) => {
        if (errorSendOneContact) {
          const msg = `Cannot send next contact for data ${data.id} : ${errorSendOneContact.message}`;
          console.error(msg);
          GsSupervisor.warn({
            type: SupervisorMessageType.SEND_NEXT_CONTACT_ERROR,
            payload: {
              error: msg,
              context: 'sendNextCampaignContactForDay',
            },
          }); // do not wait the callback
          data.set('campaign.contactScenario.nextCampaignContactDay', null);
          data.set('campaign.contactScenario.nextCampaignContactFailedAt', new Date());
          data.save(resolveData);
          return;
        }
        resolveData();
      });
    });
  const find = promisify(this.find).bind(this);
  const count = promisify(this.count).bind(this);
  /* count how many bucket/loop we have to process */
  const total = await count(where);
  if (!total) {
    return 0;
  }
  const limit = 1000;
  const loops = Math.ceil(total / limit);
  console.log(`${total} nextCampaignContact ${contactKey} to process in ${loops} loop(s) of ${limit} datas`);
  let processed = 0;
  for (let i = 0; i < loops; i++) {
    const datas = await find({ where, limit });
    const promises = [];
    for (const data of datas) {
      promises.push(() => processData(data));
    }
    await concurrentpromiseAll(promises, 500, false);
    processed += datas.length;
  }
  return processed;
};
// send recontact sms for a specific day, garageId can be omitted
// TODO if you have scalability issue, do the same than sendNextCampaignContactForDay
const sendReContactForDay = async function sendReContactForDay(day, garageId) {
  const where = {};
  if (garageId) { 
    where.garageId = garageId;
  }
  if (day) {
    where['campaign.contactScenario.nextCampaignReContactDay'] = day;
  } else {
    where['campaign.contactScenario.nextCampaignReContactDay'] = { neq: null };
  }

  const processData = (data) => new Promise((resolve) => {
    data.campaign_sendReContact()
      .then(() => {
        resolve();
      })
      .catch((err) => {
        const msg = `Cannot send recontact for data ${data.id} : ${err.message}`;
        console.error(msg);
        data.set('campaign.contactScenario.nextCampaignReContactDay', null);
        data.set('campaign.contactScenario.recontactFailedAt', new Date());
        data.save(resolve);
      });
  });

  const find = promisify(this.find).bind(this);
  const count = promisify(this.count).bind(this);
  const total = await count(where);
  if (!total) {
    return 0;
  }
  const limit = 1000;
  const loops = Math.ceil(total / limit);
  let processed = 0;
  console.log(`${total} sendReContact to process in ${loops} loop(s) of ${limit} datas`);

  for (let i = 0; i < loops ; i++) {
    const datas = await find({ where, limit });
    const promises = [];
    for (const data of datas) {
      promises.push(() => processData(data));
    }
    await concurrentpromiseAll(promises, 500, false);
    //await concurrentpromiseAll(datas.map((data) => processData(data)), 500, false);
    processed += datas.length;
  }
  return processed;
};

const prototypeMethods = {
  generateCampaignContactStatus,
  determineDataCoordsValidity,
  generateEmailStatus,
  generatePhoneStatus,
  explainCampaignContactStatus,
  explainEmailStatus,
  explainPhoneStatus,
  campaignType,
  run,
  complete,
  cancel,
  determineNextCampaignContact,
  sendNextContact,
  sendReContact,
  checkSurveyUdpates,
  handleSurveyResultsProgress,
  nextContact,
};

const staticMethods = {
  checkSurveyUdpatesForDecaMinute,
  sendNextCampaignContactForDay,
  sendReContactForDay,
};

module.exports = { model, prototypeMethods, staticMethods };
