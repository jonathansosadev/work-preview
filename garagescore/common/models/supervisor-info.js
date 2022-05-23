const debug = require('debug')('garagescore:common:models:supervisorInfo'); // eslint-disable-line max-len,no-unused-vars

module.exports = function SupervisorInfoDefinition(SupervisorInfo) {
  // eslint-disable-line no-unused-vars
  SupervisorInfo.prototype.toString = function toString() {
    // eslint-disable-line no-param-reassign
    return JSON.stringify(this);
  };
};
