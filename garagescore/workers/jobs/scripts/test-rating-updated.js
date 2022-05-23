/** A template to create new job processors
 * Check worker/server.js to add job processor
 */
const lruCache = require('lru-cache');
const app = require('../../../server/server');
const { JS, log } = require('../../../common/lib/util/log');
const slackClient = require('../../../common/lib/slack/client');

const garageNameCache = lruCache({ max: 100 });

const getGarageName = async (data) => {
  const dataId = data.get('garageId');
  let name = garageNameCache.get(dataId);
  if (name) {
    return name;
  }
  const garage = await app.models.Garage.findById(data.garageId);
  name = garage.publicDisplayName;
  garageNameCache.set(dataId, name);
  return name;
};

module.exports = async (job) => {
  // {"_id":3, "payload": {"dataId": "5ce46cbf94a7009632396f81"}}
  const dataId = job.payload.dataId;
  if (!dataId) {
    log.error(JS, `test-rating-updated no dataId in ${JSON.stringify(job)}`);
    return true;
  }
  const data = await app.models.Data.findById(dataId);
  if (!data) {
    log.error(JS, `test-rating-updated no data with id ${dataId}`);
    return true;
  }
  const garageName = await getGarageName(data);
  const rating = data.get('review.rating.value');
  return new Promise((resolve) => {
    slackClient.postMessage(
      {
        text: `Nouvelle note déposée sur ${garageName} : ${rating}`,
        channel: '#test',
        username: 'Test workers',
      },
      resolve
    );
  });
};

// module.exports({ "_id": 3, "payload": { "dataId": "5ce46cbf94a7009632396f81" } })
