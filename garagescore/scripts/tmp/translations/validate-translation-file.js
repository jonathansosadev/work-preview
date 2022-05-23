const fs = require('fs');
const PATH = require('path');
const { LocaleTypes } = require('../../../frontend/utils/enumV2');

const GLOBAL = {
  availableArgs: [
    { name: 'filePath', hasValue: true, required: true },
    { name: 'detailed', hasValue: false, required: false },
  ],
  filePath: null,
  detailed: false,
  parseArgs(args = []) {
    this.availableArgs.forEach(({ name, hasValue, required = false }) => {
      const arg = args.find((arg) => arg.startsWith(`--${name}`));
      if (!arg && required) {
        this.exitWithError(`Missing required argument "${name}"`, true);
      }
      if (hasValue) {
        const value = arg.split('=')[1];
        if (!value) {
          this.exitWithError(`Missing value for required argument "${name}"`, true);
        }
        this[name] = value;
      } else {
        this[name] = arg ? true : false;
      }
    });
  },
  /* checks if file exists at specified path */
  isValidPath(path = null) {
    return fs.existsSync(path);
  },
  /* checks if file exists at specified path */
  isJSONFile(path = null) {
    return PATH.parse(path).ext === '.json';
  },
  printUsage() {
    this.logInfo(
      `Usage : node scripts/tmp/translations/validate-translation-file.js --filePath=frontend/i18n/translations/components/global/exports/ButtonExport.json --detailed`
    );
  },
  logInfo(msg) {
    console.log('\x1b[33m', `\u2022 [INFO] ${msg}`, '\x1b[0m');
  },
  logReport(keys = [], detailed = false) {
    if (detailed) {
      keys.forEach(({ key = '', languages = [] }) =>
        console.log('\x1b[31m', `\t - "${key}"`, '\x1b[0m', `in`, '\x1b[31m', `[${languages}]`, '\x1b[0m')
      );
    } else {
      console.log(
        '\x1b[31m',
        `${JSON.stringify(
          keys.map(({ key }) => key),
          null,
          2
        )}`,
        '\x1b[0m'
      );
      this.logInfo('Run with flag "--detailed" to see in which languages the keys are invalids');
    }
  },
  exitWithError(msg = 'Error occured', printUsage = false) {
    console.error('\x1b[31m', `\u2022 [ERROR] ${msg}`, '\x1b[0m');
    printUsage && this.printUsage();
    process.exit(1);
  },
};

//--------------------------------------------------------------------------------------//
//                                        Checks                                        //
//--------------------------------------------------------------------------------------//

function checkThatAllLanguagesAreValid(jsonContent = {}, requiredLanguages = []) {
  const jsonLanguages = Object.keys(jsonContent);
  jsonLanguages.forEach((language) => {
    if (!requiredLanguages.includes(language)) {
      GLOBAL.exitWithError(`Invalid language "${language}" found`);
    }
  });
}

function checkThatAllLanguagesArePresent(jsonContent = {}, requiredLanguages = []) {
  const arrayDiff = (a, b) => {
    const sA = new Set(a);
    const sB = new Set(b);
    return [...a.filter((x) => !sB.has(x)), ...b.filter((x) => !sA.has(x))];
  };
  /* get all languages in json file */
  const jsonLanguages = Object.keys(jsonContent);
  /* compare with requiredLanguages*/
  const diff = arrayDiff(requiredLanguages, jsonLanguages);

  if (diff.length) {
    GLOBAL.exitWithError(`Missing required languages "${diff.join(', ')}"`);
  }
}

/* we compare keys in "fr" to the keys in others languages */
function checkThatAllKeysArePresent(jsonContent = {}, requiredLanguages = []) {
  const missingKeys = [];
  Object.keys(jsonContent['fr']).forEach((key) => {
    requiredLanguages.slice(1).forEach((language) => {
      const jsonKeyValue = jsonContent[language][key];
      /* key is present in fr but in current language */
      if (jsonKeyValue === undefined) {
        const missingKeyIndex = missingKeys.findIndex((missingKey) => missingKey.key === key);
        missingKeyIndex === -1
          ? missingKeys.push({ key, languages: [language] })
          : missingKeys[missingKeyIndex].languages.push(language);
      }
    });
  });

  if (missingKeys.length) {
    console.log('\x1b[31m', `\u2022 [ERROR] : Found ${missingKeys.length} missing keys compared to 'fr'`, '\x1b[0m');
    GLOBAL.logReport(missingKeys, GLOBAL.detailed);
    process.exit(1);
  }
}

