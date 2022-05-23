const chai = require('chai');
const fieldsHandler = require('../../../../../../../common/lib/garagescore/cockpit-exports/fields/fields-handler');
const { ShortcutExportTypes, ExportCategories, DataTypes } = require('../../../../../../../frontend/utils/enumV2');

const expect = chai.expect;

describe('Fields Handler', () => {
  const category = ExportCategories.BY_DATA;
  // Tests on UNSATISFIED because it's the only with subfields atm
  const unsFields = fieldsHandler[category].UNSATISFIED;
  const mainFields = unsFields.filter(field => typeof field === 'string');
  const dataTypes = [DataTypes.MAINTENANCE];

  it('[getFieldsByShortcutExportType] : Should Return An Array Of Fields', () => {
    const result = fieldsHandler.getFieldsByShortcutExportType(ShortcutExportTypes.UNSATISFIED_REVIEWS, dataTypes, false);

    expect(result).to.be.an.array;
    result.forEach((field) => expect(typeof field).to.equals('string'));
  });

  it('[fieldIsValid] : Should return true for a valid field', () => {
    const subFields = unsFields.filter(field => typeof field === 'object').map(obj => obj.subfields).flat();
    
    mainFields.forEach(field => expect(fieldsHandler.fieldIsValid(field, category), `field : ${field}`).to.equals(true));
    subFields.forEach(field => expect(fieldsHandler.fieldIsValid(field, category), `field : ${field}`).to.equals(true));
  });

  it('[fieldIsValid] : Should return false for an invalid field', () => {
    const invalidResult = fieldsHandler.fieldIsValid(mainFields[0], ExportCategories.BY_FRONT_DESK_USERS);
    expect(invalidResult).to.equals(false);
  });

  it('[fieldIsValid] : Should return false for missing params', () => {
    expect(fieldsHandler.fieldIsValid(null, category)).to.equals(false);
    expect(fieldsHandler.fieldIsValid(mainFields[0], null)).to.equals(false);
  });

  it('[getUnsatisfiedParentCriteriasFields] : Should Return An Array Of Parent Fields', () => {
    const result = fieldsHandler.getUnsatisfiedParentCriteriasFields(dataTypes, false);

    expect(result).to.be.an.array;
    result.forEach(field => expect(typeof field, `field : ${field}`).to.equals('string'));
    result.forEach(field => expect(field, `field : ${field}`).not.includes('SUB'));
    fieldsHandler.getUnsatisfiedParentCriteriasFields(dataTypes, true).forEach(field => expect(field).includes('VEHICLE_INSPECTION'));
  });

  it('[getUnsatisfiedCriteriasFields] : Should return an array Of all fields', () => {
    const result = fieldsHandler.getUnsatisfiedCriteriasFields(dataTypes, false);

    expect(result).to.be.an.array;
    result.forEach((field) => expect(typeof field, `field : ${field}`).to.equals('string'));
    fieldsHandler.getUnsatisfiedCriteriasFields(dataTypes, true).forEach(field => expect(field).includes('VEHICLE_INSPECTION'));
  });
});
