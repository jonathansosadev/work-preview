const sinon = require('sinon');
const mailgunApi = require('../../mailgun/api');
const MailComposer = require('mailcomposer').MailComposer;

let _spyComposer;
let _StubMessages;
let _StubValidate;
const _emailSent = [];
const _blackList = [];
const _mimesParameters = [];
const app = require('../../../../server/server');
/** Mock api call to mailgun */
module.exports = {
  // start mocking
  on: () => {
    if (_StubMessages) {
      _StubMessages.restore();
    }
    if (_spyComposer) {
      _spyComposer.restore();
    }
    _spyComposer = sinon.spy(MailComposer.prototype, 'setMessageOption');
    _StubMessages = sinon.stub(mailgunApi.initFromDomainKey('default'), 'messages').callsFake(() => ({
      sendMime: (mimeParameters) => {
        _mimesParameters.push(mimeParameters);
        // eslint-disable-next-line
        // mimeParameters is encoded like  to: 'to@client.com', message: [ 'From: "sender" <from@gscore.com>\r\nTo: "recipient" <to@client.com>\r\nSubject: test\r\nContent-Type: mult....
        // instead of parsing it we just retrieve the last args when setMessageOption was called
        // this suppose that we ran buildMessage > setMessageOption > mailgunApi.messages().sendMime without anything in between
        // so it will probably not work if tests are executed in parallell
        const messageOptions = _spyComposer.lastCall.args[0];
        _emailSent.push(messageOptions);
        return new Promise((resolve) => {
          resolve(messageOptions.body);
        });
      },
      send: (data) => {
        _mimesParameters.push(data);
        _emailSent.push(data);
        return new Promise((resolve) => {
          resolve(data);
        });
      },
    }));
  },
  validate() {
    const commonReturnVal = mailgunApi.initFromDomainKey('default');
    _StubValidate = sinon.stub(mailgunApi, 'initFromDomainKey').returns({
      ...commonReturnVal,
      isLocalUse: false,
      validate(email, cb) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        const result = {
          is_valid: re.test(email),
          reason: !re.test(email) ? 'Email invalid' : '',
        };
        cb(null, result);
      },
    });
  },
  // stop mocking
  off: () => {
    if (_StubMessages) {
      _StubMessages.restore();
    }
    if (_spyComposer) {
      _spyComposer.restore();
    }
    if (_StubValidate) {
      _StubValidate.restore();
    }
  },
  reset: () => {
    _mimesParameters.splice(0, _mimesParameters.length);
    _emailSent.splice(0, _emailSent.length);
    _blackList.splice(0, _blackList.length);
  },
  // return all emails sent with the stub
  emailSent: () => _emailSent,
  // return all emails sent with the stub and clear the list
  emailSentPop: () => {
    _mimesParameters.splice(0, _mimesParameters.length);
    return _emailSent.splice(0, _emailSent.length);
  },
  // black list an email into array
  drop: (email) => {
    _blackList.push(email);
  },

  simulateResponse: async () => {
    for (let i = 0; i < _mimesParameters.length; i++) {
      const mimeParameters = _mimesParameters[i];
      const emailAddress = /<(.*)>/.exec(mimeParameters.to) ? /<(.*)>/.exec(mimeParameters.to)[1] : mimeParameters.to;
      const isBlackListed = _blackList.includes(emailAddress);
      const event = {
        recipient: mimeParameters.to,
        event: isBlackListed ? 'failed' : 'delivered',
        timestamp: new Date(), // seconds since POSIX epoch
        contactId: mimeParameters['v:contactId'], // custom variable identifying a Contact instance
        forceEvent: true, // we'll use that in the tests to force the drop_email event to be fired
      };
      await app.models.Contact.emitEventFromMailgunEvent(event);
    }
  },
};
