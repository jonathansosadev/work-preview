const MongoClient = require('mongodb').MongoClient;
const config = require('config');
const publicReviewValidator = require('./review-validator');
const moderationStatus = require('../../../models/data/type/moderation-status');

process.env.KIND = 'APP';

/*

const simhashs = [];
for (const i = 0; i < ss.length; i++) {
  const ngrams = nGram(ss[i]);
  // hmmm not sure about using xxHash to be fast and unsigned and then toString...
  const hashes = ngrams.map(function (ngram) { return xxHash(ngram, 0xABCD).toString(2); }); // eslint-disable-line
  console.log(hashes)
  const simhash = 0x0;
  const mask = 0x1;
  for (const pos = 0; pos < 31; pos++) {
    const weight = 0;
    for (const h = 0; h < hashes.length; h++) {
      const hash = hashes[h];
      weight += hash.length > pos && hash[hash.length - 1 - pos] === '1' ? 1 : -1;
    }
    if (weight > 0) simhash |= mask;
    mask <<= 1;
  }
  console.log(ss[i] + ' '+(simhash >>> 0).toString(2) + ' ' + simhash.toString(2))
  simhashs.push(simhash);
}

const hammingDistance = function (x, y) {
  // http://stackoverflow.com/questions/22479584/how-to-count-the-hamming-distance-of-two-short-int
  const val = x ^ y; // set to 1 the different bits
  const dist = 0;
  while (val)
  {
    ++dist;
    val &= val - 1;
  }
  return dist;
}
for (const i = 0; i < ss.length; i++) {
  for (const j = 0; j < ss.length; j++) {
    if(i!=j){
    console.log(ss[i]+'    '+ss[j]);
    console.log('distance ' + hammingDistance(simhashs[i],simhashs[j]));

    }
  }
}

const simhash = require('simhash')();
const ar1 = simhash(['je', 'n', 'ai', 'ri','en', 'à', 'ajouter']);
const ar2 = simhash(['je', 'n', 'ai', 'ri','en', 'à', 'dire', 'merci']);


const dist = 0;
for(const i = 0 ; i< ar1.length; i++) {
    if(ar1[i] !== ar2[i]) dist++;
}
console.log(dist + '/' + ar1.length)

process.exit();*/
/*
Test the accuracy of our auto validation
Not a module, must be run as a main program
*/

const lastTimeAPublicReviewHAsBeenManuallyModerated = '2017-01-01T00:00:00.000Z';

// compare the publicReview status with the validator prediction
const classifyPrediction = function classifyPrediction(publicReview) {
  return publicReviewValidator.shouldApprove(publicReview).then((autoStatus) => {
    const predicted = autoStatus.approvableStatus;
    if (publicReview.status === moderationStatus.APPROVED && predicted === moderationStatus.APPROVED) {
      return 'TP';
    }
    if (publicReview.status === moderationStatus.APPROVED && predicted === moderationStatus.REJECTED) {
      return 'FN';
    }
    if (publicReview.status === moderationStatus.REJECTED && predicted === moderationStatus.REJECTED) {
      return 'TN';
    }
    if (publicReview.status === moderationStatus.REJECTED && predicted === moderationStatus.APPROVED) {
      return 'FP';
    }
    return null;
  });
};

MongoClient.connect(config.get('mongo.uri'), (e, db) => {
  if (e) {
    console.error(e);
    process.exit();
  }
  const publicReviews = db
    .collection('publicReviews')
    .find({ createdAt: { $lte: new Date(lastTimeAPublicReviewHAsBeenManuallyModerated) } }); // eslint-disable-line
  const kl = {};
  const fns = {};
  const fps = {};
  const totals = {};
  publicReviews.forEach(
    (publicReview) => {
      if (publicReview.status !== moderationStatus.PENDING) {
        if (publicReview.rejectedReason) {
          totals[publicReview.rejectedReason] = totals[publicReview.rejectedReason] + 1 || 1;
        }
        classifyPrediction(publicReview).then((p) => {
          kl[p] = kl[p] + 1 || 1;
          if (p === 'FN') {
            publicReviewValidator.shouldApprove(publicReview).then((autoStatus) => {
              const rejectedReason = autoStatus.rejectedReason;
              if (fns[rejectedReason]) {
                fns[rejectedReason].push(publicReview);
              } else {
                fns[rejectedReason] = [publicReview];
              }
            });
            /* if (rejectedReason === gsApprovableRejectedReason.CONTENT_IS_MEANINGLESS) {
            console.log(publicReview.status + ' ' + publicReview.score.comment);
          } */
          }
          if (p === 'FP') {
            if (fps[publicReview.rejectedReason]) {
              fps[publicReview.rejectedReason].push(publicReview);
            } else {
              fps[publicReview.rejectedReason] = [publicReview];
            }
          }
        });
      }
    },
    () => {
      const precision = kl.TP / (kl.TP + kl.FP);
      const recall = kl.TP / (kl.TP + kl.FN);
      const F1 = (2 * precision * recall) / (precision + recall);
      console.log('precision => would we publish often wrong reviews ? (100% => no false positive)');
      console.log('recall=> do we miss often reviews to publish ? (100% => no false negative)');
      /* console.log('false negative: ');
    for (const k in fns) { // eslint-disable-line
      console.log(' ' + k + ' : ' + fns[k].length + '/' + totals[k] + ' ' + (100 * (fns[k].length / totals[k]))); // eslint-disable-line
    }
    console.log('false positive: ');
    for (const k in fps) { // eslint-disable-line
      console.log(' ' + k + ' : ' + fps[k].length + '/' + totals[k] + ' ' + (100 * (fps[k].length / totals[k]))); // eslint-disable-line
    } */
      console.log(`precision: ${precision}`);
      console.log(`recall: ${recall}`);
      console.log(`F1: ${F1}`);
      /*
    const commentsList = function (reason) {
      const specificFps = fps[reason];
      const comments = [];
      for (const i = 0; i < specificFps.length; i++) {
        if (specificFps[i].score && specificFps[i].score.comment) {
          const comment = specificFps[i].score.comment.replace(/[\n\r]/g, ' ');
          comments.push(comment);
          // console.log('[] ' + comment);
        }
      }
      return comments;
    };
    const comments1 = commentsList(gsApprovableRejectedReason.CONTENT_IS_UNRELATED_TO_REVIEWED_ITEM);
    const comments2 = commentsList(gsApprovableRejectedReason.AUTHOR_IS_NOT_INDIVIDUAL);*/

      process.exit();
    }
  );
});
