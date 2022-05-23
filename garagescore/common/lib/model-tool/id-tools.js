const mongodb = require('mongodb');

module.exports = {
  formatId: function formatId(id, connectorName) {
    if (connectorName === 'memory') return id;
    return typeof id === 'string' ? new mongodb.ObjectID(id) : id;
  },
};
