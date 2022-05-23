const Enum = require('../lib/util/enum.js');

module.exports = new Enum({
  NEW: 'New',
  RUNNING: 'Running',
  COMPLETE: 'Complete',
  RETRY: 'Retry',
  ERROR: 'Error',
});
