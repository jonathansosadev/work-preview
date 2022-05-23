export function getSearchFilterRegexp(searchedWord, getRegexpObject, removeSpaces, replaceSpacesByOr) {
  let result = searchedWord;
  if (removeSpaces) {
    result = removeSpacesString(result);
  }
  if (replaceSpacesByOr) {
    result = result.replace(' ', '|');
  }
  result = result.replace(/[aàâ]/gi, '[aàâ]');
  result = result.replace(/[eéèëê]/gi, '[eéèëê]');
  result = result.replace(/[iîï]/gi, '[iîï]');
  result = result.replace(/[oôö]/gi, '[oôö]');
  result = result.replace(/[uùû]/gi, '[uùû]');
  result = result.replace(/[cç]/gi, '[cç]');
  result = result.replace(/\*/g, '\\*');
  result = getRegexpObject ? new RegExp(`(${result})`, 'i') : `/${result}/i`;
  return result;
}

export function removeSpacesString(str) {
  // trim spaces + replace a chain of spaces by one space
  let result = str.toString() || '';
  result = result.trim().replace(/\s/g, '');
  return result;
}