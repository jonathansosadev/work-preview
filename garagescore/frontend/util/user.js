function abbrevateName(firstName, lastName, email) {
  if (firstName && lastName) {
    return `${firstName} ${lastName.toUpperCase().charAt(0)}`;
  }
  if (firstName) {
    return firstName;
  }
  return email.replace(/@.+$/, '');
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
}

function fullName(firstName, lastName, email) {
  if (firstName && lastName) {
    return `${capitalize(firstName)} ${capitalize(lastName)}`;
  }
  if (firstName || lastName) {
    return capitalize(firstName || lastName);
  }
  return email.replace(/@.+$/, '');
}

/**
 * Used in leads and unsatisfied to display the manager display name
 * @param {{firstName? : string, lastName? : string, email? : string}} userInfos The user information
 * @returns {string} the computed display name based on available user information
 */
function managerDisplayName({ firstName = '', lastName = '', email = '' } = {}) {
  if (firstName || lastName) {
    return `${firstName || ''} ${lastName || ''}`.trim();
  }

  if (email) {
    return `${email}`;
  }

  return '';
}

module.exports = { abbrevateName, capitalize, fullName, managerDisplayName };
