var debug = require('debug')('garagescore:common:mixins:mongo-direct'); // eslint-disable-line max-len,no-unused-vars
var mongodb = require('mongodb');

function mongoDirectMixin(Model, options) {
  Model._mongoConnection = function (callback) {
    /*
     * Connect to the Mongo datasource
     * Only for queries where direct Mongo connections is required
     */
    var mongoConnection = Model.dataSource.connector.db;
    if (mongoConnection) {
      callback(null, mongoConnection);
      return;
    }
    Model.dataSource.connect(function (err, connectedMongoConnection) {
      if (err) {
        callback(err);
        return;
      }
      callback(null, connectedMongoConnection);
      return;
    });
  };

  Model._mongoFindOne = function (mongoQuery, callback) {
    Model._mongoConnection(function (err, mongoConnection) {
      if (err) {
        callback('Could not get Mongo connection: ' + err);
        return;
      }

      mongoConnection.collection(Model.settings.mongodb.collection).findOne(mongoQuery, callback);
      return;
    });
  };

  var oldWhereBuild = Model.dataSource.adapter.buildWhere;
  /**
   * Hack to add additionnal where filters
   * This is a coppied code from the lib in https://github.com/strongloop/loopback-connector-mongodb/blob/master/lib/mongodb.js
   * You must cheack this code once you update the mongo connector
   * this code is not effective if the whereBuildAddons options not set to true
   * @param model
   * @param where
   * @returns {{}}
   */
  Model.dataSource.adapter.buildWhere = function bulidWhereGarageScore(model, where) {
    if (!options.whereBuildAddons) {
      return oldWhereBuild.bind(Model.dataSource.adapter)(model, where);
    }
    var self = this;
    var query = {};
    if (where === null || typeof where !== 'object') {
      return query;
    }
    function ObjectID(id) {
      if (id instanceof mongodb.ObjectID) {
        return id;
      }
      if (typeof id !== 'string') {
        return id;
      }
      try {
        var settings = self._models[model] && self._models[model].settings;
        var strict = (settings && settings.strictObjectIDCoercion) || self.settings.strictObjectIDCoercion;
        if (strict) return id; // unless explicitly typed, don't coerce
        // MongoDB's ObjectID constructor accepts number, 12-byte string or 24-byte
        // hex string. For LoopBack, we only allow 24-byte hex string, but 12-byte
        // string such as 'line-by-line' should be kept as string
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          return new mongodb.ObjectID(id);
        }
        return id;
      } catch (e) {
        return id;
      }
    }
    var idName = self.idName(model);
    Object.keys(where).forEach(function (k) {
      var cond = where[k];
      if (k === 'and' || k === 'or' || k === 'nor') {
        if (Array.isArray(cond)) {
          cond = cond.map(function (c) {
            return self.buildWhere(model, c);
          });
        }
        query['$' + k] = cond;
        delete query[k];
        return;
      }
      if (k === idName) {
        k = '_id'; // eslint-disable-line no-param-reassign
      }
      var propName = k;
      if (k === '_id') {
        propName = idName;
      }
      self.getPropertyDefinition(model, propName);

      var spec = false;
      var options; // eslint-disable-line no-shadow
      if (cond && cond.constructor.name === 'Object') {
        options = cond.options;
        spec = Object.keys(cond)[0];
        cond = cond[spec];
      }
      if (spec) {
        if (spec === 'between') {
          query[k] = { $gte: cond[0], $lte: cond[1] };
        } else if (spec === 'inq') {
          query[k] = {
            $in: cond.map(function (x) {
              if (typeof x !== 'string') return x;
              return ObjectID(x); // eslint-disable-line new-cap,no-undef
            }),
          };
        } else if (spec === 'nin') {
          query[k] = {
            $nin: cond.map(function (x) {
              if (typeof x !== 'string') return x;
              return ObjectID(x); // eslint-disable-line new-cap,no-undef
            }),
          };
        } else if (spec === 'like') {
          query[k] = { $regex: new RegExp(cond, options) };
        } else if (spec === 'nlike') {
          query[k] = { $not: new RegExp(cond, options) };
        } else if (spec === 'neq') {
          query[k] = { $ne: cond };
        } else if (spec === 'exist') {
          query[k] = { $exists: cond && true };
        } else if (spec === '$text') {
          query[k] = { $text: cond };
        } else if (spec === '$search') {
          query[k] = { $search: cond };
        } else if (spec === '$language') {
          query[k] = { $language: cond };
        } else if (spec === 'regexp') {
          if (cond.global) {
            console.warn('MongoDB regex syntax does not respect the `g` flag');
          }

          query[k] = { $regex: cond };
        } else {
          query[k] = {};
          query[k]['$' + spec] = cond;
        }
      } else {
        if (cond === null) {
          // eslint-disable-line no-lonely-if
          // http://docs.mongodb.org/manual/reference/operator/query/type/
          // Null: 10
          query[k] = null;
        } else {
          query[k] = cond;
        }
      }
    });
    return query;
  };
}

module.exports = mongoDirectMixin;
