const path = require('path');
const fs = require('fs');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);

async function _getFiles(dir, filter) {
  const subdirs = await readdir(dir);
  const files = await Promise.all(
    subdirs.map(async (subdir) => {
      const res = path.resolve(dir, subdir);
      return (await stat(res)).isDirectory() ? _getFiles(res) : res;
    })
  );
  return files.reduce((a, f) => a.concat(f), []).filter((f) => (filter ? f.indexOf(filter) >= 0 : true));
}
const getTranslationsJson = async () => {
  const directories = ['frontend/i18n'];
  const globalJson = {};

  for (const directory of directories) {
    const translationsDir = path.resolve(path.join(__dirname, '../../../..', directory, 'translations'));
    const files = await _getFiles(translationsDir, '.json');
    files.forEach((tradFile) => {
      console.log(tradFile);
      globalJson[tradFile] = JSON.parse(fs.readFileSync(tradFile, 'utf8'));
    });
  }
  return globalJson;
};

const checkMissingKeys = (allTranslations, lang, base = 'fr') => {
  const missing = {};
  // eslint-disable-next-line
  for (const translationFile in allTranslations) {
    const baseJson = allTranslations[translationFile][base];
    const comparedJson = allTranslations[translationFile][lang];
    if (comparedJson) {
      const missingKeys = Object.keys(baseJson).filter(
        (baseKey) => !comparedJson[baseKey] || comparedJson[baseKey] === ''
      );
      if (missingKeys.length) missing[translationFile] = missingKeys;
    } else {
      missing[translationFile] = Object.keys(baseJson);
    }
  }
  return missing;
};

module.exports = { getTranslationsJson, checkMissingKeys };
