const sinon = require('sinon');
const SmsFactorRequest = require('../../smsfactor/request');

let _stubSendSms;
const _smsSent = [];

/** Mock api call to smsfactor */
module.exports = {
  // start mocking
  on: () => {
    if (_stubSendSms) {
      _stubSendSms.restore();
    }
    _stubSendSms = sinon
      .stub(SmsFactorRequest.prototype, 'sendSms')
      .callsFake(async (phoneNumber, messageText, sender) => {
        _smsSent.push({ phoneNumber, messageText, sender });
        if (phoneNumber.replace(/\s+/g, '') === '+33600000000') {
          // Drop it ! Special phone number meant to be dropped in tests
          return {
            status: 200,
            body: { message: 'OK', npai: 1 },
          };
        }
        return {
          status: 200,
          body: { message: 'OK', sent: 1 },
        };
      });
  },
  // stop mocking
  off: () => {
    if (_stubSendSms) {
      _stubSendSms.restore();
    }
  },
  reset: () => {
    _smsSent.splice(0, _smsSent.length);
  },
  // return all sms sent with the stub
  smsSent: () => _smsSent,
  // return all sms sent with the stub and clear the list
  smsSentPop: () => _smsSent.splice(0, _smsSent.length),
};
