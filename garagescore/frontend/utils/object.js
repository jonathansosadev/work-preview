// const { getDeepFieldValue } = require('../../common/lib/util/object.js');




module.exports = {
  getDeepFieldValue: function getDeepFieldValue(srcObject, fieldName) {
    let result = srcObject;
    const fieldParts = fieldName.split('.');
    for (let i = 0; i < fieldParts.length; i++) {
      if (typeof result !== 'object' || result === null) {
        return null;
      }
      result = result[fieldParts[i]];
    }
    return result;
  },
  // no need to provide a path, return the first match
  // Do not use with very deep objects (slow)
  // obj = {
  //   a : {
  //     b : { 
  //       c : "hello"
  //     }
  //   }
  // }
  // dig(obj, 'c') : "hello"
  dig: (obj, target) => {
    const recurse = (obj, target) => target in obj
      ? obj[target]
      : Object.values(obj).reduce((acc, val) => {
          if (acc !== undefined) return acc;
          if (typeof val === 'object') return recurse(val, target);
        }, undefined);
    return recurse(obj, target);
  }
};