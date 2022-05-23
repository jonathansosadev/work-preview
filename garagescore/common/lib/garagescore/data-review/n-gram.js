/* Factory returning a function that converts a given string
 * to n-grams. */
function nGram(n) {
  if (typeof n !== 'number' || isNaN(n) || n < 1 || n === Infinity) {
    throw new Error(`\`${n}\` is not a valid argument for n-gram`);
  }
  /* Create n-grams from a given value. */
  function grams(v) {
    const nGrams = [];
    let index;

    if (v === null || v === undefined) {
      return nGrams;
    }

    const value = String(v);
    index = value.length - n + 1;

    if (index < 1) {
      return nGrams;
    }

    while (index--) {
      nGrams[index] = value.substr(index, n);
    }

    return nGrams;
  }
  return grams;
}

module.exports = nGram;
