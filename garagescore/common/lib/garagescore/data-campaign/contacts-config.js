const fs = require('fs');
const campaignTypes = require('../../../../common/models/campaign.type.js');
const generateFollowup = require('../../../../common/lib/garagescore/data-campaign/generate-followup-survey.js');
const SurveyTypes = require('../../../../common/models/data/type/survey-types.js');

/**
 * Static configs
 */

const contactEmail = (name, sms, campaignType, contactType, contactNumber) => ({
  name,
  sms,
  channel: 'email',
  campaignType,
  from: 'survey@mg.garagescore.com',
  contactType,
  contactNumber,
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/contact-body',
    emailSubject: '/emails/survey/contact-subject',
    emailFooter: '/emails/survey/contact-footer',
  },
});
const contactSms = (name, campaignType, contactType, contactNumber) => ({
  name,
  channel: 'sms',
  campaignType,
  from: 'survey@mg.garagescore.com',
  contactType,
  contactNumber,
  templates: {
    type: 'nuxtTemplate',
    smsText: '/sms/survey/contact-sms',
  },
});
const followupUnsatisfiedEmail = (name, sms, campaignType) => ({
  name,
  sms,
  channel: 'email',
  campaignType,
  followupType: SurveyTypes.SURVEY_UNSATISFIED_FOLLOWUP,
  from: 'survey@mg.garagescore.com',
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/followup-unsatisfied-body',
    emailSubject: '/emails/survey/followup-unsatisfied-subject',
  },
});
const followupUnsatisfiedSms = (name, campaignType) => ({
  name,
  channel: 'sms',
  campaignType,
  followupType: SurveyTypes.SURVEY_UNSATISFIED_FOLLOWUP,
  from: 'survey@mg.garagescore.com',
  templates: {
    type: 'nuxtTemplate',
    smsText: '/sms/survey/followup-unsatisfied-sms',
  },
});

const followupLeadEmail = (name, sms, campaignType) => ({
  name,
  sms,
  channel: 'email',
  campaignType,
  followupType: SurveyTypes.SURVEY_LEAD_FOLLOWUP,
  from: 'survey@mg.garagescore.com',
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/followup-lead-body',
    emailSubject: '/emails/survey/followup-lead-subject',
  },
});

const followupLeadSms = (name, campaignType) => ({
  name,
  channel: 'sms',
  campaignType,
  followupType: SurveyTypes.SURVEY_LEAD_FOLLOWUP,
  from: 'survey@mg.garagescore.com',
  templates: {
    type: 'nuxtTemplate',
    smsText: '/sms/survey/followup-lead-sms',
  },
});

const recontactSms = (name, campaignType, respondent) => ({
  name,
  channel: 'sms',
  campaignType,
  isRecontact: true,
  respondent,
  templates: {
    type: 'nuxtTemplate',
    smsText: '/sms/survey/recontact-sms',
  },
});
const recontactEmail = (name, campaignType, respondent) => ({
  name,
  channel: 'email',
  campaignType,
  isRecontact: true,
  respondent,
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/recontact-body',
    emailSubject: '/emails/survey/recontact-subject',
  },
});
const recontactGoogleEmail = (name, campaignType, respondent) => ({
  name,
  channel: 'email',
  campaignType,
  isRecontact: true,
  respondent,
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/recontact-google-body',
    emailSubject: '/emails/survey/recontact-google-subject',
  },
});
const thanks = (name, sms, campaignType, contactType, surveyComplete, surveyDetractor) => ({
  name,
  sms,
  channel: 'email',
  campaignType,
  isThank: true,
  from: 'survey@mg.garagescore.com',
  contactType,
  surveyComplete,
  surveyDetractor,
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/thanks-body',
    emailSubject: '/emails/survey/thanks-subject',
  },
});
const customThanks = (name, campaignType, surveyComplete, surveyDetractor) => ({
  name,
  sms: false,
  channel: 'email',
  campaignType,
  isThank: true,
  custom: true,
  from: 'survey@mg.garagescore.com',
  surveyComplete,
  surveyDetractor,
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/thanks-body',
    emailSubject: '/emails/survey/thanks-subject',
  },
});

