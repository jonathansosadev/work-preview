/**
 * Custeedbook's app
 */
const { printFormattedHeapSizeLimit } = require('./common/lib/garagescore/v8/heap-size-info');

printFormattedHeapSizeLimit();

const { FED, log } = require('./common/lib/util/log');
const path = require('path');
const moment = require('moment');

process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  log.debug(FED, 'unhandledRejection', error);
});

log.debug(FED, `Running instance: Custeedbook`);

// Bootstrap the application, configure models, datasources and middleware.
// Sub-apps like REST API are mounted via boot scripts.
/**
 * don't require server.js before test.app
 */

const bootOptions = { appRootDir: __dirname, bootDirs: [], bootScripts: [] };
bootOptions.bootDirs.push(path.join(__dirname, 'boot-common'));

/*
 * Initialize Express/Loopback application
 */

log.debug(FED, 'Starting loopback');
const loopback = require('loopback'); // eslint-disable-line global-require

log.debug(FED, 'Starting loopback-boot');
const boot = require('loopback-boot'); // eslint-disable-line global-require

const app = (module.exports = loopback());

log.debug(FED, 'Starting middlewares');

/*
 * Loopback context
 */
app.middleware('initial:before', loopback.context());

log.debug(FED, 'Starting boot scripts');
const afterBoot = async (bootErr) => {
  if (bootErr) throw bootErr;
  // Proceed to post-boot steps, only if app was run directly (`node server.FED`), not if it was `require`d
  const { Nuxt, Builder } = require('nuxt'); // eslint-disable-line global-require
  const nuxtConfig = require('./nuxt.config.js'); // eslint-disable-line global-require
  const nuxt = new Nuxt(nuxtConfig);
  if (nuxtConfig.dev) {
    log.debug(FED, '[NUXT/BUILD] NODE_ENV is not production, starting building Nuxt.');
    moment.locale('en'); // It's weird but we need it...
    await new Builder(nuxt).build();
    moment.locale('fr');
  }
  app.start = function startWithNuxt() {
    return app.listen(process.env.PORT || 5000, () => {
      app.emit('started');
      log.debug(FED, 'Web server listening at: %s (env.PORT=%s)', app.get('url'), process.env.PORT || 3000);
      app.nuxt = nuxt;
      app.use(nuxt.render);
    });
  };
  /*
   * Favicon
   */
  const serveFavicon = require('serve-favicon'); // eslint-disable-line

  app.middleware(
    'initial:before',
    serveFavicon(path.resolve(__dirname, 'frontend/static/logo/icons/custeed/favicon.ico'))
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
   * Now that app is booted, "cookieSecret" app property is available
   */
  const cookieParser = require('cookie-parser'); // eslint-disable-line

  app.middleware('session', cookieParser(app.get('cookieSecret')));
  // Start the server
  app.start();
  moment.locale('fr');
};

boot(app, bootOptions, afterBoot);
