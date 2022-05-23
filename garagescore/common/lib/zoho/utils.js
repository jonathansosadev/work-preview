const zoho = require('./zoho-api');
const moment = require('moment');
const { getDeepFieldValue } = require('../util/object.js');

const forceFields = [
  // Those are the fields that can be empty and still be a good value, example: Rating=0 is correct, push this update
  'EReputation',
  'Lead',
  'UsedVehicleSale',
  'NewVehicleSale',
  'Maintenance',
  'VehicleInspection',
  'Analytics',
  'EReputationPrice',
  'LeadPrice',
  'Automation',
  'AutomationPrice',
  'Xleads',
  'XleadsPrice',
  'UsedVehicleSalePrice',
  'NewVehicleSalePrice',
  'MaintenancePrice',
  'VehicleInspectionPrice',
  'AnalyticsPrice',
  'validEmailPercentage',
  'respondentPercentage',
  'recontactPercentage',
  'leadConversionPercentage',
  'countConversions',
  'countPotentialSales',
  'countFollowupResponded',
  'countFollowupResponseQid122',
  'countSurveys',
  'countSurveysResponded',
  'totalShouldSurfaceInCampaignStats',
  'countValidEmails',
  'Rating',
  'boolean_fichier_vide',
  'date_fichier_vide',
  'text_fichier_vide',
  'boolean_pas_de_campagne',
  'date_pas_de_campagne',
  'text_pas_de_campagne',
  'MiroirCusteed',
  'xleads_sources_subscribed',
  'xleads_sources_email_parsed_last_week',
  'xleads_sources_call_parsed_last_week',
  'debut_abo',
  'boolean_source_xleads_disable',
  'source_xleads_disable',
  'date_source_xleads_disable',
  'M_M',
  'M_M_14',
  'M_M_23',
  'M_M_26',
  'M_M_35',
  'M_UVS',
  'M_UVS_14',
  'M_UVS_23',
  'M_UVS_26',
  'M_UVS_35',
  'VS_M_11',
  'VS_M_12',
  'VS_M_6',
  'VS_UVS_18',
  'VS_UVS_24',
  'xleads_z_LaCentrale_z_lastEmail',
  'xleads_z_LaCentrale_z_lastCall',
  'xleads_z_LaCentrale_z_createdAt',
  'xleads_z_LeBoncoin_z_lastEmail',
  'xleads_z_LeBoncoin_z_lastCall',
  'xleads_z_LeBonCoin_z_createdAt',
  'xleads_z_Largus_z_lastEmail',
  'xleads_z_Largus_z_lastCall',
  'xleads_z_Largus_z_createdAt',
  'xleads_z_ParuVendu_z_lastEmail',
  'xleads_z_ParuVendu_z_lastCall',
  'xleads_z_ParuVendu_z_createdAt',
  'xleads_z_Promoneuve_z_lastEmail',
  'xleads_z_Promoneuve_z_lastCall',
  'xleads_z_Promoneuve_createdAt',
  'xleads_z_Zoomcar_z_lastEmail',
  'xleads_z_Zoomcar_z_lastCall',
  'xleads_z_Zoomcar_createdAt',
  'xleads_z_OuestFranceAuto_z_lastEmail',
  'xleads_z_OuestFranceAuto_z_lastCall',
  'xleads_z_OuestFranceAuto_createdAt',
  'xleads_z_CustomVn_z_lastEmail',
  'xleads_z_CustomVn_z_lastCall',
  'xleads_z_CustomVn_createdAt',
  'xleads_z_CustomVo_z_lastEmail',
  'xleads_z_CustomVo_z_lastCall',
  'xleads_z_CustomVo_createdAt',
  'xleads_z_CustomApv_z_lastEmail',
  'xleads_z_CustomApv_z_lastCall',
  'xleads_z_CustomApv_createdAt',
  'xleads_z_EkonsilioVn_z_lastEmail',
  'xleads_z_EkonsilioVn_z_lastCall',
  'xleads_z_EkonsilioVn_createdAt',
  'xleads_z_EkonsilioVo_z_lastEmail',
  'xleads_z_EkonsilioVo_z_lastCall',
  'xleads_z_EkonsilioVo_createdAt',
  'exogenous_z_Google_z_connected',
  'exogenous_z_Google_z_error',
  'exogenous_z_Facebook_z_connected',
  'exogenous_z_Facebook_z_error',
  'exogenous__PagesJaunes__connected',
  'exogenous__PagesJaunes__error',
  'XleadsSourcesCosts',
  'UserCosts',
  'Coaching',
  'CoachingPrice',
];

const emptyValues = [0, 'Non renseigné', '0', null, '', 'Unknown'];
const isEqual = (oldValue, newValue) =>
  newValue === oldValue ||
  (!newValue && !oldValue) ||
  (typeof newValue === 'number' && parseInt(oldValue, 10) === newValue) ||
  (Array.isArray(newValue) && Array.isArray(oldValue) && !newValue.find((v) => !oldValue.includes(v))) ||
  (typeof newValue === 'string' && typeof oldValue === 'string' && newValue.trim() === oldValue.trim());

module.exports = {
  getUpdate: async (transforms, field, zohoEntity, mongo, ...additionalParams) => {
    let newValue = null;
    const oldValue = zohoEntity[field];
    if (field.match(/^xleads_z_|^exogenous_z_/)) {
      [, source, property] = field.split('_z_')
      newValue = transforms.handleSourcesProperties(source, property, ...additionalParams)
    }
    else if (!transforms[field]) return null;
    else if (typeof transforms[field] === 'function') newValue = await transforms[field](mongo, ...additionalParams);
    else if (typeof transforms[field] === 'string') newValue = getDeepFieldValue(mongo, transforms[field]);
    else return null;
    if (isEqual(oldValue, newValue)) return null; // No modification needed !
    if (emptyValues.includes(newValue) && emptyValues.includes(oldValue)) return null; // No modification needed !
    if (!newValue && oldValue && !forceFields.includes(field) && !emptyValues.includes(oldValue)) {
      // Do not erase the value if exists
      zoho.addlogs(
        `<-- GS (${transforms[field]}) (${mongo.id.toString()}) "${newValue}". Zoho (${field}) ${zohoEntity.id
        } "${oldValue}"`
      );
      return null;
    }
    if (typeof newValue === 'undefined') return null; // No modification needed.
    return { field, oldValue, newValue };
  },
  getLastWeekPeriod: () => {
    const max = moment().hours(0).minutes(0).seconds(0).milliseconds(0);
    const min = max.clone().subtract(7, 'd');
    return { min, max };
  },
  formatZohoDate: (date) => (date && moment(date).format('YYYY-MM-DD')) || null,
};
