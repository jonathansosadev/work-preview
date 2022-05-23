const chai = require('chai');
const gsLogger = require('../../../../common/lib/garagescore/logger');
const gsDataFileDataType = require('../../../../common/models/data-file.data-type');
const importer = require('../../../../common/lib/garagescore/data-file/lib/importer');

gsLogger.setLevel(gsLogger.LEVELS.ERROR);
const { expect } = chai;
chai.should();

function validate(buffer) {
  return new Promise((resolve) => {
    importer.validateImportFileBuffer(
      'no-path.csv',
      buffer,
      'Generic/csv-ddmmyyyy',
      {},
      gsDataFileDataType.MAINTENANCES,
      '577a30d774616c1a0056c263',
      (err, importResult) => {
        if (err) {
          resolve(err);
          return;
        }
        resolve(importResult);
      }
    );
  });
}
/**
 * Test imports with sharedImportFilters in configuration
 */
describe('Shared filters: test default config', async () => {
  it('no line filtered', async function test() {
    const header = 'dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const content = '30/09/2016 00:00:00;BatMan;Gotham;rue;999999;marque;modele;0612345678\n';
    const buffer = Buffer.from(header + content, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
  it('filtered by salecode not', async function test() {
    const header = 'salecode;dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = 'toto;30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = 'X;30/09/2016 00:00:00;Robin;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const buffer = Buffer.from(header + l1 + l2, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
  it('filtered by salecode notInclude', async function test() {
    const header = 'salecode;dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = 'toto;30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = '>>>>VO<<<<;30/09/2016 00:00:00;Robin;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const buffer = Buffer.from(header + l1 + l2, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
  it('filtered by fullName not', async function test() {
    const header = 'dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = '30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = '30/09/2016 00:00:00;Alfaromeo;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const buffer = Buffer.from(header + l1 + l2, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
  it('filtered by fullName notInclude', async function test() {
    const header = 'dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = '30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = '30/09/2016 00:00:00;>>>> Kia<<<;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const buffer = Buffer.from(header + l1 + l2, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
  it('filtered by fullName notInclude Db77', async function test() {
    const header = 'dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = '30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = '30/09/2016 00:00:00;Db77;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const buffer = Buffer.from(header + l1 + l2, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
  it('NOT filtered by fullName', async function test() {
    const header = 'dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = '30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = '30/09/2016 00:00:00;ezrezrez;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const l3 = '30/09/2016 00:00:00;Optevden;tod@gs.com;rue;999999;marque;modele;0612345680\n';
    const buffer = Buffer.from(header + l1 + l2 + l3, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(3);
  });
  it('filtered by empty rows', async function test() {
    const header = 'dateinter;fullName;email;ville;rue;cp;marque;modele;mobilePhone\n';
    const l1 = '30/09/2016 00:00:00;BatMan;bat@gs.com;rue;999999;marque;modele;0612345678\n';
    const l2 = '30/09/2016 00:00:00;;rob@gs.com;rue;999999;marque;modele;0612345679\n';
    const buffer = Buffer.from(header + l1 + l2, 'utf8');
    const importResult = await validate(buffer);
    expect(importResult.isValid).equal(true);
    expect(importResult.validationDetails.rows).equal(1);
  });
});
