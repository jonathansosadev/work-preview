/** Generate zlib dictionnary to better compress our strings with zlib */
const app = require('../../../server/server');
const moderationStatus = require('../../models/data/type/moderation-status');

// generate a dico with MAXLENGTH caracs
async function generateDictionaryFromReviews(MAXLENGTH = 100000) {
  return new Promise((resolve, reject) => {
    let count = {};
    app.models.Data.findWithProjection(
      {
        shouldSurfaceInStatistics: true,
        'review.comment.status': moderationStatus.APPROVED,
      },
      {
        garageId: 1,
        'review.comment.text': 1,
      }
    )
      .forEach(async (data) => {
        // https://stackoverflow.com/questions/2011653/how-to-find-a-good-optimal-dictionary-for-zlib-setdictionary-when-processing-a
        // count words occurences
        const words = data
          .get('review.comment.text')
          .replace(/[,;.:(){}"'\n]/g, ' ')
          .split(' ');
        for (const w of words) {
          count[w] = count[w] ? count[w] + 1 : 1;
        }
      })
      .then(() => {
        // sort count
        count = Object.entries(count);
        count.sort((a, b) => b[1] - a[1]);
        let dico = '';
        // put most commons words at the end of the dico
        for (let w = 0; w < count.length && dico.length < MAXLENGTH; w++) {
          if (count[w][1] === 1) break;
          dico = count[w][0] + dico;
        }
        resolve(dico);
      })
      .catch((err) => {
        reject(err);
        return;
      });
  });
}

module.exports = { generateDictionaryFromReviews };
