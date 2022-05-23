/**
 * this is a common validation of all queries based on the argument's
 * Especially it validate the Enumerations possible values
 */
const GarageHistoryPeriod = require('../../../../../models/garage-history.period');
const dataTypes = require('../../../../../models/data/type/data-types');
const EmailStatus = require('../../../../../models/data/type/email-status');
const PhoneStatus = require('../../../../../models/data/type/phone-status');
const moderationStatus = require('../../../../../models/data/type/moderation-status.js');
const CampaignContactStatus = require('../../../../../models/data/type/campaign-contact-status');
const leadTypes = require('../../../../../models/data/type/lead-types');
const LeadSaleTypes = require('../../../../../models/data/type/lead-sale-types');
const leadTemperatures = require('../../../../../models/data/type/ticket-temperature');
const ContactTicketStatus = require('../../../../../../common/models/data/type/contact-ticket-status.js');
const UnsatisfiedFollowupStatus = require('../../../../../../common/models/data/type/unsatisfied-followup-status');

function orderValidation(val) {
  if (['ASC', 'DESC'].includes(val)) {
    return Promise.resolve();
  }
  return Promise.reject(new Error(`Unsupported order ${val}`));
}

const validationsFn = {
  type(val) {
    if (dataTypes.values().includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported type ${val}`));
  },
  surveySatisfactionLevel(val) {
    if (['Promoter', 'Neutral', 'Detractor'].includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported scoreLevel ${val}`));
  },
  contactsOrder(val) {
    return orderValidation(val);
  },
  garageHistoryOrder(val) {
    return orderValidation(val);
  },
  garageHistoryOrderBy(val) {
    if (
      [
        'countSurveysResponded',
        'surveyRecommandPercent',
        ...dataTypes.getJobs().map((job) => `score${dataTypes.getAcronymFromJob(job)}`), // scoreAPV, score...
        'scoreNPS',
        'surveyUnsatisfiedPercent',
        'surveyUncontactablePercent',
        'countSurveyLead',
        'score',
        'countReviews',
        'promotorsPercent',
        'detractorsPercent',
        'countPromotorsPercent',
        'countDetractorsPercent',
        'neutralsPercent',
        'countValidEmails',
        'countValidEmailsPercent',
        'countValidPhones',
        'countValidPhonesPercent',
        'countNotContactable',
        'countNotContactablePercent',
        'countSurveysResponded',
        'countSurveysRespondedPercent',
        'recommendPercent',
        'garagePublicDisplayName',
      ].includes(val)
    ) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported garageHistoryOrderBy ${val}`));
  },
  publicReviewStatus(val) {
    if ([moderationStatus.REJECTED, moderationStatus.APPROVED].includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported publicReviewStatus ${val}`));
  },
  revisionStatus(val) {
    if (['Validated', 'Revised', 'NotValidated'].includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported revisionStatus ${val}`));
  },
  ticketStatus(val) {
    if (ContactTicketStatus.values().includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported ticketStatus ${val}`));
  },
  customerEmailStatus(val) {
    if (EmailStatus.values().includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported customerEmailStatus ${val}`));
  },
  customerPhoneStatus(val) {
    if (PhoneStatus.values().concat(['RecentlyContacted', 'Unsubscribed']).includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported customerPhoneStatus ${val}`));
  },
  campaignStatus(val) {
    if (CampaignContactStatus.values().concat(['ReceivedResponded', 'ReceivedNotResponded']).includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported campaignStatus ${val}`));
  },
  publicReviewCommentStatus(val) {
    if ([moderationStatus.REJECTED, moderationStatus.APPROVED, 'NoResponse'].includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported publicReviewCommentStatus ${val}`));
  },
  followupUnsatisfiedStatus(val) {
    // NewUnsatisfied = followup not sent yet
    // Resolved = insatisfaction resolved
    // NotResolved = insatisfaction not resolved
    // InProgress = insatisfaction resolution in progress
    // UnsatisfiedWithoutAnswer = insatisfaction without answer
    if ([
      UnsatisfiedFollowupStatus.NEW_UNSATISFIED,
      UnsatisfiedFollowupStatus.RESOLVED,
      UnsatisfiedFollowupStatus.NOT_RESOLVED,
      UnsatisfiedFollowupStatus.UNSATISFIED_WITHOUT_ANSWER,
    ].includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported insatisfaction resolution value ${val}`));
  },
  leadType(val) {
    if ([leadTypes.INTERESTED, 'Planned'].includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported leadType value ${val}`));
  },
  leadSaleType(val) {
    if (LeadSaleTypes.values().includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported leadSaleType value ${val}`));
  },
  leadTemperature(val) {
    if (leadTemperatures.values().includes(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported leadTemperature value ${val}`));
  },
  periodId(val) {
    if (GarageHistoryPeriod.isValidPeriod(val)) {
      return Promise.resolve();
    }
    return Promise.reject(new Error(`Unsupported periodId ${val}`));
  },
  async garageId(val, req) {
    if (!req.user) {
      return Promise.reject(new Error("garageId coudn't be used in disconnected mode"));
    }
    if (val && val.length !== 24) {
      return Promise.reject(new Error(`Unsupported garageId ${val}`));
    }
    return req.user.hasAccessToGarage(val);
  },
};

/**
 * apply validationsFn for each arguments of a such query args
 * the object of this validation is to reuse the validation of the same argument used in many queries
 * @param root
 * @param args
 * @param req
 * @returns Promise
 */
module.exports = function argumentsValidation(root, args, req) {
  const validations = [];
  Object.keys(args).forEach((key) => {
    if (validationsFn[key]) {
      validations.push(validationsFn[key](args[key], req));
    }
  });
  return Promise.all(validations);
};
