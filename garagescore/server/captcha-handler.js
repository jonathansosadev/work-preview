/* eslint no-param-reassign: ["error", { "props": true, "ignorePropertyModificationsFor": ["req", "user"] }] */
const gsClient = require('../common/lib/garagescore/client');
const ReCAPTCHA = require('recaptcha2');
const config = require('config');

let _recaptcha = null;
try {
  _recaptcha = new ReCAPTCHA({
    siteKey: config.get('google.captchaSiteKey'),
    secretKey: config.get('google.captchaSecretKey'),
  });
} catch (err) {
  // console.log('Error : ', err.message);
}

/** Custom captcha handler after parsing to verify captcha validation only if remainingLoginAttemptBeforeCaptcha of the user is <= 0 */
module.exports = {
  captchaHandler: function () {
    return function captchaHandler(req, res, next) {
      next();
      return; //#2794 disable recaptcha
      if (!_recaptcha || req.method !== 'POST' || req.originalUrl !== gsClient.url.getUrl('AUTH_SIGNIN_LOCAL')) {
        next();
        return;
      }
      const email = req.body.email || req.query.email;
      if (!email) {
        next();
        return;
      }
      req.app.models.User.findOne({ where: { email } }, (err, user) => {
        if (err || !user || !req.session) {
          next();
          return;
        }
        req.session.email = email;
        req.session.remainingLoginAttemptBeforeCaptcha = user.remainingLoginAttemptBeforeCaptcha;
        if (
          typeof user.remainingLoginAttemptBeforeCaptcha === 'undefined' ||
          user.remainingLoginAttemptBeforeCaptcha > 0
        ) {
          next();
          return;
        }
        // If we cross this line, that means the user failed to log into a account more than 2 times
        if (!req.body.recaptcha) {
          // Means the client didn't send the recaptcha in the payload
          console.log('Error, no recaptcha located in req.');
          res.status(400).send({ status: 'KO', message: 'Error, recaptcha missing' });
          return;
        }
        _recaptcha
          .validate(req.body.recaptcha)
          .then(() => {
            user.remainingLoginAttemptBeforeCaptcha = 3;
            req.session.remainingLoginAttemptBeforeCaptcha = user.remainingLoginAttemptBeforeCaptcha;
            user.save(() => {
              next();
            });
          })
          .catch((errorCodes) => {
            res.status(400).send({ status: 'KO', message: _recaptcha.translateErrors(errorCodes) });
            console.log(_recaptcha.translateErrors(errorCodes)); // translate error codes to human readable text
          });
      });
    };
  },
  captchaValidator: async function captchaValidator(recaptchaValue) {
    try {
      await _recaptcha.validate(recaptchaValue);
      return null;
    } catch (e) {
      console.log(_recaptcha.translateErrors(e));
      return _recaptcha.translateErrors(e);
    }
  },
};
