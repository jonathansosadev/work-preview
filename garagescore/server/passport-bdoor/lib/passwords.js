const redisClient = require('../../../common/lib/garagescore/redis/redis-client');

redisClient;
const key = 'passwords';
let cache = null;
async function getCache() {
  if (cache) {
    return cache;
  }
  cache = await redisClient('bdoor');
  return cache;
}
module.exports = {
  async generate(username) {
    if (!username) {
      return null;
    }
    const r = await getCache();
    const password = String(999 + Math.floor(Math.random() * 10000));
    await r.hset(key, username + password, Date.now() + 1000 * 60 * 60);
    return password;
  },
  async check(username, password) {
    const r = await getCache();
    const d = await r.hget(key, username + password);
    return !(!d || d < Date.now());
  },
  async redisQuit() {
    // for unit test
    return cache.quit();
  },
};
