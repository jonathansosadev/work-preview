const contactService = require('../../../../common/lib/garagescore/contact/service');
const ContactType = require('../../../../common/models/contact.type');
const configs = require('./configs');

function saveAndSend(app, req, res) {
  if (!req.body) {
    res.status(500).send({
      status: 'KO',
    });
    return;
  }
  const slug = req.params && req.params.slug;
  if (!configs[slug]) {
    res.send(404);
    return;
  }
  const data = {
    user: req.body.user.email,
    sponsor: req.body.user.sponsor,
    recontact: req.body.recontact || false,
    data: req.body,
  };
  let mails = [];
  const upsert = function upsert(cb) {
    if (req.body.id) {
      app.models.SubscriptionsQueue.findByIdAndUpdateAttributes(req.body.id, data, cb);
      return;
    }
    mails.push('commerce@custeed.com');
    if (req.body.user.sponsor) {
      mails.push(req.body.user.sponsor);
    }
    if (!req.body.recontact) {
      mails.push(req.body.user.email);
    }
    app.models.SubscriptionsQueue.create(data, cb);
  };
  upsert((errUpsert, upsertedSubsciptionRequest) => {
    if (errUpsert) {
      console.error(errUpsert);
      res.status(500).send({
        status: 'KO',
      });
    }
    mails = mails.map((mail) => ({
      to: mail,
      recipient: `${req.body.user.name} ${req.body.user.firstName}`,
      from: 'no-reply@custeed.com',
      sender: 'GarageScore',
      type: ContactType.SUBSCRIPTION_REQUEST_EMAIL,
      payload: req.body,
    }));
    contactService.prepareMultiSend(mails, (err) => {
      if (err) {
        console.error(err);
        res.status(400).json({ msg: 'error occured' });
        return;
      }
      res.status(200).send({
        status: 'OK',
        id: upsertedSubsciptionRequest.id,
      });
    });
  });
}
module.exports = {
  saveAndSend,
};
