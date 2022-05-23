const debug = require('debug')('garagescore:test:data-file:importer'); // eslint-disable-line max-len,no-unused-vars
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const path = require('path');
const gsLogger = require('../../../../common/lib/garagescore/logger');

gsLogger.setLevel(gsLogger.LEVELS.ERROR);
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');
const chai = require('chai');

const expect = chai.expect;
chai.should();

const columns = require('./configs/generic-columns');
const vehicleMakes = require('./configs/generic-vehiclemakes');
const dataTypeFormatting = require('./configs/generic-types');

/*
 * Extract model and make from vin
 */
describe('* Extract model and make from vin', () => {
  it('test itra', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'csv',
        charset: 'utf8',
      },
      transformers: {
        fixedLengthToCsv:
          '6, 4, 12, 5, 50, 100, 50, 25, 5, 15, 8, 18, 2, 8, 9, 10, 1, 6, 4, 100, 16, 50, 100, 7, 10, 8, 8, 8, 8, 8, 1, 8, 6',
        headerlessCsv: {
          Maintenances: {
            header: ';;;;lastName;firstName;adress;city;postCode;mobilePhone;dataRecordCompletedAt;vin;;;;;;;;email',
          },
        },
      },
      defaults: {},
      format: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/fixed-length.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBufferFromJSONParser(
          importF,
          loadFileResult.fileBuffer,
          parserConfig,
          columns,
          vehicleMakes,
          dataTypeFormatting,
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withVehicleMake).equal(16);
            expect(importResult.validationDetails.withVehicleModel).equal(12);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
});
