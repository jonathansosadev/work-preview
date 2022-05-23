/** Track user (ip, browser fingerprint) */
module.exports = {
  // return the user s real ip (The first one being the user ip)
  ip: (req) => {
    return (
      req.headers['x-forwarded-for'] ||
      req.headers['cf-connecting-ip'] || // cloudfare
      (req.connection && req.connection.remoteAddress) ||
      ''
    )
      .split(',')[0]
      .trim();
  },
  // a fingerprint of the user's browser stored in cookie (see fingerprint2 in the code)
  fingerPrint: (req) => (req.cookies && req.cookies.fingerprint) || (req.session && req.session.fingerPrint),
};
