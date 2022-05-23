const fs = require('fs');
const path = require('path');
const csvParser = require('csv');
const { LocaleTypes } = require('../../../frontend/utils/enumV2');
const parseArgs = require('minimist');

const GLOBAL = {
  csvRows: [],
  JSONToFile(json, filePath) {
    return fs.writeFileSync(filePath, JSON.stringify(json, null, 2));
  },
  exitWithError(msg = 'Error occured') {
    console.error('\x1b[31m', msg, '\x1b[0m');
    process.exit(1);
  },
};

(function main() {
  /* parse arguments */
  const { csvFilename } = parseArgs(process.argv.slice(2))

  /* read csv */
  fs.createReadStream(path.resolve(__dirname, csvFilename))
    .pipe(csvParser.parse({ delimiter: ',' }))
    .on('data', (row) => {
      GLOBAL.csvRows.push(row);
    })
    .on('end', () => {
      /* filter out non json files */
      const csvRows = GLOBAL.csvRows.filter((row) => row[0] && row[0].endsWith('.json'));
      const validRows = [];
      /* check that filePath is valid, use cache to avoid duplicate path validation*/
      const isFilePathValidCache = {};
      for (const row of csvRows) {
        /* handle multiple file path separated by || */
        const filePaths = row[0].split('||');
        filePaths.forEach((filePath) => {
          row[0] = filePath;
          if (isFilePathValidCache[filePath] === undefined) {
            isFilePathValidCache[filePath] = fs.existsSync(filePath);
          }

          if (isFilePathValidCache[filePath]) {
            validRows.push([...row]);
          }
        });
      }

      /* build an object with grouped filePath : { <filePath> : [<row>, <row>] }*/
      const formatedRows = validRows.reduce((acc, cv) => {
        const filePath = cv[0];
        if (acc[filePath] === undefined) acc[filePath] = [];
        acc[filePath].push({ key: cv[1], fr: cv[2], en: cv[5], es: cv[3], ca: cv[4], nl: cv[6] });
        return acc;
      }, {});

      /* get all unique langages from enum */
      /* ['fr', 'en', 'es', 'ca', 'nl'] */
      const requiredLanguages = [
        ...new Set(LocaleTypes.keys().map((locale) => LocaleTypes.getProperty(locale, 'language'))),
      ];
      /* process each distinct filePath */
      for (const filePath in formatedRows) {
        console.log('\x1b[33m', `\u2022 [Info] Processing file : "${path.parse(filePath).base}"`, '\x1b[0m');

        /* get the content of the json file */
        const jsonContent = JSON.parse(fs.readFileSync(filePath));
        /* process each row in filePath */
        for (const row of formatedRows[filePath]) {
          /* set translation for each language */
          for (const lang of requiredLanguages) {
            if (jsonContent[lang] === undefined) {
              jsonContent[lang] = {};
            }
            jsonContent[lang][row.key] = row[lang];
          }
        }

        /* write to file */
        GLOBAL.JSONToFile(jsonContent, filePath);
        console.log('\x1b[32m', `\t- [Success] Successfully processed : "${path.parse(filePath).base}"`, '\x1b[0m');
      }
    });
})();
