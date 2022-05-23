/**
 * _checkIfDefined checkIf a value is defined if not return default str
 */

function _checkIfDefined(value) {
  if (!!value) {
    let sanitized = `${value}`.replace(';', '').replace(',', '').replace('|', '');
    return sanitized || 'Non renseigné';
  }
  return 'Non renseigné';
}

/**
 * _checkIfNumberDefined checkIf a number is defined and return a comma separated float , if not return default str
 */

function _checkIfNumberDefined(value) {
  if (typeof value === 'number') {
    let str = `${value}`;
    return str.replace(/\./g, ',');
  }
  return 'Non renseigné';
}

/**
 * _checkIfBooleanDefined checkIf a boolean is defined  and return Oui/Non, if not return default str
 */
function _checkIfBooleanDefined(value) {
  if (value !== null && value != undefined) {
    return value ? 'Oui' : 'Non';
  }
  return 'Non renseigné';
}

/**
 * _checkIfDateDefined check if a date is defined and return a formatted date, if not return default str
 */

function _checkIfDateDefined(date) {
  if (date) {
    const year = new Intl.DateTimeFormat('fr', { year: 'numeric' }).format(date);
    const month = new Intl.DateTimeFormat('fr', { month: '2-digit' }).format(date);
    const day = new Intl.DateTimeFormat('fr', { day: '2-digit' }).format(date);
    return `${day}/${month}/${year}`;
  }
  return 'Non renseigné';
}

module.exports = {
  _checkIfDefined,
  _checkIfBooleanDefined,
  _checkIfDateDefined,
  _checkIfNumberDefined,
};
