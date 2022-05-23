const importEmail = require('../../../../../common/lib/garagescore/data-file/importer/customer-contactchannel-email');
const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('Import customer email:', () => {
  it('Correct email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { Email: 'toto@gmail.com' };
    const options = { cellLabels: { email: 'Email' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(false, 'Error on "empty"');
      expect(email).equal('toto@gmail.com', 'Error on "email"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Empty email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = {};
    const options = { cellLabels: { email: 'Email' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(true, 'Error on "empty"');
      expect(email).equal(undefined, 'Error on "email"');
      expect(valid).equal(undefined, 'Error on "valid"');
      done();
    });
  });
  it('NC email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { Email: 'NC' };
    const options = { cellLabels: { email: 'Email' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(true, 'Error on "empty"');
      expect(email).equal('NC', 'Error on "email"');
      expect(valid).equal(false, 'Error on "valid"');
      done();
    });
  });
  it('autocorrect email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { Email: 'toto@gmail' };
    const options = { cellLabels: { email: 'Email' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
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
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { Email: 'toto' };
    const options = { cellLabels: { email: 'Email' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(true, 'Error on "empty"');
      expect(email).equal('toto', 'Error on "email"');
      expect(valid).equal(false, 'Error on "valid"');
      done();
    });
  });
});
// same but in mobile field
describe('Import customer email from "mobile" field:', () => {
  it('Correct email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { mobilePhone: 'toto@gmail.com' };
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(false, 'Error on "empty"');
      expect(email).equal('toto@gmail.com', 'Error on "email"');
      expect(valid).equal(true, 'Error on "valid"');
      done();
    });
  });
  it('Empty email', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = {};
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
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
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { mobilePhone: 'toto@gmail' };
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
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
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {}, dataNC: {} } };
    const rowCells = { mobilePhone: 'toto' };
    const options = { cellLabels: { email: 'nope', mobilePhone: 'mobilePhone' } };
    importEmail(dataRecord, 1, rowCells, options, (e) => {
      e && console.error(e);
      const empty = !dataRecord.importStats.dataPresence.customer.contactChannel.email;
      const valid = dataRecord.importStats.dataValidity.customer.contactChannel.email;
      const email =
        dataRecord.customer &&
        dataRecord.customer.contactChannel &&
        dataRecord.customer.contactChannel.email &&
        dataRecord.customer.contactChannel.email.address;
      expect(empty).equal(true, 'Error on "empty"');
      expect(email).equal(undefined, 'Error on "email"');
      expect(valid).equal(undefined, 'Error on "valid"');
      done();
    });
  });
});
