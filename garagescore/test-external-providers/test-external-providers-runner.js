/**
 * Test external providers
 */
const path = require('path');
const Mocha = require('mocha');
const { promisify } = require('util');
const glob = require('glob');
const promisifiedGlob = promisify(glob);
const slackClient = require('../common/lib/slack/client');

module.exports = {
  async run(callback) {
    const directory = path.join(__dirname);
    const testFiles = await findTestFiles(directory, function (error) {
      if (error) {
        throw error;
      }
    });

    let mocha = new Mocha({
      timeout: 999999,
      ui: 'bdd',
      asyncOnly: false,
      fullTrace: true
    });
    testFiles.map(file => {
      mocha.addFile(file);
    });

    mocha.run(() => {
        callback();
      })
      .on('test', async function (test) {
        console.log(`Le Test '${test.title}' commence`);
      })
      .on('pass', async function (test) {
        console.log(`Le Test '${test.title}' s'est terminé avec succès`);
      })
      .on('fail', async function (test, err) {
        const slackText = `Erreur lors du lancement du Test '${test.title}' :\n ${err.stack}`;
        await new Promise((res, rej) =>
          slackClient.postMessage(
            {
              channel: `#çavapastrop`,
              username: '[Cron] Test External Providers',
              text: slackText,
            },
            (answer) => (answer ? rej(answer) : res())
          )
        );
      });
  }
};

const findTestFiles = async function (directory, done) {
  try {
    return promisifiedGlob(`${directory}/**/*.js`);
  } catch (error) {
    done(error);
  }
};