const moment = require('moment');
const app = require('../../../../../server/server');

/*
List of emails and mobilePhone already sent the last x days for a garage
Returns 2 functions :
- emailContacted(email) = true | false
- mobilePhoneContacted(mobilePhone) = true | false
*/
module.exports = (garageId, xdays, callback) => {
  const date = moment()
    .subtract(xdays || 30, 'd')
    .toDate();
  const stream = app.models.Data.findStream({
    where: { garageId, 'campaign.contactScenario.firstContactedAt': { gt: date } },
    order: 'campaign.contactScenario.firstContactedAt ASC',
  });
  const emails = {};
  const mobilePhones = {};
  stream
    .on('data', (data) => {
      const email = data.get('customer.contact.email');
      const mobilePhone = data.get('customer.contact.mobilePhone');
      const oldEmail = data.get('customer.contact.email.original');
      const oldPhone = data.get('customer.contact.mobilePhone.original');
      const t = data.get('type');
      if (
        email &&
        (data.get('campaign.contactStatus.hasBeenContactedByEmail') ||
          data.get('campaign.contactStatus.hasOriginalBeenContactedByEmail'))
      ) {
        emails[email + t] = true;
      } // eslint-disable-line
      if (oldEmail && email !== oldEmail && data.get('campaign.contactStatus.hasOriginalBeenContactedByEmail')) {
        emails[oldEmail + t] = true;
      } // eslint-disable-line
      if (
        mobilePhone &&
        (data.get('campaign.contactStatus.hasBeenContactedByPhone') ||
          data.get('campaign.contactStatus.hasOriginalBeenContactedByEmail'))
      ) {
        mobilePhones[mobilePhone + t] = true;
      } // eslint-disable-line
      if (oldPhone && oldPhone !== mobilePhone && data.get('campaign.contactStatus.hasOriginalBeenContactedByEmail')) {
        mobilePhones[oldPhone + t] = true;
      } // eslint-disable-line
    })
    .on('finish', () => {
      callback(null, {
        emailContacted: (e, t) => typeof emails[e + t] !== 'undefined',
        mobilePhoneContacted: (e, t) => typeof mobilePhones[e + t] !== 'undefined',
      });
    })
    .on('error', (err) => {
      callback(err);
    });
};
