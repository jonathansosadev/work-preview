/**
 * this cache is used to store ready to download xls files
 * @type {LRUCache}
 */
const lruCache = require('lru-cache');

/* This cache will be used in a special way, so it worth to be explained here
 * It stores the xls files generated when the user requests an export
 * cache key is a random number that is given to client side once the xls file generation has completed
 * Then the client side makes a GET request using the key that has been returned to it
 * request retreive the xls file from this cache
 * So we have no business in letting the cached items live once they have been retreived
 *
 * This cache must be able to destroy elements as soon as they're used
 * Storing many elements shouldn't be a problem, I'll go with 250 and explain this number
 *
 */
const xlsCache = lruCache({
  // I based this number on what appeaed to be the max requests for 30s we would get on app
  max: 120,
  length: () => 1,
  maxAge: 1000 * 60, // 1 minute seem enough for the user arrive there (twice the timeout)
});

module.exports = {
  set: (key, value, maxAge) => xlsCache.set(key, value, maxAge),
  get: (key) => {
    // Custom get that will erase the key once we got it, so we don't store files after they're redeemed useless
    const value = xlsCache.get(key);
    xlsCache.del(key);
    return value;
  },
  has: (key) => xlsCache.has(key),
};
