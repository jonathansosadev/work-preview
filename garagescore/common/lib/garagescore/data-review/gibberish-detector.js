const nGram = require('./n-gram')(2);
/**
Method 1: GibScore

Based on https://github.com/rrenaud/Gibberish-Detector
Using all the published reviews available, we created a transition matrix with the proba that one char follows another, markov-chain style
For one String we can now compute a score, log sum of the chars
Looking at the general results and the wind direction, we chose a threshold
Every new String under this threshold is considered to have too many character that should not be together

*/

const models = require('./gibberish-models');

const cleanString = function cleanString(c) {
  let comment = c.replace(/-?\d+\.?\d*/g, '1');
  comment = comment.toLowerCase();
  comment = comment.replace(/\\'/g, "'");
  comment = comment.replace(/l'/g, 'le');
  comment = comment.replace(/qu'/g, 'que');
  comment = comment.replace(/["'’]/g, ' ');
  comment = comment.replace(/\n/g, '.');
  return comment.toLowerCase();
};

/** Compute the score of a string */
const gibScore = function gibScore(string, forcedModel) {
  if (!string) {
    return -1;
  }
  let model = forcedModel;
  if (!model) {
    for (let m = 0; m < models.length; m++) {
      if (string.length > models[m].minStringLength && string.length <= models[m].maxStringLength) {
        model = models[m];
        break;
      }
    }
  }
  const ngrams = nGram(string);
  let logProb = 0;
  let transitionCount = 0;
  ngrams.forEach((ngram) => {
    const c1 = ngram[0];
    const c2 = ngram[1];
    const id1 = model.charToId[c1];
    const id2 = model.charToId[c2];
    const p = typeof id1 !== 'undefined' && typeof id2 !== 'undefined' ? model.tMatrix[id1][id2] : 0;
    logProb += p; // sum instead of product because : https://squarecog.wordpress.com/2009/01/10/dealing-with-underflow-in-joint-probability-calculations/
    transitionCount++;
  });
  return Math.exp(logProb / Math.max(transitionCount, 1));
};

/** is a string score enough to not be gibberish*/
const isGibberish = function isGibberish(string) {
  if (string.length <= 15) {
    // too short for our algorithm
    return false;
  }
  return gibScore(cleanString(string)) < 1.069;
};

/**
compute a markov chain, returns the transition matrix
probabilty that a char B follows a char A
*/
const computeTransitionMatrix = function computeTransitionMatrix(comments, cb) {
  let french = '';
  comments.forEach((c) => {
    const comment = cleanString(c);
    french += `${comment} .\n`;
  });
  const ngrams = nGram(french);
  const freqs = {};
  const totalFreq = {};
  const charToId = {};
  let idw = 0;
  ngrams.forEach((ngram) => {
    const c1 = ngram[0];
    const c2 = ngram[1];
    if (typeof charToId[c1] === 'undefined') {
      charToId[c1] = idw++;
    }
    if (typeof charToId[c2] === 'undefined') {
      charToId[c2] = idw++;
    }
    freqs[ngram] = freqs[ngram] ? freqs[ngram] + 1 : 1;
    totalFreq[c1] = totalFreq[c1] ? totalFreq[c1] + 1 : 1;
  });
  const charsCount = Object.keys(charToId).length;
  const idtoChar = [];
  idtoChar.length = charsCount;
  for (const char in charToId) {
    // eslint-disable-line
    idtoChar[charToId[char]] = char;
  }
  const tMatrix = [];
  tMatrix.chars = idw;
  for (let i = 0; i < charsCount; i++) {
    tMatrix[i] = [];
    tMatrix[i].length = charsCount;
    for (let j = 0; j < charsCount; j++) {
      const f = freqs[idtoChar[i] + idtoChar[j]];
      tMatrix[i][j] = f ? f / totalFreq[idtoChar[i]] : 0;
    }
  }
  cb(null, idtoChar, charToId, tMatrix);
};
/** Compute transitions matrices for different length of comments */
const computeTransitionMatrices = function computeTransitionMatrices(
  comments,
  tinyCommentThreshold,
  shortCommentTreshold,
  cb
) {
  const longComments = [];
  const shortComments = [];
  const tinyComments = [];
  comments.forEach((c) => {
    if (c.length <= tinyCommentThreshold) {
      tinyComments.push(c);
    } else if (c.length <= shortCommentTreshold) {
      shortComments.push(c);
    } else {
      longComments.push(c);
    }
  });
  console.log(`${comments.length} comments`);
  console.log(`${shortComments.length} shortComments`);
  console.log(`${tinyComments.length} tinyComments`);
  computeTransitionMatrix(comments, (e1, idtoChar1, charToId1, tMatrix1) => {
    computeTransitionMatrix(shortComments, (e2, idtoChar2, charToId2, tMatrix2) => {
      computeTransitionMatrix(tinyComments, (e3, idtoChar3, charToId3, tMatrix3) => {
        cb(e1 || e2 || e3, [
          {
            charToId: charToId1,
            tMatrix: tMatrix1,
            maxStringLength: 10000000,
            minStringLength: shortCommentTreshold,
          },
          {
            charToId: charToId2,
            tMatrix: tMatrix2,
            maxStringLength: shortCommentTreshold,
            minStringLength: tinyCommentThreshold,
          },
          {
            charToId: charToId3,
            tMatrix: tMatrix3,
            maxStringLength: tinyCommentThreshold,
            minStringLength: 0,
          },
        ]);
      });
    });
  });
};
module.exports = {
  computeTransitionMatrix,
  computeTransitionMatrices,
  gibScore,
  isGibberish,
};
