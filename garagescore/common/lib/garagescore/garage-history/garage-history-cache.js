const Crypto = require('crypto');

const histories = {};

module.exports = {
  getKey: (type, args) =>
    Crypto.createHash('md5')
      .update([type, ...Object.values(args).sort()].join(''))
      .digest('hex'),
  getHistories: (key) => histories[key] || null,
  setHistories: (historiesCpy, key) => {
    if (!histories[key]) {
      histories[key] = historiesCpy;
    }
  },
  revokeKey: (key) => delete histories[key],
};
