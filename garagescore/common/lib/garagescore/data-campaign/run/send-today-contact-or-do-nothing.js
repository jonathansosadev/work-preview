const sendContactNow = require('./_send-contact-now');
const timeHelper = require('../../../util/time-helper');
/** Send next contact if its for today
and starts a new runevent loop
*/

function sendTodayContact(callback) {
  const data = this.modelInstances.data;
  const nextCampaignContact = data.get('campaign.contactScenario.nextCampaignContact');
  if (!nextCampaignContact) {
    callback();
    return;
  }
  const nextCampaignContactDay = data.get('campaign.contactScenario.nextCampaignContactDay');
  if (!nextCampaignContactDay) {
    callback();
    return;
  }
  const today = timeHelper.todayDayNumber();
  if (today < nextCampaignContactDay) {
    // send also contact from the past
    callback();
    return;
  }
  sendContactNow(data, nextCampaignContact, (errSend) => {
    if (errSend) {
      callback(errSend);
      return;
    }
    callback(null, true);
  });
}

module.exports = sendTodayContact;
