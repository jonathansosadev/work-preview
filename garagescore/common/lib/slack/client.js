const config = require('config');
const debug = require('debug')('garagescore:common:lib:slack:client'); // eslint-disable-line max-len,no-unused-vars
const rest = require('restler');
const { promisify } = require('util');

const payloadDefaults = {
  channel: '#test',
  username: 'GarageScore',
  icon_url: 'https://avatars.slack-edge.com/2015-08-30/9891137014_113ccfb3f63e713cb909_72.jpg',
};

function postMessage(text, payloadParameter, callback) {
  if (typeof text === 'string') {
    payloadParameter.text = text; // eslint-disable-line
  } else {
    callback = payloadParameter; // eslint-disable-line
    payloadParameter = text; // eslint-disable-line
  }
  if (typeof process.env.LOADED_MOCHA_OPTS !== 'undefined') {
    console.warn('Test mode, not sending message to slack');
    callback();
    return;
  }
  if (!config.has('slack.incomingWebhookUrl')) {
    callback('Cannot post slack message without config');
    return;
  }
  const payload = { ...payloadDefaults, ...payloadParameter };
  const slackIncomingWebHookUrl = config.get('slack.incomingWebhookUrl'); // Default channel: #test
  if (!config.get('publicUrl.app_url') || !config.get('publicUrl.app_url').includes('app.custeed.com')) {
    payload.channel = '#test'; // do not pollute the real channel if you are in dev / review mode
  }
  rest.postJson(slackIncomingWebHookUrl, payload).on('complete', (data) => {
    if (data instanceof Error) {
      callback(data);
    } else {
      callback(null, data);
    }
  });
}
const postMessageAsync = promisify(postMessage);

module.exports = { postMessage, postMessageAsync };
