const app = require('../../../server/server.js');
const async = require('async');
const moment = require('moment');

//
// If an User was created more than 30 days ago
// And If an User has no trace of connexion (lastCockpitOpenAt, accessHistory)
// Then we start the password reset process and we send him an email
//

app.on('booted', () => {
  app.models.User.find({}, (errFind, users) => {
    if (errFind) {
      console.error(errFind);
    } else {
      async.eachSeries(
        users,
        (user, next) => {
          if (needToReset(user)) {
            user.resetPasswordAndSendEmail(next);
          } else {
            next();
          }
        },
        (err) => {
          if (err) {
            console.error(err);
          }
          process.exit(err || 0);
        }
      );
    }
  });
});

function needToReset(user) {
  return moment(user.createdAt).isBefore(moment().subtract(30, 'day')) && noAccessHistory(user);
}

function noAccessHistory(user) {
  if (user.lastCockpitOpenAt) return false;
  // if (!user.accessHistory || user.accessHistory.length <= 0) {
  //   return true;
  // }
  // for (const access of user.accessHistory) {
  //   if (access.date) {
  //     return false;
  //   }
  // }
  return true;
}
