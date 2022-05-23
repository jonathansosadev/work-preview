/** Create an user and send a graphql query connected as him */
const gql = require('graphql-tag');

module.exports = async (testApp, query, variables) => {
  // mocha recursive is going to run this file we dont want to require it before test-app
  const createTestClient = require('../../server/webservers-standalones/api/create-test-client');
  const userEmail = `user${Math.random()}@gs.com`;
  const user = await testApp.addUser({ email: userEmail });
  const token = await testApp._models().AccessToken.create({
    ttl: 9999999999,
    created: new Date(),
    userId: user.userId,
  });
  const { id: authToken } = token;
  const { query: apolloQuery } = createTestClient(testApp.server, {
    req: {
      headers: {
        authorization: `Bearer ${authToken}`,
      },
    },
  });
  return apolloQuery({
    query: gql(query),
    variables,
  });
};
