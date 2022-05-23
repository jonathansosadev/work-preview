const config = require('config');
const app = require('../../../../../server/server');
const ContactStatus = require('../../../../models/contact.status');
const contactsConfigs = require('../../../../lib/garagescore/data-campaign/contacts-config.js');
const ContactType = require('../../../../models/contact.type');
const ContactService = require('../../../../lib/garagescore/contact/service');
const debug = require('debug')('garagescore:common:lib:garagescore:campaign-item:run:send-contact'); // eslint-disable-line max-len,no-unused-vars
const GarageTypes = require('../../../../models/garage.type');
const I18nRequire = require('../../i18n/i18n');
const i18nSendContactNow = new I18nRequire('data/send-contact-now');

/** create a contact and then as to send it as an email or an sms */
module.exports = async (data, contactKey, callback) => {
  const contactConfig = contactsConfigs[contactKey];
  if (!contactConfig) {
    callback(new Error("Didn't found contactKey in contactsConfig"));
    return;
  }

  // To delete when no more loopback
  if (!data.garage && data._id) {
    data = await app.models.Data.findById(data._id);
  }
  // End to delete when no more loopback
  const checkIfAlreadySent = (next) => {
    if (config.get('contact.resendAlreadySent')) {
      data.garage(next);
      return;
    }
    app.models.Contact.find({ where: { 'payload.dataId': data.getId() } }, (errContacts, contacts) => {
      if (errContacts) {
        callback(errContacts);
        return;
      }
      const found = contacts.filter((c) => c.payload.key === contactKey);
      if (found.length > 0) {
        console.log(`Already sent: Skipping contact "${contactKey}" for data ${data.getId()}`);
        callback();
        return;
      }
      data.garage(next);
    });
  };

  checkIfAlreadySent((errGarage, garage) => {
    if (errGarage) {
      callback(errGarage);
      return;
    }
    const contact = {};
    contact.payload = {
      key: contactKey,
      dataId: data.getId(),
      garageId: data.garageId,
    };
    if (contactsConfigs.isEmail(contactKey)) {
      if (
        data.get('customer.contact.email.isEmpty') ||
        !data.get('customer.contact.email.isSyntaxOK') ||
        !data.get('customer.contact.email.value')
      ) {
        console.log(`No e-mail address: Skipping contact "${contactKey}" for data :${data.getId()}`);
        callback();
        return;
      }
      const email = data.get('customer.contact.email.value');
      const isUnsubscribed = data.get('customer.contact.email.isUnsubscribed');
      const isDropped = data.get('customer.contact.email.isDropped');
      const isComplained = data.get('customer.contact.email.isComplained');
      if (isUnsubscribed || isDropped || isComplained) {
        console.log(`Blocked e-mail address: Skipping contact "${contactKey}" for data :${data.getId()}
        reason : "${JSON.stringify({ isUnsubscribed, isDropped, isComplained })}"`);
        callback();
        return;
      }
      contact.type = ContactType.CAMPAIGN_EMAIL;
      // SGS : replace "GarageScore" by "Custeed-GarageScore"
      contact.sender =
        contactConfig.sender ||
        `${garage.publicDisplayName} ${i18nSendContactNow.$t('via')} ${
          garage.type === GarageTypes.VEHICLE_INSPECTION ? 'Custeed-' : ''
        }GarageScore`;
      contact.from = contactConfig.from || 'survey@mg.garagescore.com';
      contact.to = email;
      contact.recipient = data.get('customer.fullName');
    } else if (contactsConfigs.isSms(contactKey)) {
      if (
        data.get('customer.contact.mobilePhone.isEmpty') ||
        !data.get('customer.contact.mobilePhone.isSyntaxOK') ||
        !data.get('customer.contact.mobilePhone.value')
      ) {
        console.log(`No mobile phone number: Skipping contact "${contactKey}" for data :${data.getId()}`);
        callback();
        return;
      }
      const mobilePhone = data.get('customer.contact.mobilePhone.value');
      const isUnsubscribed = data.get('customer.contact.mobilePhone.isUnsubscribed');
      const isDropped = data.get('customer.contact.mobilePhone.isDropped');
      const isComplained = data.get('customer.contact.mobilePhone.isComplained');
      if (isUnsubscribed || isDropped || isComplained) {
        console.log(`Blocked mobile phone number: Skipping contact "${contactKey}" for data :${data.getId()}
        reason : "${JSON.stringify({ isUnsubscribed, isDropped, isComplained })}"`);
        callback();
        return;
      }
      contact.type = ContactType.CAMPAIGN_SMS;
      // SGS : replace "GarageScore" by "Custeed"
      contact.sender =
        contactConfig.sender || `${garage.type === GarageTypes.VEHICLE_INSPECTION ? 'Custeed' : 'GarageScore'}`;
      contact.to = mobilePhone;
      contact.recipient = data.get('customer.fullName');
    } else {
      console.error(`Unknown contact channel "${contactConfig.channel}": Skipping contact "${contactKey}"
      for campaignItem id:${data.getId()}`);
      callback();
      return;
    }
    contactsConfigs.initialize(contactKey, data, (errInitialize) => {
      if (errInitialize) {
        callback(errInitialize);
        return;
      }
      ContactService.prepareForSend(contact, async (errPrepare, createdContact) => {
        if (errPrepare) {
          console.error(errPrepare);
          contact.status = ContactStatus.FAILED;
          app.models.Contact.create(contact, (errFailed, contactFailed) => {
            debug(`Sending contact id:${contactFailed.getId()}! Failed : ${errPrepare.message}`);
            callback();
          });
          return;
        }
        debug('Queuing contact id:%s to be send!', createdContact.getId());
        if (contactConfig.followupType && !data.get(`${contactConfig.followupType}.sendAt`)) {
          data.set(`${contactConfig.followupType}.sendAt`, new Date());
          data.save(true, callback);
          return;
        }
        if (!contactConfig.followupType && !data.get('survey.sendAt')) {
          data.set('survey.sendAt', new Date());
          data.save(true, callback);
          return;
        }
        callback();
      });
    });
  });
};
