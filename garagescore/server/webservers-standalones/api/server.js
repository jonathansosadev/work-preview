const loopback = require('loopback');

const express = require('express');
const app = require('../../server');
const apolloServer = require('./apollo-server.js');
const BillingAccountModel = require('../../../common/lib/garagescore/automatic-billing/billing-api/components/billing-accounts/configuration/billing-accounts.model');

const monitoringUtils = require('../../../common/lib/garagescore/monitoring/utils');

app.on('booted', async () => {
  const billingAccountModel = new BillingAccountModel(app);
  app.model(loopback.createModel(billingAccountModel.model), billingAccountModel.modelConfig);
  // Choosing the port, we can't do it in another way
  // On prod's apollo app : we'll use the PORT provided by Heroku,
  // as we can't use no other port to perform the binding
  // On other apps (Next, local...) we can't use PORT, already taken by the real serv
  // so we'll be using API_PORT
  const port = process.env.API_PORT || process.env.PORT || 4000;
  const server = apolloServer.create(app);
  const webServer = express();
  server.applyMiddleware({ app: webServer, path: process.env.API_PATH });

  // Registering QUETAL route to test app health
  webServer.get(monitoringUtils.routeName, (req, res) => monitoringUtils.routeController(req, res, 'APOLLO'));

  webServer.listen({ port }, () => {
    console.log(`🚀 Server ready at http://localhost:${port}${server.graphqlPath}`);
  });
});
