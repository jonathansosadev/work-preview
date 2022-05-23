const debug = require('debug')('garagescore:common:mixins:smart-sort'); // eslint-disable-line max-len,no-unused-vars

/*
 * Wrap loopback query to add sort on indexed fields
 * when no order has been given (to avoid an automatic sortBy _id)
 */

// overrride loopback model
const overrideMethod = function (Model, indexes, argNumber, method) {
  const origin = Model[method];
  const modelName = Model.modelName;
  Model[method] = async function () {
    const query = arguments[argNumber];
    if (query && query.where && !query.order) {
      // we have a where without order
      for (let i = 0; i < indexes.length; i++) {
        const field = indexes[i];
        let found = false;
        if (typeof query.where[field] !== 'undefined') {
          // one filter is an index
          found = true;
        }
        // special case and/or, our field are a level below
        if (query.where.and) {
          query.where.and.forEach(function (t) {
            // eslint-disable-line no-loop-func
            if (typeof t[field] !== 'undefined') {
              found = true;
            }
          });
        }
        if (query.where.or) {
          query.where.or.forEach(function (t) {
            // eslint-disable-line no-loop-func
            if (typeof t[field] !== 'undefined') {
              found = true;
            }
          });
        }
        if (found) {
          query.order = field;
          debug('[SmartSort] ' + modelName + ' ' + JSON.stringify(query));
          break;
        }
      }
    }
    return origin.apply(this, arguments);
  };
};

function smartSort(Model, options) {
  const indexes = [];
  for (let i in Model.settings.indexes) {
    if (Model.settings.indexes.hasOwnProperty(i)) {
      let index = Model.settings.indexes[i];
      let key = Object.keys(index);
      if (key.length === 1 && key[0] !== 'keys') {
        indexes.push(key[0]);
      } else if (index.keys) {
        index = index.keys;
        key = Object.keys(index);
        if (key.length === 1) {
          indexes.push(key[0]);
        }
      }
    }
  }
  overrideMethod(Model, indexes, '0', 'find');
  overrideMethod(Model, indexes, '0', 'findOne');
}

module.exports = smartSort;
