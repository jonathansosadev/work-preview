const Enum = require('../lib/util/enum.js');

module.exports = new Enum({
  NEW: 'New',
  RUNNING: 'Running',
  FAILED: 'Failed',
  SEND: 'send',
  CANCELED: 'canceled',
});
