const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum({
  WITHOUTCAMPAIGN: 'WithoutCampaign',
  NEW: 'New',
  WAITING: 'Waiting',
  STARTING: 'Starting',
  RUNNING: 'Running',
  RETRY: 'Retry',
  COMPLETE: 'Complete',
  CANCELLED: 'Cancelled',
  BLOCKED: 'Blocked',
  UNKNOWN_TYPE: 'UnknownType',
});
