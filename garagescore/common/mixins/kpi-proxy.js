const Promise = require('es6-promise').Promise;
const { promisify } = require('util');

const kpiEncoder = require('../lib/garagescore/kpi/KpiEncoder');

function KpiProxyMixin(Model) {
  for (const method of ['find']) {
    Model[`noProxy_${method}`] = Model[method].bind(Model);
    Model[method] = async (...args) => {
      const where = args[0] && args[0].where;
      const fields = args[0] && args[0].fields;
      let order = args[0] && args[0].order;

      kpiEncoder.encodeObject(where);
      kpiEncoder.encodeObject(fields);
      order = kpiEncoder.encodeOrder(order);
      args[0].order = args[0].order && order ? order : args[0].order;
      const cb = typeof args[args.length - 1] === 'function' ? args.pop() : null;
      const result = await promisify(Model[`noProxy_${method}`])(...args);
      kpiEncoder.decodeObj(result);
      if (cb) {
        cb(null, result);
      }
      return Promise.resolve(result);
    };
    Model.prototype[method] = Model[method].bind(Model);
  }
  for (const method of ['updateAll']) {
    Model[`noProxy_${method}`] = Model[method].bind(Model);
    Model[method] = (...args) => {
      kpiEncoder.encodeObject(args[0]);
      kpiEncoder.encodeObject(args[1]);
      return Model[`noProxy_${method}`](...args);
    };
    Model.prototype[method] = Model[method].bind(Model);
  }
  for (const method of ['count', 'create', 'destroyAll', 'upsert']) {
    Model[`noProxy_${method}`] = Model[method].bind(Model);
    Model[method] = (...args) => {
      kpiEncoder.encodeObject(args[0], ['create', 'upsert'].includes(method));
      return Model[`noProxy_${method}`](...args);
    };
    Model.prototype[method] = Model[method].bind(Model);
  }
  for (const method of ['save']) {
    Model.prototype[`noProxy_${method}`] = Model.prototype[method];
    Model.prototype[method] = function (...args) {
      kpiEncoder.encodeObject(this, true);
      return this[`noProxy_${method}`](...args);
    };
    Model[method] = Model.prototype[method].bind(Model);
  }
}

module.exports = KpiProxyMixin;
