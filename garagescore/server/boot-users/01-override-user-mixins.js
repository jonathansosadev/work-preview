module.exports = function (app, callback) {
  const { User } = app.models;
  // Werid hack, if we don't do this, mongo connection won't be initialized during boot (occurs on scripts)
  // that causes some methods like getMongoConnector to fail on our node scripts
  // Interestingly enough, find/findById has the side effect of kickstarting the connection to mongo if not already established
  User.findById('plop', () => {
    User.mixin('Testable', {});
    User.mixin('Stream', {});
    User.mixin('Timestamp', {});
    User.mixin('AsyncLoopback', {});
    User.mixin('MongoDirect', { whereBuildAddons: true });
    User.mixin('GetMongoConnector', {});
    callback();
  });
};
