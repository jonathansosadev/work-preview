const graphql = require('graphql');
const greyboKpi = require('../../../types/greybo-kpi');

module.exports = {
  type: greyboKpi,
  args: {},
  async resolve(root, args, req) {
    try {
      // detailled values of my service kpis
      const myKpis = await req.app.models.InternalKPI.getMyKpis(req.user);
      // summary of every kpis of every services
      const report = await req.app.models.InternalKPI.getPublicReport();
      return {
        userEmail: req.user.email,
        myKpis,
        report,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  },
};
