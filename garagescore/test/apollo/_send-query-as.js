/** Send a grapqhl query as an user */
const gql = require('graphql-tag');

module.exports = async (testApp, query, variables, userId) => {
  // mocha recursive is going to run this file we dont want to require it before test-app
  const createTestClient = require('../../server/webservers-standalones/api/create-test-client');
  const token = await testApp._models().AccessToken.create({
    ttl: 9999999999,
    created: new Date(),
    userId,
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
    query: typeof query === String ? gql(query) : query,
    variables,
  });
};
