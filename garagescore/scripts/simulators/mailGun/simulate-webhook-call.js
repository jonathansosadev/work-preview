var app = require('../../../server/server.js');
var SurveyGizmoTools = require('../../../common/lib/mailgun/tools.js');
var request = require('request');
var config = require('config');

var contactId;
var eventName;

process.argv.forEach(function (val, index) {
  if (val === '--help') {
    console.log('');
    console.log('* This command simulate sending request to surveygizmo for a revised data');
    console.log('* If no data are specified the script send the original data instead');
    console.log('');
    console.log('Usage node bin/survey-gizmo/simulate-revised-data.js [options]');
    console.log('options:');
    console.log('--survey-id \t the contactId');
    console.log('--title \t optionnel: customer new Title');
    process.exit(0);
  }
  if (val === '--contact-id') {
    contactId = process.argv[index + 1];
  }
  if (val === '--event') {
    eventName = process.argv[index + 1];
    if (!SurveyGizmoTools.supportedMailgunEventsByName[eventName]) {
      console.log('unsupported eventName ' + eventName);
      console.log('supported events :' + Object.keys(SurveyGizmoTools.supportedMailgunEventsByName).join(', '));
      process.exit(-1);
    }
  }
});
if (!contactId) {
  console.log('The contact id is mandatory');
  process.exit(-1);
}
if (!eventName) {
  console.log('The event name is mandatory');
  process.exit(-1);
}

app.on('booted', function () {
  var mailgunWebhookUrl = config.get('publicUrl.app_url') + '/webhook/mailgun/' + eventName;
  app.models.Contact.findById(contactId, function (err, contact) {
    if (err || !contact) {
      console.log(err || 'contact not found');
      process.exit(-1);
    }
    var options = {
      url: mailgunWebhookUrl,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        recipient: contact.overrideTo || contact.to,
        event: eventName,
        timestamp: Date.now() / 1000, // seconds since POSIX epoch
        contactId: contactId, // custom variable identifying a Contact instance
      }),
    };
    request.post(options, function (err3, res, body) {
      if (err3) {
        throw err3;
      }
      if (body !== 'Ok') {
        throw new Error(mailgunWebhookUrl + ' is not responding or another probleme occured');
      }
      console.log('Request send');
      process.exit(0);
    });
  });
});
