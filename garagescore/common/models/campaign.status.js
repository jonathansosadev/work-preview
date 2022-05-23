const Enum = require('../lib/util/enum.js');

module.exports = new Enum({
  NEW: 'New',
  WAITING: 'Waiting',
  STARTING: 'Starting',
  RUNNING: 'Running',
  RETRY: 'Retry',
  COMPLETE: 'Complete',
  CANCELLED: 'Cancelled',
});
