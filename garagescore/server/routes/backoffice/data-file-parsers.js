const { AutoBrands, MotoBrands, CaravanBrands, OtherBrands } = require('../../../frontend/utils/enumV2');
const dataTypes = require('../../../common/models/data/type/data-types');
const gsDataFileTypes = require('../../../common/models/data-file.data-type');

const __SaveModel = function (app, res, model, id, data) {
  const upsert = function (cb) {
    if (id === '-1') {
      app.models[model].create(data, cb);
    } else {
      app.models[model].findById(id, (err, org) => {
        if (err) {
          res.status(500).send({ status: 'ko', message: err.message });
          return;
        }
        if (!org) {
          res.status(500).send({ status: 'ko', message: `No instance found for ${id}` });
          return;
        }
        for (const k in app.models[model].definition.properties) {
          // eslint-disable-line
          if (!data[k]) {
            data[k] = null; // eslint-disable-line
          }
        }
        org.updateAttributes(data, cb);
      });
    }
  };
  upsert((err, ups) => {
    if (err) {
      res.status(500).send({ status: 'ko', message: err.message });
      return;
    }
    res.send({ status: 'ok', details: { id: ups.getId().toString() } });
  });
};

const _indexConfig = function index(app, req, res) {
  const currentId = req.query.currentId || -1;
  const getConfigs = function (cb) {
    app.models.ParserColumns.find({}, (errC, cArray) => {
      if (errC) {
        res.status(500).send({ status: 'ko', message: errC.message });
        return;
      }
      const columns = [];
      for (let i = 0; i < cArray.length; i++) {
        columns.push({ _reference: cArray[i]._reference, id: cArray[i].getId().toString() });
      }
      app.models.ParserVehicleMakes.find({}, (errM, mArray) => {
        if (errM) {
          res.status(500).send({ status: 'ko', message: errM.message });
          return;
        }
        const makes = [];
        for (let j = 0; j < mArray.length; j++) {
          makes.push({ _reference: mArray[j]._reference, id: mArray[j].getId().toString() });
        }
        app.models.ParserTypes.find({}, (errT, tArray) => {
          if (errT) {
            res.status(500).send({ status: 'ko', message: errT.message });
            return;
          }
          const types = [];
          for (let l = 0; l < tArray.length; l++) {
            types.push({ _reference: tArray[l]._reference, id: tArray[l].getId().toString() });
          }
          app.models.ParserConfig.find({}, (errG, gArray) => {
            if (errG) {
              res.status(500).send({ status: 'ko', message: errG.message });
              return;
            }
            const configs = {};
            for (let k = 0; k < gArray.length; k++) {
              configs[gArray[k].getId().toString()] = {
                _reference: gArray[k]._reference,
                id: gArray[k].getId().toString(),
              };
            }
            cb(null, configs, makes, columns, types);
          });
        });
      });
    });
  };
  getConfigs((err, configs, makes, columns, typesLists) => {
    res.render('darkbo/darkbo-campaigns/data-file-parsers-config', {
      current_tab: 'datafile-parsers',
      configs: JSON.stringify(configs),
      makes: JSON.stringify(makes),
      columns: JSON.stringify(columns),
      currentId,
      dataRecordTypes: [...dataTypes.getJobs(), dataTypes.UNKNOWN, 'VehicleSale'],
      typesLists: JSON.stringify(typesLists),
      dataFileTypes: gsDataFileTypes,
      dataRecordTypesJson: JSON.stringify([...dataTypes.getJobs(), dataTypes.UNKNOWN]), // Added for mixed vehicle at import moment
      dataFileTypesJson: JSON.stringify(gsDataFileTypes),
    });
  });
};
const _loadConfig = function index(app, req, res) {
  const configId = req.params.configId;
  if (!configId) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  app.models.ParserConfig.findById(configId, (err, config) => {
    if (err) {
      res.status(500).send({ status: 'ko', message: err.message });
      return;
    }
    if (!config) {
      res.status(500).send({ status: 'ko', message: `No instance found for ${configId}` });
      return;
    }
    res.send({ status: 'ok', config });
  });
};
const _saveConfig = function index(app, req, res) {
  const configId = req.body.configId;
  const config = req.body.config;
  if (!configId || !config) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  __SaveModel(app, res, 'ParserConfig', configId, config);
};
/* ***********************************************************/
const _indexColumns = function index(app, req, res) {
  const currentId = req.query.currentId || -1;
  const getConfigs = function (cb) {
    app.models.ParserColumns.find({}, (err, columns) => {
      if (err) {
        res.status(500).send({ status: 'ko', message: err.message });
        return;
      }
      const cr = {};
      for (let i = 0; i < columns.length; i++) {
        cr[columns[i].getId().toString()] = { _reference: columns[i]._reference, id: columns[i].getId().toString() };
      }
      cb(null, cr);
    });
  };
  getConfigs((err, configs) => {
    res.render('darkbo/darkbo-campaigns/data-file-parsers-columns', {
      current_tab: 'datafile-parsers',
      configs: JSON.stringify(configs),
      currentId,
    });
  });
};
const _loadColumns = function index(app, req, res) {
  const columnsId = req.params.columnsId;
  if (!columnsId) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  app.models.ParserColumns.findById(columnsId, (err, columns) => {
    if (err) {
      res.status(500).send({ status: 'ko', message: err.message });
      return;
    }
    if (!columns) {
      res.status(500).send({ status: 'ko', message: `No instance found for ${columnsId}` });
      return;
    }
    res.send({ status: 'ok', columns });
  });
};
const _saveColumns = function index(app, req, res) {
  const columnsId = req.body.columnsId;
  const columns = req.body.columns;
  if (!columnsId || !columns) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  __SaveModel(app, res, 'ParserColumns', columnsId, columns);
};
/* ***********************************************************/
const _indexMakes = function index(app, req, res) {
  const currentId = req.query.currentId || -1;
  const getConfigs = function (cb) {
    app.models.ParserVehicleMakes.find({}, (err, columns) => {
      if (err) {
        res.status(500).send({ status: 'ko', message: err.message });
        return;
      }
      const cr = {};
      for (let i = 0; i < columns.length; i++) {
        cr[columns[i].getId().toString()] = { _reference: columns[i]._reference, id: columns[i].getId().toString() };
      }
      cb(null, cr);
    });
  };
  getConfigs((err, configs) => {
    res.render('darkbo/darkbo-campaigns/data-file-parsers-makes', {
      current_tab: 'datafile-parsers',
      configs: JSON.stringify(configs),
      brands: JSON.stringify({ ...AutoBrands.toObject(), ...MotoBrands.toObject(), ...CaravanBrands.toObject(), ...OtherBrands.toObject() }),
      currentId,
    });
  });
};

