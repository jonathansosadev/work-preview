const app = require('../../../../../server/server');
const reasons = require('../../../../models/black-list-reason');

/*
Customers 'blacklisted', can be for many reasons
  USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL: 'USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL',
  USER_COMPLAINED_BY_EMAIL: 'USER_COMPLAINED_BY_EMAIL',
  USER_UNSUBSCRIBED_FROM_GARAGE_BY_PHONE: 'USER_UNSUBSCRIBED_FROM_GARAGE_BY_PHONE',
  USER_EMAIL_ON_DROPPED: 'USER_EMAIL_ON_DROPPED',
  USER_PHONE_ON_DROPPED: 'USER_PHONE_ON_DROPPED'

  Returns an object {
    isDropped(emailOrPhone),
    isComplained(email),
    isUnsubscribed(emailOrPhone),
  }

*/

module.exports = (callback) => {
  const stream = app.models.BlackListItem.findStream({});
  const unsubscribed = {};
  const dropped = {};
  const complainedEmails = {};
  stream
    .on('data', (record) => {
      const contact = record.to;
      const email = contact.indexOf('@') > 0 && contact;
      const mobilePhone = !email && contact;
      const garage = record.foreign.garageId;
      const reason = record.reason;
      switch (reason) {
        case reasons.USER_UNSUBSCRIBED_FROM_GARAGE_BY_EMAIL: {
          if (!email) {
            break;
          }
          if (!unsubscribed[garage]) {
            unsubscribed[garage] = {};
          }
          unsubscribed[garage][email] = true;
          break;
        }
        case reasons.USER_UNSUBSCRIBED_FROM_GARAGE_BY_PHONE: {
          if (!mobilePhone) {
            break;
          }
          if (!unsubscribed[garage]) {
            unsubscribed[garage] = {};
          }
          unsubscribed[garage][mobilePhone] = true;
          break;
        }
        case reasons.USER_EMAIL_ON_DROPPED: {
          if (!email) {
            break;
          }
          dropped[email] = true;
          break;
        }
        case reasons.USER_PHONE_ON_DROPPED: {
          if (!mobilePhone) {
            break;
          }
          dropped[mobilePhone] = true;
          break;
        }
        case reasons.USER_COMPLAINED_BY_EMAIL: {
          if (!email) {
            break;
          }
          complainedEmails[email] = true;
          break;
        }
        default:
          break;
      }
    })
    .on('finish', () => {
      callback(null, {
        isDropped: (emailOrPhone) => typeof dropped[emailOrPhone] !== 'undefined',
        isComplained: (emailOrPhone) => typeof complainedEmails[emailOrPhone] !== 'undefined',
        isUnsubscribed: (garageId, emailOrPhone) =>
          typeof unsubscribed[garageId] !== 'undefined' && typeof unsubscribed[garageId][emailOrPhone] !== 'undefined',
      });
    })
    .on('error', (err) => {
      callback(err);
    });
};
