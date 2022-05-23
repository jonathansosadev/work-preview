/**
 * Methods to prepare contacts to be sent
 * And to effectively send contacts
 */
const config = require('config');
const async = require('async');
const app = require('../../../../server/server');
const ContactStatus = require('../../../models/contact.status');

const contactsSender = require('../../../../workers/contacts-sender');
const GarageType = require('../../../models/garage.type');
const AlertType = require('../../../models/alert.types');
const ContactType = require('../../../models/contact.type');

const isCusteedEmail = ({ recipient, signature, forceEvent } = {}) => {
  return (
    recipient &&
    ['garagescore.com', 'mg.garagescore.com', 'custeed.com', 'mg.custeed.com'].includes(recipient.split('@').pop()) &&
    signature !== 'mailgum' &&
    forceEvent !== true
  );
};
/**
 * @description This function check if we should emit an event
 * @throw {Error} if it's a custeed email
 */
function isEventEmittingTracked(mailgunEvent) {
  return !isCusteedEmail(mailgunEvent);
}

/**
 * PrepareContact to be sent
 * It save it to DB with `Waiting` status and push it to the queue
 * @param contact ContactModel | Array[ContactModel]
 * @param callback function
 */
function prepareForSend(contact, callback) {
  const { Contact } = app.models;

  // if the garage is VI, do not send some alerts
  if (contact.payload && contact.payload.garageType && contact.payload.garageType === GarageType.VEHICLE_INSPECTION) {
    const { alertType = null, surveyReviewPagePass = null } = contact.payload;

    if (alertType === AlertType.AUTO_ALLOW_CRAWLERS) {
      callback && callback();
      return;
    }
    if (alertType === AlertType.GOOGLE_CAMPAIGN_ACTIVATED || alertType === AlertType.GOOGLE_CAMPAIGN_DESACTIVATED) {
      callback && callback();
      return;
    }
    if (contact.type === ContactType.UNSATISFIED_SUCCESS_ALERT) {
      callback && callback();
      return;
    }
    // [SGS] do not send unsatisfied/sensitive emails if REVIEW_PAGE of survey is not complete
    if (
      (alertType === AlertType.UNSATISFIED_VI || alertType === AlertType.SENSITIVE_VI) && (!surveyReviewPagePass)
    ) {
      callback && callback();
      return;
    }
  }

  // [SGS] do not send welcome email for some users
  if (
    contact.type === ContactType.WELCOME_EMAIL &&
    contact.payload &&
    contact.payload.job === 'Directeur de centre' &&
    contact.payload.cockpitType === GarageType.VEHICLE_INSPECTION
  ) {
    callback && callback();
    return;
  }

  Contact.validate(contact, async (err) => {
    if (err) {
      callback(err);
      return;
    }
    contact.app_url = process.env.APP_URL; // eslint-disable-line no-param-reassign
    const inUnitTest =
      typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ||
      (process.argv.length > 1 && process.argv[1].indexOf('mocha') >= 0); // Do not override contact when in unit test
    if (contact.to.includes('@') && config.has('contact.override.to.emailAddress') && !inUnitTest) {
      contact.overrideTo = config.get('contact.override.to.emailAddress'); // eslint-disable-line no-param-reassign
    } else if (config.has('contact.override.to.mobilePhoneNumber') && !inUnitTest) {
      contact.overrideTo = config.get('contact.override.to.mobilePhoneNumber');
    }
    contact.status = ContactStatus.WAITING; // eslint-disable-line no-param-reassign
    const ignored = config.get('contact.ignored') && config.get('contact.ignored').map((c) => c.trim());
    const only = config.get('contact.only') && config.get('contact.only').map((c) => c.trim());
    const contactKey = (contact.payload && contact.payload.key) || null;
    const contactGarageId = (contact.payload && contact.payload.garageId) || null;
    if (only && !only.includes(contact.type) && !only.includes(`${contact.type}#${contactKey}`)) {
      contact.status = ContactStatus.IGNORED;
    } else if (ignored && ignored.includes(contact.type)) {
      contact.status = ContactStatus.IGNORED;
    }
    contact.sendAt = contact.sendAt || new Date();
    // [SGS] : sender should be Custeed-GarageScore for UnsatisfiedVI && SensitiveVI emails
    if (
      contact.type === ContactType.ALERT_EMAIL &&
      contact.payload &&
      contact.payload.alertType &&
      (contact.payload.alertType === AlertType.UNSATISFIED_VI || contact.payload.alertType === AlertType.SENSITIVE_VI)
    ) {
      contact.sender = 'Custeed-GarageScore';
    }

    Contact.create(contact, async (errc, newDoc) => {
      if (errc) {
        console.error(errc);
        callback();
        return;
      }
      try {
        await contactsSender.queueContact(newDoc.getId().toString(), contact.type, contact.sendAt, contactGarageId);
      } catch (errp) {
        console.error(errp);
      }
      callback(null, newDoc);
    });
  });
}

function prepareMultiSend(contacts, callback) {
  async.forEachSeries(
    contacts,
    (contact, nextContact) => {
      prepareForSend(contact, nextContact);
    },
    callback
  );
}

module.exports = {
  prepareForSend,
  isEventEmittingTracked,
  prepareMultiSend,
};