const _loadMakes = function index(app, req, res) {
  const makesId = req.params.makesId;
  if (!makesId) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  app.models.ParserVehicleMakes.findById(makesId, (err, makes) => {
    if (err) {
      res.status(500).send({ status: 'ko', message: err.message });
      return;
    }
    if (!makes) {
      res.status(500).send({ status: 'ko', message: `No instance found for ${makesId}` });
      return;
    }
    res.send({ status: 'ok', makes });
  });
};
const _saveMakes = function index(app, req, res) {
  const makesId = req.body.makesId;
  const makes = req.body.makes;
  if (!makesId || !makes) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  __SaveModel(app, res, 'ParserVehicleMakes', makesId, makes);
};

// **************************************

const _indexUndefined = function index(app, req, res) {
  const currentId = req.query.currentId || -1;
  const getConfigs = function (cb) {
    app.models.ParserVehicleMakes.find({}, (err, columns) => {
      if (err) {
        res.status(500).send({ status: 'ko', message: err.message });
        return;
      }
      const cr = {};
      for (let i = 0; i < columns.length; i++) {
        cr[columns[i].getId().toString()] = { _reference: columns[i]._reference, id: columns[i].getId().toString() };
      }
      cb(null, cr);
    });
  };
  getConfigs((err, configs) => {
    res.render('darkbo/darkbo-campaigns/data-file-parsers-undefined', {
      current_tab: 'datafile-parsers',
      configs: JSON.stringify(configs),
      brands: JSON.stringify({ ...AutoBrands.toObject(), ...MotoBrands.toObject(), ...CaravanBrands.toObject(), ...OtherBrands.toObject() }),
      currentId,
    });
  });
};

const _loadUndefined = function (app, req, res) {
  app.models.UndefinedDictionary.find({ order: 'createdAt DESC' }, function (err, dictionary) {
    if (err) {
      res.send(500, err);
      return;
    }
    res.json(dictionary);
  });
};

