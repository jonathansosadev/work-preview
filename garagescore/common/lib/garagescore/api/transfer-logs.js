const redisClient = require('../redis/redis-client.js');

let redisCache = null;

(async function () {
  redisCache = await redisClient('transfer:logs');
})();

const uniqueKey = 'waitingTransfers';

/** A redis map of process logs
And
A redis-queue of transfers to run
*/
const setLog = (taskId, taskLog) => {
  if (!taskId) throw Error('no taskId provided');
  if (!taskLog) throw Error('no taskLog provided');
  return redisCache.set(String(taskId), JSON.stringify(taskLog));
};
const getLog = async (taskId) => {
  const taskLog = await redisCache.get(String(taskId));
  if (!taskLog) {
    throw Error(`No logs for taskId ${taskId}`);
  }
  return JSON.parse(taskLog);
};

const _getQueue = async () => (await redisCache.lrange(uniqueKey, 0)).map(JSON.parse);

const pushTransfer = async (garageId) => {
  const transfersInQueue = await _getQueue();
  const transfer = transfersInQueue.find((element) => element.garageId === garageId);
  if (transfer) {
    return transfer.taskId;
  }
  let taskId = Date.now();
  await redisCache.rpush(uniqueKey, JSON.stringify({ garageId, taskId }));
  return taskId;
};

const popTransfer = async () => {
  const transfer = await redisCache.rpop(uniqueKey);
  return transfer && JSON.parse(transfer);
};

module.exports = {
  setLog,
  getLog,
  pushTransfer,
  popTransfer,
};
