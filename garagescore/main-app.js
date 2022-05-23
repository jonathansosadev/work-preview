/**
 * Our main app
 * By default run a loopback server
 * But depending the conf can also run standalone servers like http2ftp, logdrain or discuss
 */

require('dotenv').config({ silent: true });
const args = process.argv.slice(2);
if (args[0]) {
  process.env.NODE_APP_INSTANCE = args[0];
}
if (args[1]) {
  process.env.PORT = args[1];
}
if (process.env.NODE_APP_INSTANCE === 'custeedbook') {
  require('./main-custeedbook.js'); // eslint-disable-line
  return;
}
if (process.env.NODE_APP_INSTANCE === 'apollo') {
  require('./server/webservers-standalones/api/server.js'); // eslint-disable-line
  return;
}

const { printFormattedHeapSizeLimit } = require('./common/lib/garagescore/v8/heap-size-info');

printFormattedHeapSizeLimit();

const config = require('config');
const timeHelper = require('./common/lib/util/time-helper.js'); // eslint-disable-line

const { JS, log } = require('./common/lib/util/log');

process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  log.debug(JS, 'unhandledRejection', error);
});
if (config.util.getEnv('NODE_APP_INSTANCE') === 'http2ftp') {
  require('./server/webservers-standalones/http2ftp/server.js'); // eslint-disable-line
} else if (config.util.getEnv('NODE_APP_INSTANCE') === 'logdrain') {
  require('./server/webservers-standalones/herokulogdrain/server.js'); // eslint-disable-line
} else if (config.util.getEnv('NODE_APP_INSTANCE') === 'discuss') {
  require('./server/webservers-standalones/discuss/server.js'); // eslint-disable-line
} else if (config.util.getEnv('NODE_APP_INSTANCE') === 'apollo') {
  require('./server/webservers-standalones/api/server.js'); // eslint-disable-line
} else if (config.util.getEnv('NODE_APP_INSTANCE') === 'contacts') {
  require('./server/server');
  // no crons in contacts
} else if (config.util.getEnv('NODE_APP_INSTANCE') === 'github-incidents') {
  require('./server/webservers-standalones/github-incidents/server.js'); // eslint-disable-line
} else {
  require('./server/server');
}
