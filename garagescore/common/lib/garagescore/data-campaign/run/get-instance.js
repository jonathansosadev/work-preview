const app = require('../../../../../server/server');

/*
 * Get data instance
 */
function getInstance(callback) {
  const self = this;
  app.models.Data.findById(this.dataId, (err, data) => {
    if (err) {
      callback(err);
      return;
    }
    self.modelInstances.data = data;
    callback();
  });
}

module.exports = getInstance;
