const sendContactNow = require('./_send-contact-now');
const { promisify } = require('util');

/**
 Send recontact sms/emails
*/
const sendRecontact = async (data) => new Promise((resolve, reject) => {
  if (!data.get('campaign.contactScenario.nextCampaignReContactDay')) {
    return resolve();
  }

  data.garage((errGarage, garage) => {
    if (errGarage) { 
      return reject(errGarage);
    }

    garage.getCampaignScenario(async (errScenario, scenario) => {
      if (errScenario) {
        return reject(errScenario);
      }
      if (!scenario) { 
        return reject(new Error(`No scenario found for ${garage.getId()}`));
      }
        
      const contacts = scenario.recontacts(data);
      data.set('campaign.contactScenario.nextCampaignReContactDay', null);
      await Promise.all(contacts.map(async contact => await promisify(sendContactNow)(data, contact)));
      if (contacts.length) {
        data.set('campaign.contactScenario.recontactedAt', new Date());
      }
      data.save(resolve);
    });
  });
});

module.exports = sendRecontact;
