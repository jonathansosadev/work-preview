const path = require('path');
const chai = require('chai');
const sinon = require('sinon');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');
const gsLogger = require('../../../../common/lib/garagescore/logger');
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');
const sharedFilters = require('../../../../common/lib/garagescore/data-file/shared-filters');

gsLogger.setLevel(gsLogger.LEVELS.ERROR);
const { expect } = chai;
chai.should();

chai.should();
/* eslint-disable max-len */

/*
 * Test imports schemas
 */
describe('DataFile Importer:', () => {
  before(function before() {
    this.stubs = sinon.stub(sharedFilters, 'getConfig').callsFake(() => []);
  });
  after(function after() {
    if (this.stubs) {
      this.stubs.restore();
    }
  });
  var logExpected = function (importResult) {
    // eslint-disable-line
    console.log(`expect(importResult.isValid).equal(${importResult.isValid});`);
    if (importResult.isValid) {
      console.log(
        `expect(importResult.validationDetails.withEmails).equal(${importResult.validationDetails.withEmails});`
      );
      console.log(
        `expect(importResult.validationDetails.withMobile).equal(${importResult.validationDetails.withMobile});`
      );
      console.log(
        `expect(importResult.validationDetails.withContactChannel).equal(${importResult.validationDetails.withContactChannel});`
      );
      console.log(`expect(importResult.validationDetails.withName).equal(${importResult.validationDetails.withName});`);
      console.log(`expect(importResult.validationDetails.withCity).equal(${importResult.validationDetails.withCity});`);
      console.log(
        `expect(importResult.validationDetails.withVehicleMake).equal(${importResult.validationDetails.withVehicleMake});`
      );
      console.log(
        `expect(importResult.validationDetails.withVehicleModel).equal(${importResult.validationDetails.withVehicleModel});`
      );
      console.log(
        `expect(importResult.validationDetails.withServiceProvidedAt).equal(${importResult.validationDetails.withServiceProvidedAt});`
      );
      console.log(
        `expect(importResult.validationDetails.minServiceProvidedAt).equal('${importResult.validationDetails.minServiceProvidedAt}');`
      );
      console.log(
        `expect(importResult.validationDetails.maxServiceProvidedAt).equal('${importResult.validationDetails.maxServiceProvidedAt}');`
      );
      console.log(`expect(importResult.validationDetails.rows).equal(${importResult.validationDetails.rows});`);
      console.log(
        `expect(importResult.validationDetails.nbDuplicates).equal(${importResult.validationDetails.nbDuplicates});`
      );
      for (const t in importResult.validationDetails.perType) {
        // eslint-disable-line
        if ({}.hasOwnProperty.call(importResult.validationDetails.perType, t)) {
          console.log(
            `expect(importResult.validationDetails.perType.${t}).equal(${importResult.validationDetails.perType[t]});`
          );
        }
      }
    }
  };

  /** Test only header */
  it('test header - xml', function test(done) {
    const importF = path.join(__dirname, 'data/maurel1.xml');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'ERIC/eric-xml.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.columnLabels).eql([
              'psv',
              'site',
              'facture.numero',
              'facture.date',
              'facture.nature',
              'facture.montant',
              'commande',
              'client.type',
              'client.juridique',
              'client.nom',
              'client.adresse.rue',
              'client.adresse.commune',
              'client.adresse.cp',
              'client.adresse.distributeur',
              'utilisateur.juridique',
              'utilisateur.nom',
              'utilisateur.telephone.domicile',
              'utilisateur.telephone.bureau',
              'utilisateur.telephone.mobile',
              'utilisateur.poste',
              'utilisateur.mail',
              'responsable.code',
              'responsable.nom',
              'atelier',
              'vehicule.marque',
              'vehicule.modele',
              'vehicule.immatriculation',
              'vehicule.kilometrage',
              'vehicule.datemec',
              'vehicule.vin',
              'operation.$.numero',
              'operation.libelle',
              'operation.nature',
              'piece.$.numero',
              'piece.libelle',
            ]); // eslint-disable-line
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test header - xls', function test(done) {
    const importF = path.join(__dirname, 'data/generic_mixed_test.xls');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Generic/xlsx-ddmmyyyy_hhmm.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.columnLabels).eql([
              'Date de facture',
              'Titre',
              'nom',
              'Prénom',
              'Adresse',
              'Code Postal',
              'ville',
              'Tel Portable',
              'Courriel',
              'Châssis',
              'Immatriculation',
              'Km',
              'Date MEC',
              'Marque',
              'Série',
              'Modéle véhicule',
              'Service',
              'VIN',
            ]); // eslint-disable-line
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test header - csv', function test(done) {
    const importF = path.join(__dirname, 'data/dcs-ftp.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'DCS/dcsnet-ddmmyyyy',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.validationDetails.columnLabels).eql([
              'Nom Affaire',
              'Date',
              'No facture',
              'Type facture',
              'Profession (Code)',
              'Nature ORV',
              'Libellé réceptionnaire',
              'Marque (Libellé)',
              'Gamme Modele',
              'No client',
              'Civilité (Libellé)',
              'Nom client',
              'Rue',
              'Code postal',
              'Commune client',
              'Tél. domicile',
              'Tél. professionnel',
              'Tél. portable',
              'Email individu',
              'Code forfait',
              'Libellé forfait',
              'Libellé équipe',
              'Référence',
              'Libellé / Désignation',
              'Type ligne (PR/MO/DIV)',
            ]); // eslint-disable-line
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  /** (end) Test only header */

  it('test csvwithquotes.csv', function test(done) {
    const importF = path.join(__dirname, 'data/csvwithquotes.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Cobredia/cobredia-mix.js',
          {},
          gsDataFileDataType.VEHICLESALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.nbDuplicates).equal(9);
            expect(importResult.validationDetails.withEmails).equal(10);
            expect(importResult.validationDetails.withMobile).equal(14);
            expect(importResult.validationDetails.withContactChannel).equal(14);
            expect(importResult.validationDetails.withName).equal(16);
            expect(importResult.validationDetails.withCity).equal(16);
            expect(importResult.validationDetails.withVehicleMake).equal(16);
            expect(importResult.validationDetails.withVehicleModel).equal(16);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(16);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('03/10/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('03/10/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(16);
            expect(importResult.validationDetails.perType.Unknown).equal(16);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test csvwithquotes-2.csv with email in mobilePhone field', function test(done) {
    const importF = path.join(__dirname, 'data/csvwithquotes-2.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Cobredia/cobredia-mix.js',
          {},
          gsDataFileDataType.VEHICLESALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(12);
            expect(importResult.validationDetails.withMobile).equal(13);
            expect(importResult.validationDetails.withContactChannel).equal(15);
            expect(importResult.validationDetails.withName).equal(17);
            expect(importResult.validationDetails.withCity).equal(17);
            expect(importResult.validationDetails.withVehicleMake).equal(17);
            expect(importResult.validationDetails.withVehicleModel).equal(17);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(17);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('03/10/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('03/10/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(17);
            expect(importResult.validationDetails.nbDuplicates).equal(8);
            expect(importResult.validationDetails.perType.Unknown).equal(17);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test cobrediamix - txt', function test(done) {
    const importF = path.join(__dirname, 'data/cobrediamix1.txt');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Cobredia/cobredia-mix.js',
          {},
          gsDataFileDataType.VEHICLESALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
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
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test cobrediamix - xls', function test(done) {
    const importF = path.join(__dirname, 'data/cobrediamix2.xls');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Cobredia/cobredia-mix.js',
          {},
          gsDataFileDataType.VEHICLESALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(99);
            expect(importResult.validationDetails.withMobile).equal(102);
            expect(importResult.validationDetails.withContactChannel).equal(116);
            expect(importResult.validationDetails.withName).equal(119);
            expect(importResult.validationDetails.withCity).equal(118);
            expect(importResult.validationDetails.withVehicleMake).equal(116);
            expect(importResult.validationDetails.withVehicleModel).equal(119);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(119);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('11/07/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('30/03/2017 00:00:00');
            expect(importResult.validationDetails.rows).equal(119);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            expect(importResult.validationDetails.perType.UsedVehicleSale).equal(59);
            expect(importResult.validationDetails.perType.NewVehicleSale).equal(60);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });
  it('test cobrediamix - mecaplanning', function test(done) {
    const importF = path.join(__dirname, 'data/mecaplanning1006.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Cobredia/cobredia-mix.js',
          {},
          gsDataFileDataType.VEHICLESALES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(5);
            expect(importResult.validationDetails.withMobile).equal(7);
            expect(importResult.validationDetails.withContactChannel).equal(8);
            expect(importResult.validationDetails.withName).equal(11);
            expect(importResult.validationDetails.withCity).equal(9);
            expect(importResult.validationDetails.withVehicleMake).equal(11);
            expect(importResult.validationDetails.withVehicleModel).equal(9);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(9);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/01/1970 01:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('16/03/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(11);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            expect(importResult.validationDetails.perType.Unknown).equal(11);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test filter options', function test(done) {
    const importF = path.join(__dirname, 'data/dcs-ftp.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        const options = { filter: '["Nom Affaire"]="GIDAATH"' };
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'DCS/dcsnet-ddmmyyyy',
          options,
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(8);
            expect(importResult.validationDetails.withMobile).equal(8);
            expect(importResult.validationDetails.withContactChannel).equal(8);
            expect(importResult.validationDetails.withName).equal(8);
            expect(importResult.validationDetails.withCity).equal(8);
            expect(importResult.validationDetails.withVehicleMake).equal(0);
            expect(importResult.validationDetails.withVehicleModel).equal(0);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(8);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('22/08/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('22/08/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(8);
            expect(importResult.validationDetails.nbDuplicates).equal(70);
            expect(importResult.validationDetails.perType.Unknown).equal(8);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test generic mix xlsx - MIXED', function test(done) {
    const importF = path.join(__dirname, 'data/generic_mixed_test.xls');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Generic/xlsx-ddmmyyyy_hhmm.js',
          {},
          gsDataFileDataType.MIXED,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
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

  it('test generic mix xlsx - MAINTENANCES', function test(done) {
    const importF = path.join(__dirname, 'data/generic_mixed_test.xls');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Generic/xlsx-ddmmyyyy_hhmm.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
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
            expect(importResult.validationDetails.perType.Maintenance).equal(489);
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

  it('test dedup xlsx', function test(done) {
    const importF = path.join(__dirname, 'data/test-dedup.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'DCS/dcsnet-mmddyyyy.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(2);
            expect(importResult.validationDetails.withMobile).equal(1);
            expect(importResult.validationDetails.withContactChannel).equal(3);
            expect(importResult.validationDetails.withName).equal(6);
            expect(importResult.validationDetails.withCity).equal(6);
            expect(importResult.validationDetails.withVehicleMake).equal(6);
            expect(importResult.validationDetails.withVehicleModel).equal(1);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(6);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('19/07/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('19/07/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(6);
            expect(importResult.validationDetails.nbDuplicates).equal(1);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test ecars21 xlsx', function test(done) {
    const importF = path.join(__dirname, 'data/ecars21.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Generic/xlsx-ddmmyyyy_hhmm.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(246);
            expect(importResult.validationDetails.withMobile).equal(0);
            expect(importResult.validationDetails.withContactChannel).equal(248);
            expect(importResult.validationDetails.withName).equal(274);
            expect(importResult.validationDetails.withCity).equal(272);
            expect(importResult.validationDetails.withVehicleMake).equal(274);
            expect(importResult.validationDetails.withVehicleModel).equal(274);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(135);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/01/1970 01:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('05/12/2016 16:27:00');
            expect(importResult.validationDetails.rows).equal(274);
            expect(importResult.validationDetails.nbDuplicates).equal(12);
            expect(importResult.validationDetails.perType.Maintenance).equal(274);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test datafirst xlsx', function test(done) {
    const importF = path.join(__dirname, 'data/datafirst.xls');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'DataFirst/datafirst.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(106);
            expect(importResult.validationDetails.withMobile).equal(0);
            expect(importResult.validationDetails.withContactChannel).equal(106);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(106);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('24/05/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('31/05/2016 00:00:00');
            expect(importResult.validationDetails.withName).equal(106);
            expect(importResult.validationDetails.withCity).equal(106);
            expect(importResult.validationDetails.withVehicleMake).equal(106);
            expect(importResult.validationDetails.withVehicleModel).equal(0);
            expect(importResult.validationDetails.rows).equal(106);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test everlog xlsx', function test(done) {
    const importF = path.join(__dirname, 'data/everlog.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Everlog/everlog.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(701);
            expect(importResult.validationDetails.withMobile).equal(0);
            expect(importResult.validationDetails.withContactChannel).equal(701);
            expect(importResult.validationDetails.withName).equal(1149);
            expect(importResult.validationDetails.withCity).equal(176);
            expect(importResult.validationDetails.withVehicleMake).equal(882);
            expect(importResult.validationDetails.withVehicleModel).equal(889);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(1149);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/03/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('31/05/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(1149);
            expect(importResult.validationDetails.nbDuplicates).equal(188);
            expect(importResult.validationDetails.perType.Maintenance).equal(1149);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
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
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.nbDuplicates).equal(52);
            expect(importResult.validationDetails.withEmails).equal(68);
            expect(importResult.validationDetails.withMobile).equal(58);
            expect(importResult.validationDetails.withContactChannel).equal(77);
            expect(importResult.validationDetails.withName).equal(64);
            expect(importResult.validationDetails.withCity).equal(88);
            expect(importResult.validationDetails.withVehicleMake).equal(87);
            expect(importResult.validationDetails.withVehicleModel).equal(88);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(86);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/01/1970 01:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('30/05/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(88);
            expect(importResult.validationDetails.perType.Maintenance).equal(88);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test sofida xlsx', function test(done) {
    const importF = path.join(__dirname, 'data/sofida.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'Carbase/sofida-xlsx.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(669);
            expect(importResult.validationDetails.withMobile).equal(675);
            expect(importResult.validationDetails.withContactChannel).equal(914);
            expect(importResult.validationDetails.withName).equal(993);
            expect(importResult.validationDetails.withCity).equal(1077);
            expect(importResult.validationDetails.withVehicleMake).equal(1030);
            expect(importResult.validationDetails.withVehicleModel).equal(1030);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(1062);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/01/1970 01:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('31/05/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(1077);
            expect(importResult.validationDetails.nbDuplicates).equal(1261);
            expect(importResult.validationDetails.perType.Maintenance).equal(1077);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test too many rows', function test(done) {
    const importF = path.join(__dirname, 'data/lotofemptylines.xlsx');
    importer.parseFileStore(
      importF,
      'filesystem',
      'DCS/dcsnet-mmddyyyy.js',
      {},
      gsDataFileDataType.MAINTENANCES,
      '577a30d774616c1a0056c263',
      (err, iterator) => {
        if (err) {
          done();
          return;
        }
        done('Files with too many rows should be ignored');
      }
    );
  });

  it('test icarsystem2', function test(done) {
    const importF = path.join(__dirname, 'data/icarsystem2.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'IcarSystems/icarsystems.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(140);
            expect(importResult.validationDetails.withMobile).equal(0);
            expect(importResult.validationDetails.withContactChannel).equal(144);
            expect(importResult.validationDetails.withName).equal(319);
            expect(importResult.validationDetails.withCity).equal(0);
            expect(importResult.validationDetails.withVehicleMake).equal(319);
            expect(importResult.validationDetails.withVehicleModel).equal(312);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(319);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('04/01/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('31/03/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(319);
            expect(importResult.validationDetails.nbDuplicates).equal(3);
            expect(importResult.validationDetails.perType.Maintenance).equal(319);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test mecaplanning', function test(done) {
    const importF = path.join(__dirname, 'data/mecaplanning1006.csv');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'MecaPlanning/mecaplanning.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(5);
            expect(importResult.validationDetails.withMobile).equal(7);
            expect(importResult.validationDetails.withContactChannel).equal(8);
            expect(importResult.validationDetails.withName).equal(11);
            expect(importResult.validationDetails.withCity).equal(9);
            expect(importResult.validationDetails.withVehicleMake).equal(11);
            expect(importResult.validationDetails.withVehicleModel).equal(9);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(9);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/01/1970 01:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('16/03/2016 16:24:30');
            expect(importResult.validationDetails.rows).equal(11);
            expect(importResult.validationDetails.nbDuplicates).equal(0);
            expect(importResult.validationDetails.perType.Maintenance).equal(11);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test mecaplanning complete parse', function test(done) {
    const importF = path.join(__dirname, 'data/mecaplanning1006-bis.csv');
    importer.parseFileStore(
      importF,
      'filesystem',
      'MecaPlanning/mecaplanning.js',
      {},
      gsDataFileDataType.MAINTENANCES,
      '577a30d774616c1a0056c263',
      (err, iterator) => {
        if (err) {
          done(err);
          return;
        }
        let nb = 0;
        while (iterator.hasNext()) {
          const n = iterator.next();
          if (n.value.customer.firstName) {
            nb++;
          }
        }
        expect(nb).equal(16);
        done();
      }
    );
  });

  it('test maurel xml schema - dynamic options', function test(done) {
    const importF = path.join(__dirname, 'data/maurel1.xml');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        const options = { filter: '["psv"]="231203H"' };
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'ERIC/eric-xml.js',
          options,
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(23);
            expect(importResult.validationDetails.withMobile).equal(21);
            expect(importResult.validationDetails.withContactChannel).equal(31);
            expect(importResult.validationDetails.withName).equal(47);
            expect(importResult.validationDetails.withCity).equal(47);
            expect(importResult.validationDetails.withVehicleMake).equal(38);
            expect(importResult.validationDetails.withVehicleModel).equal(35);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(47);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('20/01/2018 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('20/01/2022 00:00:00');
            expect(importResult.validationDetails.rows).equal(47);
            expect(importResult.validationDetails.nbDuplicates).equal(9);
            expect(importResult.validationDetails.perType.Maintenance).equal(47);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test maurel xls schema 2', function test(done) {
    const importF = path.join(__dirname, 'data/maurelcastres.xls');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'ERIC/maurel-xlsx.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(405);
            expect(importResult.validationDetails.withMobile).equal(0);
            expect(importResult.validationDetails.withContactChannel).equal(405);
            expect(importResult.validationDetails.withName).equal(700);
            expect(importResult.validationDetails.withCity).equal(698);
            expect(importResult.validationDetails.withVehicleMake).equal(700);
            expect(importResult.validationDetails.withVehicleModel).equal(700);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(700);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('09/09/2009 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('21/03/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(700);
            expect(importResult.validationDetails.nbDuplicates).equal(45);
            expect(importResult.validationDetails.perType.Maintenance).equal(700);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test icarsystems json schema', function test(done) {
    const importF = path.join(__dirname, 'data/icarsystems.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'IcarSystems/icarsystems.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(189);
            expect(importResult.validationDetails.withMobile).equal(0);
            expect(importResult.validationDetails.withContactChannel).equal(241);
            expect(importResult.validationDetails.withName).equal(241);
            expect(importResult.validationDetails.withCity).equal(241);
            expect(importResult.validationDetails.withVehicleMake).equal(241);
            expect(importResult.validationDetails.withVehicleModel).equal(206);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(241);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('04/01/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('29/03/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(241);
            expect(importResult.validationDetails.nbDuplicates).equal(424);
            expect(importResult.validationDetails.perType.Maintenance).equal(241);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test tomauto json schema', function test(done) {
    const importF = path.join(__dirname, 'data/tomauto.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'tom-auto-v1.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
              return;
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(183);
            expect(importResult.validationDetails.withMobile).equal(575);
            expect(importResult.validationDetails.withContactChannel).equal(591);
            expect(importResult.validationDetails.withName).equal(669);
            expect(importResult.validationDetails.withCity).equal(667);
            expect(importResult.validationDetails.withVehicleMake).equal(664);
            expect(importResult.validationDetails.withVehicleModel).equal(668);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(669);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/09/2015 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('23/02/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(669);
            expect(importResult.validationDetails.nbDuplicates).equal(15);
            expect(importResult.validationDetails.perType.Maintenance).equal(669);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test sofiland json schema', function test(done) {
    const importF = path.join(__dirname, 'data/sofiland.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'DCS/dcsnet-mmddyyyy.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
              return;
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(231);
            expect(importResult.validationDetails.withMobile).equal(496);
            expect(importResult.validationDetails.withContactChannel).equal(505);
            expect(importResult.validationDetails.withName).equal(559);
            expect(importResult.validationDetails.withCity).equal(0);
            expect(importResult.validationDetails.withVehicleMake).equal(559);
            expect(importResult.validationDetails.withVehicleModel).equal(486);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(559);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('01/02/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('11/03/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(559);
            expect(importResult.validationDetails.nbDuplicates).equal(12);
            expect(importResult.validationDetails.perType.Maintenance).equal(559);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test sofiland #2 json schema', function test(done) {
    const importF = path.join(__dirname, 'data/sofiland2.xlsx');
    const promise = importer.loadFileFromFileStore(importF, 'filesystem');
    promise
      .then((loadFileResult) => {
        importer.validateImportFileBuffer(
          importF,
          loadFileResult.fileBuffer,
          'DCS/dcsnet-mmddyyyy.js',
          {},
          gsDataFileDataType.MAINTENANCES,
          '577a30d774616c1a0056c263',
          (err, importResult) => {
            if (err) {
              done(err);
            }
            expect(importResult.isValid).equal(true);
            expect(importResult.validationDetails.withEmails).equal(394);
            expect(importResult.validationDetails.withMobile).equal(499);
            expect(importResult.validationDetails.withContactChannel).equal(528);
            expect(importResult.validationDetails.withName).equal(594);
            expect(importResult.validationDetails.withCity).equal(0);
            expect(importResult.validationDetails.withVehicleMake).equal(593);
            expect(importResult.validationDetails.withVehicleModel).equal(347);
            expect(importResult.validationDetails.withServiceProvidedAt).equal(594);
            expect(importResult.validationDetails.minServiceProvidedAt).equal('04/01/2016 00:00:00');
            expect(importResult.validationDetails.maxServiceProvidedAt).equal('07/03/2016 00:00:00');
            expect(importResult.validationDetails.rows).equal(594);
            expect(importResult.validationDetails.nbDuplicates).equal(279);
            expect(importResult.validationDetails.perType.Maintenance).equal(594);
            done();
          }
        );
      })
      .catch((e) => {
        done(e);
      });
  });

  it('test sofiland json schema with parser', function test(done) {
    const importF = path.join(__dirname, 'data/sofiland.xlsx');
    importer.parseFileStore(
      importF,
      'filesystem',
      'DCS/dcsnet-mmddyyyy.js',
      {},
      gsDataFileDataType.MAINTENANCES,
      '577a30d774616c1a0056c263',
      (err, iterator) => {
        if (err) {
          done(err);
          return;
        }
        let nb = 0;
        while (iterator.hasNext()) {
          iterator.next();
          nb++;
        }
        expect(nb).equal(559);
        done();
      }
    );
  });
});
