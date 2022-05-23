const sinon = require('sinon');
const slack = require('../../slack/client');

let slackMessages;
const messages = [];

/** Mock api call to google reply method*/
module.exports = {
  // start mocking
  on: () => {
    if (slackMessages) {
      slackMessages.restore();
    }
    slackMessages = sinon.stub(slack, 'postMessage').callsFake(async function ({ username, channel, text }, cb) {
      if (username.includes('@') && channel && text) {
        messages.push({ username, channel, text });
        return cb(false);
      }

      return cb(true);
    });
  },
  // stop mocking
  off: () => {
    if (slackMessages) {
      slackMessages.restore();
    }
  },
  reset: () => {
    messages.length = 0;
  },
  // return all messages sent with the stub
  messages: () => messages,
  // return all messages sent with the stub and clear the list
  findByUsename: (username) => messages.find((message) => message[username]),
};
