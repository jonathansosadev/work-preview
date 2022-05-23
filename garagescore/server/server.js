require('dotenv').config({ silent: true });
const config = require('config');
const path = require('path');
const moment = require('moment');
const { JS, log } = require('../common/lib/util/log');
const { TEST_DB_NAME } = require('../common/lib/test/constants');
const mongoProfiler = require('../common/lib/garagescore/monitoring/mongo-profiler');

log.debug(JS, `Running instance: ${config.util.getEnv('NODE_APP_INSTANCE')}`);

const mochaON =
  typeof process.env.LOADED_MOCHA_OPTS !== 'undefined' ||
  (process.argv.length > 1 && process.argv[1].indexOf('mocha') >= 0);

if (!mochaON && config.has('newrelic.enable') && config.get('newrelic.enable')) {
  log.debug(JS, 'New Relic enabled');
  require('newrelic'); // eslint-disable-line
}

const mainModule = require.main === module || module.parent.filename.includes('main-app.js');

/*
 * Initialize Express/Loopback application
 */

log.debug(JS, 'Starting loopback');
const loopback = require('loopback'); // eslint-disable-line global-require

log.debug(JS, 'Starting loopback-boot');
const boot = require('loopback-boot'); // eslint-disable-line global-require

const app = (module.exports = loopback());

log.debug(JS, 'Starting middlewares');

/*
 * Loopback context
 */
app.middleware('initial:before', loopback.context());

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
/**
 * don't require server.js before test.app
 */

function findTestAppParent(current) {
  if (!current || !current.parent) {
    return false;
  } else if (current.parent.filename.includes('test-app')) {
    return true;
  } else if (current.parent.parent) {
    return findTestAppParent(current.parent);
  }
  return false;
}

if (mochaON && !findTestAppParent(module)) {
  process.env.serverjsloaded = true; // if testapp see this var to true, it will leave
}

const bootOptions = { appRootDir: __dirname, bootDirs: [], bootScripts: [] };
bootOptions.bootDirs.push(path.join(__dirname, 'boot-common'));
if (
  mochaON ||
  (config.has('server.web.app') && config.get('server.web.app')) ||
  config.util.getEnv('NODE_APP_INSTANCE') === 'contacts'
) {
  /*  || config.util.getEnv('NODE_APP_INSTANCE') === 'script' */

  bootOptions.bootScripts.push(
    path.join(__dirname, '../common/lib/garagescore/automatic-billing/billing-api/api.main.js')
  );

  bootOptions.bootDirs.push(path.join(__dirname, 'boot-users'));
} else if (config.has('server.web.api') && config.get('server.web.api')) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-users'));
}
if (mainModule && config.has('server.web.www') && config.get('server.web.www')) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-www'));
}
if (mainModule && config.has('server.web.survey') && config.get('server.web.survey')) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-survey'));
}
if (mainModule && config.has('server.web.publicapi') && config.get('server.web.publicapi')) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-users'));
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-publicapi'));
}
if (config.util.getEnv('NODE_APP_INSTANCE') === 'review' && config.get('simulators.activated') === true) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-simulators'));
}
if (config.util.getEnv('NODE_APP_INSTANCE') === 'contacts') {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-contacts'));
}
if (config.util.getEnv('NODE_APP_INSTANCE') === 'www' || config.util.getEnv('NODE_APP_INSTANCE') === 'app') {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-legaldocs'));
}
if (mainModule && config.has('server.web.app') && config.get('server.web.app')) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-app'));
  bootOptions.bootScripts.push(path.join(__dirname, 'boot-app/user-jobs/12-user-jobs-routes'));
  // bootOptions.bootScripts.push(path.join(__dirname, 'boot-app/api/api.main.js'));
}

if (mainModule) {
  bootOptions.bootDirs.push(path.join(__dirname, 'boot-webstatic'));
  /*
   * Flash
   */
  const flash = require('express-flash'); // eslint-disable-line

  app.use(flash());
}