const reply = (name) => ({
  name,
  channel: 'email',
  from: 'survey@mg.garagescore.com',
  templates: {
    type: 'nuxtTemplate',
    emailBody: '/emails/survey/reply-body',
    emailSubject: '/emails/survey/reply-subject',
  },
});

const configs = {
  /** _ MAINTENANCE - EMAIL _____________________________ DEFAULT _____________________________ **/
  maintenance_email_1: contactEmail(
    'DEFAULT GROUP - E-mail #1 (maintenance)',
    'maintenance_sms_1',
    campaignTypes.MAINTENANCE,
    'group',
    1
  ),
  maintenance_email_2: contactEmail(
    'DEFAULT GROUP - E-mail #2 (maintenance)',
    null,
    campaignTypes.MAINTENANCE,
    'group',
    2
  ),
  maintenance_email_3: contactEmail(
    'DEFAULT GROUP - E-mail #3 (maintenance)',
    null,
    campaignTypes.MAINTENANCE,
    'group',
    3
  ),

  /** _ MAINTENANCE - EMAIL _____________________________ CAR REPAIRER _____________________________ **/
  maintenance_email_1_car_repairer: contactEmail(
    'DEFAULT - E-mail #1 (maintenance)',
    'maintenance_sms_1',
    campaignTypes.MAINTENANCE,
    'default',
    1
  ),
  maintenance_email_2_car_repairer: contactEmail(
    'DEFAULT - E-mail #2 (maintenance)',
    null,
    campaignTypes.MAINTENANCE,
    'default',
    2
  ),
  maintenance_email_3_car_repairer: contactEmail(
    'DEFAULT - E-mail #3 (maintenance)',
    null,
    campaignTypes.MAINTENANCE,
    'default',
    3
  ),

  /** _ MAINTENANCE - EMAIL _____________________________ MAKER _____________________________ **/
  maintenance_email_1_make: contactEmail(
    'MAKER - E-mail #1 (maintenance)',
    'maintenance_sms_1',
    campaignTypes.MAINTENANCE,
    'make',
    1
  ),
  maintenance_email_2_make: contactEmail('MAKER - E-mail #2 (maintenance)', null, campaignTypes.MAINTENANCE, 'make', 2),

  /** _ SALE - EMAIL _____________________________ DEFAULT _____________________________ **/
  sale_email_1: contactEmail('DEFAULT GROUP - E-mail #1 (sale)', 'sale_sms_1', campaignTypes.VEHICLE_SALE, 'group', 1),
  sale_email_2: contactEmail('DEFAULT GROUP - E-mail #2 (sale)', null, campaignTypes.VEHICLE_SALE, 'group', 2),
  sale_email_3: contactEmail('DEFAULT GROUP - E-mail #3 (sale)', null, campaignTypes.VEHICLE_SALE, 'group', 3),

  /** _ EMAIL _____________________________ VEHICLE_INSPECTION _____________________________ **/
  vehicle_inspection_email_1: contactEmail(
    'VEHICLE INSPECTION - E-mail #1',
    'sale_sms_1',
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    1
  ),
  vehicle_inspection_email_2: contactEmail(
    'VEHICLE INSPECTION - E-mail #2',
    null,
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    2
  ),
  vehicle_inspection_email_3: contactEmail(
    'VEHICLE INSPECTION - E-mail #3',
    null,
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    3
  ),

  /** _ SALE - EMAIL _____________________________ MAKER _____________________________ **/
  sale_email_1_make: contactEmail('MAKER - E-mail #1 (sale)', 'sale_sms_1', campaignTypes.VEHICLE_SALE, 'make', 1),
  sale_email_2_make: contactEmail('MAKER - E-mail #2 (sale)', null, campaignTypes.VEHICLE_SALE, 'make', 2),

  /** _ MAINTENANCE - SMS _____________________________ DEFAULT _____________________________ **/
  maintenance_sms_1: contactSms('DEFAULT GROUP - SMS #1 (maintenance)', campaignTypes.MAINTENANCE, 'group', 1),

  /** _ SALE - SMS _____________________________ DEFAULT _____________________________ **/
  sale_sms_1: contactSms('DEFAULT GROUP - SMS #1 (sale)', campaignTypes.VEHICLE_SALE, 'group', 1),

  /** SMS _____________________________ VEHICLE INSPECTION _____________________________ **/
  vehicle_inspection_sms_1: contactSms('VEHICLE INSPECTION - SMS #1', campaignTypes.VEHICLE_INSPECTION, 'default', 1),

  /** _ FOLLOWUP_UNSATISFIED - MAINTENANCE - EMAIL _____________________________ DEFAULT _____________________________ **/
  maintenance_email_followup: followupUnsatisfiedEmail(
    'DEFAULT GROUP - FollowupUnsatisfied - E-mail #1 (maintenance)',
    'maintenance_sms_followup',
    campaignTypes.MAINTENANCE
  ),

  /** _ FOLLOWUP_UNSATISFIED - MAINTENANCE - SMS _____________________________ DEFAULT _____________________________ **/
  maintenance_sms_followup: followupUnsatisfiedSms(
    'DEFAULT GROUP - FollowupUnsatisfied - SMS #1 (maintenance)',
    campaignTypes.MAINTENANCE
  ),

  /** _ FOLLOWUP_UNSATISFIED - SALE - EMAIL _____________________________ DEFAULT _____________________________ **/
  sale_email_followup: followupUnsatisfiedEmail(
    'DEFAULT GROUP - FollowupUnsatisfied - E-mail #1 (sale)',
    'sale_sms_followup',
    campaignTypes.VEHICLE_SALE
  ),

  /** _ FOLLOWUP_UNSATISFIED - SALE - SMS _____________________________ DEFAULT _____________________________ **/
  sale_sms_followup: followupUnsatisfiedSms(
    'DEFAULT GROUP - FollowupUnsatisfied - SMS #1 (sale)',
    campaignTypes.VEHICLE_SALE
  ),

  /** _ FOLLOWUP_UNSATISFIED - EMAIL _____________________________ VEHICLE INSPECTION _____________________________ **/
  vehicle_inspection_email_followup: followupUnsatisfiedEmail(
    'VEHICLE INSPECTION - FollowupUnsatisfied - E-mail #1',
    'vehicle_inspection_sms_followup',
    campaignTypes.VEHICLE_INSPECTION
  ),

  /** _ FOLLOWUP_UNSATISFIED - SMS _____________________________ VEHICLE INSPECTION _____________________________ **/
  vehicle_inspection_sms_followup: followupUnsatisfiedSms(
    'VEHICLE INSPECTION - FollowupUnsatisfied - SMS #1',
    campaignTypes.VEHICLE_INSPECTION
  ),

  /** _ FOLLOWUP_LEAD - EMAIL _____________________________ DEFAULT _____________________________ **/
  email_followup_lead: followupLeadEmail(
    'DEFAULT - FollowupLead - E-mail #1',
    'sms_followup_lead',
    campaignTypes.MAINTENANCE
  ),

  /** _ FOLLOWUP_LEAD - SMS _____________________________ DEFAULT _____________________________ **/
  sms_followup_lead: followupLeadSms('DEFAULT - FollowupLead - SMS #1', campaignTypes.MAINTENANCE),

  /** _ THANK YOU - SALE - EMAIL _____________________________ DEFAULT _____________________________ **/
  sale_email_thanks_1: thanks(
    'DEFAULT GROUP - Thanks #1 (sale)',
    false,
    campaignTypes.VEHICLE_SALE,
    'group',
    true,
    false
  ),
  sale_email_thanks_2: thanks(
    'DEFAULT GROUP - Thanks #2 (sale)',
    true,
    campaignTypes.VEHICLE_SALE,
    'group',
    true,
    true
  ),
  sale_email_thanks_3: thanks(
    'DEFAULT GROUP - Thanks #3 (sale)',
    false,
    campaignTypes.VEHICLE_SALE,
    'group',
    false,
    false
  ),
  sale_email_thanks_4: thanks(
    'DEFAULT GROUP - Thanks #4 (sale)',
    true,
    campaignTypes.VEHICLE_SALE,
    'group',
    false,
    true
  ),

  /** _ THANK YOU - MAINTENANCE - EMAIL _____________________________ DEFAULT _____________________________ **/

  maintenance_email_thanks_1: thanks(
    'DEFAULT GROUP - Thanks #1 (maintenance)',
    false,
    campaignTypes.MAINTENANCE,
    'group',
    true,
    false
  ),
  maintenance_email_thanks_2: thanks(
    'DEFAULT GROUP - Thanks #2 (maintenance)',
    true,
    campaignTypes.MAINTENANCE,
    'group',
    true,
    true
  ),
  maintenance_email_thanks_3: thanks(
    'DEFAULT GROUP - Thanks #3 (maintenance)',
    false,
    campaignTypes.MAINTENANCE,
    'group',
    false,
    false
  ),
  maintenance_email_thanks_4: thanks(
    'DEFAULT GROUP - Thanks #4 (maintenance)',
    true,
    campaignTypes.MAINTENANCE,
    'group',
    false,
    true
  ),

  /** _ THANK YOU - MAINTENANCE - EMAIL _____________________________ MAKER _____________________________ **/
  maintenance_email_thanks_1_make: thanks(
    'MAKER - Thanks #1 (maintenance)',
    false,
    campaignTypes.MAINTENANCE,
    'make',
    true,
    false
  ),
  maintenance_email_thanks_2_make: thanks(
    'MAKER - Thanks #2 (maintenance)',
    true,
    campaignTypes.MAINTENANCE,
    'make',
    true,
    true
  ),
  maintenance_email_thanks_3_make: thanks(
    'MAKER - Thanks #3 (maintenance)',
    false,
    campaignTypes.MAINTENANCE,
    'make',
    false,
    false
  ),
  maintenance_email_thanks_4_make: thanks(
    'MAKER - Thanks #4 (maintenance)',
    true,
    campaignTypes.MAINTENANCE,
    'make',
    false,
    true
  ),

  /** _ THANK YOU - SALE - EMAIL _____________________________ MAKER _____________________________ **/
  sale_email_thanks_1_make: thanks('MAKER - Thanks #1 (sale)', false, campaignTypes.VEHICLE_SALE, 'make', true, false),
  sale_email_thanks_2_make: thanks('MAKER - Thanks #2 (sale)', true, campaignTypes.VEHICLE_SALE, 'make', true, true),
  sale_email_thanks_3_make: thanks('MAKER - Thanks #3 (sale)', false, campaignTypes.VEHICLE_SALE, 'make', false, false),
  sale_email_thanks_4_make: thanks('MAKER - Thanks #4 (sale)', true, campaignTypes.VEHICLE_SALE, 'make', false, true),

  /** _ THANK YOU - MAINTENANCE - EMAIL _____________________________ CAR REPAIRER _____________________________ **/
  maintenance_email_thanks_1_car_repairer: thanks(
    'DEFAULT - Thanks #1 (maintenance)',
    false,
    campaignTypes.MAINTENANCE,
    'default',
    true,
    false
  ),
  maintenance_email_thanks_2_car_repairer: thanks(
    'DEFAULT - Thanks #2 (maintenance)',
    true,
    campaignTypes.MAINTENANCE,
    'default',
    true,
    true
  ),
  maintenance_email_thanks_3_car_repairer: thanks(
    'DEFAULT - Thanks #3 (maintenance)',
    false,
    campaignTypes.MAINTENANCE,
    'default',
    false,
    false
  ),
  maintenance_email_thanks_4_car_repairer: thanks(
    'DEFAULT - Thanks #4 (maintenance)',
    true,
    campaignTypes.MAINTENANCE,
    'default',
    false,
    true
  ),

  /** _ THANK YOU - SALE - EMAIL _____________________________ CAR REPAIRER _____________________________ **/
  sale_email_thanks_1_car_repairer: thanks(
    'DEFAULT - Thanks #1 (sale)',
    false,
    campaignTypes.VEHICLE_SALE,
    'default',
    true,
    false
  ),
  sale_email_thanks_2_car_repairer: thanks(
    'DEFAULT - Thanks #2 (sale)',
    true,
    campaignTypes.VEHICLE_SALE,
    'default',
    true,
    true
  ),
  sale_email_thanks_3_car_repairer: thanks(
    'DEFAULT - Thanks #3 (sale)',
    false,
    campaignTypes.VEHICLE_SALE,
    'default',
    false,
    false
  ),
  sale_email_thanks_4_car_repairer: thanks(
    'DEFAULT - Thanks #4 (sale)',
    true,
    campaignTypes.VEHICLE_SALE,
    'default',
    false,
    true
  ),

  /** _ THANK YOU - EMAIL _____________________________ VEHICLE - INSPECTION _____________________________ **/
  vehicle_inspection_email_thanks_1: thanks(
    'VEHICLE INSPECTION - Thanks #1',
    false,
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    true,
    false
  ),
  vehicle_inspection_email_thanks_2: thanks(
    'VEHICLE INSPECTION - Thanks #2',
    true,
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    true,
    true
  ),
  vehicle_inspection_email_thanks_3: thanks(
    'VEHICLE INSPECTION - Thanks #3',
    false,
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    false,
    false
  ),
  vehicle_inspection_email_thanks_4: thanks(
    'VEHICLE INSPECTION - Thanks #4',
    true,
    campaignTypes.VEHICLE_INSPECTION,
    'default',
    false,
    true
  ),

  /** _ THANK YOU - CUSTOM */
  email_thanks_1_custom_maintenance: customThanks(
    'CUSTOM - Thanks #1 (maintenance)',
    campaignTypes.MAINTENANCE,
    true,
    false
  ),
  email_thanks_2_custom_maintenance: customThanks(
    'CUSTOM - Thanks #2 (maintenance)',
    campaignTypes.MAINTENANCE,
    true,
    true
  ),
  email_thanks_3_custom_maintenance: customThanks(
    'CUSTOM - Thanks #3 (maintenance)',
    campaignTypes.MAINTENANCE,
    false,
    false
  ),
  email_thanks_4_custom_maintenance: customThanks(
    'CUSTOM - Thanks #4 (maintenance)',
    campaignTypes.MAINTENANCE,
    false,
    true
  ),
  email_thanks_1_custom_sale_car_repairer: customThanks(
    'CUSTOM - Thanks #1 (sale)',
    campaignTypes.VEHICLE_SALE,
    true,
    false
  ),
  email_thanks_2_custom_sale_car_repairer: customThanks(
    'CUSTOM - Thanks #2 (sale)',
    campaignTypes.VEHICLE_SALE,
    true,
    true
  ),
  email_thanks_3_custom_sale_car_repairer: customThanks(
    'CUSTOM - Thanks #3 (sale)',
    campaignTypes.VEHICLE_SALE,
    false,
    false
  ),
  email_thanks_4_custom_sale_car_repairer: customThanks(
    'CUSTOM - Thanks #4 (sale)',
    campaignTypes.VEHICLE_SALE,
    false,
    true
  ),
  email_thanks_1_custom_vehicle_inspection: customThanks(
    'CUSTOM - Thanks #1 (vehicle inspection)',
    campaignTypes.VEHICLE_INSPECTION,
    true,
    false
  ),
  email_thanks_2_custom_vehicle_inspection: customThanks(
    'CUSTOM - Thanks #2 (vehicle inspection)',
    campaignTypes.VEHICLE_INSPECTION,
    true,
    true
  ),
  email_thanks_3_custom_vehicle_inspection: customThanks(
    'CUSTOM - Thanks #3 (vehicle inspection)',
    campaignTypes.VEHICLE_INSPECTION,
    false,
    false
  ),
  email_thanks_4_custom_vehicle_inspection: customThanks(
    'CUSTOM - Thanks #4 (vehicle inspection)',
    campaignTypes.VEHICLE_INSPECTION,
    false,
    true
  ),

  /** _____________________________________________ GOOGLE RECONTACTS _____________________________________________ **/
  /* email recontact */
  recontact_email_google_write_review: recontactGoogleEmail(
    'E-mail Recontact Google write review',
    campaignTypes.MAINTENANCE,
    true
  ),
  /* no sms Google recontact */
  /** _____________________________________________ MERCEDES RECONTACTS _____________________________________________ **/

  /* sms recontact */
  custom_mercedes_maintenance_recontact_sms: recontactSms(
    'X - Custom Mercedes APV - SMS Recontact',
    campaignTypes.MAINTENANCE,
    true
  ),

  custom_mercedes_maintenance_recontact_email_respondent: recontactEmail(
    'X - Custom Mercedes APV - E-mail Recontact respondent',
    campaignTypes.MAINTENANCE,
    true
  ),

  custom_mercedes_maintenance_recontact_email_non_respondent: recontactEmail(
    'X - Custom Mercedes APV - E-mail Recontact non-respondent',
    campaignTypes.MAINTENANCE,
    false
  ),
  custom_mercedes_sale_recontact_sms: recontactSms(
    'X - Custom Mercedes Sale - SMS Recontact',
    campaignTypes.VEHICLE_SALE,
    true
  ),
  custom_mercedes_sale_recontact_email_respondent: recontactEmail(
    'X - Custom Mercedes Sale - E-mail Recontact respondent',
    campaignTypes.VEHICLE_SALE,
    true
  ),

  custom_mercedes_sale_recontact_email_non_respondent: recontactEmail(
    'X - Custom Mercedes Sale - E-mail Recontact non-respondent',
    campaignTypes.VEHICLE_SALE,
    false
  ),

  /** _____________________________________________ ALLIANCE (CARROSSERIE) _____________________________________________ **/
  contact_sms_1_alliance: contactSms('ALLIANCE - SMS #1 (Maintenance)', campaignTypes.MAINTENANCE, 'alliance', 1),

  /** _____________________________________________ CLIENT REPLY TO FINAL CLIENT _____________________________________________ **/
  email_reply: reply('REPLY - E-mail #1'),
};

