const dogapi = require('dogapi');
const util = require('util');

const options = {
  api_key: process.env.DD_API_KEY,
  app_key: process.env.DD_APP_KEY,
};
dogapi.initialize(options);

const async = {
  // https://brettlangdon.github.io/node-dogapi/#metric
  send: dogapi.metric.send,
  // https://brettlangdon.github.io/node-dogapi/#event
  create: dogapi.event.create,
};
const sync = {
  // https://brettlangdon.github.io/node-dogapi/#metric
  send: util.promisify(dogapi.metric.send),
  // https://brettlangdon.github.io/node-dogapi/#event
  create: util.promisify(dogapi.event.create),
};
module.exports = { sync, async };
