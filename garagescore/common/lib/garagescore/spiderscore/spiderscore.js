const axios = require('axios');

module.exports = class SpiderScore {
  static get _spiderScoreUrl() {
    return process.env.SPIDERSCORE_URL || 'http://localhost:4000';
  }

  static async requestCrawl(garage, source, wait = false, noThrow = true) {
    try {
      const garageId = garage._id.toString();
      const garageName = garage.publicDisplayName;
      const token =
        garage.exogenousReviewsConfigurations &&
        garage.exogenousReviewsConfigurations[source] &&
        garage.exogenousReviewsConfigurations[source].token;
      const id =
        garage.exogenousReviewsConfigurations &&
        garage.exogenousReviewsConfigurations[source] &&
        garage.exogenousReviewsConfigurations[source].externalId;
      if (wait) {
        await axios.get(
          `${this._spiderScoreUrl}/api/reviews?garageId=${garageId}&garageName=${garageName}&source=${source}&token=${token}&externalId=${id}`
        );
        return Promise.resolve();
      }
      axios
        .get(
          `${this._spiderScoreUrl}/api/reviews?garageId=${garageId}&garageName=${garageName}&source=${source}&token=${token}&externalId=${id}`
        )
        .then(() => Promise.resolve());
    } catch (e) {
      return Promise[`${noThrow ? 'resolve' : 'reject'}`](e.message || JSON.stringify(e));
    }
  }
};
