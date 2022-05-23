const reputyScoreRoutes = {
  // Display the monitoring page on the DarkBO
  index(app, req, res) {
    try {
      res.render('darkbo/darkbo-reputyscore/monitoring', { current_tab: 'application' });
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  },

  // Fetch the garages for the Custeed E-Reputation Monitoring page on the DarkBO
  async fetchGarages(app, req, res) {
    try {
      const where = { 'subscriptions.EReputation.enabled': true };
      const fields = { id: true, publicDisplayName: true, exogenousReviewsConfigurations: true, group: true };
      const garages = await app.models.Garage.find({ where, fields });

      res.json(garages);
    } catch (e) {
      console.error(e);
      res.status(500).send('Error');
    }
  },
};

module.exports = reputyScoreRoutes;