const _applyUndefined = function (app, req, res) {
  const mongo = app.models.Data.getMongoConnector();
  const word = req.body.word;

  if (word) {
    mongo.updateMany(
      { 'service.frontDeskUserName': word },
      {
        $set: {
          'service.frontDeskUserName': 'UNDEFINED',
        },
      },
      null,
      function (err, updated) {
        if (err) {
          res.status(500).send(err);
          return;
        }
        res.json(updated);
      }
    );
  } else {
    res.status(500).send('NULL_ENTRY');
  }
};

const _saveUndefined = function (app, req, res) {
  const newWord =
    (req.body.word &&
      req.body.word
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')) ||
    null;

  if (newWord) {
    app.models.UndefinedDictionary.find({ where: { word: newWord } }, function (err, dictionary) {
      if (err) {
        res.status(500).send(err);
        return;
      }
      if (dictionary && dictionary.length > 0) {
        dictionary[0].destroy(function (err3) {
          if (err3) {
            res.status(500).send(err3);
            return;
          }
          res.json('DELETED');
        });
      } else {
        const wordToSave = new app.models.UndefinedDictionary({ word: newWord });
        wordToSave.save(function (err2, savedWord) {
          if (err2) {
            res.status(500).send(err2);
            return;
          }
          res.json(savedWord.word);
        });
      }
    });
  } else {
    res.status(500).send('NULL_ENTRY');
  }
};

// *******************************************

const _indexTypes = function index(app, req, res) {
  const currentId = req.query.currentId || -1;
  const getConfigs = function (cb) {
    app.models.ParserTypes.find({}, (err, types) => {
      if (err) {
        res.status(500).send({ status: 'ko', message: err.message });
        return;
      }
      const cr = {};
      for (let i = 0; i < types.length; i++) {
        cr[types[i].getId().toString()] = { _reference: types[i]._reference, id: types[i].getId().toString() };
      }
      cb(null, cr);
    });
  };
  getConfigs((err, configs) => {
    res.render('darkbo/darkbo-campaigns/data-file-parsers-types', {
      current_tab: 'datafile-parsers',
      configs: JSON.stringify(configs),
      dataTypes: JSON.stringify(dataTypes.translations()),
      currentId,
    });
  });
};
const _loadTypes = function index(app, req, res) {
  const typesId = req.params.typesId;
  if (!typesId) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  app.models.ParserTypes.findById(typesId, (err, types) => {
    if (err) {
      res.status(500).send({ status: 'ko', message: err.message });
      return;
    }
    if (!types) {
      res.status(500).send({ status: 'ko', message: `No instance found for ${typesId}` });
      return;
    }
    res.send({ status: 'ok', types });
  });
};
const _saveTypes = function index(app, req, res) {
  const typesId = req.body.typesId;
  const types = req.body.types;
  if (!typesId || !types) {
    res.status(400).send({ status: 'ko', message: 'Missing fields' });
    return;
  }
  __SaveModel(app, res, 'ParserTypes', typesId, types);
};
module.exports = {
  // GET /backoffice/data-file/parsers/:currentConfig
  indexConfig: _indexConfig,
  // GET /backoffice/data-file/parsers/load/:currentConfig
  loadConfig: _loadConfig,
  // GET /backoffice/data-file/parsers/save/:currentConfig
  saveConfig: _saveConfig,
  // GET /backoffice/data-file/parsers/makes
  indexMakes: _indexMakes,
  // GET /backoffice/data-file/parsers/makes/load/:currentConfig
  loadMakes: _loadMakes,
  // GET /backoffice/data-file/parsers/makes/save/:currentConfig
  saveMakes: _saveMakes,
  // GET /backoffice/data-file/parsers/undefined
  indexUndefined: _indexUndefined,
  // GET /backoffice/data-file/parsers/undefined/load
  loadUndefined: _loadUndefined,
  // POST /backoffice/data-file/parsers/undefined/apply/
  applyUndefined: _applyUndefined,
  // POST /backoffice/data-file/parsers/undefined/save/
  saveUndefined: _saveUndefined,
  // GET /backoffice/data-file/parsers/columns
  indexColumns: _indexColumns,
  // GET /backoffice/data-file/parsers/columns/load/:currentConfig
  loadColumns: _loadColumns,
  // GET /backoffice/data-file/parsers/columns/save/:currentConfig
  saveColumns: _saveColumns,
  // GET /backoffice/data-file/parsers/columns
  indexTypes: _indexTypes,
  // GET /backoffice/data-file/parsers/Types/load/:currentConfig
  loadTypes: _loadTypes,
  // GET /backoffice/data-file/parsers/Types/save/:currentConfig
  saveTypes: _saveTypes,
};
