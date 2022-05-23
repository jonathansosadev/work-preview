// modify array values so their sum add up to target
// array : an array of object
// ftcGetValue(o) : function to get the value of an object
// ftcSetValue(index, val, array) : function to set the value of array[index]
// target : integer to aim
// https://en.wikipedia.org/wiki/Largest_remainder_method

const _ = require('underscore');

const _largestRemainder = (array, fctGetValue, fctSetValue, target) => {
  array.forEach((o, i) => {
    fctSetValue(i, Math.floor(fctGetValue(o)), array);
  });
  const computeSum = () => {
    let sum = 0;
    array.forEach((o) => {
      sum += fctGetValue(o);
    });
    return sum;
  };
  let sum = computeSum();
  if (sum < target) {
    const values = [];
    array.forEach((o, i) => {
      values.push([fctGetValue(o), i]);
    });
    const sortedValues = _.sortBy(values, (o) => o[0]);
    sortedValues.reverse();
    const sortedIndex = sortedValues.map((o) => o[1]);
    let i = 0;
    while (sum !== target) {
      const index = sortedIndex[i];
      const el = array[index];
      i = (i + 1) % sortedIndex.length;
      const v = fctGetValue(el);
      if (v !== 0) {
        fctSetValue(index, 1 + v, array);
        sum = computeSum();
      }
    }
  }
};
module.exports = _largestRemainder;
