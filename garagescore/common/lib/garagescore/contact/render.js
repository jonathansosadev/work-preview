const app = require('../../../../server/server');
const juice = require('juice');
const { htmlToText } = require('../../util/html-to-text');
const { Nuxt, Builder } = require('nuxt');
const nuxtConfig = require('../../../../nuxt.config');
const ping = require('../../workerbeats/ping');

// during our tests app.nuxt is not available
// our mocha code need to call setTestMode()
// this will override the classic ap.nuxt and use a special nuxt instance created only for the teste
let NUXT_FOR_TESTS = false;
let NUXT_FOR_WORKERS = false;

const setTestMode = async () => {
  if (!NUXT_FOR_TESTS) {
    try {
      console.log('Attaching nuxt for unit tests...');
      const { Nuxt } = require('nuxt');
      const configForTests = { ...nuxtConfig };
      // customize options to get better perf/ resources consumption
      configForTests.dev = false;
      NUXT_FOR_TESTS = new Nuxt(configForTests);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
};

/**
 * Nuxt is only attached when we have express (server/server.js)
 * For workers we need to attach it manually
 */
const setWorkersMode = async () => {
  if (!NUXT_FOR_WORKERS && !app.nuxt) {
    try {
      console.log('Attaching nuxt for workers...');
      const { Nuxt } = require('nuxt');
      const config = { ...nuxtConfig };
      // customize options to get better perf/ resources consumption
      config.dev = false;
      NUXT_FOR_WORKERS = new Nuxt(config);
    } catch (err) {
      console.error(err);
      process.exit(1);
    }
  }
};

const nuxt = () => {
  if (NUXT_FOR_TESTS) {
    return NUXT_FOR_TESTS;
  }
  if (NUXT_FOR_WORKERS) {
    return NUXT_FOR_WORKERS;
  }
  if (!app.nuxt) {
    console.error(new Error('Nuxt is not defined ! If you are testing try testApp.allowContactsRender()'));
    return null;
  }
  return app.nuxt;
};

/** Return an html render with nuxt
 *
 * route: see nuxt.config and extended routes to relate a path with a nuxt page
 * data: avaible in the store with this.$store.state.emailData
 */
const renderEmailWithNuxt = async (route, data, cb) => {
  const promise = new Promise((resolve) => {
    nuxt()
      .renderRoute(route, { req: { emailData: data, headers: {} } })
      .then(async ({ html, err }) => {
        if (err) {
          console.error(`renderEmailWithNuxt error ${route}`);
          console.error(err);
          await ping('EmailRenderInError');
          resolve('');
          return;
        }
        let cleaned = html;
        const i = cleaned.lastIndexOf('<body');
        let m1 = cleaned.substr(0, i);
        let m2 = cleaned.substr(i);
        m1 = m1.replace(/<title.+\/title>/, '');
        m1 = m1.replace(/<link[^<]+>/g, '');
        m1 = m1.replace(/<meta[^<]+>/g, '');
        m1 = m1.replace(/<script[\s\S]*<\/script>/g, ''); // multiline replace
        m2 = m2.replace(/<script[\s\S]*<\/script>/g, ''); // multiline replace
        cleaned = `${m1}${m2}`;
        // TODO return a perfectly clean html
        resolve(juice(cleaned));
      })
      .catch(async (e) => {
        console.error(`renderEmailWithNuxt error ${route}`);
        console.error(e);
        await ping('EmailRenderInError');
        resolve('');
      });
  });
  if (cb) {
    promise.then((res) => {
      cb(null, res);
    });
    return null;
  }
  return promise;
};

const renderTextEmailWithNuxt = async (route, data, cb) => {
  const html = await renderEmailWithNuxt(route, data);
  let text = htmlToText(html);
  text = text.trim();
  if (cb) {
    cb(null, text);
    return null;
  }
  return new Promise((resolve) => {
    resolve(text);
  });
};

module.exports = {
  html: renderEmailWithNuxt,
  txt: renderTextEmailWithNuxt,
  setTestMode,
  setWorkersMode,
};
