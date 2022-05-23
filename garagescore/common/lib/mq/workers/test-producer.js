/** Test producer manually */
require('dotenv').config({ silent: true });
const Producer = require('./producer');
const { JobTypes } = require('../../../../frontend/utils/enumV2');
const jobsConfigurations = require('../../../../workers/jobs/jobs-configurations');

(async function main() {
  const queue = jobsConfigurations(JobTypes.TEST_RATING_UPDATED).queue;
  const producer = new Producer(queue);
  await producer.start();
  await producer.publish({ _id: 3, payload: { dataId: '5ce46cbf94a7009632396f81' } });
  console.log(`Message published on ${queue}`);
  process.exit();
})();