function checkThatNoUnprocessedKeysIsPresent(jsonContent = {}, requiredLanguages = []) {
  const unProcessedKeys = [];
  requiredLanguages.slice(1).forEach((lang) => {
    const keys = Object.keys(jsonContent[lang]);
    keys.forEach((key) => {
      const jsonKeyValue = jsonContent[lang][key];
      if (!jsonKeyValue.length || jsonKeyValue.includes(`(${lang})`) || jsonKeyValue.includes(`${lang}(`)) {
        const unprocessedKeyIndex = unProcessedKeys.findIndex((unProcessedKey) => unProcessedKey.key === key);
        unprocessedKeyIndex === -1
          ? unProcessedKeys.push({ key, languages: [lang] })
          : unProcessedKeys[unprocessedKeyIndex].languages.push(lang);
      }
    });
  });

  if (unProcessedKeys.length) {
    console.log('\x1b[31m', `\u2022 [ERROR] : Found ${unProcessedKeys.length} unProcessed keys`, '\x1b[0m');
    GLOBAL.logReport(unProcessedKeys, GLOBAL.detailed);
    process.exit(1);
  }
}

//--------------------------------------------------------------------------------------//
//                                         JSON                                         //
//--------------------------------------------------------------------------------------//

function readJSONFile(path = null) {
  /* read json file */
  try {
    const jsonContent = JSON.parse(fs.readFileSync(path));
    return jsonContent;
  } catch (error) {
    GLOBAL.exitWithError(`Invalid JSON : ${error.message}`);
  }
}

//--------------------------------------------------------------------------------------//
//                                 Arguments validation                                 //
//--------------------------------------------------------------------------------------//

function validateArgs(args = []) {
  /* parse arguments */
  GLOBAL.parseArgs(args);

  /* checks that filePath is a valid path*/
  if (!GLOBAL.isValidPath(GLOBAL.filePath)) {
    GLOBAL.exitWithError(`Invalid Path : ${GLOBAL.filePath}`, true);
  }
  /* checks that filePath is a json file*/
  if (!GLOBAL.isJSONFile(GLOBAL.filePath)) {
    GLOBAL.exitWithError(`Invalid File : JSON file expected, received ${GLOBAL.filePath}`, true);
  }
}

//--------------------------------------------------------------------------------------//
//                                        START                                         //
//--------------------------------------------------------------------------------------//

(function main() {
  /* checks that args are valid */
  validateArgs(process.argv.slice(2));

  /* logs */
  GLOBAL.logInfo(`Processing File: "${GLOBAL.filePath}"`);

  /* get parsed json content */
  const jsonContent = readJSONFile(GLOBAL.filePath);

  /* get all required langages from enum */
  /* ['fr', 'en', 'es', 'ca', 'nl'] */
  const requiredLanguages = [
    ...new Set(LocaleTypes.keys().map((locale) => LocaleTypes.getProperty(locale, 'language'))),
  ];

  /*checks that all languages are valid */
  checkThatAllLanguagesAreValid(jsonContent, requiredLanguages);
  /*checks that all required languages are present in the json file */
  checkThatAllLanguagesArePresent(jsonContent, requiredLanguages);
  /* checks that all fr keys are present in each language */
  checkThatAllKeysArePresent(jsonContent, requiredLanguages);
  /* checks for unprocessed keys */
  /* unprocessed keys = empty || es("french") || "french" es() */
  checkThatNoUnprocessedKeysIsPresent(jsonContent, requiredLanguages);

  /* log success */
  console.log('\x1b[32m', `\u2713 [SUCCESS] File is valid`, '\x1b[0m');
})();
