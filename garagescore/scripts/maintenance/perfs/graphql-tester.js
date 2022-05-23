/** *
 * Rerun graphql requests from our logs, one after the other, to find the requests to optimize
 *
 *
 * HOWTO
 *
 * - Dowload your log from logentries
 *
 * - Decompress it
 *
 * - Zip it with password
 * > zip -e glog garagescore_2019-02-10_231810_2019-02-11_231810.log
 * > Enter password: qU34A5evdUsMVWWdtKvdx9Vf
 *
 * - Upload it to https://transfer.sh/
 * > curl --upload-file ./glog.zip https://transfer.sh/glog
 * > response: https://transfer.sh/G6Boh/glog
 * (alternative curl -F'file=@glog.zip' https://0x0.st)
 * - Run the script with the url and password as arguments
 * > graphql-tester.js https://transfer.sh/G6Boh/glog qU34A5evdUsMVWWdtKvdx9Vf
 */
process.env.QUERY_LOGGER = false;
const { graphql } = require('graphql');
const gql = require('graphql-tag');
const querystring = require('querystring');
const sizeof = require('object-sizeof');
const request = require('request');
const unzipper = require('unzipper');
const promisify = require('util').promisify;

const schema = require('../../../common/lib/garagescore/api/graphql');
const app = require('../../../server/server');

//
const args = process.argv.slice(2);
console.log(args);
if (args.length !== 2) {
  console.error('Usage: node graphql-tester.js [url] [password]');
  process.exit();
}

/** download and unzip logs */
const downloadLogs = async function () {
  const directory = await unzipper.Open.url(request, args[0]);
  const file = directory.files[0];
  const content = await file.buffer(args[1]);
  return content.toString();
};
/* parse one line of logs and returns the original time spend, the graphql query and the req id */
const parseLog = (line) => {
  const m = line.match(/low graphql query: (\d+)ms - (.+) - (http.+)/);
  if (m && m.length === 4) {
    if (line.indexOf('mutation') > 0) {
      return null;
    }
    const timeOrg = parseInt(m[1], 10);
    const id = m[2];
    const req = m[3];
    // Here, we're parsing logs taken from prod while we might launch script locally so, hardcode
    const url = querystring.parse(req.replace('https://app.custeed.com/graphql?', ''));
    const graphqlQuery = url.query;
    const gData = gql`
      ${graphqlQuery}
    `;
    const queryName = gData.definitions[0].selectionSet.selections[0].name.value;
    const queryArgs =
      (
        gData.definitions[0].selectionSet.selections[0].arguments &&
        gData.definitions[0].selectionSet.selections[0].arguments.map((a) => `${a.name.value}=${a.value.value}`)
      ).sort() || '';

    return { id, timeOrg, graphqlQuery, queryName, queryArgs: queryArgs.join(' '), queryHttp: req };
  }
  return null;
};
/** Transform a flat content of logs into a list of request items to be processed, see ParseLog */
const parseLogs = (textLogs) => {
  const requests = [];
  const logs = textLogs.split('\n');
  logs.forEach((q) => {
    const r = parseLog(q);
    if (r) {
      requests.push(r);
    }
  });
  return requests;
};
/** Remove duplicates */
const dedupRequests = (requests) => {
  const res = [];
  const alreadTested = {};
  for (let i = 0; i < requests.length; i++) {
    const gRequest = requests[i];
    const hash = `${gRequest.queryName};${gRequest.queryArgs}`;
    if (alreadTested[hash]) {
      continue;
    }
    alreadTested[hash] = true;
    res.push(gRequest);
  }
  return res;
};
/** run a graphql query */
async function query(str, loopback, user) {
  const req = {};
  req.user = user;
  req.app = loopback;
  return graphql(schema, str, null, req);
}

/* verbose logs*/
const VERBOSE = false;
function verbose(l) {
  if (VERBOSE) {
    console.log(l);
  }
}

async function main() {
  /** Get our logs */
  const logs = await downloadLogs();
  let requests = parseLogs(logs);
  requests = dedupRequests(requests);
  console.log(`${requests.length} graphql requests to test`);
  /* we need an user with unlimited access to test our queries */
  const bb = await app.models.User.findOne({ email: 'bbodrefaux@garagescore.com' });

  console.log('Alert;Request Id;Time spent;Results size;Query;Arguments;graphiql');
  /** run our tests in serie */
  for (let i = 0; i < requests.length; i++) {
    const gRequest = requests[i];
    const start = Date.now();
    if ([].indexOf(gRequest.id) >= 0) continue;
    verbose(`Running ${gRequest.id}...`);
    const data = await query(gRequest.graphqlQuery, app, bb);
    const sizeInKB = Math.round((sizeof(data) / 1024) * 10) / 10;
    const timeNew = Date.now() - start;
    let PREFIX = '';
    if (timeNew > 0.05 && sizeInKB > 500) {
      PREFIX = 'ALERT TIME&SIZE - ';
    } else if (timeNew > 5000) {
      PREFIX = 'ALERT TIME - ';
    } else if (sizeInKB > 500) {
      PREFIX = 'ALERT SIZE - ';
    }
    verbose(
      `${PREFIX}${gRequest.id} ${gRequest.timeOrg}ms in production / ${timeNew}ms now (results size: ${sizeInKB}KB)`
    );
    if (PREFIX) {
      console.log(
        `${PREFIX};${gRequest.id};${timeNew};${sizeInKB};${gRequest.queryName};${gRequest.queryArgs};${gRequest.queryHttp}`
      );
    }
  }
  console.log('bye');
  process.exit();
}
main();
