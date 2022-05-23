/** REST API for BIME */
const bimeAuth = require('../../common/lib/garagescore/api/bime/_common').bimeAuth;
const bimeRoutes = require('../../common/lib/garagescore/api/bime/_common').bimeRoutes;
const kpis = require('../../common/lib/garagescore/api/bime/kpis');

module.exports = function cockpitAPI(app) {
  app.use(`/bime/${bimeRoutes.KPIS}`, bimeAuth, kpis);
  console.log('Running a protected REST API server (for bime) at localhost:3000/bime');
};
