/**
Levenshtein Distance based on wikipedia
https://en.wikipedia.org/wiki/Levenshtein_distance
*/
// https://github.com/hiddentao/fast-levenshtein/blob/master/levenshtein.js
let collator;
try {
  collator =
    typeof Intl !== 'undefined' && typeof Intl.Collator !== 'undefined'
      ? Intl.Collator('generic', { sensitivity: 'base' })
      : null; // eslint-disable-line
} catch (err) {
  console.log("Collator could not be initialized and wouldn't be used");
}
// arrays to re-use
const prevRow = [];
const str2Char = [];

/**
 * Based on the algorithm at http://en.wikipedia.org/wiki/Levenshtein_distance.
 */
const Levenshtein = {
  /**
   * Calculate levenshtein distance of the two strings.
   *
   * @param str1 String the first string.
   * @param str2 String the second string.
   * @param [options] Additional options.
   * @param [options.useCollator] Use `Intl.Collator` for locale-sensitive string comparison.
   * @return Integer the levenshtein distance (0 and above).
   */
  get: function get(str1, str2, options) {
    const useCollator = options && collator && options.useCollator;

    const str1Len = str1.length;
    const str2Len = str2.length;

    // base cases
    if (str1Len === 0) return str2Len;
    if (str2Len === 0) return str1Len;

    // two rows
    let curCol;
    let nextCol;
    let i;
    let j;
    let tmp;

    // initialise previous row
    for (i = 0; i < str2Len; ++i) {
      prevRow[i] = i;
      str2Char[i] = str2.charCodeAt(i);
    }
    prevRow[str2Len] = str2Len;

    let strCmp;
    if (useCollator) {
      // calculate current row distance from previous row using collator
      for (i = 0; i < str1Len; ++i) {
        nextCol = i + 1;

        for (j = 0; j < str2Len; ++j) {
          curCol = nextCol;

          // substution
          strCmp = collator.compare(str1.charAt(i), String.fromCharCode(str2Char[j])) === 0;

          nextCol = prevRow[j] + (strCmp ? 0 : 1);

          // insertion
          tmp = curCol + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }
          // deletion
          tmp = prevRow[j + 1] + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }

          // copy current col value into previous (in preparation for next iteration)
          prevRow[j] = curCol;
        }

        // copy last col value into previous (in preparation for next iteration)
        prevRow[j] = nextCol;
      }
    } else {
      // calculate current row distance from previous row without collator
      for (i = 0; i < str1Len; ++i) {
        nextCol = i + 1;

        for (j = 0; j < str2Len; ++j) {
          curCol = nextCol;

          // substution
          strCmp = str1.charCodeAt(i) === str2Char[j];

          nextCol = prevRow[j] + (strCmp ? 0 : 1);

          // insertion
          tmp = curCol + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }
          // deletion
          tmp = prevRow[j + 1] + 1;
          if (nextCol > tmp) {
            nextCol = tmp;
          }

          // copy current col value into previous (in preparation for next iteration)
          prevRow[j] = curCol;
        }

        // copy last col value into previous (in preparation for next iteration)
        prevRow[j] = nextCol;
      }
    }
    return nextCol;
  },
};

/** distance between two strings*/
function distance(s, t) {
  return Levenshtein.get(s, t);
}
/** return the n closest candidate, comparing the distance bewtween word and each candidates */
function closest(word, candidates, n) {
  if (typeof word.length === 'undefined' || word.length === 0) {
    return [];
  }
  const scores = [];
  candidates.forEach((candidate) => {
    const score = distance(word, candidate);
    if (word && candidate && score < word.length / 2 && score < candidate.length / 2) {
      scores.push([candidate, score]);
    }
  });
  if (!scores.length) {
    return null;
  }
  scores.sort((s1, s2) => s1[1] - s2[1]);
  if (!n || n === 1) {
    return scores[0][0];
  }
  const res = [];
  for (let i = 0; i < n && i < scores.length; i++) {
    res.push(scores[i][0]);
  }
  return res;
}

module.exports = {
  distance,
  closest,
};
// console.log(closest('saint maximin', ['saint maximun', 'st maximin', 'st maximain']));
