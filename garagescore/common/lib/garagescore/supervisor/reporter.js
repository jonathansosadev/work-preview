const async = require('async');
const app = require('../../../../server/server');
const ContactService = require('../contact/service');
const ContactType = require('../../../models/contact.type');
const supervisorMessageType = require('../../../models/supervisor-message.type');
const { customerSuccessAliasEmail } = require('../../garagescore/custeed-users.js');

// send all messages saved with warn from yesterday
function sendReport(filter, reportName, callback) {
  app.models.SupervisorMessage.find(filter, (err, supervisorMessages) => {
    if (err || supervisorMessages.length === 0) {
      callback(err);
      return;
    }
    // split between messages for techies and not
    const tech = [];
    const customers = [];
    supervisorMessages.forEach((message) => {
      if (message.type === supervisorMessageType.DROPPED_ALERT_EMAIL) {
        customers.push(message);
      } else {
        tech.push(message);
      }
    });
    // send a list of message to a recipient
    const send = (msgs, to, cb) => {
      if (msgs.length === 0) {
        cb();
        return;
      }
      ContactService.prepareForSend(
        {
          to,
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: ContactType.SUPERVISOR_REPORT_EMAIL,
          payload: {
            supervisorMessageIds: msgs.map((m) => m.getId().toString()),
            reportName,
          },
        },
        cb
      );
    };
    send(tech, 'plateforme@custeed.com', () => {
      send(customers, customerSuccessAliasEmail, callback);
    });
  });
}

// compute and send a diff between data used in cockpit and bime
function _getSubscribedUsers(callback) {
  callback(null, ['bbodrefaux@garagescore.com', 'jscarinos@garagescore.com']);
}
function sendSynchronisationDiffReport(data, callback) {
  _getSubscribedUsers((err2, emails) => {
    if (err2) {
      callback(err2);
      return;
    }
    async.eachSeries(
      emails,
      (email, cb) => {
        ContactService.prepareForSend(
          {
            to: email,
            from: 'no-reply@custeed.com',
            sender: 'GarageScore',
            type: ContactType.SUPERVISOR_SYNCHRONISATION_REPORT,
            payload: { data },
          },
          cb
        );
      },
      callback
    );
  });
}

module.exports = {
  sendReport,
  sendSynchronisationDiffReport,
};
