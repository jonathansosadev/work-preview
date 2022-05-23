// in mongo profiler loopback returns a MongoDB connection not established if we don't run a mixin...
module.exports = function (app, callback) {
  const { User } = app.models;
  // Werid hack, if we don't do this, mongo connection won't be initialized during boot (occurs on scripts)
  // that causes some methods like getMongoConnector to fail on our node scripts
  // Interestingly enough, find/findById has the side effect of kickstarting the connection to mongo if not already established
  User.findById('plop', () => {
    User.mixin('GetMongoConnector', {});
    callback();
  });
};
