const _common = require('../_common');

/**
 * Update function list for the followupLead
 */

function _getRealValue(val) {
  if (val === null) return null;
  return val === 'Yes';
}

module.exports = [
  _common.updateSurveyProgressIntern,
  function (foreignResponses, updates) {
    const updatesValues = {
      recontacted: _getRealValue(_common.getValueFromForeignResponses('recontacted', foreignResponses)),
      satisfied: _getRealValue(_common.getValueFromForeignResponses('satisfied', foreignResponses)),
      satisfiedReasons: _common.getValueFromForeignResponses('satisfiedReasons', foreignResponses),
      notSatisfiedReasons: _common.getValueFromForeignResponses('notSatisfiedReasons', foreignResponses),
      appointment: _common.getValueFromForeignResponses('appointment', foreignResponses),
    };
    updates.updateFollowupLead(updatesValues);
  },
];
