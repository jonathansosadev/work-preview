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
  setDeepFieldValue: function getDeepFieldValue(srcObject, fieldName, value) {
    let result = srcObject;
    const fieldParts = fieldName.split('.');
    for (let i = 0; i < fieldParts.length - 1; i++) {
      if (typeof result[fieldParts[i]] !== 'object' || result[fieldParts[i]] === null) {
        result[fieldParts[i]] = {};
      }
      result = result[fieldParts[i]];
    }
    result[fieldParts[fieldParts.length - 1]] = value;
  },
  // return a flatten object
  // { x: { a: 1, b:2 } }
  // =>
  // { 'x.a': 1, 'x.b' :2 } }
  flatten: function flatten(data) {
    const result = {};
    function recurse(cur, prop) {
      if (Object(cur) !== cur) {
        result[prop] = cur;
      } else if (Array.isArray(cur)) {
        const l = cur.length;
        for (let i = 0; i < l; i++) {
          recurse(cur[i], `${prop}[${i}]`);
        }
        if (l === 0) {
          result[prop] = [];
        }
      } else {
        let isEmpty = true;
        for (const p in cur) {
          // eslint-disable-line
          isEmpty = false;
          recurse(cur[p], prop ? `${prop}.${p}` : p);
        }
        if (isEmpty && prop) {
          result[prop] = {};
        }
      }
    }
    recurse(data, '');
    return result;
  },
};
