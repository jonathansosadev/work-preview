/** Send a test email */

const to = process.argv[2];
if (!to) {
  console.log('`to` email adress missing');
  process.exit();
}

const ContactType = require('../../../common/models/contact.type');
const ContactService = require('../../../common/lib/garagescore/contact/service');

ContactService.prepareForSend(
  {
    to,
    from: 'no-reply@custeed.com',
    sender: 'GarageScore',
    type: ContactType.TEST,
    payload: {},
  },
  (err) => {
    console.log('DONE');
    if (err) {
      console.error(err);
    }
    // wait to be sure, we had time to publish
    setTimeout(() => {
      console.log('Message Waiting/in queue');
      process.exit();
    }, 3000);
  }
);
