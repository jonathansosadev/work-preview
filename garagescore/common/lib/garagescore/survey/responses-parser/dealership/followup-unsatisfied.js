const _common = require('../_common');

/**
 * Update function list for the followupUnsatisfied
 */
module.exports = [
  _common.updateSurveyProgressIntern,
  function (foreignResponses, updates) {
    const followupStatus = _common.getValueFromForeignResponses('followupStatus', foreignResponses);
    if (followupStatus) {
      const isRecontacted = _common.getValueFromForeignResponses('follwupRecontact', foreignResponses) === 'Yes';
      const unsatisfactionComment = _common.getValueFromForeignResponses('unsatisfiedComment', foreignResponses);
      updates.updateFollowupUnsatisfied(followupStatus, isRecontacted, unsatisfactionComment);
      updates.rating = _common.getValueFromForeignResponses('followupUnsatisfiedRating', foreignResponses); // eslint-disable-line
      updates.comment = _common.getValueFromForeignResponses('followupUnsatisfiedComment', foreignResponses); // eslint-disable-line
    }
  },
];
