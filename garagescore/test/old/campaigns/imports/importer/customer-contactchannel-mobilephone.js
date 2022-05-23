const importPhone = require('../../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-phones-fax');
const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('Import customer mobilephone:', () => {
  it('Correct phone FR', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: '0789764577' };
    const options = { cellLabels: { mobilePhone: 'mobilePhone', homePhone: 'homePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('+33789764577', 'Error on "mobilePhone"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Correct phone FR with ,', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: '07,89,76,45,77' };
    const options = { cellLabels: { mobilePhone: 'mobilePhone', homePhone: 'homePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('+33789764577', 'Error on "mobilePhone"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Correct phone PE', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: '991873312' };
    const options = { country: 'es_PE', cellLabels: { mobilePhone: 'mobilePhone', homePhone: 'homePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('+51991873312', 'Error on "mobilePhone"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Correct phone ES', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: '644008896' };
    const options = { country: 'es_ES', cellLabels: { mobilePhone: 'mobilePhone', homePhone: 'homePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('+34644008896', 'Error on "mobilePhone"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Correct phone US', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: '(248) 325-4022' };
    const options = { country: 'en_US', cellLabels: { mobilePhone: 'mobilePhone', homePhone: 'homePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('+12483254022', 'Error on "mobilePhone"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Empty phone', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = {};
    const options = { cellLabels: { mobilePhone: 'mobilePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(true, 'Error on "empty"');
      expect(mobilePhone).equal(undefined, 'Error on "mobilePhone"');
      expect(valid).equal(undefined, 'Error on "valid"');
      done();
    });
  });
  it('invalid phone', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: 'toto' };
    const options = { cellLabels: { mobilePhone: 'mobilePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('toto', 'Error on "mobilePhone"');
      expect(valid).equal(false, 'Error on "valid"');
      done();
    });
  });
  it('NC phone', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: 'NC' };
    const options = { cellLabels: { mobilePhone: 'mobilePhone' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const mobilePhone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(mobilePhone).equal('NC', 'Error on "email"');
      expect(valid).equal(false, 'Error on "valid"');
      done();
    });
  });
});

describe('Import customer phone from "email" field:', () => {
  it('Correct phone', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { 'Email individu': '0789764577' };
    const options = { cellLabels: { email: 'Email individu', mobilePhone: 'nope' } };
    importPhone(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.mobilePhone;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.mobilePhone;
      const phone =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.mobilePhone &&
        dataRecord.customer.contactChannel.mobilePhone.number;
      expect(empty).equal(false, 'Error on "empty"');
      expect(phone).equal('+33789764577', 'Error on "phone"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  /*  it('Empty email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { };
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email = dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(true, 'Error on "empty"');
      expect(email).equal(undefined, 'Error on "email"');
      expect(valid).equal(undefined, 'Error on "valid"');
      done();
    });
  });
  it('autocorrect email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: 'toto@gmail' };
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email = dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(false, 'Error on "empty"');
      expect(email).equal('toto@gmail.com', 'Error on "email"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('invalid email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { mobilePhone: 'toto' };
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email = dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(true, 'Error on "empty"');
      expect(email).equal(undefined, 'Error on "email"');
      expect(valid).equal(undefined, 'Error on "valid"');
      done();
    });
  });*/
});
