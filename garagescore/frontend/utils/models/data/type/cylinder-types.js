const cylinderTypes = {
  SMALL: 'Small',
  MEDIUM: 'Medium',
  BIG: 'Big',
  HUGE: 'Huge',
  ELECTRIC: 'Electric',
  UNKNOWN: 'Unknown'
}
function _displayName(value, language = 'fr', prefix) {
  if (typeof value === 'undefined') {
    console.error('The given value is undefined')
    return ''
  }
  if (!Object.values(cylinderTypes).includes(value)) {
    console.error(`Value '${value}' is not supported`)
    return value
  }
  return value // translate(value, language, prefix)
}
export default {
  CylinderTypes: cylinderTypes,
  CylinderTypesForSurvey: Object.values(cylinderTypes).map((c) => ({
    value: c,
    text: _displayName(c)
  })),
  displayName: _displayName
}
