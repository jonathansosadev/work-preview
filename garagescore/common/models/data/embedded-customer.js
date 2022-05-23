const Revisable = require('./definition-helpers').Revisable;
const RevisableContact = require('./definition-helpers').RevisableContact;
const cityNormalizer = require('../../lib/garagescore/customer/city-normalizer');
const gsCustomerUtil = require('../../lib/garagescore/customer/util');
const importCustomerEmail = require('../../lib/garagescore/data-file/importer/customer-contactchannel-email.js');
const importCustomerPhonesFax = require('../../lib/garagescore/data-file/importer/customer-contactchannel-phones-fax.js');
const StringUtil = require('../../lib/util/string');
const BlackListReason = require('../black-list-reason');
const { ObjectId } = require('mongodb');
const app = require('../../../server/server');

/*
 * A person, could also be a future customer (lead)
 */
const model = () => ({
  properties: {
    /* Were some data changed by the customer */
    isRevised: {
      type: 'boolean',
    },
    /* Was the data valided by the customer */
    isValidated: {
      type: 'boolean',
    },
    /* Last time some data has been revised */
    lastRevisionAt: {
      type: 'date',
    },
    /* the customer could allow to shareWithGarage his revised contact*/
    shareWithGarage: {
      type: 'boolean',
    },
    contact: {
      /* Email address */
      email: {
        type: RevisableContact,
      },
      /* Mobile phone number */
      mobilePhone: {
        type: RevisableContact,
      }
    },
    /* Personal data */
    gender: {
      type: Revisable,
    },
    title: {
      type: Revisable,
    },
    firstName: {
      type: Revisable,
    },
    lastName: {
      type: Revisable,
    },
    fullName: {
      type: Revisable,
    },
    street: {
      type: Revisable,
    },
    postalCode: {
      type: Revisable,
    },
    city: {
      type: Revisable,
    },
    countryCode: {
      type: Revisable,
    },
    /** RGPD consent */
    rgpd: {
      optOutMailing: {
        type: Revisable,
      },
      optOutSMS: {
        type: Revisable,
      },
    },
  },
});

const staticMethods = {};

const reviseEmbeddedTickets = (data, field, revisedValue, originalValue) => {
  const ticketTypes = ['leadTicket', 'unsatisfiedTicket'];
  ticketTypes.forEach((ticketType) => {
    if (!data.get(ticketType)) return;

    if (field === 'firstName' || field === 'lastName') {
      const fullNameInTicket = data.get(`${ticketType}.customer.fullName`);
      if (fullNameInTicket && fullNameInTicket.includes(originalValue)) {
        if (field === 'firstName') {
          const customerLastName = data.get('customer.lastName');
          data.set(`${ticketType}.customer.fullName`, [revisedValue, customerLastName].join(' '));
        }
        if (field === 'lastName') {
          const customerFirstName = data.get('customer.firstName');
          data.set(`${ticketType}.customer.fullName`, [customerFirstName, revisedValue].join(' '));
        }
      }
    } else {
      const valueInTicket = data.get(`${ticketType}.customer.${field}`);
      if (valueInTicket === originalValue) {
        data.set(`${ticketType}.customer.${field}`, revisedValue);
      }
    }
  });
};

