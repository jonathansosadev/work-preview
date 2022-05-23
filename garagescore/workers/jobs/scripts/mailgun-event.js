/* Process mailgun events */
const app = require('../../../server/server');

const { JS, log } = require('../../../common/lib/util/log');

module.exports = async (job) => {
  const mailgunEvent = (job.payload && job.payload.body) || {};
  // Emit CampaignContact event reflecting Mailgun Event
  if (mailgunEvent.alertMailId || mailgunEvent.contactId || mailgunEvent.campaignContactId) {
    try {
      await app.models.Contact.emitEventFromMailgunEvent(mailgunEvent);
    } catch (err) {
      log.error(JS, err);
    }
  } else {
    log.error(
      JS,
      `Warning: Mailgun - Neither \`contactId\`, \`campaignContactId\` or \`alertMailId\` has been send in Mailgun Event : ${JSON.stringify(
        job.payload
      )}`
    );
  }
};
