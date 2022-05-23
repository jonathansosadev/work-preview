import Vue from 'vue';
import VueI18n from 'vue-i18n';
import fr from '../translations/fr.json';
import es from '../translations/es.json';
import ca from '../translations/ca.json';
import en from '../translations/en.json';
import nl from '../translations/nl.json';
import pt from '../translations/pt.json';
import it from '../translations/it.json';
import sv from '../translations/sv.json';
import de from '../translations/de.json';

Vue.use(VueI18n);

export default ({ app, store, $moment }) => {
  const capitalize = (s) => s.toLowerCase().split(' ').map((w) => {
    if (w.length <= 1) return w;
    return (w.charAt(0).toUpperCase() + w.slice(1));
  }).join(' ');
  const dateTimeFormats = {
    'fr': {
      cockpit: {
        year: 'numeric', month: 'long', day: 'numeric'
      },
      admin: {
        year: '2-digit', month: '2-digit', day: '2-digit'
      }
    },
    'en': {
      cockpit: {
        year: 'numeric', month: 'long', day: 'numeric'
      },
      admin: {
        year: '2-digit', month: '2-digit', day: '2-digit'
      }
    },
    'es': {
      cockpit: {
        year: 'numeric', month: 'long', day: 'numeric'
      },
      admin: {
        year: '2-digit', month: '2-digit', day: '2-digit'
      }
    },
    'ca': {
      cockpit: {
        year: 'numeric', month: 'long', day: 'numeric'
      },
      admin: {
        year: '2-digit', month: '2-digit', day: '2-digit'
      }
    }
  };

  /**
   * Node comes usually only with english locale, vue i18n date translation is broken server side
   * Since $d will probably work only client side, we add a simpler alternative $dd
   */
  Vue.prototype.$dd = (rawDate, format) => {
    if (!rawDate) { console.error('$dd: no date provided'); return ''; }
    const doubleDigit = (number) => `0${number}`.slice(-2);
    const locale = store.state.locale;
    const timezone = store.state.timezone;
    const date = new Date(rawDate);
    if (!locale) { console.error('$dd: no locale found'); return ''; }
    if (!timezone) { console.error('$dd: no timezone found'); return ''; }

    let momentFormat = '';

    /* CLEAN EVERYTHING LATER WHEN WE ARE SURE IT WORKS FINE */

    if (format === 'long') { // Example: Lundi 23 Février 1993
      momentFormat = 'dddd DD MMMM YYYY';
    } else if (format === 'DD MMMM YYYY') { // Example: 23 Février 1993
      momentFormat = 'DD MMMM YYYY';
    } else if (format === 'DD MMM YYYY') { // Example: 23 Fév. 1993
      momentFormat = 'DD MMM YYYY';
    } else if (format === 'date shortTime') { // 23 Février 1993 23h42
      momentFormat = 'DD MMMM YYYY HH:mm';
    } else if(format === 'date shortTime readable') {// 23 Février 1993 à 23h42
      momentFormat = 'DD MMMM YYYY à HH:mm';
    } else if (format === 'shortTime') { // Example: 23h42
      momentFormat = 'HH:mm';
    } else if (format === 'short') { // Example: 23/02/1993 -> KeySim's birthday
      momentFormat = 'DD/MM/YYYY';
    }
    return capitalize($moment(date).tz(timezone).locale(locale).format(momentFormat));
  };
  
  Vue.prototype.$t_locale = function (prefix) {// we replace all $t in the code by $t_locale during render
    const self = this;
    return (key, variables = {}, fallbackValue) => {
      const routeTranslation = "frontend:" + prefix.replace(/\//g, ':');
      const keyTranslation = routeTranslation + "." + key; 
      const existRouteTranslation = self.$te(routeTranslation);
      if (existRouteTranslation) {
        const translated = self.$t(keyTranslation, variables);
        if (translated === keyTranslation && fallbackValue) {
          return fallbackValue;
        }
        return translated;
      } else {
        //for this case the route doesnt exit, it need to be fixed
        return fallbackValue ? fallbackValue : keyTranslation;
      }
    };
  }
  Vue.prototype.$tc_locale = function (prefix) {// we replace all $t in the code by $t_locale during render
    const self = this;
    return (key, variables = {}) => { return self.$tc("frontend:"+prefix.replace(/\//g, ':') + "." + key, variables); };
  }
  Vue.prototype.$t_common = function (key, variables = {}) {//dont use this
    return this.$t("common." + key, variables);
  }
  Vue.prototype.$tc_common = function (key, variables = {}) {//dont use this
    return this.$tc("common." + key, variables);
  }
  // Set i18n instance on app
  // This way we can use it in middleware and pages asyncData/fetch
  app.i18n = new VueI18n({
    locale: store.state.locale,
    fallbackLocale: 'fr',
    dateTimeFormats,
    messages: {
      fr,
      es,
      ca,
      en,
      nl,
      pt,
      it,
      sv,
      de,
    }
  });

  // certificates: urls in french have no /lang/ segment
  // example:
  // https://www.garagescore.com/siteindex => for fr
  // https://www.garagescore.com/es_ES/siteindex => for es
  app.i18n.path = (link) => {
    if (app.i18n.locale === app.i18n.fallbackLocale) {
      return `/${link}`;
    }

    return `/${app.i18n.locale}/${link}`;
  }
}