/* Revise a field, use 'field.subfield' if you want to update an embeded field*/
function revise(field, revisedValue, options) {
  if (!revisedValue) {
    return;
  }
  const currentValue = this.get(`customer.${field}.value`);
  if (StringUtil.deepEquality(currentValue, revisedValue)) {
    this.set(`customer.${field}.isValidated`, revisedValue);
    return;
  }
  if (field === 'contact.email') {
    const dataRecord3 = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
    importCustomerEmail(dataRecord3, 0, { email: revisedValue }, { cellLabels: { email: 'email' } });
    if (
      dataRecord3.importStats.dataValidity.customer &&
      dataRecord3.importStats.dataValidity.customer.contactChannel &&
      dataRecord3.importStats.dataValidity.customer.contactChannel.email &&
      !StringUtil.deepEquality(currentValue, dataRecord3.customer.contactChannel.email.address)
    ) {
      revisedValue = dataRecord3.customer.contactChannel.email.address; // eslint-disable-line no-param-reassign
      this.set('customer.contact.email.originalContactStatus', this.get('campaign.contactStatus.emailStatus'));
      this.set('customer.contact.email.originalContactStatusExplain', this.campaign_explainEmailStatus());
      this.set(
        'campaign.contactStatus.hasOriginalBeenContactedByEmail',
        this.get('campaign.contactStatus.hasBeenContactedByEmail')
      );
      this.set('campaign.contactStatus.hasBeenContactedByEmail', false);
    } else {
      return;
    } // Invalid data is ignored
  }
  if (field === 'contact.mobilePhone') {
    const dataRecord1 = { importStats: { dataPresence: {}, dataNC: {}, dataValidity: {}, dataFixes: {} } };
    importCustomerPhonesFax(
      dataRecord1,
      0,
      { mobilePhone: revisedValue },
      { cellLabels: { mobilePhone: 'mobilePhone' }, country: options && options.country }
    );
    if (
      dataRecord1.importStats.dataValidity.customer &&
      dataRecord1.importStats.dataValidity.customer.contactChannel &&
      dataRecord1.importStats.dataValidity.customer.contactChannel.mobilePhone &&
      !StringUtil.deepEquality(currentValue, dataRecord1.customer.contactChannel.mobilePhone.number)
    ) {
      revisedValue = dataRecord1.customer.contactChannel.mobilePhone.number; // eslint-disable-line no-param-reassign
      this.set('customer.contact.mobilePhone.originalContactStatus', this.get('campaign.contactStatus.phoneStatus'));
      this.set('customer.contact.mobilePhone.originalContactStatusExplain', this.campaign_explainPhoneStatus());
      this.set(
        'campaign.contactStatus.hasOriginalBeenContactedByPhone',
        this.get('campaign.contactStatus.hasBeenContactedByPhone')
      );
      this.set('campaign.contactStatus.hasBeenContactedByPhone', false);
    } else {
      return;
    } // Invalid data is ignored
  }
  if (field.match(/^contact/)) {
    this.set(`customer.${field}.isOriginalUnsubscribed`, this.get(`customer.${field}.isUnsubscribed`));
    this.set(`customer.${field}.isOriginalDropped`, this.get(`customer.${field}.isDropped`));
    this.set(`customer.${field}.isOriginalComplained`, this.get(`customer.${field}.isComplained`));
    this.set(`customer.${field}.isUnsubscribed`, false);
    this.set(`customer.${field}.isDropped`, false);
    this.set(`customer.${field}.isComplained`, false);
  }
  this.set(`customer.${field}.isOriginalSyntaxOK`, this.get(`customer.${field}.isSyntaxOK`));
  this.set(`customer.${field}.isOriginalEmpty`, this.get(`customer.${field}.isSyntaxOK`));
  this.set(`customer.${field}.value`, revisedValue);
  this.set(`customer.${field}.isSyntaxOK`, true);
  this.set(`customer.${field}.isEmpty`, false);
  this.set(`customer.${field}.revised`, revisedValue);
  this.set(`customer.${field}.revisedAt`, new Date());
  reviseEmbeddedTickets(this, field, revisedValue, currentValue);
}
// compute city normalizd name using our kb and the postcode
const getCityNormalizedName = function getCityNormalizedName() {
  const name = this.get('customer.city');
  if (name) {
    const postCode = this.get('customer.postalCode');
    return cityNormalizer.normalize(name, postCode) || name;
  }
  return undefined;
};
// Anonymize fullName
const getAbbreviatedTitle = function getCustomerPublicDisplayName() {
  const titleProps = Object.values(gsCustomerUtil.CustomerTitleProperties);
  for (let i = 0; i < titleProps.length; i++) {
    if (this.get('customer.title.value') === titleProps[i].title) {
      return titleProps[i].abbreviatedTitle;
    }
  }
  return null;
};
const _cleanupName = (name) =>
  name
    .replace('-', ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((w) => (w[0] ? `${w[0]}.` : ''))
    .join(' ')
    .toUpperCase();
// Anonymize fullName
const getCustomerPublicDisplayName = function getCustomerPublicDisplayName() {
  try {
    const firstName = this.get('customer.firstName') || '';
    const lastName = this.get('customer.lastName') || '';
    const fullName = this.get('customer.fullName') || '';
    const isRevised = this.get('customer.isRevised');
    // we dont anymore if the firstname is not the lastname
    if (isRevised && typeof fullName === 'string') {
      return _cleanupName(fullName);
    }
    /*
     * Use case:
     *   firstName and lastName are populated
     *   "Eric", "Redon" → "Eric R."
     */
    if (firstName && lastName) {
      return `${firstName} ${lastName[0] ? `${lastName[0]}.` : ''}`;
    }
    /*
     * Use case:
     *   fullName is populated
     *   "Eric Redon" → "E. R."
     */
    if (typeof fullName === 'string') {
      return _cleanupName(fullName);
    }
  } catch (e) {
    console.error(e);
    console.error(JSON.stringify(this));
  }
  return '(Anonyme)';
};

const getCustomerFullName = function getCustomerFullName() {
  const fullName = this.get('customer.fullName');
  if (fullName) {
    return fullName;
  }
  const firstName = this.get('customer.firstName');
  const lastName = this.get('customer.lastName');
  /*
   * Use case:
   *   firstName and lastName are populated
   *   "Eric", "Redon" → "Eric Redon"
   */

  return `${lastName} ${firstName}`;
};

const prototypeMethods = {
  revise,
  getCityNormalizedName,
  getAbbreviatedTitle,
  getCustomerPublicDisplayName,
  getCustomerFullName,
};
const consistencyChecks = {
  /** update isRevised to true if some data are revised
   * update the current value if different from the revised value
   * update the lastRevisionAt with the newest revisedAt : TODO
   */
  revision: (data) => {
    if (!data.customer) {
      return;
    }
    const d = data.customer;
    if (d.contact && d.contact.email && d.contact.email.revised) {
      d.isRevised = true;
      d.contact.email.value = d.contact.email.revised;
    }
    if (d.contact && d.contact.mobilePhone && d.contact.mobilePhone.revised) {
      d.isRevised = true;
      d.contact.mobilePhone.value = d.contact.mobilePhone.revised;
    }
    if (d.gender && d.gender.revised) {
      d.customer.isRevised = true;
      d.gender.value = d.gender.revised;
    }
    if (d.title && d.title.revised) {
      d.title.value = d.title.revised;
    } // #1764 don't change d.customer.isRevised anymore !
    if (d.lastName && d.lastName.revised) {
      d.customer.isRevised = true;
      d.lastName.value = d.lastName.revised;
    }
    if (d.firstName && d.firstName.revised) {
      d.customer.isRevised = true;
      d.firstName.value = d.firstName.revised;
    }
    if (d.fullName && d.fullName.revised) {
      d.customer.isRevised = true;
      d.fullName.value = d.fullName.revised;
    }
    if (d.street && d.street.revised) {
      d.customer.isRevised = true;
      d.street.value = d.street.revised;
    }
    if (d.postalCode && d.postalCode.revised) {
      d.customer.isRevised = true;
      d.postalCode.value = d.postalCode.revised;
    }
    if (d.city && d.city.revised) {
      d.customer.isRevised = true;
      d.city.value = d.city.revised;
    }
    if (d.countryCode && d.countryCode.revised) {
      d.customer.isRevised = true;
      d.countryCode.value = d.countryCode.revised;
    }
    if (d.email && d.email.revised) {
      d.customer.isRevised = true;
      d.email.value = d.email.revised;
    }
  },
};

module.exports = { model, staticMethods, prototypeMethods, consistencyChecks };
