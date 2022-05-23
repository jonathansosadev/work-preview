class FakePostgresClient {
  query(query, callback) {
    callback();
  } // TODO simulate postgres query
}
module.exports = FakePostgresClient;
