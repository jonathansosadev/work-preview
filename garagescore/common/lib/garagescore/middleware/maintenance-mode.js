const app = require('../../../../server/server');

module.exports = function ensureMaintenanceModeMiddleware(req, res, next) {
  app.models.Configuration.getMaintenanceMode((err, maintenanceMode) => {
    if (maintenanceMode && (!req.user || (req.user && !req.user.isGarageScoreUser()))) {
      res.render('error/maintenance');
      return;
    }
    next();
  });
};
