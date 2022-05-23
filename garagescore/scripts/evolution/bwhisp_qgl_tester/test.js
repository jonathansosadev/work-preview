'use strict';

/* Helping us doing the garage subscriptions revamp */
const gql = require('graphql-tag');
const objectHash = require('object-hash');
const jsonDiff = require('json-diff');

const legacySchema = require('../../../common/lib/garagescore/api/graphql');
const app = require('../../../server/server');
const { graphql } = require('graphql');
// const { createTestClient } = require('apollo-server-testing');
const createTestClient = require('../../../server/webservers-standalones/api/create-test-client');

const processLegacyQuery = async ({ label, before, legacyQuery, variablesLegacy, getLegacyResults }, logs, req) => {
  logs.push(`Query: ${label}`);
  await before();
  let queryRes;
  try {
    queryRes = await graphql(legacySchema, legacyQuery, null, req, variablesLegacy);
    if (queryRes.errors) {
      throw queryRes.errors[0];
    }
    logs.push(getLegacyResults(queryRes.data));
  } catch (graphQLErr) {
    console.log(graphQLErr);
  }
};
const processQuery = async ({ label, before, queryApollo, variablesApollo, getResults, expected }, logs, authToken) => {
  logs.push(`Query: ${label}`);
  await before();
  let queryRes;
  try {
    const { query: apolloQuery } = createTestClient(app, {
      req: { headers: { authorization: `Bearer ${authToken}` } },
    });
    queryRes = await apolloQuery({ query: gql(queryApollo), variables: variablesApollo });
    if (queryRes.errors) {
      throw queryRes.errors[0].originalError.stack;
    }
    const res = getResults(queryRes.data);
    const diff = jsonDiff.diffString(expected, res);
    if (!diff) {
      logs.push('✓ Same results');
    } else {
      console.log(diff);
      logs.push('Problem! Did not expect those results');
      logs.push(diff);
    }
  } catch (graphQLErr) {
    logs.push(graphQLErr);
  }
};

async function main() {
  const logs = [];
  if (process.argv.length > 3) {
    const user = await app.models.User.findOne({ where: { email: process.argv[2] } });
    const req = { user, app };
    const { id: authToken } = await app.models.AccessToken.findOne({
      where: { userId: user.id },
      order: 'created DESC',
    });
    // const authToken = 'DQI5YVkTMZaNGrJkEdrCMZlOHhUNDsvz5bO6frpTXEkFpgUyDK2xj3rnFMNzmWFn'; // find it or create it in db

    const query = require(`./${process.argv[3]}`); // eslint-disable-line
    const legacy = process.argv.length > 4 && process.argv[4] === 'legacy';
    if (legacy) {
      await processLegacyQuery(query, logs, req);
    } else {
      await processQuery(query, logs, authToken);
    }
    console.log(logs.join('\n'));
    process.exit(0);
  } else {
    process.exit(1);
  }
}

main();
