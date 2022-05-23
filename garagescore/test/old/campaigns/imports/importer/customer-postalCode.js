const importCustomerSnailMail = require('../../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-snailmail');
const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('Import customer postalCode from dataFile :', () => {
  it('test import value postalCode with 4 chars', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { postCode: '4270', city: 'city' };
    const options = { cellLabels: { postCode: 'postCode', city: 'city' } };
    importCustomerSnailMail(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      expect(dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.postCode).equal(true);
      expect(dataRecord.customer.contactChannel.snailMail.postCode).equal('04270');
    });
    done();
  });

  it('test import value postalCode with 5 chars', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { postCode: '94270', city: 'city' };
    const options = { cellLabels: { postCode: 'postCode', city: 'city' } };
    importCustomerSnailMail(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      expect(dataRecord.importStats.dataPresence.customer.contactChannel.snailMail.postCode).equal(true);
      expect(dataRecord.customer.contactChannel.snailMail.postCode).equal('94270');
    });
    done();
  });
});
