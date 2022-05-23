const graphqlHTTP = require('express-graphql');
const schema = require('../../common/lib/garagescore/api/graphql/index');
const config = require('config');
const { log, JS } = require('../../common/lib/util/log');
const graphqlProfiler = require('../../common/lib/garagescore/monitoring/graphql-profiler');

const gql = require('graphql-tag');
/** GraphQL Cockpit API */
module.exports = function cockpitAPI(app) {
  app.use(
    '/graphql',
    graphqlHTTP((req) => {
      let query = null;
      let queryName = null;
      if (req.body && req.body.query) {
        const obj = gql`
          ${req.body.query}
        `;
        query = req.body.query;
        queryName = obj.definitions[0].selectionSet.selections[0].name.value;
        // log.debug(JS, queryLog);
      }
      const startTime = Date.now();
      return {
        schema,
        pretty: true,
        formatError(err) {
          const msg = err.message || '';
          if (msg.indexOf('No configured garage') > 0 || msg.indexOf('have no access') > 0) {
            // silence common errors
            log.debug(JS, `GraphQL - ${msg || '?'} at ${err.path || '?'}`);
          } else {
            log.error(JS, `ERROR: GraphQL - ${msg || '?'} at ${err.path || '?'}`, err);
          }
          return err;
        },
        graphiql: req.user && req.user.isGarageTechnicalTeamMember(),
        extensions() {
          const ext = {};
          ext.runTime = Date.now() - startTime;
          graphqlProfiler.insert(app, { name: queryName, query, variables: null, runTime: ext.runTime });
          if (req.total) {
            ext.total = req.total;
          }
          if (req.hasMore) {
            ext.hasMore = req.hasMore;
          }
          return ext;
        },
      };
    })
  );
  log.debug(JS, 'Running a GraphQL API server at localhost:3000/graphql');
};
