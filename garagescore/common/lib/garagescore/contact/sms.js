const ContactStatus = require('../../../../common/models/contact.status');
const ContactType = require('../../../../common/models/contact.type');
const debug = require('debug')('garagescore:common:lib:garagescore:contact:sms');
const app = require('../../../../server/server');
const async = require('async');
const config = require('config');
const SmsFactorRequest = require('../../../lib/smsfactor/request');
const ContactEvent = require('../../../models/contact.event.js');
const { ANASS, log } = require('../../util/log');

function sendSms(contact, renderer, credentials, callback) {
  if (config.has('contact.skip.channel.sms') && config.get('contact.skip.channel.sms')) {
    debug('Skipping contact "%s" for contactId: %s per Environment Configuration', contact.type, contact.getId());

    contact.status = ContactStatus.SKIPPED; // eslint-disable-line no-param-reassign
    contact.save(callback);
    return;
  }
  if (contact.overrideTo) {
    debug(
      'Overriding mobile phone of contact "%s"' + ' for contactId:%s per Environment Configuration: "%s"→"%s"',
      contact.type,
      contact.getId(),
      contact.to,
      contact.overrideTo
    );
  }
  const smsFactorRequest = new SmsFactorRequest(credentials);

  async.auto(
    {
      content: (cb) => {
        if (typeof renderer !== 'function') {
          cb('SmsSend: Expecting renderer to be a function');
          return;
        }
        renderer(contact, cb);
      },
      sendThrowSmsFactor: [
        'content',
        (cb, res) => {
          let pushType = 'alert';
          if (
            contact.type === ContactType.AUTOMATION_CAMPAIGN_SMS ||
            contact.type === ContactType.AUTOMATION_GDPR_SMS
          ) {
            pushType = 'advertising';
          }
          smsFactorRequest
            .sendSms(contact.overrideTo ? contact.overrideTo : contact.to, res.content.body, contact.sender, pushType)
            .then((sendSmsResponse) => {
              // The following white-list of conditions must be met to consider the SMS sent.
              // In any other case, it is considered a failure.
              if (
                typeof sendSmsResponse !== 'undefined' &&
                typeof sendSmsResponse.status !== 'undefined' &&
                sendSmsResponse.status.toString() === '200' &&
                typeof sendSmsResponse.body !== 'undefined' &&
                typeof sendSmsResponse.body.message !== 'undefined' &&
                sendSmsResponse.body.message === 'OK'
              ) {
                cb(null, sendSmsResponse);
              } else {
                cb(JSON.stringify(sendSmsResponse));
              }
            })
            .catch((errsend) => {
              cb(errsend);
            });
        },
      ],
      updateContact: [
        'sendThrowSmsFactor',
        (cb, res) => {
          if (res.sendThrowSmsFactor.body.sent === 1) {
            contact.status = ContactStatus.OPENED; // eslint-disable-line no-param-reassign
          } else if (res.sendThrowSmsFactor.body.blacklisted === 1) {
            contact.status = ContactStatus.UNSUBSCRIBED; // eslint-disable-line no-param-reassign
          } else if (res.sendThrowSmsFactor.body.npai === 1) {
            contact.status = ContactStatus.DROPPED; // eslint-disable-line no-param-reassign
          } else if (res.sendThrowSmsFactor.body.invalid === 1) {
            contact.status = ContactStatus.FAILED; // eslint-disable-line no-param-reassign
            contact.failureDescription = 'Invalid contact in SMS factor'; // eslint-disable-line no-param-reassign
          } else {
            contact.status = ContactStatus.FAILED; // eslint-disable-line no-param-reassign
            contact.failureDescription = 'Unsupported SMS factor response'; // eslint-disable-line no-param-reassign
          }
          contact.sendDate = new Date(); // eslint-disable-line no-param-reassign
          if (!contact.payload) {
            contact.payload = {}; // eslint-disable-line no-param-reassign
          }
          contact.payload.smsfactor = res.sendThrowSmsFactor; // eslint-disable-line no-param-reassign
          contact.save(cb);
        },
      ],
      emitEvent: [
        'updateContact',
        (cb, res) => {
          let eventName;
          if (res.sendThrowSmsFactor.body.sent === 1) {
            eventName = ContactEvent.SMS_SEND;
          } else if (res.sendThrowSmsFactor.body.blacklisted === 1) {
            eventName = ContactEvent.SMS_UNSUBSCRIBE;
          } else if (res.sendThrowSmsFactor.body.npai === 1) {
            eventName = ContactEvent.SMS_DROP;
          } else if (res.sendThrowSmsFactor.body.invalid === 1) {
            cb();
            return;
          }
          app.models.Contact.emitEventFromSmsFactorEvent(contact, eventName)
            .then((inst) => cb(null, inst))
            .catch((err7) => {
              log.error(ANASS, `EventEmitter Error : ${err7}`);
              cb(err7);
            });
        },
      ],
    },
    (err, res) => {
      if (err) {
        contact.status = ContactStatus.FAILED; // eslint-disable-line no-param-reassign
        contact.failureDescription = err.toString(); // eslint-disable-line no-param-reassign
        contact.save(() => callback(err));
        return;
      }
      callback(null, res.updateContact);
    }
  );
}

module.exports = {
  sendSms,
};
