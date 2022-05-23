const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const gsLogger = require('../../../../common/lib/garagescore/logger');
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const sharedFilters = require('../../../../common/lib/garagescore/data-file/shared-filters');

gsLogger.setLevel(gsLogger.LEVELS.ERROR);
const { expect } = chai;
chai.should();
/* eslint-disable max-len */
/**
 * Test imports with shared filters
 */
describe('Shared filters: test with one simple rule', () => {
  afterEach(function afterEach() {
    if (this.stubs) {
      this.stubs.restore();
    }
  });
  it('test cobrediamix - txt, without shared options', function test(done) {
    this.stubs = sinon.stub(sharedFilters, 'getConfig').callsFake(() => []);

    const importF = path.join(__dirname, 'data/cobrediamix1.txt');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise.then((loadFileResult) => {
      importer.validateImportFileBuffer(
        importF,
        loadFileResult.fileBuffer,
        'Cobredia/cobredia-mix.js',
        {},
        gsDataFileDataType.VEHICLESALES,
        '577a30d774616c1a0056c263',
        (err, importResult) => {
          expect(err).to.be.null;
          expect(importResult.isValid).equal(true);
          expect(importResult.validationDetails.withEmails).equal(9);
          expect(importResult.validationDetails.withMobile).equal(10);
          expect(importResult.validationDetails.withContactChannel).equal(11);
          expect(importResult.validationDetails.withName).equal(11);
          expect(importResult.validationDetails.withCity).equal(11);
          expect(importResult.validationDetails.withVehicleMake).equal(11);
          expect(importResult.validationDetails.withVehicleModel).equal(11);
          expect(importResult.validationDetails.withServiceProvidedAt).equal(11);
          expect(importResult.validationDetails.minServiceProvidedAt).equal('30/09/2016 00:00:00');
          expect(importResult.validationDetails.maxServiceProvidedAt).equal('30/09/2016 00:00:00');
          expect(importResult.validationDetails.rows).equal(11);
          expect(importResult.validationDetails.nbDuplicates).equal(4);
          expect(importResult.validationDetails.perType.Unknown).equal(11);
          done();
        }
      );
    });
  });

  it('test cobrediamix - txt, WITH shared options', function test(done) {
    const filter = {
      // ['['Civilite']= '2'']
      field: 'Civilite',
      filters: {
        not: ['1', '3', '4', '5'],
      },
    };
    this.stubs = sinon.stub(sharedFilters, 'getConfig').callsFake(() => [filter]);
    const importF = path.join(__dirname, 'data/cobrediamix1.txt');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise.then((loadFileResult) => {
      importer.validateImportFileBuffer(
        importF,
        loadFileResult.fileBuffer,
        'Cobredia/cobredia-mix.js',
        {},
        gsDataFileDataType.VEHICLESALES,
        '577a30d774616c1a0056c263',
        (err, importResult) => {
          expect(err).to.be.null;
          expect(importResult.isValid).equal(true);
          expect(importResult.validationDetails.withEmails).equal(1);
          expect(importResult.validationDetails.withMobile).equal(2);
          expect(importResult.validationDetails.withContactChannel).equal(2);
          expect(importResult.validationDetails.withName).equal(2);
          expect(importResult.validationDetails.withCity).equal(2);
          expect(importResult.validationDetails.withVehicleMake).equal(2);
          expect(importResult.validationDetails.withVehicleModel).equal(2);
          expect(importResult.validationDetails.withServiceProvidedAt).equal(2);
          expect(importResult.validationDetails.minServiceProvidedAt).equal('30/09/2016 00:00:00');
          expect(importResult.validationDetails.maxServiceProvidedAt).equal('30/09/2016 00:00:00');
          expect(importResult.validationDetails.rows).equal(2);
          expect(importResult.validationDetails.nbDuplicates).equal(0);
          expect(importResult.validationDetails.perType.Unknown).equal(2);
          done();
        }
      );
    });
  });
});
