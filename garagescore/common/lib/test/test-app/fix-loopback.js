/** In memory connector is buggued and ignore type of sub properties */
/* eslint-disable */
const Memory = require('loopback-datasource-juggler/lib/connectors/memory').Memory;

function deserialize(dbObj) {
  if (dbObj === null || dbObj === undefined) {
    return dbObj;
  }
  if (typeof dbObj === 'string') {
    return JSON.parse(dbObj);
  }
  return dbObj;
}
module.exports = () => {
  Memory.prototype.fromDb = function (model, data, subprops) {
    if (!data) return null;
    data = subprops ? data : deserialize(data);
    var props = subprops || this._models[model].properties;
    for (var key in data) {
      var val = data[key];
      if (val === undefined || val === null) {
        continue;
      }
      if (props[key] && props[key].type) {
        const type = props[key].type.name || props[key].type || props[key];
        switch (type) {
          case 'Date':
            val = new Date(val.toString().replace(/GMT.*$/, 'GMT'));
            break;
          case 'Boolean':
            val = Boolean(val);
            break;
          case 'Number':
            val = Number(val);
            break;
        }
      }
      if (typeof val === 'object') {
        data[key] = this.fromDb(model, val, props[key]);
      } else {
        data[key] = val;
      }
    }
    return data;
  };
};
