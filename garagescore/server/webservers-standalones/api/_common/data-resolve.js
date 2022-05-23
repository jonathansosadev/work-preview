const EmailStatus = require('../../../../common/models/data/type/email-status');
const PhoneStatus = require('../../../../common/models/data/type/phone-status');
const CampaignContactStatus = require('../../../../common/models/data/type/campaign-contact-status');
const timeHelper = require('../../../../common/lib/util/time-helper');

const explainEmailStatus = (data) => {
  try {
    let emailStatus = null;
    if (data.campaign && data.campaign.contactStatus && data.campaign.contactStatus.emailStatus) {
      emailStatus = data.campaign.contactStatus.emailStatus;
    }

    switch (emailStatus) {
      case EmailStatus.VALID:
      case EmailStatus.EMPTY:
      case EmailStatus.NOT_TO_SURFACE:
        return '';
      case EmailStatus.WRONG:
        if (!data.customer.contact.email.isSyntaxOK) {
          return 'erreur de saisie';
        }
        return '-';
      case EmailStatus.DROPPED:
        if (data.customer.contact.email.isDropped) {
          return 'cette adresse email ne répond pas / NPAI';
        }
        if (
          data.campaign.contactStatus.previouslyDroppedEmail &&
          !data.campaign.contactStatus.previouslyUnsubscribedByEmail
        ) {
          return 'cette adresse email est injoignable';
        }
        if (data.campaign.contactStatus.previouslyUnsubscribedByEmail) {
          return "client ne souhaitant plus recevoir d'enquête GS";
        }
        return '-';
      case EmailStatus.UNSUBSCRIBED:
        if (data.campaign.contactStatus.previouslyComplainedByEmail || data.customer.contact.email.isComplained) {
          return "client ne souhaitant plus recevoir d'enquête GS : mise en spam";
        }
        return "client ne souhaitant plus recevoir d'enquête GS";
      case EmailStatus.RECENTLY_CONTACTED:
        return 'Email envoyé dans les 30 derniers jours';
      default:
        return '';
    }
  } catch (e) {
    return '';
  }
};

const explainPhoneStatus = (data) => {
  try {
    let phoneStatus = null;
    if (data.campaign && data.campaign.contactStatus && data.campaign.contactStatus.phoneStatus) {
      phoneStatus = data.campaign.contactStatus.phoneStatus;
    }
    switch (phoneStatus) {
      case PhoneStatus.VALID:
      case PhoneStatus.EMPTY:
      case PhoneStatus.NOT_TO_SURFACE:
        return '';
      case PhoneStatus.WRONG:
        if (!data.customer.contact.mobilePhone.isSyntaxOK) {
          return 'erreur de saisie';
        }
        if (data.customer.contact.mobilePhone.isDropped) {
          return 'ce téléphone ne répond pas / NPAI';
        }
        if (
          data.campaign.contactStatus.previouslyDroppedPhone &&
          !data.campaign.contactStatus.previouslyUnsubscribedByPhone
        ) {
          return 'ce téléphone est injoignable';
        }
        if (data.campaign.contactStatus.previouslyUnsubscribedByPhone) {
          return 'ce téléphone est désabonné';
        }
        return '-';
      case PhoneStatus.UNSUBSCRIBED:
        return "client ne souhaitant plus recevoir d'enquête GS";
      case PhoneStatus.RECENTLY_CONTACTED:
        return 'SMS envoyé dans les 30 derniers jours';
      default:
        return '';
    }
  } catch (e) {
    return e;
  }
};

const explainCampaignContactStatus = (data) => {
  try {
    let campaignStatus = null;
    if (data.campaign && data.campaign.contactStatus && data.campaign.contactStatus.status) {
      campaignStatus = data.campaign.contactStatus.status;
    }
    switch (campaignStatus) {
      case CampaignContactStatus.SCHEDULED:
      case CampaignContactStatus.RECEIVED:
      case CampaignContactStatus.NOT_TO_SURFACE:
        return '';
      case CampaignContactStatus.NOT_RECEIVED:
        if (data.campaign.contactStatus.phoneStatus === PhoneStatus.WRONG) {
          return explainPhoneStatus(data);
        }
        if (data.campaign.contactStatus.emailStatus === EmailStatus.WRONG) {
          return explainEmailStatus(data);
        }
        return '';
      case CampaignContactStatus.IMPOSSIBLE:
        return 'erreur de coordonnées Email et Mobile';
      case CampaignContactStatus.BLOCKED:
        if (
          !data.campaign.contactStatus.previouslyContactedByPhone &&
          !data.campaign.contactStatus.previouslyContactedByEmail &&
          !data.campaign.contactStatus.previouslyUnsubscribedByPhone &&
          !data.campaign.contactStatus.previouslyUnsubscribedByEmail
        ) {
          if (
            data.campaign.contactStatus.hasBeenContactedByEmail === false &&
            data.campaign.contactScenario &&
            data.campaign.contactScenario.firstContactByPhoneDay === false &&
            data.campaign.contactStatus.phoneStatus === PhoneStatus.VALID
          ) {
            return 'Campagne SMS désactivée dans la configuration garage';
          }
          if (
            data.campaign.contactStatus.hasBeenContactedByPhone === false &&
            data.campaign.contactScenario &&
            data.campaign.contactScenario.firstContactByEmailDay === false &&
            data.campaign.contactStatus.emailStatus === EmailStatus.VALID
          ) {
            return 'Campagne Email désactivée dans la configuration garage';
          }
        }
        if (!data.service.providedAt) {
          return "date d'intervention non renseignée";
        }
        if (
          [PhoneStatus.UNSUBSCRIBED, PhoneStatus.RECENTLY_CONTACTED].includes(data.campaign.contactStatus.phoneStatus)
        ) {
          return explainPhoneStatus(data);
        }
        if (
          [EmailStatus.UNSUBSCRIBED, EmailStatus.RECENTLY_CONTACTED].includes(data.campaign.contactStatus.emailStatus)
        ) {
          return explainEmailStatus(data);
        }
        return explainEmailStatus(data) || explainPhoneStatus(data);
      default:
        return '';
    }
  } catch (e) {
    return e;
  }
};

const firstContactedAtOrfirstContactByEmailOrfirstContactByPhone = (data) => {
  const date = data.campaignFirstContactedAt;
  if (!date) {
    const firstEmailDay = data.campaignFirstContactByEmailDay;
    const firstPhoneDay = data.campaignFirstContactByPhoneDay;
    if (!firstEmailDay && !firstPhoneDay) {
      return null;
    }
    if (firstEmailDay && !firstPhoneDay) {
      return timeHelper.dayNumberToDate(firstEmailDay);
    }
    if (!firstEmailDay && firstPhoneDay) {
      return timeHelper.dayNumberToDate(firstPhoneDay);
    }
    return firstPhoneDay > firstEmailDay
      ? timeHelper.dayNumberToDate(firstEmailDay)
      : timeHelper.dayNumberToDate(firstPhoneDay);
  }
  return date || null;
};

module.exports = {
  explainCampaignContactStatus,
  explainPhoneStatus,
  explainEmailStatus,
  firstContactedAtOrfirstContactByEmailOrfirstContactByPhone,
};
