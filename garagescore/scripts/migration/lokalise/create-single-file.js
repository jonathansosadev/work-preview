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

/** Convert array ["a", "b", "c"] to {"0":"a","1":"b","2":"c"} */
function convertArrays(o) {
  const res = {};
  Object.keys(o).forEach((k) => {
    const v = o[k];
    if (Array.isArray(v)) {
      res[k] = convertArrays(Object.assign({}, v));
    } else if (typeof v === 'object') {
      res[k] = convertArrays(v);
    } else {
      res[k] = v;
    }
  });
  return res;
}

const main = async (translationsDir, lang) => {
  const globalJson = {};

  const files = await _getFiles(translationsDir, '.json');
  files.forEach((tradFile) => {
    const path = tradFile.replace(__dirname + '/', '');
    if (path.indexOf('.json')) {
      //console.log(path);
      try {
        const t = convertArrays(JSON.parse(fs.readFileSync(tradFile, 'utf8'))[lang]);
        if (Object.keys(t).length > 0) {
          globalJson[
            path
              .replace(translationsDir + '/', '')
              .replace('.json', '')
              .replace(/\//g, ':')
          ] = t; // lokalize bug with /
        }
      } catch (e) {
        //console.error(path,e.message);
      }
    }
  });
  console.log(JSON.stringify(globalJson, null, 2));
};

/*

node scripts/migration/lokalise/create-single-file.js fr > frontend/translations/fr.json
node scripts/migration/lokalise/create-single-file.js es > frontend/translations/es.json
node scripts/migration/lokalise/create-single-file.js ca > frontend/translations/ca.json
node scripts/migration/lokalise/create-single-file.js en > frontend/translations/en.json
node scripts/migration/lokalise/create-single-file.js nl > frontend/translations/nl.json

*/

const translationsDir = path.resolve(path.join(__dirname), '../../..', 'frontend/i18n/translations');
main(translationsDir, process.argv[2]);
