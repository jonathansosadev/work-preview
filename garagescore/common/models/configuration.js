const lruCache = require('lru-cache');
const configuration = require('../lib/garagescore/configuration');

/*
Configuration is like a database-mapped bean

It is a flat model and for every properties declared in the json we have the following methods:
* getField([useCache], cb)
* setField(fieldValue, cb)

All method use async

When getting a field, you can force a db lookup by using useCache=false,
if not the return value can be the last returned by a get or modified by a set


The values are always in cache

### IMPORTANT ###
Please check and use common/lib/garagescore/configuration
if you need to use Configuration when the `app` instance may be avaible or not
*/

// https://stackoverflow.com/questions/1026069/how-do-i-make-the-first-letter-of-a-string-uppercase-in-javascript
function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

module.exports = function ConfigurationDefinition(Configuration) {
  // eslint-disable-line no-unused-vars
  configuration._mapToConfigurationModel(Configuration);

  const CACHE = lruCache({
    maxAge: 1000 * 60 * 60, // last 1 hour
  });

  Configuration.forEachProperty((prop) => {
    if (prop !== 'id' && prop !== 'reserved_field_name') {
      const fieldName = capitalizeFirstLetter(prop);
      // getter
      Configuration[`get${fieldName}`] = function getter(...args) {
        // eslint-disable-line no-param-reassign
        const useCache = args.length === 2 ? args[0] : true;
        const cb = args.length === 2 ? args[1] : args[0];
        if (useCache && CACHE.has(fieldName)) {
          cb(null, CACHE.get(fieldName));
          return;
        }
        Configuration.findOne({ where: { reserved_field_name: fieldName } }, (e, data) => {
          cb(e, (data && data[prop]) || Configuration.definition.properties[prop].default || null);
        });
      };
      // setter
      Configuration[`set${fieldName}`] = function setter(...args) {
        // eslint-disable-line no-param-reassign
        const value = args[0];
        const cb = args.length === 2 ? args[1] : function cb() {};
        Configuration.findOne({ where: { reserved_field_name: fieldName } }, (e, data) => {
          if (e) {
            cb(e);
            return;
          }
          const callback = function callback(ee, d) {
            const res = d && d[prop];
            const isdef = typeof res !== 'undefined';
            if (!ee && isdef) {
              CACHE.set(fieldName, res);
            }
            cb(ee, isdef ? res : null);
          };
          if (data) {
            data.updateAttribute(prop, value, callback);
            return;
          }
          const n = { reserved_field_name: fieldName };
          n[prop] = value;
          Configuration.create(n, callback);
        });
      };
    }
  });
};
