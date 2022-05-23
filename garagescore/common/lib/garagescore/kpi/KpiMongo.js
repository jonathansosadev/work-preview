/**
 * Returns a function to decrypt the kpis from your Mongo client
 * Call it like that
 *
 * nkpi(db.kpiByPeriod.find())
 *
 */
const KpiDictionary = require('./KpiDictionary');

const keys = KpiDictionary.keys;
const _d = {};
Object.keys(keys).forEach((k) => {
  const v = keys[k];
  _d[v] = k;
});
const nkpi = (cursor) => {
  cursor.limit(50);
  cursor.forEach((d) => {
    const o = {};
    Object.keys(d).forEach((k) => {
      if (_d[k]) {
        o[_d[k]] = d[k];
      } else {
        o[k] = d[k];
      }
    });
    print(o);
  });
};
console.log(`var _d = ${JSON.stringify(_d)};`);
console.log(`var nkpi = ${nkpi};`);
console.log('nkpi(db.kpiByPeriod.find());');
