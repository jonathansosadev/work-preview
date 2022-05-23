/** Monitor app health */
const debugPerfs = require('debug')('perfs:server:boot:www-surveys');
const monitoringUtils = require('../../common/lib/garagescore/monitoring/utils');

debugPerfs('Starting boot 20-monitoring-routes.js');

module.exports = function mountMonitoringRoutes(app) {
  // Registering QUETAL route to test app health
  app.get(monitoringUtils.routeName, (req, res) => monitoringUtils.routeController(req, res, 'COMMON'));

  // collection of 'quetal' iframes for every production apps
  app.get('/cava', (req, res) => {
    res.status(200).send(`<html>
    <body>
      <b>APP</b>
      <br/><iframe src="${process.env.APP_URL}/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>FFEUC</b>
      <br/><iframe src="${process.env.FFEUC_URL}/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>WWW</b>
      <br/><iframe src="${process.env.WWW_URL}/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>SURVEY</b>
      <br/><iframe src="${process.env.SURVEY_URL}/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>CONTACTS</b>
      <br/><iframe src="https://garagescore-contacts.herokuapp.com/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>HTTP2FTP</b>
      <br/><iframe src="https://http2ftp.garagescore.com/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>DISCUSS</b>
      <br/><iframe src="https://garagescore-discuss.herokuapp.com/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>APOLLO</b>
      <br/><iframe src="https://garagescore-apollo.herokuapp.com/quetal" style="border:0; width:100%; height:50px"></iframe>
      <b>GITHUB INCIDENTS</b>
      <br/><iframe src="https://garagescore-github-incidents.herokuapp.com/quetal" style="border:0; width:100%; height:50px"></iframe>
      </body>
    </html>`);
  });
};
