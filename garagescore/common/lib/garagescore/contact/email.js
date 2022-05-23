const debug = require('debug')('garagescore:common:lib:garagescore:contact:email');
const async = require('async');
const config = require('config');
const { MailComposer } = require('mailcomposer');
const app = require('../../../../server/server');
const ContactStatus = require('../../../models/contact.status');
const SupervisorMessageType = require('../../../models/supervisor-message.type');
const alertTypes = require('../../../models/alert.types.js');
const mailgunApi = require('../../mailgun/api');
const GsSupervisor = require('../supervisor/service');

const { ANASS, JS, ALEX, log } = require('../../util/log');

function _composeToWithCcAndBcc(contact) {
  const mailcomposer = new MailComposer();
  const override = !!contact.overrideTo;
  let to = `${mailcomposer.convertAddress({
    name: contact.recipient,
    address: override ? contact.overrideTo : contact.to,
  })}`;

  if (!override && contact.cc && contact.cc.length) {
    for (const cc of contact.cc) {
      to += `, ${mailcomposer.convertAddress({ name: cc.name, address: cc.address })}`;
    }
  }
  if (!override && contact.bcc && contact.bcc.length) {
    for (const bcc of contact.bcc) {
      to += `, ${mailcomposer.convertAddress({ name: bcc.name, address: bcc.address })}`;
    }
  }
  return to;
}

function _composeEmailMimeParameters(contact, messageSource, callback) {
  const sendMimeParameters = {
    to: _composeToWithCcAndBcc(contact), // e-mail address is mandatory for Mailgun
    message: messageSource,
    'v:contactId': contact.getId().toString(),
  };

  if (process.env.EMAILS_DISABLE_SEND === 'true') {
    sendMimeParameters['o:testmode'] = true;
  }

  if (process.env.EMAILS_ADDRESS_FILTER && !sendMimeParameters.to.match(process.env.EMAILS_ADDRESS_FILTER)) {
    sendMimeParameters['o:testmode'] = true;
  }

  if (contact.payload && contact.payload.tags) {
    sendMimeParameters['o:tag'] = contact.payload.tags;
  }
  if (contact.payload && contact.payload.disableMailgunClickTracking) {
    sendMimeParameters['o:tracking-clicks'] = 'no';
  }

  callback(null, sendMimeParameters);
}

function _composeEmailMessageSource(contact, content, callback) {
  const mailcomposer = new MailComposer();

  const fromString = mailcomposer.convertAddress({
    name: contact.sender,
    address: contact.from,
  });

  if (!content) {
    log.error(JS, `_composeEmailMessageSource Error - empty content ${contact.type} ${contact.id}`);
    callback(new Error(`Empty content ${contact.type} ${contact.id}`));
    GsSupervisor.warn({
      type: SupervisorMessageType.EMPTY_CONTACT,
      payload: {
        error: 'Empty content',
        context: `${contact.type} ${contact.id}`,
      },
    });
    return;
  }
  mailcomposer.setMessageOption({
    to: _composeToWithCcAndBcc(contact),
    from: fromString,
    subject: content.subject,
    body: content.textBody,
    html: content.htmlBody,
  });

  mailcomposer.buildMessage(callback);
}

function _renderContentAndSendEmail(contact, renderer, callback) {
  async.auto(
    {
      content: (cb) => {
        if (typeof renderer !== 'function') {
          cb('_renderContentAndSendEmail: Expecting renderer to be a function');
          return;
        }
        renderer(contact, cb);
      },
      messageSource: [
        'content',
        (cb, res) => {
          _composeEmailMessageSource(contact, res.content, cb);
        },
      ],
      mimeParameters: [
        'messageSource',
        (cb, res) => {
          _composeEmailMimeParameters(contact, res.messageSource, cb);
        },
      ],
      sendToMailgun: [
        'mimeParameters',
        (cb, res) => {
          if (mailgunApi.smellsLikeProdSpirit()) {
            mailgunApi
              .initFromContactType(contact.type)
              .messages()
              .sendMime(res.mimeParameters)
              .then((r) => cb(null, r))
              .catch((e) => {
                cb(e);
              });
          } else {
            const fromString = new MailComposer().convertAddress({
              name: contact.sender,
              address: contact.from,
            });
            mailgunApi
              .initFromContactType(contact.type)
              .messages()
              .send({
                from: fromString,
                to: contact.overrideTo || contact.to,
                subject: res.content.subject,
                html: res.content.htmlBody,
                body: res.content.textBody,
                'v:contactId': contact.getId().toString(),
              })
              .then((r) => cb(null, r))
              .catch((e) => {
                cb(e);
              });
          }
        },
      ],
      updateContact: [
        'sendToMailgun',
        (cb, res) => {
          contact.status = ContactStatus.SEND; // eslint-disable-line no-param-reassign
          contact.sendDate = new Date(); // eslint-disable-line no-param-reassign
          if (!contact.payload) {
            contact.payload = {}; // eslint-disable-line no-param-reassign
          }
          contact.payload.mailgun = res.sendToMailgun; // eslint-disable-line no-param-reassign
          contact.save(cb);
        },
      ],
      emitEvent: [
        'updateContact',
        function emitEvent(cb) {
          if (!require('./service').isEventEmittingTracked({ recipient: contact.overrideTo || contact.to })) {
            log.error(ANASS, `Mailgun EventListener is not tracked`);
            cb();
            return;
          }
          const eventName = 'email.send';
          const eventRes = {
            foreign: { mailgun: contact.payload.mailgun },
            contactType: contact.type,
          };
          app.models.Contact.emitEvent(contact, eventName, eventRes, (err7, inst) => {
            if (err7) {
              log.error(ANASS, `EventEmitter Error : ${err7}`);
            }
            cb(err7, inst);
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

/**
 * send email using mailgun
 * @param contact a Contact Model instance
 * @param renderer a callable that return an object that contain the 3 part of email "text", "html and "subject
 * @param callback
 */
function sendEmail(contact, renderer, callback) {
  if (config.has('contact.skip.channel.email') && config.get('contact.skip.channel.email')) {
    debug('Skipping contact "%s" for contactId: %s per Environment Configuration', contact.type, contact.getId());

    contact.status = ContactStatus.SKIPPED; // eslint-disable-line no-param-reassign
    contact.save(callback);
    return;
  }

  if (contact.overrideTo) {
    debug(
      'Overriding e-mail address of contact "%s" for contactId:%s per Environment Configuration: "%s"→"%s"',
      contact.type,
      contact.getId(),
      contact.to,
      contact.overrideTo
    );
  }

  const { alertType, dataId, garageId } = contact.payload;
  if (alertType && dataId && garageId) {
    app.models.Data.findById(dataId, (errData, data) => {
      app.models.Garage.findById(garageId, (errGarage, garage) => {
        if (!errData && !errGarage) {
          const alertTypeUpdate = app.models.Alert.getAlertType(data, garage);

          // In the case where the contact is already created but not sent yet and the note has been modified as a promoter
          if ((alertTypes.isUnsatisfied(alertType) || alertTypes.isSensitive(alertType)) && (alertTypes.isSatisfied(alertTypeUpdate))) {
            log.debug(ALEX, `Skipping contact ${contact.type} for contactId: ${contact.getId()} : the note has been modified`);
          } else {
            _renderContentAndSendEmail(contact, renderer, callback);
            return;
          }
        }
        contact.status = ContactStatus.SKIPPED; // eslint-disable-line no-param-reassign
        contact.save(callback);
      });
    });
  } else {
    _renderContentAndSendEmail(contact, renderer, callback);
  }
}

module.exports = {
  sendEmail,
};
