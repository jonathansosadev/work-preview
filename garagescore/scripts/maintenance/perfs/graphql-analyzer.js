/** *
 * Analyze graphql queries
 */
process.env.QUERY_LOGGER = false;
// const { graphql } = require('graphql');
const gql = require('graphql-tag');
const querystring = require('querystring');
// const sizeof = require('object-sizeof');
// const request = require('request');
const unzipper = require('unzipper');
const fs = require('fs');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const Crypto = require('crypto');

// const schema = require('../../../common/lib/garagescore/api/graphql');
// const app = require('../../../server/server');

//
const args = process.argv.slice(2);
if (args.length !== 1) {
  console.error('Usage: >node scripts/maintenance/perfs/graphql-analyzer.js [logPath]');
  process.exit();
}
const logsPath = args[0];
// console.log('logsPath is:', logsPath);

/** unzip logs + return content as string */
const getContentFromZip = async function () {
  const directory = await unzipper.Open.file(zipPath);
  const file = directory.files[0];
  const content = await file.buffer();
  return content.toString();
};
let fileDate = '';
/* parse one line of logs and returns the original time spend, the graphql query and the req id */
const parseLog = (line) => {
  const m = line.match(/low graphql query: (\d+)ms - (.+) - (http.+)/);
  const d = line.match(/1 ([0-9][0-9][0-9][0-9])-([0-9][0-9])-([0-9][0-9])T([0-9][0-9]):([0-9][0-9])/);
  if (m && m.length === 4) {
    if (line.indexOf('mutation') > 0) {
      return null;
    }
    fileDate = `${d[3]}/${d[2]}/${d[1]}`;
    const time = `${d[4]}:${d[5]}`;
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

    return { id, time, timeOrg, graphqlQuery, queryName, queryArgs: queryArgs.join(' '), queryHttp: req };
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

const displayResults = (list) => {
  console.log(`Date (${fileDate});MD5;Perf;Id;Time;Name;Args`); // ;QueryHttp
  for (const elem of list) {
    console.log(
      [
        elem.time,
        elem.md5,
        elem.perf,
        elem.id,
        elem.timeSpend,
        elem.name,
        elem.args,
        // elem.queryHttp
      ].join(';')
    );
  }
};

async function main() {
  const content = await readFileAsync(logsPath, 'utf8');
  const parsedRequests = parseLogs(content);
  const list = [];
  for (const req of parsedRequests) {
    const md5Key = Crypto.createHash('md5').update(req.queryHttp).digest('hex');
    let PREFIX = `${Math.ceil(req.timeOrg / 1000)}k+`;
    list.push({
      time: req.time,
      md5: md5Key,
      perf: PREFIX,
      id: req.id,
      timeSpend: req.timeOrg,
      name: req.queryName,
      // query bien sale pour tester vite fait
      args: `${decodeURI(
        req.graphqlQuery
          .replace(/[ ]/g, '')
          .replace(/\n+/g, '\n')
          .split('\n')[1]
          .replace(/[{)]/g, '')
          .replace(/.*\(/, '')
      )}`, // eslint-disable-line
      queryHttp: req.queryHttp,
    });
  }
  displayResults(
    list.sort((a, b) => {
      if (a.md5 < b.md5) return -1;
      else if (a.md5 > b.md5) return 1;
      return 0;
    })
  );
  process.exit();
}
main();
