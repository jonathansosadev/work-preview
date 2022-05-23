const importCustomerPhonesFax = require('../data-file/importer/customer-contactchannel-phones-fax.js');
const importCustomerEmail = require('../data-file/importer/customer-contactchannel-email.js');
const importCustomerSnailMail = require('../data-file/importer/customer-contactchannel-snailmail.js');
const importCustomerName = require('../data-file/importer/customer-name.js');
const importCustomerTypeGenderTitle = require('../data-file/importer/customer-type-gender-title.js');
const lodash = require('lodash');

module.exports = {
  getFromRawData: function getFromRawData(data) {
    let dataRecord = null;
    const dataRecord1 = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
    importCustomerPhonesFax(dataRecord1, 0, data, { cellLabels: { mobilePhone: 'mobilePhone' } });
    if (
      dataRecord1.importStats.dataValidity.customer &&
      dataRecord1.importStats.dataValidity.customer.contactChannel &&
      dataRecord1.importStats.dataValidity.customer.contactChannel.mobilePhone
    ) {
      dataRecord = lodash.merge(dataRecord, dataRecord1);
    }
    const dataRecord2 = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
    importCustomerSnailMail(dataRecord2, 0, data, {
      cellLabels: { city: 'city', postCode: 'postCode', streetAddress: 'streetAddress', countryCode: 'countryCode' },
    });
    if (
      dataRecord2.importStats.dataValidity.customer &&
      dataRecord2.importStats.dataValidity.customer.contactChannel &&
      dataRecord2.importStats.dataValidity.customer.contactChannel.snailMail &&
      dataRecord2.importStats.dataValidity.customer.contactChannel.snailMail.city &&
      dataRecord2.importStats.dataValidity.customer.contactChannel.snailMail.postCode &&
      dataRecord2.importStats.dataValidity.customer.contactChannel.snailMail.streetAddress &&
      dataRecord2.importStats.dataValidity.customer.contactChannel.snailMail.countryCode
    ) {
      dataRecord = lodash.merge(dataRecord, dataRecord2);
    }
    const dataRecord3 = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
    importCustomerEmail(dataRecord3, 0, data, { cellLabels: { email: 'email' } });
    if (
      dataRecord3.importStats.dataValidity.customer &&
      dataRecord3.importStats.dataValidity.customer.contactChannel &&
      dataRecord3.importStats.dataValidity.customer.contactChannel.email
    ) {
      dataRecord = lodash.merge(dataRecord, dataRecord3);
    }
    const dataRecord4 = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
    importCustomerName(dataRecord4, 0, data, {
      cellLabels: { fullName: 'fullName' },
      transformer: (a, b) => b,
    });
    if (dataRecord4.importStats.dataValidity.customer && dataRecord4.importStats.dataValidity.customer.fullName) {
      dataRecord = lodash.merge(dataRecord, dataRecord4);
    }
    const dataRecord5 = { importStats: { dataPresence: {}, dataValidity: {}, dataNC: {}, dataFixes: {} } };
    importCustomerTypeGenderTitle(dataRecord5, 0, data, { cellLabel: 'title' });
    if (dataRecord5.importStats.dataValidity.customer && dataRecord5.importStats.dataValidity.customer.title) {
      dataRecord = lodash.merge(dataRecord, dataRecord5);
    }
    return dataRecord;
  },
};
