const debug = require('debug')('garagescore:common:lib:garagescore:campaign-item:run:handle-current-run-event'); // eslint-disable-line max-len,no-unused-vars
const runEvents = require('./run-events');
const sendTodayContactOrDoNothing = require('./send-today-contact-or-do-nothing');
const timeHelper = require('../../../../lib/util/time-helper');
const contactsConfigs = require('../../../../../common/lib/garagescore/data-campaign/contacts-config.js');

// callback of sendTodayContactOrDoNothing
const contactSent = (self, campaignContact, lastCampaignContact, callback) => (errSend, isSent) => {
  if (errSend) {
    callback(errSend);
    return;
  }
  const data = self.modelInstances.data;
  if (isSent) {
    self.currentRunEvent = runEvents.CONTACT_SENT;
    data.set('campaign.contactScenario.lastCampaignContactSent', campaignContact);
    data.set('campaign.contactScenario.lastCampaignContactSentAt', Date.now());
    handleCurrentRunEvent.apply(self, [callback]); // eslint-disable-line no-use-before-define
    return;
  }
  // contact has not been sent, so it wasnt for today but we still must save
  data.save(callback);
};

/** check current run event, modify campaign data in consequence */
function handleCurrentRunEvent(callback) {
  if (!this.currentRunEvent) {
    callback();
    return;
  }
  const self = this;
  const data = this.modelInstances.data;
  const currentRunEvent = this.currentRunEvent;
  const today = timeHelper.todayDayNumber();
  debug(`handleCurrentRunEvent ${this.currentRunEvent}`);
  if (currentRunEvent === runEvents.CAMPAIGN_STARTED || currentRunEvent === runEvents.CONTACT_SENT) {
    // eslint-disable-line max-len
    data.campaign_determineNextCampaignContact(
      currentRunEvent,
      data,
      (errDetermine, nextCampaignContact, nextCampaignContactDay) => {
        if (errDetermine) {
          callback(errDetermine);
          return;
        }
        const lastContactKey = data.get('campaign.contactScenario.lastCampaignContactSent');
        if (currentRunEvent === runEvents.CONTACT_SENT && lastContactKey) {
          if (!data.get('campaign.contactScenario.firstContactedAt')) {
            data.set('campaign.contactScenario.firstContactedAt', new Date());
          }
          if (contactsConfigs.isEmail(lastContactKey)) {
            if (
              !data.get('campaign.contactStatus.hasBeenContactedByEmail') &&
              data.get('campaign.contactScenario.firstContactByEmailDay') &&
              data.get('campaign.contactScenario.firstContactByEmailDay') > today
            ) {
              data.set('campaign.contactScenario.firstContactByEmailDay', today);
            }
            data.set('campaign.contactStatus.hasBeenContactedByEmail', true);
          }
          if (contactsConfigs.isSms(lastContactKey)) {
            if (
              !data.get('campaign.contactStatus.hasBeenContactedByPhone') &&
              data.get('campaign.contactScenario.firstContactByPhoneDay') &&
              data.get('campaign.contactScenario.firstContactByPhoneDay') > today
            ) {
              data.set('campaign.contactScenario.firstContactByPhoneDay', today);
            }
            data.set('campaign.contactStatus.hasBeenContactedByPhone', true);
          }
        }
        const nextCampaignContactAt = timeHelper.dayNumberToDate(nextCampaignContactDay);

        if (!nextCampaignContact) {
          data.set('campaign.contactScenario.nextCampaignContactEvent', currentRunEvent);
          data.set('campaign.contactScenario.nextCampaignContactAt', nextCampaignContactAt);
          data.set('campaign.contactScenario.nextCampaignContact', null);
          data.set('campaign.contactScenario.nextCampaignContactDay', null);
          data.save(callback);
          return;
        }
        data.set('campaign.contactScenario.nextCampaignContactEvent', currentRunEvent);
        data.set('campaign.contactScenario.nextCampaignContactAt', nextCampaignContactAt);
        data.set('campaign.contactScenario.nextCampaignContact', nextCampaignContact);
        data.set('campaign.contactScenario.nextCampaignContactDay', nextCampaignContactDay);
        data.save(() => {
          sendTodayContactOrDoNothing.apply(self, [contactSent(self, nextCampaignContact, lastContactKey, callback)]);
        });
      }
    );
    return;
  }
  if (currentRunEvent === runEvents.SURVEY_UPDATE) {
    // eslint-disable-line max-len
    data.campaign_determineNextCampaignContact(
      currentRunEvent,
      data,
      (errDetermine, nextCampaignContact, nextCampaignContactDay) => {
        if (errDetermine) {
          callback(errDetermine);
          return;
        }
        data.set('campaign.contactScenario.nextCheckSurveyUpdatesDecaminute', null);
        if (!nextCampaignContact) {
          debug(`data ${this.modelInstances.data.id} updated, nothing to send`);
          data.save(callback);
          return;
        }
        debug(
          `data ${this.modelInstances.data.id} updated, send ${JSON.stringify({
            nextCampaignContact,
            nextCampaignContactDay,
          })}`
        ); // eslint-disable-line max-len
        const lastCampaignContact = data.get('campaign.contactScenario.nextCampaignContact');
        data.set('campaign.contactScenario.nextCampaignContact', nextCampaignContact);
        data.set('campaign.contactScenario.nextCampaignContactDay', nextCampaignContactDay);
        // we received responses; customer will not be contacted again, we cancel the next email contact
        if (
          data.get('campaign.contactScenario.firstContactByEmailDay') &&
          data.get('campaign.contactScenario.firstContactByEmailDay') > today
        ) {
          data.set('campaign.contactScenario.firstContactByEmailDay', null);
        }
        // we received responses; customer will not be contacted again, we cancel the next sms contact
        if (
          data.get('campaign.contactScenario.firstContactByPhoneDay') &&
          data.get('campaign.contactScenario.firstContactByPhoneDay') > today
        ) {
          data.set('campaign.contactScenario.firstContactByPhoneDay', null);
        }
        data.save(() => {
          sendTodayContactOrDoNothing.apply(self, [
            contactSent(self, nextCampaignContact, lastCampaignContact, callback),
          ]);
        });
      }
    );
    return;
  }
  callback();
}

module.exports = handleCurrentRunEvent;
