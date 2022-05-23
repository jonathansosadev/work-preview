const communes = require('../../../../resources/cities_FR');
const levenshtein = require('../../util/levenshtein');

// some manual normalisation...
const clean = function clean(c) {
  if (!c) {
    return '';
  }
  return c
    .toLowerCase()
    .replace(/-/g, ' ')
    .replace(/\bst\b/, 'saint')
    .replace(/\s*cedex[ 0-9]*/, '');
};

// list of all cities
const raw = {};
const dictionnary = Object.keys(communes).map((c) => {
  const cleaned = clean(c);
  raw[cleaned] = c;
  return cleaned;
});
// if our word is 3 char, we dont want to compute the distance with words of 15 chars
const _dictionnaryForSize = [];
_dictionnaryForSize.push([]);
_dictionnaryForSize.push([]);
for (let i = 2; i < 30; i++) {
  _dictionnaryForSize[i] = [];
  dictionnary.forEach((w) => {
    if (w.length > i - 4 && w.length < i + 4) {
      _dictionnaryForSize[i].push(w);
    }
  });
}
const _getDictionnaryForSize = function _getDictionnaryForSize(size) {
  if (size < 2) {
    return [];
  }
  if (size >= _dictionnaryForSize.length) {
    return [];
  }
  return _dictionnaryForSize[size];
};

const communesClean = {};
for (let c in communes) {
  // eslint-disable-line
  communesClean[clean(c)] = communes[c];
}
/**
Normalize city name

Use levenshtein distance to compare the name to normalize with a dictionnary of city names,
if the name is sufficiently close to one our of names in our dictionnay it will be chosed
if not we chechk the postal code and allow a greater lev distance if the city codes are the same
else we return null
*/

const normalize = (name, postCode) => {
  try {
    if (communes[name]) {
      return name;
    }
    if (typeof postCode === 'number') {
      postCode = String(postCode); // eslint-disable-line
    }
    const cleaned = clean(name);
    const dico = _getDictionnaryForSize(cleaned.length);
    const suggests = levenshtein.closest(cleaned, dico, 3);
    if (suggests) {
      // has one of the suggestion the same postcode ?
      if (postCode) {
        for (let s = 0; s < suggests.length; s++) {
          const p = communes[raw[suggests[s]]];
          if (!p) {
            continue;
          } // eslint-disable-line no-continue
          if (p === postCode || p.substr(0, 2) === postCode.substr(0, 2)) {
            return raw[suggests[s]];
          }
        }
      }
      const distance = levenshtein.distance(cleaned, suggests[0]);
      if (distance < 4) {
        return raw[suggests[0]];
      }
    }
  } catch (e) {
    console.error(`Error normalizing ${name} ${postCode}`);
  }
  return null;
};

module.exports = { normalize };
