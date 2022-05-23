const chai = require('chai');
const sinon = require('sinon');

const path = require('path');
const importName = require('../../../../common/lib/garagescore/data-file/importer/price');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');
const sharedFilters = require('../../../../common/lib/garagescore/data-file/shared-filters');

const { expect } = chai;
chai.should();

describe('Import price:', () => {
  before(function before() {
    this.stubs = sinon.stub(sharedFilters, 'getConfig').callsFake(() => []);
  });
  after(function after() {
    if (this.stubs) {
      this.stubs.restore();
    }
  });
  it('test import price function', (done) => {
    const dataRecord = { importStats: { dataPresence: {}, dataValidity: {} } };
    const rowCells = { TarifTTC: '164,02' };
    const options = { cellLabel: 'TarifTTC', transformer: (c, v) => v };
    importName(dataRecord, 0, rowCells, options, (error) => {
      expect(error).to.be.null;

      expect(dataRecord.importStats.dataPresence.price).equal(true);
      expect(dataRecord.importStats.dataValidity.price).equal(true);

      expect(dataRecord.price).equal(164.02);
      done();
    });
  });

  it('test sofida csv', function test(done) {
    const importF = path.join(__dirname, 'data/sofida.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Carbase/sofida-csv.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withPrice).equal(88);
            expect(importResult.validationDetails.perType.Maintenance).equal(88);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test sofida csv', function test(done) {
    const importF = path.join(__dirname, 'data/cobrediamix1.txt');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Cobredia/cobredia-mix.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withPrice).equal(11);
            expect(importResult.validationDetails.perType.Maintenance).equal(11);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
});
