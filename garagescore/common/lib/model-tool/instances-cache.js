const lru = require('lru-cache');

function InstanceCache(lruOptions) {
  this.cache = lru(lruOptions || { max: 8500, maxAge: 1000 * 60 });
  this.app = require('../../../server/server.js'); // eslint-disable-line global-require
}

/**
 * get a deepfield from object like 'foreign.contcts.email' then the value of 'email' will be returned
 * @param object
 * @param field
 * @returns {*}
 */
InstanceCache.prototype.getDeepField = function getDeepField(object, field) {
  let result = object;
  const chainFields = field.split('.');
  for (let i = 0; i < chainFields.length; i++) {
    if (!result) return null;
    result = result[chainFields[i]];
  }
  return result;
};
/**
 * findOne from Model where 'field' = 'value'
 * @param model
 * @param field
 * @param value
 * @param callback
 */
InstanceCache.prototype.findOne = function findOne(model, field, value, callback) {
  if (!field) {
    throw new Error('field for findOne is mandatory');
  }
  if (!value) {
    callback();
    return;
  }
  const key = model + field + value;
  if (this.cache.has(key)) {
    callback(null, this.cache.get(key));
    return;
  }
  const whereObj = {};
  whereObj[field] = value;
  this.app.models[model].findOne(
    {
      where: whereObj,
    },
    (err, inst) => {
      if (err || !inst) {
        // if (!inst) {
        //   console.log(`Instance not found for ${model} with field ${field} and value ${value}`);
        // }
        callback(err);
        return;
      }
      this.cache.set(key, inst);
      callback(null, inst);
    }
  );
};

InstanceCache.prototype.find = function find(model, field, value, callback) {
  if (!field) {
    throw new Error('field for find is mandatory');
  }
  if (!value) {
    callback();
    return;
  }
  const key = model + field + value;
  if (this.cache.has(key)) {
    callback(null, this.cache.get(key));
    return;
  }
  const whereObj = {};
  whereObj[field] = value;
  this.app.models[model].find(
    {
      where: whereObj,
    },
    (err, inst) => {
      if (err || !inst) {
        // if (!inst) {
        //   console.log(`Instance not found for ${model} with field ${field} and value ${value}`);
        // }
        callback(err);
        return;
      }
      this.cache.set(key, inst);
      callback(null, inst);
    }
  );
};

InstanceCache.prototype.findById = function findById(model, id, callback) {
  if (!id) {
    callback();
    return;
  }
  const key = model + id;
  if (this.cache.has(key)) {
    callback(null, this.cache.get(key));
    return;
  }
  this.app.models[model].findById(id, (err, inst) => {
    if (err) {
      callback(err);
      return;
    }
    if (!inst) {
      console.log(`Instance not found for ${model} with id ${id}`); // eslint-disable-line no-console
    }
    this.cache.set(key, inst);
    callback(null, inst);
  });
};

InstanceCache.prototype.findField = function findField(model, id, field, callback) {
  this.findById(model, id, (err, instance) => {
    if (err || !instance) {
      callback(err);
      return;
    }
    callback(null, this.getDeepField(instance, field));
  });
};

module.exports = InstanceCache;
