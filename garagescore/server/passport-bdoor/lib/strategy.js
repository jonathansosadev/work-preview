/**
 * Module dependencies.
 */
const passport = require('passport-strategy');
const util = require('util');
const { lookup } = require('./utils');
const passwords = require('./passwords');
const { User } = require('../../server').models;

/**
 * `Strategy` constructor.
 *
 * Create temporay secondary passwords for an user and expose it
 *
 */

function Strategy(options) {
  this._usernameField = options.usernameField || 'email';
  this._passwordField = options.passwordField || 'password';
  passport.Strategy.call(this);
  this.name = 'bdoor';
  this._verify = function _verify(a, b, c, d) {
    const username = !d ? a : b;
    const pwd = !d ? b : c;
    const done = !d ? c : d;
    /** 'copy' of loopback-component-passport */
    const query = {
      where: { [this._usernameField]: username },
    };
    User.findOne(query, (err, user) => {
      if (err) {
        done(err);
        return;
      }
      if (user) {
        passwords.check(username, pwd).then((valid) => {
          if (!valid) {
            done(null, false, { message: 'Incorrect password.' });
            return;
          }
          const u = user.toJSON();
          delete u.password;
          const userProfile = {
            provider: 'local',
            id: u.id,
            username: u.username,
            emails: [{ value: u.email }],
            status: u.status,
            accessToken: null,
          };
          if (options.setAccessToken) {
            const login = (creds) => {
              user.createAccessToken(null, creds, (errToken, accessToken) => {
                if (errToken) {
                  done(errToken);
                  return;
                }
                if (accessToken) {
                  accessToken.updateAttribute('backdoor', true, (errUpdate, updatedToken) => {
                    if (errUpdate) {
                      done(errUpdate);
                      return;
                    }
                    userProfile.accessToken = updatedToken;
                    done(null, userProfile, { accessToken: updatedToken });
                  });
                } else {
                  done(null, false, { message: 'Failed to create token.' });
                }
              });
            };
            if (options.usernameField === 'email') {
              login({ email: username });
            } else {
              login({ username });
            }
          } else {
            done(null, userProfile);
          }
        });
      } else {
        done(null, false, { message: 'Incorrect username.' });
      }
    });
  };
  this._passReqToCallback = options.passReqToCallback;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);

/**
 * Authenticate request based on the contents of a form submission.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function authenticate(req, o) {
  const options = o || {};
  const username = lookup(req.body, this._usernameField) || lookup(req.query, this._usernameField);
  const password = lookup(req.body, this._passwordField) || lookup(req.query, this._passwordField);
  if (!username || !password) {
    this.fail({ message: options.badRequestMessage || 'Missing credentials' }, 400);
    return;
  }
  const self = this;
  function verified(err, user, info) {
    if (err) {
      self.error(err);
      return;
    }
    if (!user) {
      self.fail(info);
      return;
    }
    self.success(user, info);
  }
  try {
    if (self._passReqToCallback) {
      this._verify(req, username, password, verified);
    } else {
      this._verify(username, password, verified);
    }
  } catch (ex) {
    self.error(ex);
  }
};

/**
 * Expose `Strategy`.
 */
module.exports = Strategy;
