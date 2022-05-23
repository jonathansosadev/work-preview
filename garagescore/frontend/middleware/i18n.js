// https://webdevchallenges.com/nuxt-js-internationalization-without-route-param/
export default function ({ isHMR, app, store, route, params, req, error, redirect }) {
  if (isHMR) { // ignore if called from hot module replacement
    return;
  }
  if (route.name === 'home-www_fr_FR') {
    store.commit('setLang', 'fr');
    app.i18n.locale = store.state.locale;
  }
  if (route.name === 'home-www_es_ES') {
    store.commit('setLang', 'es');
    app.i18n.locale = store.state.locale;
  }
  if (route.name === 'home-www_ca_ES') {
    store.commit('setLang', 'ca');
    app.i18n.locale = store.state.locale;
  }
  if (route.name === 'home-www_en_US') {
    store.commit('setLang', 'en');
    app.i18n.locale = store.state.locale;
  }
  if (route.name && route.name.indexOf('certificate-slug') === 0) {
    store.commit('setLang', store.state.locale);
    app.i18n.locale = store.state.locale;
  }
   if (req && route.name && route.name.indexOf('certificate-slug') === -1) {
    if (route.name) {
      let locale = null;

      // check if the locale cookie is set
      if (req.headers && req.headers.cookie) {
        const cookies = req.headers.cookie.split('; ').map(stringCookie => (stringCookie || '').split('='));
        const cookie = cookies.find(cookie => cookie[0] === 'gs-locale');

        if (cookie) {
          locale = cookie[1];
        }
      }

      // if the locale cookie is not set, fallback to accept-language header
      if (!locale && req.headers && req.headers['accept-language']) {
        locale = req.headers['accept-language'].split(',')[0].toLocaleLowerCase().substring(0, 2);
      }
      if (locale) {
        store.commit('setLang', locale);
        app.i18n.locale = store.state.locale;
      }
    }
  }
};