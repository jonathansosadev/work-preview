/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["user", "req"] }] */
/** Custom error handler to not pollute the log with Exception at every login fail
 *  if loopback detect wrong password, count down remainingLoginAttemptBeforeCaptcha
 * */
const slackClientPostMessage = require('../common/lib/slack/client').postMessage;
const sections = require('../common/models/userSection.type.js');
const userAccess = require('../common/lib/garagescore/users-access/access');

const _delayInMinutesBetweenEachLoginFailedLog = 1 / 60; // 1 seconds
const _slackParameters = {
  channel: '#users-access',
  username: 'Login supervisor',
  icon_url: 'https://pre00.deviantart.net/f784/th/pre/f/2011/296/7/2/heimdall_by_sin_vraal-d4dq4os.jpg',
};

/**
 * This private function is used to add a LOGIN_FAILED access on the user
 * We also notify by slack every 5 fails by user
 * @param req
 * @param user
 * @private
 */
function _handleUserAccess(req, user) {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  req.app.models.AccessHistory.find({
    where: { userId: user.id, section: sections.routeEnum.LOGIN_FAILED, createdAt: { gt: yesterday } },
  }).then((loginFailAccess) => {
    if (loginFailAccess.length && !(loginFailAccess.length % 5)) {
      slackClientPostMessage(
        `${user.email} a des difficultés pour rejoindre GarageScore (${loginFailAccess.length} mdp failed sur les dernières 24h)`,
        _slackParameters,
        (slackError) => {
          if (slackError) console.log(slackError);
        }
      );
    }
    user.addAccess(userAccess.create(req, sections.routeEnum.LOGIN_FAILED), _delayInMinutesBetweenEachLoginFailedLog);
  });
}

/**
 * Handle captcha by decreasing remainingLoginAttemptBeforeCaptcha and saving it into the user
 * @param req
 * @param callback
 * @private
 */
function _handleCaptcha(req, callback) {
  if (!req || !req.session || !req.session.email) {
    callback();
    return;
  }
  req.app.models.User.findOne({ where: { email: req.session.email } }, (findErr, user) => {
    if (findErr || !user) {
      callback();
      return;
    }
    if (typeof user.remainingLoginAttemptBeforeCaptcha === 'undefined') user.remainingLoginAttemptBeforeCaptcha = 3;
    user.remainingLoginAttemptBeforeCaptcha--;
    // We save into the session the same number so we are able to display the captcha when he reload the page
    req.session.remainingLoginAttemptBeforeCaptcha = user.remainingLoginAttemptBeforeCaptcha;
    user.save((errorSave) => {
      callback(errorSave, user);
    });
  });
}

/**
 * Handle every request errors
 * @returns {logError}
 */
module.exports = function handler() {
  return function logError(err, req, res, next) {
    if (err) {
      console.log(`Warning: Loopback - "${err.message}" at ${req.url}`);
      if (err.message === 'login failed' || err.message === 'échec de la connexion') {
        _handleCaptcha(req, (errCaptcha, user) => {
          if (user) {
            _handleUserAccess(req, user);
          }
          next();
        });
      }
    } else next();
  };
};
