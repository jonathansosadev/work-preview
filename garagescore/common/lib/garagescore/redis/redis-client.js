/* Aw wrapper around the redis client to add a prefix to every keys */
const redis = require('redis');
const config = require('config');
const { promisify } = require('util');

/**
at the time of the dev, redis client V4.0 still do not handle the tls param rejectUnauthorized
 */
async function redisClient(namespace, onOp = () => {}) {
  if (!process.env.REDIS_URL) {
    console.log('WARNING: Redis is dis');
    return;
  }
  const mochaON =
    typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ||
    (process.argv.length > 1 && process.argv[1].indexOf('mocha') >= 0);
  if (mochaON && !module.parent.filename.includes('test-external-providers')) {
    console.error('No redis during the tests');
    return;
  }
  return new Promise((resolve, reject) => {
    // on V4, remove the promise
    try {
      this.redisPrefix = config.get('session.redisPrefix');
      this.namespace = namespace;
      this.isReady = false;
      const tls = process.env.REDIS_URL.includes('rediss://') ? { tls: { rejectUnauthorized: false } } : {};
      const options = {
        //legacyMode: true,
        url: process.env.REDIS_URL,
        ...tls,
      };
      console.log('Starting redis client...');
      const client = redis.createClient(options);
      let result = {};
      client.on('error', (err) => {
        console.error(err);
      });
      client.on('connect', () => {
        console.log('---- REDIS is now connected. ----');
        resolve(result);
      });
      client.on('end', () => {
        console.log('---- REDIS just disconnected. ----');
      });
      client.on('reconnecting', () => {
        console.log('---- REDIS is reconnecting... ----');
      });
      // V4 await client.connect();
      const addRedisPrefix = (key) => {
        return `${this.redisPrefix}:${this.namespace}:${key}`;
      };
      result = {
        async quit() {
          return client.quit();
        },
        async set(key, value) {
          onOp(`SET(${addRedisPrefix(key)}, ${value})`);
          //V4 return client.set(addRedisPrefix(key), value);
          return promisify(client.set).bind(client)(addRedisPrefix(key), value);
        },
        async get(key) {
          onOp(`GET(${addRedisPrefix(key)})`);
          //V4 return client.get(addRedisPrefix(key));
          return promisify(client.get).bind(client)(addRedisPrefix(key));
        },
        async hset(hash, key, value) {
          onOp(`HSET(${addRedisPrefix(hash)}, ${key}, ${value})`);
          //V4 return client.set(addRedisPrefix(key), value);
          return promisify(client.hset).bind(client)(addRedisPrefix(hash), key, value);
        },
        async hget(hash, key) {
          onOp(`HGET(${addRedisPrefix(hash)}, ${key})`);
          //V4 return client.get(addRedisPrefix(key));
          return promisify(client.hget).bind(client)(addRedisPrefix(hash), key);
        },
        async del(key) {
          onOp(`DEL(${addRedisPrefix(key)})`);
          //V4 return client.del(addRedisPrefix(key));
          return promisify(client.del).bind(client)(addRedisPrefix(key));
        },
        async rpush(key, value) {
          onOp(`RPUSH(${addRedisPrefix(key)})`);
          //V4 return client.RPUSH(addRedisPrefix(key), value);
          return promisify(client.RPUSH).bind(client)(addRedisPrefix(key), value);
        },
        async lrange(key, start = 0, stop = -1) {
          onOp(`LRANGE(${addRedisPrefix(key)}, ${start}, ${stop})`);
          //V4 return client.LRANGE(addRedisPrefix(key), start, stop);
          return promisify(client.LRANGE).bind(client)(addRedisPrefix(key), start, stop);
        },
        async lindex(key, index) {
          onOp(`LINDEX(${addRedisPrefix(key)}, ${index})`);
          //V4 return client.LINDEX(addRedisPrefix(key), index);
          return promisify(client.LINDEX).bind(client)(addRedisPrefix(key), index);
        },
        async lrem(key, count, element) {
          onOp(`LREM(${addRedisPrefix(key)}, ${count}, ${element})`);
          //V4 return client.LREM(addRedisPrefix(key), count, element);
          return promisify(client.LREM).bind(client)(addRedisPrefix(key), count, element);
        },
        async rpop(key) {
          onOp(`RPOP(${addRedisPrefix(key)})`);
          //V4 return client.RPOP(addRedisPrefix(key));
          return promisify(client.RPOP).bind(client)(addRedisPrefix(key));
        },
      };
    } catch (e) {
      console.error(e);
      process.exit(1);
    }
  });
}
module.exports = redisClient;
