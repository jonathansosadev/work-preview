const path = require('path');
const sinon = require('sinon');
const chai = require('chai');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const gsLogger = require('../../../../common/lib/garagescore/logger');
const dataTypesEnum = require('../../../../common/models/data/type/data-types');

gsLogger.setLevel(gsLogger.LEVELS.ERROR);
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');
const sharedFilters = require('../../../../common/lib/garagescore/data-file/shared-filters');

const { expect } = chai;

chai.should();

const columns = require('./configs/generic-columns');
const solwareColumns = require('./configs/solware-columns');
const vehicleMakes = require('./configs/generic-vehiclemakes');
const dataTypeFormatting = require('./configs/generic-types');

let stubs;
/*
 * Test imports with parsers dynamically created
 */
describe('Test imports with parsers dynamically created:', () => {
  before(() => {
    stubs = sinon.stub(sharedFilters, 'getConfig').callsFake(() => []);
  });
  after(() => {
    if (stubs) {
      stubs.restore();
    }
  });
  it('test generic mix xlsx - MIXED', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'xlsx',
        worksheetName: '#first#',
      },
      format: {
        dataRecordCompletedAt: 'DD/MM/YYYY hh:mm',
        vehicleRegistrationFirstRegisteredAt: 'dd/mm/yyyy',
      },
      transformers: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/generic_mixed_test.xls');
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
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withEmails).equal(442);
            expect(importResult.validationDetails.withMobile).equal(456);
            expect(importResult.validationDetails.withContactChannel).equal(484);
            expect(importResult.validationDetails.withName).equal(492);
            expect(importResult.validationDetails.withCity).equal(489);
            expect(importResult.validationDetails.withVehicleMake).equal(491);
            expect(importResult.validationDetails.withVehicleModel).equal(484);
            expect(importResult.validationDetails.withVehicleVIN).equal(492);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(492);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('09/05/2016 16:47:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('21/07/2016 18:11:00');
            expect(importResult.validationDetails.rows).equal(492);
            expect(importResult.validationDetails.nbDuplicates).equal(17);
            expect(importResult.validationDetails.perType.Unknown).equal(58);
            expect(importResult.validationDetails.perType.Maintenance).equal(431);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(2);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(1);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test headerless file with transform and ignore lines', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'csv',
        charset: 'UTF-8',
        ignoreFirstXLines: 1,
      },
      transformers: {
        tsvToCsv: '1',
        colsizeCsv: '59',
        headerlessCsv: {
          Maintenances: {
            header:
              ';;ID société;providedCustomerId;providedGarageId;;;dataRecordCompletedAt;;;;vehicleRegistrationPlate;vehicleMileage;providedFrontDeskUserName;;;;;;;;' + // eslint-disable-line
              'gender;lastName;firstName;;;postCode;city;;;officePhone;mobilePhone;homePhone;fax;email;;;;;flagOptOut;;vehicleMake;;vehicleModel;;;;;;vehicleRegistrationFirstRegisteredAt', // eslint-disable-line
          },
        },
      },
      format: {
        dataRecordCompletedAt: 'YYYY-MM-DD',
        vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
      },
      id: '1',
    };
    const importF = path.join(__dirname, 'data/headerless.txt');
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
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(24);
            expect(importResult.validationDetails.withMobile).equal(28);
            expect(importResult.validationDetails.withContactChannel).equal(39);
            expect(importResult.validationDetails.withName).equal(45);
            expect(importResult.validationDetails.withCity).equal(45);
            expect(importResult.validationDetails.withVehicleMake).equal(45);
            expect(importResult.validationDetails.withVehicleModel).equal(30);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(45);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('08/11/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('17/11/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(45);
            expect(importResult.validationDetails.nbDuplicates).equal(28);
            expect(importResult.validationDetails.perType.Maintenance).equal(45);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test specific data format', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'csv',
        charset: 'win1252',
      },
      transformers: {
        tsvToCsv: '1',
        colsizeCsv: '59',
        headerlessCsv: {
          MixedVehicleSales: {
            header:
              'providedCustomerId;gender;firstName;lastName;postCode;city;;homePhone;mobilePhone;officePhone;fax;email;;;;;vehicleRegistrationPlate;vehicleMake;vehicleModel;rowType;;;dataRecordCompletedAt;VIN;Société;providedGarageId;providedFrontDeskUserName', // eslint-disable-line
          },
        },
      },
      format: {
        dataRecordCompletedAt: { VehicleSale: 'DD/MM/YYYY', Unknown: 'DD/MM/YYYY' },
        vehicleRegistrationFirstRegisteredAt: 'YYYY-MM-DD',
      },
      id: '1',
    };
    const importF = path.join(__dirname, 'data/dmd-mixedvehiclesales.csv');
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
          gsDataFileDataType.VEHICLE_SALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.minServiceProvidedAt).equal('08/02/2017 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('08/02/2017 00:00:00');
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test comma to semicolon', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'csv',
        charset: 'win1252',
      },
      transformers: {
        vsvToCsv: '1',
      },
      format: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/csv-with-commas.csv');
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
          gsDataFileDataType.VEHICLE_SALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.rows).equal(3);
            expect(importResult.validationDetails.withCity).equal(3);
            expect(importResult.validationDetails.withContactChannel).equal(2);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test pipe to semicolon', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'csv',
        charset: 'win1252',
      },
      transformers: {
        psvToCsv: '1',
      },
      format: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/csv-with-pipe.csv');
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
          gsDataFileDataType.VEHICLE_SALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.rows).equal(3);
            expect(importResult.validationDetails.withCity).equal(3);
            expect(importResult.validationDetails.withContactChannel).equal(2);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  // Test Types with a custom type formatter
  it('test Solware - custom type formatter', function test(done) {
    const parserConfig = {
      _reference: 'solware',
      foreigns: {
        parserColumnsId: '5a15c5d7d39ff913008881c1',
        parserVehicleMakesId: '586a5f57faa7521a00513ca4',
      },
      fileformat: {
        format: 'xml',
        charset: 'UTF-8',
        ignoreFirstXLines: '',
        worksheetName: '',
        path: 'DATA.CLIENTS.CLIENT',
      },
      format: {
        dataRecordCompletedAt: {
          Maintenance: 'YYYY-MM-DDThh:mm:ss',
          VehicleSale: 'YYYY-MM-DDThh:mm:ss',
          NewVehicleSale: 'YYYY-MM-DDThh:mm:ss',
          UsedVehicleSale: 'YYYY-MM-DDThh:mm:ss',
          Unknown: 'YYYY-MM-DDThh:mm:ss',
          ExogenousLead: '',
        },
        vehicleRegistrationFirstRegisteredAt: '',
      },
      transformers: {
        tsvToCsv: '',
        colsizeCsv: null,
        headerlessCsv: {
          Maintenances: {
            header: '',
          },
          NewVehicleSales: {
            header: '',
          },
          UsedVehicleSales: {
            header: '',
          },
          MixedVehicleSales: {
            header: '',
          },
          Mixed: {
            header: '',
          },
        },
      },
      id: '5a15a078a6cac81300099eb4',
      createdAt: '2017-11-22T16:06:16.721Z',
      updatedAt: '2017-11-22T18:46:20.904Z',
    };
    const importF = path.join(__dirname, 'data/solware-test.xml');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    const dataTypesFormatter = {};
    dataTypesFormatter[dataTypesEnum.MAINTENANCE] = ['1'];
    dataTypesFormatter[dataTypesEnum.NEW_VEHICLE_SALE] = ['5'];
    dataTypesFormatter[dataTypesEnum.USED_VEHICLE_SALE] = ['6'];

    promise
      .then((loadFileResult) => {
        importer.validateImportFileBufferFromJSONParser(
          importF,
          loadFileResult.fileBuffer,
          parserConfig,
          solwareColumns,
          vehicleMakes,
          dataTypesFormatter,
          {},
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withEmails).equal(3);
            expect(importResult.validationDetails.withMobile).equal(5);
            expect(importResult.validationDetails.withName).equal(5);
            expect(importResult.validationDetails.withCity).equal(5);
            expect(importResult.validationDetails.withVehicleMake).equal(2);
            expect(importResult.validationDetails.withVehicleModel).equal(5);
            expect(importResult.validationDetails.withContactChannel).equal(5);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(5);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('31/05/2018 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('31/05/2018 00:00:00');
            expect(importResult.validationDetails.rows).equal(5);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            expect(importResult.validationDetails.perType.Unknown).equal(0);
            expect(importResult.validationDetails.perType.Maintenance).equal(1);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(2);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(2);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  // Test optionnal date
  it('test without date and optional date enabled', function test(done) {
    const parserConfig = {
      _reference: 'solware',
      foreigns: {
        parserColumnsId: '5a15c5d7d39ff913008881c1',
        parserVehicleMakesId: '586a5f57faa7521a00513ca4',
      },
      fileformat: {
        format: 'xml',
        charset: 'UTF-8',
        ignoreFirstXLines: '',
        worksheetName: '',
        path: 'DATA.CLIENTS.CLIENT',
      },
      format: {
        dataRecordCompletedAt: {
          Maintenance: 'YYYY-MM-DDThh:mm:ss',
          VehicleSale: 'YYYY-MM-DDThh:mm:ss',
          NewVehicleSale: 'YYYY-MM-DDThh:mm:ss',
          UsedVehicleSale: 'YYYY-MM-DDThh:mm:ss',
          Unknown: 'YYYY-MM-DDThh:mm:ss',
          ExogenousLead: '',
        },
        vehicleRegistrationFirstRegisteredAt: '',
      },
      transformers: {
        tsvToCsv: '',
        colsizeCsv: null,
        headerlessCsv: {
          Maintenances: {
            header: '',
          },
          NewVehicleSales: {
            header: '',
          },
          UsedVehicleSales: {
            header: '',
          },
          MixedVehicleSales: {
            header: '',
          },
          Mixed: {
            header: '',
          },
        },
      },
      optionalCompletedAt: true,
      id: '5a15a078a6cac81300099eb4',
      createdAt: '2017-11-22T16:06:16.721Z',
      updatedAt: '2017-11-22T18:46:20.904Z',
    };
    const importF = path.join(__dirname, 'data/no-date-test.xml');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    const dataTypesFormatter = {};
    dataTypesFormatter[dataTypesEnum.MAINTENANCE] = ['1'];
    dataTypesFormatter[dataTypesEnum.NEW_VEHICLE_SALE] = ['5'];
    dataTypesFormatter[dataTypesEnum.USED_VEHICLE_SALE] = ['6'];

    promise
      .then((loadFileResult) => {
        importer.validateImportFileBufferFromJSONParser(
          importF,
          loadFileResult.fileBuffer,
          parserConfig,
          solwareColumns,
          vehicleMakes,
          dataTypesFormatter,
          {},
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withEmails).equal(3);
            expect(importResult.validationDetails.withMobile).equal(5);
            expect(importResult.validationDetails.withName).equal(5);
            expect(importResult.validationDetails.withCity).equal(5);
            expect(importResult.validationDetails.withVehicleMake).equal(2);
            expect(importResult.validationDetails.withVehicleModel).equal(5);
            expect(importResult.validationDetails.withContactChannel).equal(5);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(5);
            expect(importResult.validationDetails.rows).equal(5);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            expect(importResult.validationDetails.perType.Unknown).equal(0);
            expect(importResult.validationDetails.perType.Maintenance).equal(1);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(2);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(2);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  // Test Types with a custom type formatter
  it('test without date and optional date disabled', function test(done) {
    const parserConfig = {
      _reference: 'solware',
      foreigns: {
        parserColumnsId: '5a15c5d7d39ff913008881c1',
        parserVehicleMakesId: '586a5f57faa7521a00513ca4',
      },
      fileformat: {
        format: 'xml',
        charset: 'UTF-8',
        ignoreFirstXLines: '',
        worksheetName: '',
        path: 'DATA.CLIENTS.CLIENT',
      },
      format: {
        dataRecordCompletedAt: {
          Maintenance: 'YYYY-MM-DDThh:mm:ss',
          VehicleSale: 'YYYY-MM-DDThh:mm:ss',
          NewVehicleSale: 'YYYY-MM-DDThh:mm:ss',
          UsedVehicleSale: 'YYYY-MM-DDThh:mm:ss',
          Unknown: 'YYYY-MM-DDThh:mm:ss',
          ExogenousLead: '',
        },
        vehicleRegistrationFirstRegisteredAt: '',
      },
      transformers: {
        tsvToCsv: '',
        colsizeCsv: null,
        headerlessCsv: {
          Maintenances: {
            header: '',
          },
          NewVehicleSales: {
            header: '',
          },
          UsedVehicleSales: {
            header: '',
          },
          MixedVehicleSales: {
            header: '',
          },
          Mixed: {
            header: '',
          },
        },
      },
      optionalCompletedAt: false,
      id: '5a15a078a6cac81300099eb4',
      createdAt: '2017-11-22T16:06:16.721Z',
      updatedAt: '2017-11-22T18:46:20.904Z',
    };
    const importF = path.join(__dirname, 'data/no-date-test.xml');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    const dataTypesFormatter = {};
    dataTypesFormatter[dataTypesEnum.MAINTENANCE] = ['1'];
    dataTypesFormatter[dataTypesEnum.NEW_VEHICLE_SALE] = ['5'];
    dataTypesFormatter[dataTypesEnum.USED_VEHICLE_SALE] = ['6'];

    promise
      .then((loadFileResult) => {
        importer.validateImportFileBufferFromJSONParser(
          importF,
          loadFileResult.fileBuffer,
          parserConfig,
          solwareColumns,
          vehicleMakes,
          dataTypesFormatter,
          {},
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withEmails).equal(3);
            expect(importResult.validationDetails.withMobile).equal(5);
            expect(importResult.validationDetails.withName).equal(5);
            expect(importResult.validationDetails.withCity).equal(5);
            expect(importResult.validationDetails.withVehicleMake).equal(2);
            expect(importResult.validationDetails.withVehicleModel).equal(5);
            expect(importResult.validationDetails.withContactChannel).equal(5);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(0);
            expect(importResult.validationDetails.rows).equal(5);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            expect(importResult.validationDetails.perType.Unknown).equal(0);
            expect(importResult.validationDetails.perType.Maintenance).equal(1);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(2);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(2);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test fixedlength with headerless', function test(done) {
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
            expect(importResult.validationDetails.rows).equal(16);
            expect(importResult.validationDetails.withCity).equal(16);
            expect(importResult.validationDetails.withContactChannel).equal(16);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  // Test RGPD value in xlsx file
  it('test OptOutMailing and OptOutSMS in xlsx file with header name "RGPD" and "SMS"', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'xlsx',
        worksheetName: '#first#',
      },
      format: {
        dataRecordCompletedAt: 'DD/MM/YYYY hh:mm',
        vehicleRegistrationFirstRegisteredAt: 'dd/mm/yyyy',
      },
      transformers: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/generic_with_rgpd.xls');
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
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withOptOutMailing).equal(11);
            expect(importResult.validationDetails.withOptOutSMS).equal(11);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  // Test RGPD value in csv file
  it('test OptOutMailing and OptOutSMS in csv file with header name "DPO" and "SMS"', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'csv',
        charset: 'win1252',
      },
      transformers: {
        vsvToCsv: '1',
      },
      format: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/csv-with-commas_rgpd.csv');
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
          gsDataFileDataType.VEHICLE_SALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withOptOutMailing).equal(3);
            expect(importResult.validationDetails.withOptOutSMS).equal(3);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  // Test parser with cobredia file
  it('test OptOutMailing and OptOutSMS in cobredia file"', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      foreigns: {
        parserColumnsId: '1',
        parserVehicleMakesId: '1',
      },
      fileformat: {
        format: 'xlsx',
        worksheetName: '#first#',
      },
      format: {
        dataRecordCompletedAt: 'DD/MM/YYYY hh:mm',
        vehicleRegistrationFirstRegisteredAt: 'dd/mm/yyyy',
      },
      transformers: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/cobrediamix2_rgpd.xls');
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
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withOptOutMailing).equal(4);
            expect(importResult.validationDetails.withOptOutSMS).equal(4);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test generic mix json - MIXED', function test(done) {
    const parserConfig = {
      _reference: 'Generic',
      fileformat: {
        format: 'json',
        worksheetName: '#first#',
      },
      format: {
        dataRecordCompletedAt: 'DD/MM/YYYY hh:mm',
        vehicleRegistrationFirstRegisteredAt: 'dd/mm/yyyy',
      },
      transformers: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/generic_mixed_test.json');
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
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            // eslint-disable-line max-len
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withEmails).equal(442);
            expect(importResult.validationDetails.withMobile).equal(456);
            expect(importResult.validationDetails.withContactChannel).equal(484);
            expect(importResult.validationDetails.withName).equal(492);
            expect(importResult.validationDetails.withCity).equal(489);
            expect(importResult.validationDetails.withVehicleMake).equal(491);
            expect(importResult.validationDetails.withVehicleModel).equal(484);
            expect(importResult.validationDetails.withVehicleVIN).equal(492);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(492);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('09/05/2016 16:47:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('21/07/2016 18:11:00');
            expect(importResult.validationDetails.rows).equal(492);
            expect(importResult.validationDetails.nbDuplicates).equal(17);
            expect(importResult.validationDetails.perType.Unknown).equal(58);
            expect(importResult.validationDetails.perType.Maintenance).equal(431);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(2);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(1);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test sample JSON', function test(done) {
    const parserConfig = {
      _reference: 'generic',
      fileformat: {
        format: 'json',
      },
      format: {
        dataRecordCompletedAt: 'YYYY-MM-DD hh:mm:ss',
      },
      transformers: {},
      id: '1',
    };
    const importF = path.join(__dirname, 'data/sample.json');
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
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.withEmails).equal(1);
            expect(importResult.validationDetails.withMobile).equal(1);
            expect(importResult.validationDetails.withContactChannel).equal(2);
            expect(importResult.validationDetails.withName).equal(2);
            expect(importResult.validationDetails.withCity).equal(2);
            expect(importResult.validationDetails.withVehicleMake).equal(1);
            expect(importResult.validationDetails.withVehicleModel).equal(2);
            expect(importResult.validationDetails.withVehicleVIN).equal(0);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(2);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('08/02/2021 17:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('09/02/2021 12:00:00');
            expect(importResult.validationDetails.rows).equal(2);
            expect(importResult.validationDetails.nbDuplicates).equal(1);
            expect(importResult.validationDetails.perType.Unknown).equal(0);
            expect(importResult.validationDetails.perType.Maintenance).equal(2);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(0);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(0);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
});
