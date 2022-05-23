/** Listing all raw fields (from csv, xls or xml) in db
 * And return for each of them N non empty values
 */

const app = require('../../server/server');
const promises = require('../../common/lib/util/promises');

const N = 10;

/** return all raw fields we parse */
const getParsedFields = async () => {
  const statics = [
    'Carbase/sofida-csv.js',
    'ERIC/tigre-xml-no-psv-filter.js',
    'Everlog/everlog.js',
    'Carbase/sofida-xlsx.js',
    'Cobredia/cobredia-mix.js',
    'Generic/csv-ddmmyyyy.js',
    'Generic/xlsx-ddmmyyyy.js',
    'Generic/xlsx-ddmmyyyy_hhmm.js',
    'Generic/xlsx-mmddyyyy_hhmm.js',
    'Generic/xlsx-mmddyyyy.js',
    'DCS/dcsnet-global.js',
    'DCS/dcsnet-ddmmyyyy.js',
    'DCS/dcsnet-mmddyyyy.js',
    'DataFirst/datafirst.js',
    'IcarSystems/dmd.js',
    'ERIC/eric-global-xml.js',
    'ERIC/eric-xml.js',
    'ERIC/maurel-xlsx.js',
    'IcarSystems/icarsystems.js',
    'MecaPlanning/mecaplanning.js',
    'tom-auto-v1.js',
  ];
  const res = {};
  // get columns form static schemas
  statics.forEach((path) => {
    const schema = require(`../../common/lib/garagescore/data-file/import-schema/${path}`);
    const id = schema.ID;
    const columns = schema.config && schema.config.columns;
    if (id && columns) {
      Object.values(columns).forEach((c) => {
        if (Array.isArray(c)) {
          c.forEach((cc) => {
            if (!res[cc]) {
              res[cc] = [id];
            } else if (res[cc].indexOf(id) < 0) {
              res[cc].push(id);
            }
          });
        } else if (!res[c]) {
          res[c] = [id];
        } else if (res[c].indexOf(id) < 0) {
          res[c].push(id);
        }
      });
    }
  });
  // get columns from dynamic parsers
  const find = promises.makeAsync(app.models.ParserColumns.find.bind(app.models.ParserColumns));
  const configs = await find({});
  configs.forEach((conf) => {
    const config = JSON.parse(JSON.stringify(conf));
    const id = config._reference;
    Object.values(config).forEach((c) => {
      if (Array.isArray(c)) {
        c.forEach((cc) => {
          if (!res[cc]) {
            res[cc] = [id];
          } else if (res[cc].indexOf(id) < 0) {
            res[cc].push(id);
          }
        });
      }
    });
  });
  return res;
};
/** return all raw fields in db with up to N example values */
const getRawFields = async () => {
  const res = {};
  return app.models.Data.findWithProjection({}, { 'source.raw.cells': 1 })
    .forEach(async (data) => {
      const cells = data.get('source.raw.cells');
      if (cells) {
        const fields = Object.keys(cells);
        fields.forEach((field) => {
          const value = cells[field];
          if (value && (!res[field] || res[field].length < N)) {
            if (!res[field]) {
              res[field] = [];
            }
            res[field].push(value);
          }
        });
      }
    })
    .then(() => {
      return Promise.resolve(res); // eslint-disable-line
    })
    .catch((e) => {
      console.error(e);
      return Promise.reject(e); // eslint-disable-line
    });
};
const main = async () => {
  console.time('time');
  try {
    console.log('Listing all parsed fields...');
    const parsedFields = await getParsedFields();
    console.log('Listing all raw fields in db...');
    const res = await getRawFields();
    console.timeEnd('time');
    const fields = Object.keys(res);
    console.log('champ;configurations utilisant le champ;Exemples de valeur');
    fields.forEach((field) => {
      const parsers = parsedFields[field] || '';
      console.log(`${field};${parsers};${res[field].join(';')}`);
    });
    console.log('Bye');
    process.exit();
  } catch (err) {
    console.timeEnd('time');
    console.log(`Finished with error: ${err}`);
    process.exit();
  }
};

if (require.main === module) {
  app.on('booted', main);
} else {
  module.exports = { getRawFields: getRawFields, getParsedFields: getParsedFields };
}
