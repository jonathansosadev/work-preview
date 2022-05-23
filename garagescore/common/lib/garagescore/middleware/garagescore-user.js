module.exports = function ensureGarageScoreUser(req, res, next) {
  if (!req.user || !req.user.isGarageScoreUser()) {
    res.send('Non authorisé');
    return;
  }
  next();
};
