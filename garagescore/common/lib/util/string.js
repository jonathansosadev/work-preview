function removeAccents(str) {
  let result = str.toString() || '';
  result = result.replace(/Ä|Å|à|ä|à|á|â|ä|å|À|Á|Â|Ã/g, 'a');
  result = result.replace(/ç|Ç/g, 'c');
  result = result.replace(/ê|é|ë|è|Ê|Ë|É|È/g, 'e');
  result = result.replace(/ï|í|î|ì|Í|Ì|Î|Ï/g, 'i');
  result = result.replace(/ñ|Ñ/g, 'n');
  result = result.replace(/œ|Œ/g, 'oe');
  result = result.replace(/ô|ö|ò|õ|ó|ø|Ó|Ô|Õ|Ø|Ö|Ò/g, 'o');
  result = result.replace(/š|Š/g, 's');
  result = result.replace(/ú|ü|û|ù|Ù|Ú|Ü|Û/g, 'u');
  result = result.replace(/ÿ|Ÿ|ý|Ý/g, 'u');
  result = result.replace(/ž|Ž/g, 'z');
  return result;
}

module.exports = {
  // this function compare if strings are really equal
  // it ignore repeated spaces and spaces in start and end
  // it compare the lower case version of the two strings
  deepEquality(str1, str2) {
    if (!str1 && !str2) return true;
    if (str1 && str2) {
      return (
        str1.toString().replace(/\s+/, ' ').trim().toLowerCase() ===
        str2.toString().replace(/\s+/, ' ').trim().toLowerCase()
      );
    }
    return false;
  },
  capitalize(s) {
    return s.charAt(0).toUpperCase() + s.substring(1).toLowerCase();
  },
  normalizeSpaces(str) {
    // trim spaces + replace a chain of spaces by one space
    let result = str.toString() || '';
    result = result.trim().replace(/\s+/g, ' ');
    return result;
  },
  removeSpaces(str) {
    // trim spaces + replace a chain of spaces by one space
    let result = str.toString() || '';
    result = result.trim().replace(/\s/g, '');
    return result;
  },
  removeAccents,
  slugify(str) {
    return removeAccents(str.trim()).replace(/\s+/g, '-').toLowerCase();
  },
};