function _filterContactsBy(type) {
  return configs.toArray.filter((c) => c.campaignType === type && !c.isRecontact && !c.followup && !c.isThank);
}

Object.keys(configs).forEach((key) => (configs[key].key = key)); // Add the key into variable "key"
configs.toArray = Object.values(configs).sort((c1, c2) => (c1.name < c2.name ? -1 : 1));
configs.byJob = {};
configs.recontacts = {}; // configs.toArray.filter((c) => (c.isRecontact));
configs.keys = configs.toArray.map((config) => config.key);
configs.recontacts.sms = configs.toArray.filter((c) => c.isRecontact && c.channel === 'sms');
configs.recontacts.emails = configs.toArray.filter((c) => c.isRecontact && c.channel === 'email');
campaignTypes.values().forEach((job) => {
  configs.byJob[job] = _filterContactsBy(job); // Filtered per job
});
configs.byThanks = {
  // classify thanks by types
  complete_satisfied: configs.toArray.filter((c) => c.isThank && c.key.indexOf('1') !== -1),
  complete_unsatisfied: configs.toArray.filter((c) => c.isThank && c.key.indexOf('2') !== -1),
  incomplete_satisfied: configs.toArray.filter((c) => c.isThank && c.key.indexOf('3') !== -1),
  incomplete_unsatisfied: configs.toArray.filter((c) => c.isThank && c.key.indexOf('4') !== -1),
};
// Special one because VEHICLE_SALE is VN and VO, so we concat them to each of them
configs.byJob[campaignTypes.NEW_VEHICLE_SALE] = configs.byJob[campaignTypes.NEW_VEHICLE_SALE].concat(
  configs.byJob[campaignTypes.VEHICLE_SALE]
);
configs.byJob[campaignTypes.USED_VEHICLE_SALE] = configs.byJob[campaignTypes.USED_VEHICLE_SALE].concat(
  configs.byJob[campaignTypes.VEHICLE_SALE]
);

