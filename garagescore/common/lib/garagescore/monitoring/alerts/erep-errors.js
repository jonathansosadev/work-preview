module.exports = {
  enabled: true,
  batch: 'MORNING',
  script: async (app) => {
    const where = { 'subscriptions.EReputation.enabled': true };
    const fields = { id: true, publicDisplayName: true, exogenousReviewsConfigurations: true };
    const garages = await app.models.Garage.find({ where, fields });
    const res = {
      Google: { connected: 0, error: 0 },
      Facebook: { connected: 0, error: 0 },
      PagesJaunes: { connected: 0, error: 0 },
    };
    garages.forEach((garage) => {
      const conf = garage.exogenousReviewsConfigurations;
      ['Google', 'Facebook', 'PagesJaunes'].forEach((source) => {
        const connected = (conf && conf[source] && conf[source].token && conf[source].externalId && 1) || 0;
        const error = (conf && conf[source] && conf[source].error && 1) || 0;
        res[source].connected += connected;
        res[source].error += error;
      });
    });
    return res;
  },
  shouldSendMessage: async (res) => {
    return res.Google.error > 0 || res.Facebook.error > 0 || res.PagesJaunes.error > 0;
  },
  message: async (res) => {
    let g = res.Google.connected ? Math.round((100 * res.Google.error) / res.Google.connected) : 0;
    g = `${g}% (${res.Google.error} erreurs sur ${res.Google.connected} établissements connectés)`;
    let f = res.Facebook.connected ? Math.round((100 * res.Facebook.error) / res.Facebook.connected) : 0;
    f = `${f}% (${res.Facebook.error} erreurs sur ${res.Facebook.connected} établissements connectés)`;
    let y = res.PagesJaunes.connected ? Math.round((100 * res.PagesJaunes.error) / res.PagesJaunes.connected) : 0;
    y = `${y}% (${res.PagesJaunes.error} erreurs sur ${res.PagesJaunes.connected} établissements connectés)`;
    return `*[E-reputation]* Connexion error:\n* Google: ${g}\n* Facebook: ${f}\n* PagesJaunes: ${y}\nhttps://app.custeed.com/backoffice/reputyscore/monitoring`;
  },
  slackChannel: 'çavapastrop',
};
