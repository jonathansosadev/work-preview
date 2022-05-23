'use strict';

const _ = require('underscore');
const config = require('config');
const Q = require('q');
const qBufferStream = require('q-io/buffer-stream');
const qHTTP = require('q-io/http');
const s = require('underscore.string');

const SmsFactorRequest = function SmsFactorRequest({ sfusername, sfpassword, sfhost } = {}) {
  this.smsfactorApiCredentials = {
    sfusername: sfusername || config.get('smsfactor.sfusername'),
    sfpassword: sfpassword || config.get('smsfactor.sfpassword'),
    sfhost: sfhost || config.get('smsfactor.sfhost'),
  };
};
SmsFactorRequest.prototype.sendSms = function (phoneNumber, messageText, sender, pushType) {
  // HACK: '+33 6 80 55 75 81' -> '33680557581'
  const formattedPhoneNumber = s.replaceAll(phoneNumber, ' ', '').substring(1);

  const body = qBufferStream(
    new Buffer(
      JSON.stringify({
        sms: {
          message: {
            text: messageText,
            pushtype: pushType || 'alert', // allow sms send on sundays
            sender: sender || 'GarageScore',
          },
          recipients: {
            gsm: [
              {
                gsmsmsid: '1',
                value: formattedPhoneNumber,
              },
            ],
          },
        },
      })
    )
  );

  return qHTTP
    .request({
      method: 'POST',
      url: this.smsfactorApiCredentials.sfhost,
      headers: _.extend(
        {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          encoding: 'utf-8',
        },
        {
          sfusername: this.smsfactorApiCredentials.sfusername,
          sfpassword: this.smsfactorApiCredentials.sfpassword,
        }
      ),
      body: body,
    })
    .then(function (response) {
      return response.body.read().then(function (buffer) {
        return Q({
          status: response.status,
          body: JSON.parse(buffer.toString()),
        });
      });
    });
};

module.exports = SmsFactorRequest;
