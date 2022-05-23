/**
 * This enumeration is used to detect the section from a url
 * The urls are taken from the common file: /lib/garagescore/urls
 */
import urls from '~/utils/urls';
import Enum from '~/utils/enum.js';

/**
 * The urls below are organize so if a url given is part of 2 section, we take the first one
 * Ex: /cockpit/leads THEN /cockpit
 * @type {string[]}
 * @private
 */

// TODO : this file use two different ways because it is used by nuxt and by legacy. It has to be cleaned

const _sectionsOrder = [
  'DARKBO',
  'GREYBO',
  'ADMIN',
  'ANALYTICS_APV',
  'ANALYTICS_VN',
  'ANALYTICS_VO',
  'ANALYTICS_LEADS',
  'ANALYTICS_TEAM',
  'ANALYTICS_MAP',
  'ANALYTICS',
  'COCKPIT_CONTACTS',
  'COCKPIT_LEAD',
  'COCKPIT_UNSATISFIED',
  'COCKPIT_REVIEWS',
  'COCKPIT_E-REPUTATION'
];

const routeEnum = new Enum({
  DARKBO: urls.getShortUrl('ADMIN_HOME'),
  GREYBO: urls.getShortUrl('GREY_BACKOFFICE_BASE'),
  ADMIN: urls.getShortUrl('ADMIN'),
  ANALYTICS_APV: urls.getShortUrl('ANALYTICS_APV'),
  ANALYTICS_VN: urls.getShortUrl('ANALYTICS_VN'),
  ANALYTICS_VO: urls.getShortUrl('ANALYTICS_VO'),
  ANALYTICS_LEADS: urls.getShortUrl('ANALYTICS_LEADS'),
  ANALYTICS_TEAM: urls.getShortUrl('ANALYTICS_TEAM'),
  ANALYTICS_MAP: urls.getShortUrl('ANALYTICS_MAP'),
  ANALYTICS: urls.getShortUrl('ANALYTICS_HOME'),
  COCKPIT_CONTACTS: urls.getShortUrl('COCKPIT_CONTACT_QUALIFICATION'),
  COCKPIT_LEAD: urls.getShortUrl('COCKPIT_LEAD'),
  COCKPIT_UNSATISFIED: urls.getShortUrl('COCKPIT_UNSATISFIED'),
  COCKPIT_REVIEWS: urls.getShortUrl('COCKPIT_HOME'),
  LOGIN_FAILED: 'LOGIN_FAILED' // Not a url
});

const getSection = (url) => {
  if (!url) return null;
  const uri = url.split('?')[0]; // We don't care about the query
  const secureUri = `${uri}/`; // This is a trick to always match urls sections, even if they don't end with '/'
  for (let i = 0; i < _sectionsOrder.length; i++) {
    if (secureUri.indexOf(routeEnum[_sectionsOrder[i]]) === 0) {
      return _sectionsOrder[i];
    }
  }
  return null;
}

const getSectionFromName = (name) => {
  switch (name) {
    case 'cockpit-leads': return 'COCKPIT_LEAD';
    case 'cockpit-unsatisfied': return 'COCKPIT_UNSATISFIED';
    case 'cockpit-admin': return 'ADMIN';
    case 'cockpit-admin-profile': return 'ADMIN';
    case 'cockpit-admin-users': return 'ADMIN';
    case 'cockpit-contacts': return 'COCKPIT_CONTACTS';
    case 'cockpit-satisfaction' : return 'COCKPIT_REVIEWS';
    case 'cockpit-analytics' : return 'ANALYTICS';
    case 'cockpit-analytics-id' : return 'ANALYTICS';
    case 'cockpit-e-reputation' : return 'COCKPIT_E-REPUTATION';
    case 'cockpit-e-reputation-suivi' : return 'COCKPIT_E-REPUTATION';
    case 'cockpit-e-reputation-widget' : return 'COCKPIT_E-REPUTATION';
    default: return null;
  }
}

export { routeEnum, getSection, getSectionFromName };
