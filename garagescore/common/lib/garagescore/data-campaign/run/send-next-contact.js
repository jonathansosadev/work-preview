const sendContactNow = require('./_send-contact-now');
const runEvents = require('./run-events');
const handleCurrentRunEvent = require('./handle-current-run-event');

/**
Send next contact if its for today
and starts a new runevent loop
*/

function sendNextContact(callback) {
  const self = this;
  const data = this.modelInstances.data;
  const nextCampaignContact = data.get('campaign.contactScenario.nextCampaignContact');
  const nextCampaignContactDay = data.get('campaign.contactScenario.nextCampaignContactDay');
  if (!nextCampaignContact) {
    callback(new Error(`Cannot send data ${data.getId().toString()}: nextCampaignContact empty `));
    return;
  }
  if (!nextCampaignContactDay) {
    callback(new Error(`Cannot send data ${data.getId().toString()}: nextCampaignContactDay empty `));
    return;
  }
  if (!data.shouldSurfaceInStatistics) {
    callback(new Error(`Cannot send data ${data.getId().toString()}: shouldSurfaceInStatistics empty `));
    return;
  }
  sendContactNow(data, nextCampaignContact, (errSend) => {
    if (errSend) {
      callback(errSend);
      return;
    }
    data.set('campaign.contactScenario.lastCampaignContactSent', nextCampaignContact);
    data.set('campaign.contactScenario.lastCampaignContactSentAt', Date.now());
    self.currentRunEvent = runEvents.CONTACT_SENT;
    handleCurrentRunEvent.apply(self, [callback]); // eslint-disable-line no-use-before-define
  });
}

module.exports = sendNextContact;