// const values = Object.values(contacts).map((v) => v.name);
// const valuesWithoutRecontacts = Object.keys(contacts).filter(key => !contacts[key].isRecontact).map((key) => contacts[key].name);

const functions = {
  // values: (cb) => cb(null, values),
  // valuesWithoutRecontacts: (cb) => cb(null, valuesWithoutRecontacts),
  initialize: async (contactKey, data, cb) => {
    if (!configs[contactKey].followupType) {
      cb();
      return;
    } // Not a followup
    await generateFollowup(data, configs[contactKey].followupType);
    cb();
  },
  isEmail: (contactKey) => configs[contactKey].channel === 'email',
  isSms: (contactKey) => configs[contactKey].channel === 'sms',
  getThankKey: (thanks, isCompleted, isUnsatisfied) => {
    if (isCompleted && isUnsatisfied) return thanks.complete_unsatisfied;
    if (!isCompleted && isUnsatisfied) return thanks.incomplete_unsatisfied;
    return thanks.complete_satisfied; // We don't send Email 3 anymore cause we don't want to bother happy people
  },
  getFollowup(campaignType) {
    if (campaignTypes.isSale(campaignType)) {
      // For VN and VO
      return configs.sale_email_followup;
    } else if (campaignType === campaignTypes.MAINTENANCE) {
      return configs.maintenance_email_followup;
    } else if (campaignType === campaignTypes.VEHICLE_INSPECTION) {
      return configs.vehicle_inspection_email_followup;
    }
    console.error('campaignType not handle by getFollowup');
    return null;
  },
  /** ------------------------ THIS FUNCTION TEST IF ALL THE CONTACTS FILES EXISTS ------------------------ **/
  filesExistsErrors() {
    const base = `${__dirname}/../../..`;
    for (let i = 0; i < configs.toArray.length; i++) {
      const c = configs.toArray[i];
      if (c.templates.emailSubject && c.templates.type !== 'nuxtTemplate') {
        if (!fs.existsSync(`${base}/${c.templates.emailBody}`)) return `ERROR in body: ${c.key}`;
        if (c.templates.emailSubject.indexOf('.nunjucks') !== -1) {
          if (!fs.existsSync(`${base}/${c.templates.emailSubject}`)) return `ERROR in subject: ${c.key}`;
        }
      }
      if (c.templates.smsText && c.templates.type !== 'nuxtTemplate') {
        if (!fs.existsSync(`${base}/${c.templates.smsText}`))
          return `ERROR in sms: ${c.key}, ${base}/${c.templates.smsText} not found`;
      }
    }
    return null;
  },
};

const errors = functions.filesExistsErrors();
if (errors) console.error(errors); // EXECUTE THIS TO TEST TEMPLATE VALIDITY

module.exports = Object.freeze(Object.assign({}, functions, configs)); // Freeze it so we can't overwrite it.
