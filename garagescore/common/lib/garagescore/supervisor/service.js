/**
 * It send SupervisorMessages (emails and sms)
 * To send a SupervisorMessage instance use prepareForSend
 */
const app = require('../../../../server/server');

// save a message to be sent in the morning with the other warnings
function warn(supervisorMessage, callback) {
  app.models.SupervisorMessage.create(supervisorMessage, callback);
}

// not used
function track(supervisorInfo, callback) {
  app.models.SupervisorInfo.create(supervisorInfo, callback);
}

module.exports = {
  warn,
  track,
};
