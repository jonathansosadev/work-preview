const Enum = require('../../../lib/util/enum.js');

module.exports = new Enum({
  NOT_CONFIGURED: 'NotConfigured',
  NEW_UNSATISFIED: 'NewUnsatisfied',
  FOLLOWUP_SENSIBLE: 'FollowupSensible',
  FOLLOWUP_MANUAL: 'FollowupManual',
  RESOLVED: 'Resolved',
  NOT_RESOLVED: 'NotResolved',
  IN_PROGRESS: 'InProgress',
  UNSATISFIED_WITHOUT_ANSWER: 'UnsatisfiedWithoutAnswer',
});
