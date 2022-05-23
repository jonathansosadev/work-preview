// basic http auth
const bimeAuth = (req, res, next) => {
  next();
};

const bimeRoutes = {
  KPIS: 'kpis',
};

module.exports = {
  bimeAuth,
  bimeRoutes,
};