log.debug(JS, 'Starting boot scripts');
const afterBoot = async (bootErr) => {
  if (bootErr) throw bootErr;
  // log mongo requests
  mongoProfiler.start(app);
  // Proceed to post-boot steps, only if app was run directly (`node server.js`), not if it was `require`d
  if (mainModule) {
    if (
      process.env.NODE_APP_INSTANCE !== 'survey' &&
      process.env.NODE_APP_INSTANCE !== 'contacts' &&
      process.env.NODE_APP_INSTANCE !== 'publicapi'
    ) {
      const { Nuxt, Builder } = require('nuxt'); // eslint-disable-line global-require
      const nuxtConfig = require('../nuxt.config.js'); // eslint-disable-line global-require
      const nuxt = new Nuxt(nuxtConfig);
      if (nuxtConfig.dev) {
        log.debug(JS, '[NUXT/BUILD] NODE_ENV is not production, starting building Nuxt.');
        moment.locale('en'); // It's weird but we need it...
        await new Builder(nuxt).build();
        moment.locale('fr');
      }
      app.start = function startWithNuxt() {
        return app.listen(process.env.PORT || 3000, () => {
          app.emit('started');
          log.debug(JS, 'Web server listening at: %s (env.PORT=%s)', app.get('url'), process.env.PORT);
          app.nuxt = nuxt;
          app.use(nuxt.render);
        });
      };
    } else {
      // contacts, reviews
      moment.locale('fr');
      app.start = function start() {
        return app.listen(process.env.PORT || process.env.PUBLICAPI_PORT || 3000, () => app.emit('started'));
      };
    }
    /*
     * Favicon
     */
    const serveFavicon = require('serve-favicon'); // eslint-disable-line

    app.middleware(
      'initial:before',
      serveFavicon(path.resolve(__dirname, '../frontend/static/logo/icons/custeed/favicon.ico'))
    );

    /*
     * Parser Middlewares:
     * body-parser for application/json and application/x-www-form-urlencoded
     * express-formidable for multipart/form-data encoded (eg. Mailgun Webhooks)
     */
    const bodyParser = require('body-parser'); // eslint-disable-line

    app.middleware('parse', bodyParser.json());
    app.middleware(
      'parse',
      bodyParser.urlencoded({
        extended: true,
      })
    );

    const formidable = require('express-formidable'); // eslint-disable-line

    app.middleware('parse', formidable.parse());

    /*
     * Nunjucks
     */

    const gsClient = require('../common/lib/garagescore/client'); // eslint-disable-line

    log.debug(JS, 'Starting nunjucks');
    const nunjucks = require('nunjucks'); // eslint-disable-line

    app.set('view engine', 'nunjucks');
    app.set('views', path.normalize(path.join(__dirname, '../common/templates/app')));

    const nunjucksEnv = nunjucks.configure(path.normalize(path.join(__dirname, '../common/templates/app')), {
      express: app,
      autoescape: true,
      watch: config.get('nunjucks.watchUdpates'),
    });
    nunjucksEnv.addGlobal('lib', {
      client: gsClient,
    });

    /*
     * Now that app is booted, "cookieSecret" app property is available
     */
    const cookieParser = require('cookie-parser'); // eslint-disable-line

    app.middleware('session', cookieParser(app.get('cookieSecret')));
    // Start the server
    const server = app.start();

    if (config.has('server.web.app') && config.get('server.web.app')) {
      require('./workers/backoffice-workers').responseServer(server); // eslint-disable-line
    }
  } else {
    moment.locale('fr');
  }
};

const startMongoMemoryServer = async () => {
  const { MongoMemoryServer } = require('mongodb-memory-server'); // eslint-disable-line
  const mongod = new MongoMemoryServer({ instance: { dbName: TEST_DB_NAME }, binary: { version: '4.4.1' } });
  const uri = await mongod.getUri();
  process.env.MEMORY_DB_URI = uri;
};

if (process.env.USE_MEMORY_DB === 'true' || process.env.USE_MEMORY_DB === true) {
  startMongoMemoryServer().then(() => {
    boot(app, bootOptions, afterBoot);
  });
} else {
  boot(app, bootOptions, afterBoot);
}
