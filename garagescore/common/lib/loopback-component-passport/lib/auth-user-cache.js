/** #3067 Add some cache to the userModel */
const lruCache = require('lru-cache');

const usersCacheById = lruCache({
  length: () => 1,
  max: 100, // max 100 users in cache
  maxAge: 1000 * 60 * 10, // lasts 10 minute
});
// let cacheHits = 0;
let start = Date.now();

function clearUserCache(userId) {
  usersCacheById.del(userId.toString());
}

function enableUserCache(User) {
  const notSoRealClone = Object.create(User);
  notSoRealClone.findById = (id, cb) => {
    const cached = usersCacheById.get(id.toString());
    if (cached) {
      const end = Date.now();
      if (end - start > 600000) {
        console.log('#3067 passport user cache reset hits counter');
        start = Date.now();
      }
      cb(null, cached);
      return;
    }
    User.findById(id, (err, u) => {
      if (err) {
        cb(err);
        return;
      }
      usersCacheById.set(id.toString(), u);
      cb(null, u);
    });
  };
  notSoRealClone.findOne = (query, cb) => {
    console.log('#3067 passport user findOne called but not cached (todo)');
    User.findOne(query, cb);
  };
  return notSoRealClone;
}
module.exports = { enableUserCache, clearUserCache };
