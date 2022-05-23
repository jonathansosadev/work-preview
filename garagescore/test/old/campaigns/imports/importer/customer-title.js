const importTitle = require('../../../../../common/lib/garagescore/data-file/importer/customer-type-gender-title');
const chai = require('chai');

const expect = chai.expect;
chai.should();

describe('Import title tests', () => {
  const checkCompany = (dataRecord, expected = 'Company') => {
    expect(dataRecord.importStats.dataPresence.customer.type).equal(true);
    expect(dataRecord.importStats.dataPresence.customer.title).equal(false);
    expect(dataRecord.importStats.dataPresence.customer.gender).equal(false);
    expect(dataRecord.importStats.dataPresence.customer.abbreviatedTitle).equal(false);

    expect(dataRecord.importStats.dataValidity.customer.type).equal(true);
    expect(dataRecord.importStats.dataValidity.customer.title).not.equal(true);
    expect(dataRecord.importStats.dataValidity.customer.gender).not.equal(true);
    expect(dataRecord.importStats.dataValidity.customer.abbreviatedTitle).not.equal(true);

    expect(dataRecord.customer.type).equal(expected);
  };

  it('test import Ets title type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'Ets' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      checkCompany(dataRecord);
    });
    done();
  });

  it('test import S A S title type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'S A S' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      checkCompany(dataRecord);
    });
    done();
  });

  it('test import SA title type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'SA' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      checkCompany(dataRecord);
    });
    done();
  });
  it('test import Adm title type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'Adm' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      checkCompany(dataRecord);
    });
    done();
  });

  it('test import SA title type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'SA' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      checkCompany(dataRecord);
    });
    done();
  });

  it('test import Ass title type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'Ass' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      checkCompany(dataRecord, 'NonProfit');
    });
    done();
  });

  it('test import customer title Mle type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'Mle' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      expect(dataRecord.importStats.dataPresence.customer.type).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.title).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.gender).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.abbreviatedTitle).equal(true);
      expect(dataRecord.importStats.dataValidity.customer.type).equal(true);
      expect(dataRecord.customer.type).equal('Individual');
      expect(dataRecord.customer.title).equal('Mademoiselle');
      expect(dataRecord.customer.abbreviatedTitle).equal('Mlle');
      expect(dataRecord.customer.gender).equal('F');
    });
    done();
  });

  it('test import customer title MrMe type is valid', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {}, dataFixes: {} } };
    const rowCells = { title: 'MrMe' };
    const options = { cellLabel: 'title' };
    importTitle(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;
      expect(dataRecord.importStats.dataPresence.customer.type).equal(true);
      expect(dataRecord.importStats.dataPresence.customer.title).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.gender).equal(false);
      expect(dataRecord.importStats.dataPresence.customer.abbreviatedTitle).equal(false);
      expect(dataRecord.importStats.dataValidity.customer.type).equal(true);
      expect(dataRecord.customer.type).equal('Joint');
    });
    done();
  });
});
