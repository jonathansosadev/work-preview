const _ = require('underscore');
const debug = require('debug')('garagescore:server:boot:contact-me'); // eslint-disable-line max-len,no-unused-vars
const validator = require('validator');
const debugPerfs = require('debug')('perfs:server:boot:contact-me');
const ContactService = require('../../common/lib/garagescore/contact/service');
const ContactType = require('../../common/models/contact.type');
const captchaHandler = require('../captcha-handler.js');

debugPerfs('Starting boot contact-me');

function getDestinationEmail(req, callback) {
  const gsEmail = req.user ? 'customer_success@custeed.com' : 'contact@custeed.com';
  callback(null, gsEmail, 'GarageScore');
}

module.exports = function mountWwwContactMe(app) {
  app.post('/contact-me', async (req, res) => {
    if (typeof req.body === 'undefined') {
      res.sendStatus(500);
      return;
    }

    debug(req.body);
    if (_.isEmpty(req.body.name) || _.isEmpty(req.body.email) || _.isEmpty(req.body.message)) {
      res.sendStatus(500);
      return;
    }

    if (
      _.isEmpty(req.body['g-recaptcha-response']) ||
      (await captchaHandler.captchaValidator(req.body['g-recaptcha-response']))
    ) {
      res.sendStatus(500);
      return;
    }

    if (!validator.isEmail(req.body.email)) {
      res.sendStatus(500);
      return;
    }

    getDestinationEmail(req, (err, recipientEmail, recipientName) => {
      if (err) {
        console.error(`Error: ${err}`);
        res.sendStatus(500);
        return;
      }
      ContactService.prepareForSend(
        {
          to: recipientEmail,
          recipient: recipientName,
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: ContactType.USER_MESSAGE_EMAIL,
          payload: {
            name: req.body.name,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            raisonsociale: req.body.raisonsociale,
            context: req.body.context || 'contact-me',
            message: req.body.message,
            emailConnectedUser: req.user ? req.user.email : null,
          },
        },
        (sendErr) => {
          if (sendErr) {
            console.error(`Error: ${sendErr}`);
            res.sendStatus(500);
            return;
          }
          res.sendStatus(200);
        }
      );
    });
  });
  app.post('/help-me', (req, res) => {
    if (typeof req.body === 'undefined') {
      res.sendStatus(500);
      return;
    }

    debug(req.body);
    if (_.isEmpty(req.body)) {
      res.sendStatus(500);
      return;
    }
    getDestinationEmail(req, (err, recipientEmail, recipientName) => {
      if (err) {
        console.error(`Error: help-me: ${err}`);
        res.sendStatus(500);
        return;
      }
      ContactService.prepareForSend(
        {
          to: recipientEmail,
          recipient: recipientName,
          from: 'no-reply@custeed.com',
          sender: 'GarageScore',
          type: ContactType.USER_MESSAGE_EMAIL,
          payload: {
            name: req.body.name,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone,
            raisonsociale: req.body.raisonsociale,
            context: req.body.context || 'contact-me',
            message: req.body.message,
            emailConnectedUser: req.user ? req.user.email : null,
          },
        },
        (sendErr) => {
          if (sendErr) {
            console.error(`Error: help-me: ${sendErr}`);
            res.sendStatus(500);
            return;
          }
          res.sendStatus(200);
        }
      );
    });
  });
};
