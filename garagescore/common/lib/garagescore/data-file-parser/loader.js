let app = null;
/**
Load schemas from jsons stored in database
*/

const initApp = () => {
  if (!app) {
    app = require('../../../../server/server'); // eslint-disable-line
  }
};
const dataTypes = require('../../../../common/models/data/type/data-types');

/** load an from json*/
const loadFromJSON = (config, columns, vehicleMakes, parseTypes, callback) => {
  const confSchema = JSON.parse(JSON.stringify(config));
  confSchema.columns = JSON.parse(JSON.stringify(columns));

  // now we have to transform our json, before using the database, configs were store in files with a different format...

  // makes
  const mmm = JSON.parse(JSON.stringify(vehicleMakes.makes));
  const refactoredMakes = {};
  for (let mm in mmm) {
    // eslint-disable-line
    for (let m = 0; m < mmm[mm].length; m++) {
      refactoredMakes[mmm[mm][m]] = mm;
    }
  }
  confSchema.format.vehicleMake = refactoredMakes;

  //types
  confSchema.format.dataTypes = {};
  const typeValues = dataTypes.values();
  for (let i = 0; i < typeValues.length; i++) {
    if (parseTypes[typeValues[i]]) {
      for (let j = 0; j < parseTypes[typeValues[i]].length; j++) {
        confSchema.format.dataTypes[parseTypes[typeValues[i]][j]] = typeValues[i];
      }
    }
  }

  // foreigns
  if (confSchema.foreigns) {
    delete confSchema.foreigns.parserVehicleMakesId;
    delete confSchema.foreigns.parserColumnsId;
    delete confSchema.foreigns.parserTypesId;
  } else {
    confSchema.foreigns = {};
  }
  for (let col in confSchema.columns) {
    // eslint-disable-line
    if (col.indexOf('foreigns_') === 0) {
      const c = col.substr(9);
      confSchema.foreigns[c] = confSchema.columns[col];
      delete confSchema.columns[col];
    }
  }
  // transformers
  if (confSchema.transformers) {
    const transformers = [];
    if (confSchema.transformers.tsvToCsv === '1') {
      transformers.push({ name: 'tsv-to-csv', options: {} });
    }
    if (confSchema.transformers.vsvToCsv === '1') {
      transformers.push({ name: 'vsv-to-csv', options: {} });
    }
    if (confSchema.transformers.psvToCsv === '1') {
      transformers.push({ name: 'psv-to-csv', options: {} });
    }
    if (confSchema.transformers.colsizeCsv) {
      transformers.push({ name: 'colsize-csv', options: { size: confSchema.transformers.colsizeCsv.toString() } });
    }

    if (confSchema.transformers.fixedLengthToCsv) {
      const lengths = confSchema.transformers.fixedLengthToCsv.toString().split(',');
      if (lengths.length > 1) {
        transformers.push({ name: 'fixedlength-to-csv', options: { lengths } });
      }
    }
    if (confSchema.transformers.headerlessCsv) {
      const o = confSchema.transformers.headerlessCsv;
      const options = typeof o === 'string' ? { header: o } : o;

      let emptyConf = true;
      if (o.header) {
        emptyConf = false;
      }
      const keys = Object.keys(o); // return empty if its not an object
      keys.forEach((k) => {
        if (o[k].header) {
          emptyConf = false;
        }
      });
      if (!emptyConf) {
        transformers.push({ name: 'headerless-csv', options });
      }
    }
    if (!confSchema.fileformat) {
      confSchema.fileformat = {};
    }
    confSchema.transformers = transformers; // eslint-disable-line
  }
  callback(null, confSchema);
};

/** load an from a parerconfig reference stored in db*/
const load = (reference, callback) => {
  initApp();
  app.models.ParserConfig.findOne({ where: { _reference: reference } }, (err, config) => {
    if (err) {
      callback(err);
      return;
    }
    if (!config) {
      callback(new Error(`No parser config ${reference} found `));
      return;
    }
    if (!config.foreigns) {
      callback(new Error(`No foreigns for config ${reference} found `));
      return;
    }
    if (!config.foreigns.parserColumnsId) {
      callback(new Error(`No parserColumnsId for config ${reference} found `));
      return;
    }
    if (!config.foreigns.parserVehicleMakesId) {
      callback(new Error(`No parserVehicleMakesId for config ${reference} found `));
      return;
    }

    app.models.ParserColumns.findById(config.foreigns.parserColumnsId, (err2, columns) => {
      if (err2) {
        callback(err2);
        return;
      }
      if (!columns) {
        callback(new Error(`No columns ${config.foreigns.parserColumnsId} found `));
        return;
      }
      app.models.ParserVehicleMakes.findById(config.foreigns.parserVehicleMakesId, (err3, vehicleMakes) => {
        if (err3) {
          callback(err3);
          return;
        }
        if (!columns) {
          callback(new Error(`No vehicleMakes ${config.foreigns.parserVehicleMakesId} found `));
          return;
        }
        app.models.ParserTypes.findById(config.foreigns.parserTypesId, (err4, parseTypes) => {
          if (err4) {
            callback(err3);
            return;
          }
          if (!columns) {
            callback(new Error(`No parseTypes ${config.foreigns.parserTypesId} found `));
            return;
          }
          loadFromJSON(config, columns, vehicleMakes, parseTypes, callback);
        });
      });
    });
  });
};

/** List of references in the db */
const availableReferences = (callback) => {
  initApp();
  app.models.ParserConfig.find({}, (err, configs) => {
    if (err) {
      callback(err, []);
      return;
    }
    callback(
      null,
      configs.map((c) => c._reference)
    );
  });
};

module.exports = { availableReferences, load, loadFromJSON };
