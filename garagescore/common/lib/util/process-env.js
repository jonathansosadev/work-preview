/**
 * Methods concerning process env.
 */
module.exports = {
  isUnitTest: () => {
    return (
      typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ||
      (typeof global.it === 'function' && typeof global.describe === 'function')
    );
  },
};
