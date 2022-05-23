var debug = require('debug')('garagescore:common:lib:garagescore:firewall'); // eslint-disable-line max-len,no-unused-vars

// allow or not a request received by Express
// return false if not allow, or return the authorised ip
var isRequestAllowed = function allowRequest(req) {
  // we don't really know where the real client ip is, let's check everything...
  var refusedIps = [];

  var ip = req.ip;
  ip = ip.replace('::ffff:', '');

  // Allowing all ips on our next-publicapi-pr-xxxx
  if (process.env.PUBLIC_API_URL.includes('-pr-')) {
    return req.id || (req.headers['x-forwarded-for'] && req.headers['x-forwarded-for'].split(',').pop().trim());
  }
  if (ip) {
    if (this.ALLOWED_IPS.indexOf(ip) !== -1) { // Remove to test on local
      debug('[GarageScore App Firewall] Allowing access to ' + req.originalUrl + ' from ' + ip + ' (req.ip)');
      return ip;
    }
    refusedIps.push(ip);
  }
  if (req.headers['x-forwarded-for']) {
    var ips = req.headers['x-forwarded-for'].split(',');
    for (var i = 0; i < ips.length; i++) {
      if (this.ALLOWED_IPS.indexOf(ips[i].trim()) !== -1) {
        debug(
          '[GarageScore App Firewall] Allowing access to ' +
            req.originalUrl +
            ' from ' +
            ips[i] +
            " (req.headers['x-forwarded-for'][" +
            i +
            '])'
        );
        return ips[i];
      }
      refusedIps.push(refusedIps.push(ips[i]));
    }
  }
  if (req.connection && req.connection.remoteAddress) {
    if (this.ALLOWED_IPS.indexOf(req.connection.remoteAddress) !== -1) {
      debug(
        '[GarageScore App Firewall] Allowing access to ' +
          req.originalUrl +
          ' from ' +
          req.connection.remoteAddress +
          ' (req.connection.remoteAddress)'
      );
      return req.connection.remoteAddress;
    }
    refusedIps.push(req.connection.remoteAddress);
  }
  debug('[GarageScore App Firewall] Forbidding access to ' + req.originalUrl + ' from ' + refusedIps.join(','));
  return false;
};

// check an express connection, must be used like
// app.get('/public-api', firewall.checkConnection());
var checkConnection = function checkConnection(req, res, next) {
  if (this.isRequestAllowed(req)) {
    next();
  } else {
    res.status(403).end('Access forbidden');
  }
};

var Firewall = function (rules) {
  this.ALLOWED_IPS = rules.allowedIps;
  this.isRequestAllowed = isRequestAllowed.bind(this);
  this.checkConnection = checkConnection.bind(this);
};

module.exports = Firewall;
