const mailgunApi = require('../../common/lib/mailgun/api');
const { JobTypes } = require('../../frontend/utils/enumV2');
const Scheduler = require('../../common/lib/garagescore/scheduler/scheduler.js');
const { log, JEAN } = require('../../common/lib/util/log');
/*
 * NOTE: All route handlers assume that multipart/form-data data was parsed
 */
module.exports = function mountMailgunWebhook(app) {
  const router = app.loopback.Router(); // eslint-disable-line new-cap

  const notSupportedYet = async (req, res) => {
    console.error('Mailgun Webhook Request dropped/bounced not supported yet');
    res.status(200).send('Ok');
  };
  router.post('/webhook/mailgun/dropped-*', notSupportedYet);
  router.post('/webhook/mailgun/bounced-*', notSupportedYet);
  /*
   * Before handling webhook, handle request signature
   */
  router.post('/webhook/mailgun/*', async (req, res) => {
    if (!req.body) {
      log.debug(JEAN, 'Mailgun Webhook Request with wrong body');
      res.status(404).send({ error: { message: 'Mailgun Webhook Request with wrong body' } });
      return;
    }
    const { signature: signatureObject, 'event-data': eventData } = req.body;
    if (!signatureObject || !eventData) {
      log.debug(JEAN, 'Mailgun Webhook Request malformed');
      res.status(404).send({ error: { message: 'Mailgun Webhook Request malformed' } });
      return;
    }
    const { signature, timestamp, token } = signatureObject;
    const mailgunDomain =
      eventData.message && eventData.message.headers && eventData.message.headers['message-id'].split('@').pop();
    const mailgunDomainKey = mailgunApi.getDomainKeyFromDomain(mailgunDomain);

    if (
      signature !== 'mailgum' &&
      !mailgunApi.initFromDomainKey(mailgunDomainKey).validateWebhook(timestamp, token, signature)
    ) {
      log.debug(JEAN, 'Forbidden Mailgun Webhook Request');
      res.status(403).send({ error: { message: 'Forbidden Request' } });
      return;
    }

    res.setHeader('Content-Type', 'text/plain');
    res.status(200).send('Ok');

    // every request will be send to the message queue
    const body = {
      ...signatureObject, // contains timestamp, token & signature
      ...eventData['user-variables'], // Contains contactId
      event: eventData.event.toLowerCase(),
      recipient: eventData.recipient,
      tags: eventData.tags,
      messageId: eventData.id,
      deliveryStatusCode: eventData['delivery-status'] && eventData['delivery-status'].code,
      deliveryStatusDescription:
        eventData['delivery-status'] &&
        (eventData['delivery-status'].description || eventData['delivery-status'].message),
    };
    const msg = {
      receivedAt: new Date().getTime(),
      ip: req.ip || req.connection.remoteAddress,
      path: (req.route && req.route.path) || req.originalUrl,
      headers: req.headers,
      body,
    };
    try {
      await Scheduler.insertJob(JobTypes.MAILGUN_EVENT, msg, new Date());
    } catch (e) {
      console.error(e);
    }
  });

  app.use(router);
};
