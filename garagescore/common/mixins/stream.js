/**
 * Have a stream defined for read operation on the db
 * that would be used for big reading from db to not excced Memory limit
 */

var util = require('util');
var Transform = require('stream').Transform;
var Readable = require('stream').Readable;
var debug = require('debug')('garagescore:common:mixins:stream'); // eslint-disable-line max-len,no-unused-vars

/**
 * Defining transform from Mongodb Object to loopback Model instance stream
 * @param options
 * @returns {ModelReadStream}
 * @constructor
 */
function ModelReadStream(options) {
  if (!options || !options.Model) {
    throw new Error("couldn't use ModelReadStream without Model");
  }
  if (!(this instanceof ModelReadStream)) {
    return new ModelReadStream(options);
  }
  options.objectMode = true; // eslint-disable-line no-param-reassign
  this.Model = options.Model;
  Transform.call(this, options);
}
util.inherits(ModelReadStream, Transform);
ModelReadStream.prototype._transform = function _transform(instance, encoding, callback) {
  try {
    if (instance._id) {
      this.Model.findById(instance._id, callback);
      return;
    }
    callback(new Error('instance have no _id'));
  } catch (err) {
    console.log(err);
    callback(err);
  }
};

function streamMixin(Model, options) {
  /**
   * filter supported params:
   * - where: Object http://loopback.io/doc/en/lb2/Where-filter.html
   * - skip or offset: Number http://loopback.io/doc/en/lb2/Skip-filter.html
   * - limit: Number http://loopback.io/doc/en/lb2/Limit-filter.html
   * - order: String http://loopback.io/doc/en/lb2/Order-filter.html
   * some of code is copied from loopback-connector-mongodb@1.13.3/lib/mongodb.js
   * @param filter
   * @returns {Cursor}
   */
  Model.findStream = function (filter, streamOptions) {
    try {
      if (!filter) {
        filter = {}; // eslint-disable-line no-param-reassign
      }
      if (Model.getDataSource().connector.name === 'memory') {
        var locks = require('locks');
        var initMutex = locks.createMutex();
        var readStreamX = new Readable({ objectMode: true });
        readStreamX.dataCounter = 0;
        readStreamX.getDataItems = function (callback) {
          if (this.dataItems) {
            callback(null, this.dataItems);
            return;
          }
          Model.find(
            filter,
            function (err, dataItems) {
              this.dataItems = dataItems;
              callback(err, dataItems);
            }.bind(this)
          );
        };
        readStreamX._read = function () {
          initMutex.lock(
            function () {
              this.getDataItems(
                function (err, dataItems) {
                  if (this.dataCounter >= dataItems.length) {
                    // stop the stream
                    this.push(null);
                    return;
                  }
                  if (err) {
                    this.emit('error', err);
                    return;
                  }
                  this.push(dataItems[this.dataCounter]);
                  this.dataCounter++;
                  initMutex.unlock();
                }.bind(this)
              );
            }.bind(this)
          );
        };
        var transformStreamX = new Transform({ objectMode: true });
        transformStreamX._transform = function (item, encoding, callback) {
          callback(null, item);
        };
        transformStreamX.count = function (callback) {
          readStreamX.getDataItems(function (err, dataItems) {
            callback(err, dataItems ? dataItems.length : 0);
          });
        };
        readStreamX.pipe(transformStreamX);
        readStreamX.on('error', function (err) {
          transformStreamX.emit('error', err);
        });
        return transformStreamX;
      }
      var collection = Model.getDataSource().connector.collection(Model.modelName);
      if (!collection) {
        throw new Error('MongoDb collection not found');
      }
      /** copied from line 668 **/
      var query = {};
      var idName = Model.getDataSource().connector.idName(Model.modelName);
      if (filter.where) {
        if (filter.where[idName]) {
          var id = filter.where[idName];
          delete filter.where[idName];
          if (id.constructor !== Object) {
            // {id: value}
            id = Model.getDataSource().connector.coerceId(Model.modelName, id);
          }
          filter.where._id = id;
        }
        query = Model.getDataSource().connector.buildWhere(Model.modelName, Model._coerce(filter.where));
      }
      /** end copie to line 681 */

      /** copied from line 693 **/
      var cursor = collection.find(query, { _id: 1 });
      if (streamOptions && streamOptions.batchSize) {
        cursor.batchSize(streamOptions.batchSize);
      }
      var order = {};
      if (!filter.order) {
        var idNames = Model.getDataSource().connector.idNames(Model.modelName);
        if (idNames && idNames.length) {
          filter.order = idNames;
        }
      }
      if (filter.order) {
        var keys = filter.order;
        if (typeof keys === 'string') {
          keys = keys.split(',');
        }
        for (var index = 0, len = keys.length; index < len; index++) {
          var m = keys[index].match(/\s+(A|DE)SC$/);
          var key = keys[index];
          key = key.replace(/\s+(A|DE)SC$/, '').trim();
          if (key === idName) {
            key = '_id';
          }
          if (m && m[1] === 'DE') {
            order[key] = -1;
          } else {
            order[key] = 1;
          }
        }
      } else {
        // order by _id by default
        order = { _id: 1 };
      }
      cursor.sort(order);

      if (filter.limit) {
        cursor.limit(filter.limit);
      }
      if (filter.skip) {
        cursor.skip(filter.skip);
      } else if (filter.offset) {
        cursor.skip(filter.offset);
      }
      /** end copie to line 731 */
      var readStream = cursor.stream();
      var transformStream = new ModelReadStream({ Model: Model });
      transformStream.count = readStream.count.bind(readStream);
      readStream.pipe(transformStream);
      readStream.on('error', function (err) {
        transformStream.emit('error', err);
      });
      return transformStream;
    } catch (err) {
      var transformStream2 = new ModelReadStream({ Model: Model });
      transformStream2.emit('error', err);
      return transformStream2;
    }
  };
}

module.exports = streamMixin;
