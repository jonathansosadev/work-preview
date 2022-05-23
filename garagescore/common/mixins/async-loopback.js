const { promisify } = require('util');
const Promise = require('es6-promise').Promise;

/*
 * Overload mixin
 */

function asyncLoopbackMixin(Model, options) {
  /**
   * Set up async loopback overload on Model
   */
  for (const method of ['find', 'findOne', 'findById', 'count', 'upsert', 'create', 'updateAll', 'destroyAll']) {
    Model[`old_${method}`] = Model[method].bind(Model);
    Model[method] = async (...args) => {
      let cb = null;
      if (typeof args[args.length - 1] === 'function') cb = args.pop();
      const promise = promisify(Model[`old_${method}`])(...args);
      if (!cb) return promise;
      promise.then((d) => cb(null, d)).catch(cb);
      return Promise.resolve();
    };
    Model.prototype[method] = Model[method].bind(Model);
  }
  /**
   * Set up async loopback overload on Model prototype
   */
  for (const method of ['save', 'updateAttribute', 'updateAttributes', 'destroy']) {
    Model[`old_${method}`] = Model.prototype[method];
    Model.prototype[method] = async function (...args) {
      let cb = null;
      if (typeof args[args.length - 1] === 'function') cb = args.pop();
      const promise = promisify(Model[`old_${method}`].bind(this))(...args);
      if (!cb) return promise;
      promise.then((d) => cb(null, d)).catch(cb);
      return Promise.resolve();
    };
    Model[method] = Model.prototype[method].bind(Model);
  }

  Model.findByIdAndUpdateAttributes = async function (id, data, cb) {
    const promise = new Promise((resolve, reject) => {
      Model.findById(id, function (errFind, instance) {
        if (errFind) {
          reject(errFind);
          return;
        }
        instance.updateAttributes(data, (err, res) => {
          if (err) reject(err);
          else resolve(res);
        });
      });
    });
    if (!cb) return promise;
    promise.then((d) => cb(null, d)).catch(cb);
    return Promise.resolve();
  };
}

module.exports = asyncLoopbackMixin;
