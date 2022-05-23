/** Resend welcome email (and reset password) for a list of users emails given in parameters */
var async = require('async');
var app = require('../../../server/server.js');
async.forEachOfSeries(
  process.argv,
  function (email, i, next) {
    if (i < 2) {
      next();
      return;
    }
    app.models.User.findOne({ where: { email: email } }, function (err, user) {
      if (err || !user) {
        next();
        return;
      }
      console.log('Send to ' + email + ' ' + user.getId());
      user.resetPasswordAndSendWelcomeEmail(next);
    });
  },
  function () {
    console.log('bye');
    process.exit();
  }
);
