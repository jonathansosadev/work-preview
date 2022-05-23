const translate = require('../../../../common/lib/garagescore/languages')('cylinder-types.js');

const cylinderTypes = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  BIG: 'Big',
  HUGE: 'Huge',
  ELECTRIC: 'Electric',
  UNKNOWN: 'Unknown',
};
function _displayName(value, language = 'fr', prefix) {
  if (typeof value === 'undefined') {
    console.error('The given value is undefined');
    return '';
  }
  if (!Object.values(cylinderTypes).includes(value)) {
    console.error(`Value '${value}' is not supported`);
    return value;
  }
  return translate(value, language, prefix);
}
module.exports = {
  CylinderTypes: cylinderTypes,
  CylinderTypesForSurvey: Object.values(cylinderTypes).map((c) => ({ value: c, text: _displayName(c) })),
  displayName: _displayName,
};
