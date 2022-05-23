export function host(url) {
  const host1 = url.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  const parts = host1.split('.').slice(-3);
  if (parts[0] === 'www') parts.shift();
  return parts.join('.');
}

export function frenchFloating(value) {
  if (value.toString().length === 1 && value.toString() !== '10') return `${value},0`;
  return value.toString().replace(/\./, ',');
}
export function capitalize(str) { return str.charAt(0).toUpperCase() + str.slice(1); }


export function spacedNumber(value) { return value.toString().replace(/(\d)(\d{3,3})$/, '$1 $2'); }

export function displayableDate(value, shouldCapitalize) {
  const date = new Date(value);
  const months = ['Janvier', 'Février', 'Mars', 'Avril', 'May', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return ` ${shouldCapitalize ? 'L' : 'l'}e ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

export function oneDecimal(value) {
  if (!value || isNaN(value)) return 0;
  if (value >= 10 || value <= -10) return Math.floor(value);
  return Number.parseFloat(Number.parseFloat(value).toFixed(1));
}

/**
 * @param  {number} value the value to format
 * @param  {boolean=} round=false if it should round the value
 * @return {number}
 */
export function formatPercent(value, round = false) {
  if (!value || isNaN(value)) return 0.0;
  let formated = round ? Math.round(value) : value;
  formated = oneDecimal(formated);
  /* same as frenchFloating but with numbers */
  if(formated >= 0 && formated < 10 && Number.isInteger(formated)) {
    formated = +Math.floor(formated).toFixed(1);
  }
  return formated;
}

/* to stay the same as erep */
export function formatGrade_5(value) {
  if (!value || isNaN(value)) return 0;
  return oneDecimal(value / 2);
}

/* to stay the same as erep */
export function formatGrade_10(value) {
  if (!value || isNaN(value)) return 0;
  return oneDecimal(formatGrade_5(value) * 2);
}

/* to stay the same as erep */
export function formatRound(value) {
  if (!value || isNaN(value)) return 0;
  return Math.round(value);
}

/**
 * Method that search and replace values
 * @param {String} searchString String to search and replace
 * @param {String} replaceString replacement word
 * @param {String} text
 * @returns {String} text replaced with the new word
 */
 export function searchAndReplaceValues(searchString, replaceString, text) {
  const regExp = new RegExp(searchString, 'g')
  return text.replace(regExp, replaceString);
}
/**
 * Method that get Rating Category
 * @param {Number} rating
 * @returns {String} obtain a value in base of rating
 */
export function getRatingCategory(rating) {
  if (rating >= 9){
    return 'promoter';
  }
  else if(rating >= 7) {
    return 'passive';
  }
  return 'detractor';
}

/**
 * Method that make a Signature and Group of garage
 * @param {Array} garageSignatures
 * @param {String} garageId
 * @returns {Object}
 */
export function garageSignaturesGroup(garageSignatures, garageId) {
  if(!garageSignatures)
    return {signature: '', group:''}

  const { firstName = '', lastName = '', job = '', group = '' } = garageSignatures.find((item) => item._id.toString() === garageId) || {};

  return {
    signature: `${firstName} ${lastName}, ${job}`,
    group,
  };
}
/**
 * @param {String} fullName
 * @returns {String} Initials Name
 */
export function getInitialsName(fullName) {
  if (!fullName) {
    return '-';
  }
  return fullName
    .split(' ')
    .map((data) => data.substring(0, 1))
    .join('');
}

export function getDataTemplate(garageSignatures, garageId, currentUser, initialName, garageName) {
  const { signature, group } = garageSignaturesGroup(garageSignatures, garageId);
  const { firstName, lastName} = currentUser
  return {
    InitialName: initialName,
    GarageName: garageName,
    FirstName: firstName,
    LastName: lastName,
    Sign: signature,
    GroupName: group
  };
}

/**
 * Method that reload search filters from route url
 * @param {Object} route
 * @param {Array} filtersConfig
 * @returns {Object}
 */
export function generateSubFiltersWithRoute(route, filtersConfig) {
  const finalFilters = {};

  filtersConfig.forEach(e => {
    if (route.query[e.query]) {
      const value = e.callbackValue
        ? e.callbackValue(route.query[e.query])
        : route.query[e.query];
      const payload =
        typeof e.payload === 'object'
          ? Object.assign(e.payload, { value })
          : value;
      finalFilters[payload.filter] = payload.value;
    }
  });
  return finalFilters;
}

export function getGaragesIdsFromTags(tags, tagsSelected) {
  const garageIds = tags.reduce(
    (garageIds, tag) => {
      if (tagsSelected.includes(tag.value)) {
        return [...garageIds, ...tag.garageIds];
      }
      return garageIds;
    },
    [],
  );

  return Array.from(new Set(garageIds));
}
