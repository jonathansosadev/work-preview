/** Find missing translations and give a lexicon
 *
 * Returns {missing, current}
 * Missing a list of expressions not translated
 * current an array of {source, target} giving the existing transations
 *
 */
const path = require('path');
const fs = require('fs');
const { promisify } = require('util');
const { resolve } = require('path');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
/** list all files recursively in a directory */
async function _getFiles(dir, filter) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? _getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []).filter((f) => (filter ? f.indexOf(filter) >= 0 : true));
}

const nuxtPath = 'frontend/i18n';

/**
 * Returns an object 'expression in french' => 'expression in lang' (false if no translations)
 */
async function getTranslations(directory, lang) {
  const traverse = (o, fn, prev = []) => {
    for (var i in o) {
      // eslint-disable-line
      const keys = [...prev, i];
      if (typeof o[i] === 'string') fn.apply(this, [keys.join('.'), o[i]]);
      if (o[i] !== null && typeof o[i] === 'object') {
        traverse(o[i], fn, keys);
      }
    }
  };

  const translationsDir = path.resolve(path.join(__dirname, '../../../..', directory, 'translations'));
  const files = await _getFiles(translationsDir, '.json');
  const key2french = {};
  const translations = {};
  // get all values in french
  files.forEach((tradFile) => {
    try {
      const json = JSON.parse(fs.readFileSync(tradFile, 'utf8'));
      traverse(json.fr, (vpath, value) => {
        key2french[`${tradFile}::${vpath}`] = value;
        translations[value] = false;
      });
    } catch (e) {
      console.error(tradFile);
      console.error(e);
    }
  });
  // get translations in lang
  files.forEach((tradFile) => {
    try {
      const json = JSON.parse(fs.readFileSync(tradFile, 'utf8'));
      traverse(json[lang], (vpath, value) => {
        const french = key2french[`${tradFile}::${vpath}`];
        if (value.indexOf('es(') !== 0 && value.indexOf('en(') !== 0 && value.indexOf('ca(') !== 0 && value !== '??') {
          translations[french] = value;
        }
      });
    } catch (e) {
      console.error(tradFile);
      console.error(e);
    }
  });
  return translations;
}

module.exports = async function (lang, includeNotMissing = false) {
  const nuxtTranslations = await getTranslations(nuxtPath, lang);
  // assign can override a translation with a false
  // const translations = Object.assign({}, nuxtTranslations, nunjucksTranslations);
  const translations = Object.assign({}, nuxtTranslations);

  const current = [];
  const missing = [];
  Object.keys(translations).forEach((s) => {
    if (includeNotMissing) {
      missing.push(s);
    } else {
      const t = translations[s];
      if (t === false || t.indexOf('es(') === 0 || t.indexOf('en(') === 0 || t.indexOf('ca(') === 0 || t === '??') {
        if (s.trim().length > 0) {
          missing.push(s);
        }
      } else {
        current.push({ source: s, target: t });
      }
    }
  });
  return { missing, current };
};
