/* Send a test email with the api */
var MailComposer = require('mailcomposer').MailComposer;
var mailgun = require('./api');
/* SIMPLE MAIL
var data = {
  from: 'Test mailgun <tests@aragescore.com>',
  to: 'hackers@custeed.com',
  subject: 'Hello',
  text: 'Testing some Mailgun awesomness!'
};
mailgun.messages().send(data, function (error, body) {
  console.log(body);
});
*/
function _composeEmailMessageSource(to, callback) {
  var mailcomposer = new MailComposer();

  var fromString = mailcomposer.convertAddress({
    name: 'Test sender',
    address: 'plop@am.custeed.com',
  });

  var toString = mailcomposer.convertAddress({
    name: 'Test recipient',
    address: to,
  });

  mailcomposer.setMessageOption({
    to: toString,
    from: fromString,
    subject: 'Test subject',
    body: 'Enquête de satisfaction http://www.toto.com/page?x=1&y=2',
    html: '<p>Enquête de satisfaction</p><a href="http://www.toto.com/page?x=1&y=2">ici</a>',
  });

  mailcomposer.buildMessage(callback);
}
function test(to = 'to@recipient.com') {
  _composeEmailMessageSource(to, function (e1, messageSource) {
    if (e1) {
      console.e1(e1);
    }
    var mimeParameters = {
      to: to, // e-mail address is mandatory for Mailgun
      message: messageSource,
      'v:contactId': 'contactId',
    };
    // mimeParameters['o:tag'] = contact.payload.tags;
    mailgun
      .initFromDomainKey('default')
      .messages()
      .sendMime(mimeParameters, function (error, body) {
        if (error) {
          console.error(error);
        }
        console.log(body);
        process.exit();
      });
  });
}

test(process.argv[2]);
