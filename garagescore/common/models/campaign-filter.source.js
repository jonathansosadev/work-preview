const Enum = require('../lib/util/enum.js');

module.exports = new Enum({
  MAILGUN_BOUNCES: 'Mailgun Bounces',
  MAILGUN_COMPLAINTS: 'Mailgun Complaints',
  MAILGUN_UNSUBSCRIBES: 'Mailgun Unsubscribes',
});
