var ContactStatus = require('../../../common/models/contact.status');
var ContactEvent = require('../../../common/models/contact.event');
var s = require('underscore.string');
var supportedMailgunEventsByName = {
  bounced: {
    eventName: ContactEvent.EMAIL_BOUNCE,
    contactStatus: ContactStatus.BOUNCED,
  },
  clicked: {
    eventName: ContactEvent.EMAIL_CLICK,
    contactStatus: ContactStatus.CLICKED,
  },
  complained: {
    eventName: ContactEvent.EMAIL_COMPLAINT,
    contactStatus: ContactStatus.COMPLAINED,
  },
  delivered: {
    eventName: ContactEvent.EMAIL_DELIVERY,
    contactStatus: ContactStatus.DELIVERED,
  },
  dropped: {
    eventName: ContactEvent.EMAIL_DROP,
    contactStatus: ContactStatus.DROPPED,
  },
  opened: {
    eventName: ContactEvent.EMAIL_OPEN,
    contactStatus: ContactStatus.OPENED,
  },
  unsubscribed: {
    eventName: ContactEvent.EMAIL_UNSUBSCRIBE,
    contactStatus: ContactStatus.UNSUBSCRIBED,
  },
  // we doesn't need an eventName for failed because it will be changed by dropped or bounced
  failed: {
    contactStatus: ContactStatus.FAILED,
  }
};

module.exports = {
  /**
    * @description This function check if contactId has a correct form
    * @throw {Error} if the result of the unquote is not a string
  */
  validateMailgunContactId: function (id) {
    /*
     * HACK: Workaround a non-understood bug where *SOMETIMES* the value of contactId
     * is made available in the form of an array ("object" type) of two identical strings:
     * ['5633584351c9f11900639f0b','5633584351c9f11900639f0b']
     * This happens even though the variable is properly set at sendMime,
     * and is apparently properly set in the Mailgun Query, too.
     * Hypothesis: one of the middlewares might acts zealous, in a non-understood way.
     * UPDATE 04/2021: I don't think this bug still exist but just to be sure I let the code like that
     */
    let result = id;
    if (
      typeof result !== 'string' &&
      typeof result[0] !== 'undefined' &&
      typeof result[1] !== 'undefined' &&
      result[0] === result[1]
    ) {
      result = result[0];
    }

    /*
     * LEGACY: Workaround a bug fixed by commit 0d099ca43839d4c6521b743d9da009a101e844da by removing surrounding quotes, if found.
     */
    result = s.unquote(result);
    if (typeof result !== 'string') {
      throw Error('Malformed `contactId` in Mailgun Event.');
    }
    return result;
  },
  supportedMailgunEventsByName,
  /**
    * @description This function check if the mailgunEvent object is correctly formed
    * @throw {Error} if the mailgunEvent is not correctly formed
  */
  validateMailgunEvent: function (mailgunEvent) {
    if (!mailgunEvent) throw Error('UNDEFINED_MAILGUN_EVENT');
    if (!mailgunEvent.contactId) throw Error('UNDEFINED_MAILGUN_EVENT_CONTACT_ID');
    if (!mailgunEvent.recipient) throw Error('UNDEFINED_MAILGUN_EVENT_RECIPIENT');

    const mailgunEventName = mailgunEvent.event;

    if (!mailgunEventName) throw Error('UNDEFINED_MAILGUN_EVENT_NAME');
    if (!supportedMailgunEventsByName[mailgunEventName]) throw Error('UNSUPPORTED_MAILGUN_EVENT_NAME');
    if (!mailgunEvent.timestamp) throw Error('UNDEFINED_MAILGUN_EVENT_TIMESTAMP');
  },
  convertMailgunEvent: (mailgunEventName, deliveryStatusCode) => {
    if (mailgunEventName !== ContactStatus.FAILED.toLowerCase()) return mailgunEventName;

    // 605 means it failed because the email is already on the bounce list
    if (deliveryStatusCode === 605) return ContactStatus.BOUNCED.toLowerCase();
    // 606 means it failed because the email is already on the unsubscribe list
    if (deliveryStatusCode === 606) return ContactStatus.UNSUBSCRIBED.toLowerCase();
    // others are just drop
    return ContactStatus.DROPPED.toLowerCase();
  },
  needFailureDescription: (failureDescription, mailgunEventName) => {
    if (!failureDescription) return false;
    return mailgunEventName === ContactStatus.DROPPED.toLowerCase();
  }
};
