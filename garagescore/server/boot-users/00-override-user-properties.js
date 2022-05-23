const { INITIALIZED } = require('../../common/models/user-subscription-status.js');

module.exports = function (app) {
  const { User } = app.models;

  User.defineProperty('subscriptionStatus', {
    type: 'string',
    default: INITIALIZED,
  });
  User.defineProperty('email', {
    type: 'string',
    required: true,
    index: true,
  });
  User.defineProperty('fullName', {
    type: 'string',
    index: true,
  });
  User.defineProperty('civility', {
    type: 'string',
  });
  User.defineProperty('phone', {
    type: 'string',
  });
  User.defineProperty('mobilePhone', {
    type: 'string',
  });
  User.defineProperty('address', {
    type: 'string',
  });
  User.defineProperty('postCode', {
    type: 'string',
  });
  User.defineProperty('businessName', {
    type: 'string',
  });
  User.defineProperty('job', {
    type: 'string',
  });
  User.defineProperty('role', {
    type: 'string',
  });
  User.defineProperty('fax', {
    type: 'string',
  });
  User.defineProperty('city', {
    type: 'string',
  });
  User.defineProperty('lastName', {
    type: 'string',
    index: true,
  });
  User.defineProperty('firstName', {
    type: 'string',
    index: true,
  });
  User.defineProperty('frontDesk', {
    type: 'object',
  });
  User.defineProperty('postalAddress', {
    type: 'object',
  });
  User.defineProperty('authorization', {
    type: 'object',
    default: {
      WIDGET_MANAGEMENT: false,
    },
  });
  User.defineProperty('authRequest', {
    type: 'object',
    default: {
      ACCESS_TO_E_REPUTATION: false,
    },
  });
  User.defineProperty('firstVisit', {
    type: 'object',
    default: {
      EREPUTATION: true,
    },
  });
  User.defineProperty('allGaragesAlerts', {
    type: 'object',
  });
  User.defineProperty('lastCockpitOpenAt', {
    type: 'date',
  });
  User.defineProperty('lastCockpitOpenWithBackdoorAt', {
    type: 'date',
  });
  User.defineProperty('countActiveLeadTicket', {
    type: 'number',
  });
  User.defineProperty('countActiveUnsatisfiedTicket', {
    type: 'number',
  });
  User.defineProperty('remainingLoginAttemptBeforeCaptcha', {
    type: 'number',
    default: 3,
  });
  User.defineProperty('isBizDev', {
    type: 'boolean',
    default: false,
    index: true,
  });
  User.defineProperty('isPerfMan', {
    type: 'boolean',
    default: false,
    index: true,
  });
  User.defineProperty('alerts', {
    type: 'array',
  });
  User.defineProperty('trolled', {
    type: 'string',
    default: null,
  });
  User.defineProperty('garageIds', {
    type: 'array',
    default: [],
    index: true,
  });
  User.defineProperty('groupIds', {
    type: 'array',
    default: [],
    index: true,
  });
};
