/** Reproduce a graphql query and display its runTime */
process.env.QUERY_LOGGER = false;
process.env.NODE_APP_INSTANCE = 'app';
const gql = require('graphql-tag');
const app = require('../../../server/server');
const request = require('./request-apollo.js');
const createTestClient = require('../../../server/webservers-standalones/api/create-test-client');

async function main() {
  const user = await app.models.User.findOne({ where: { email: 'bbodrefaux@garagescore.com' } });
  const token = await app.models.AccessToken.findOne({ where: { userId: user.id }, order: 'created DESC' });
  token.ttl = 9999999999;
  await token.save();
  const { id: authToken } = token;
  console.time('graphql');
  const { query: apolloQuery } = createTestClient(app, { req: { headers: { authorization: `Bearer ${authToken}` } } });
  let queryRes = await apolloQuery({ query: gql(request.query), variables: request.variables });
  if (queryRes.errors) {
    queryRes = queryRes.errors[0];
  }
  console.log(JSON.stringify(queryRes, null, 2));
  console.timeEnd('graphql');
  process.exit();
}

main();
