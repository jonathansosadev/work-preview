const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// const timeZone = Enum({
//   UTC: "UTC",
//   EUROPE_PARIS: "Europe/Paris",
//   EUROPE_MADRID: "Europe/Madrid",
//   AMERICA_NEWYORK: "America/New_York",
//   AMERICA_DENVER: "America/Denver",
//   AMERICA_LOSANGELES: "America/Los_Angeles"
// });

dotenv.config({ silent: true });
const urls = {
  api:
    process.env.HEROKU_PR_NUMBER && !process.env.APP_URL
      ? `https://beta-app-pr-${process.env.HEROKU_PR_NUMBER}.herokuapp.com`
      : process.env.APP_URL,
  www_url:
    process.env.HEROKU_PR_NUMBER && !process.env.WWW_URL
      ? `https://beta-app-pr-${process.env.HEROKU_PR_NUMBER}.herokuapp.com`
      : process.env.WWW_URL,
  graphQLApiUrl:
    process.env.HEROKU_PR_NUMBER && !process.env.API_URL
      ? `https://beta-apollo-pr-${process.env.HEROKU_PR_NUMBER}.herokuapp.com/graphqlapi`
      : process.env.API_URL,
  publicAPIUrl:
    process.env.HEROKU_PR_NUMBER && !process.env.PUBLIC_API_URL
      ? `https://beta-publicapi-pr-${process.env.HEROKU_PR_NUMBER}.herokuapp.com`
      : process.env.PUBLIC_API_URL,
};

const CDN =
  process.env.CDN || // use this on local
  (process.env.HEROKU_PR_NUMBER && !process.env.APP_URL
    ? `https://deploy-preview-${process.env.HEROKU_PR_NUMBER}--cdn-custeed.netlify.app`
    : 'https://cdn-custeed.netlify.app');
urls.cdn_url = CDN;

const nuxtConfig = {
  dev: process.env.NODE_ENV !== 'production',

  srcDir: './frontend',

  mode: 'universal',
  /*
   ** Headers of the page
   */
  head: {
    title: 'Custeed',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'GarageScore' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: CDN + '/logo/icons/custeed/favicon.ico' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900&display=swap',
      },
    ],
    script: [
      // { src: '/tracking/hotjar.js' },
      { src: CDN + '/tracking/user-tracking.js' },
      { src: 'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver' },
    ],
  },
  /*
   ** Customize the progress-bar color
   */
  loading: { color: '#3B8070' },

  /*
   ** Global CSS
   */
  css: [
    'vue-snotify/styles/material.css',
    'vue-multiselect/dist/vue-multiselect.min.css',
    'normalize.css/normalize.css',
    '~/assets/fontawesome.css',
    '~/assets/style/global.scss',
    '~/assets/style/vue-multiselect.scss',
    '~/assets/gs-icomoon/style.css',
  ],

  styleResources: {
    scss: '~/assets/style/variables.scss',
  },

  /*
   ** Plugins to load before mounting the App
   */
  /*
   ** Plugin
   */
  plugins: [
    '~/plugins/font-awesome',
    '~/plugins/vue-click-outside',
    '~/plugins/vuex-router-sync',
    '~/plugins/UiComponentRegister',
    '~/plugins/FilterRegister',
    '~/plugins/filter',
    '~/plugins/vue-snotify',
    '~/plugins/vue-tooltip',
    { src: '~/plugins/vue2-datepicker', ssr: false },
    { src: '~/plugins/vue-multiselect', ssr: false },
    '~/plugins/i18n',
    { src: '~/plugins/vue-toastification', ssr: false },
  ],
  /*
   ** Nuxt.js dev-modules
   */
  buildModules: [
    // Doc: https://github.com/nuxt-community/eslint-module
    // "@nuxtjs/eslint-module"
  ],
  /*
   ** Nuxt.js modules
   */
  modules: [
    '@nuxtjs/axios',
    // "@nuxtjs/pwa",
    '@nuxtjs/dotenv',
    '@nuxtjs/style-resources',
    '@nuxtjs/moment',

    'nuxt-mq',
    '~/modules/graphql-tag',
    // '~/modules/gs-google-maps',
    '~/modules/moment-timezone',
  ],

  /**
   * Google maps api key
   */
  maps: {
    key: process.env.GOOGLE_API_KEY,
  },

  /*
   *
   */
  mq: {
    defaultBreakpoint: 'lg',
    breakpoints: {
      sm: 768,
      md: 959,
      lg: Infinity,
    },
  },
  /*
   ** Axios module configuration
   ** See https://axios.nuxtjs.org/options
   */
  axios: {
    baseURL: `http://localhost:${process.env.PORT || 3000}`,
    browserBaseURL: process.env.APP_URL,
    prefix: '/',
    proxyHeaders: true,
  },

  /**
   * Moment module config
   */
  moment: {
    locales: ['fr', 'es', 'ca'],
    defaultLocale: 'fr',
    plugins: ['moment-timezone'],
  },

  momentTimezone: {
    matchZones: ['UTC', 'Europe/Paris', 'Europe/Madrid', 'America/New_York', 'America/Denver', 'America/Los_Angeles'],
    startYear: 1970,
    endYear: 2030,
  },

  router: {
    middleware: ['isProfileComplete', 'traceUrlChange', 'certificates-handler', 'i18n', 'unauthenticated'],
  },

  env: {
    // NOTE: If you add a process.env.SOMETHING you have to add the correcponding env var in garagescore-staging
    // That is because those variables are evaluated at buildtime and not runtime
    // Urls
    api: urls.api,
    www_url: urls.www_url,
    cdn_url: urls.cdn_url,
    graphQLApiUrl: urls.graphQLApiUrl,
    publicAPIUrl: urls.publicAPIUrl,
    // OAuth Erep
    googleOauthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    googleOauthClientSecret: process.env.GOOGLE_OAUTH_CLIENT_SECRET,
    facebookOauthClientId: process.env.FACEBOOK_OAUTH_CLIENT_ID,
    facebookOauthClientSecret: process.env.FACEBOOK_OAUTH_CLIENT_SECRET,
    erepSourcesInMaintenance: process.env.EREP_SOURCES_IN_MAINTENANCE,
    // Google Analytics
    gaMeasurementCockpitID: process.env.GA_MEASUREMENT_COCKPIT_ID,
    gaMeasurementSurveyID: process.env.GA_MEASUREMENT_SURVEY_ID,
    gaMeasurementWidgetID: process.env.GA_MEASUREMENT_WIDGET_ID,
    gaMeasurementCertificateID: process.env.GA_MEASUREMENT_CERTIFICATE_ID,
    gaDebugMode: process.env.GA_DEBUG_MODE,
    // Hotjar
    hotjarId: process.env.HOTJAR_ID,
    // MapBox
    mapboxApiToken: process.env.MAPBOX_API_TOKEN,
  },

  /*
   ** Build configuration
   */
  build: {
    transpile: ['vue-toastification', 'vue2-datepicker', 'vue-multiselect'],
    ...(process.env.LOADED_MOCHA_OPTS === 'undefined' &&
      process.env.USE_NUXT_CACHE === 'true' && { cache: true, hardSource: false, vue: { prettify: false } }),
    postcss: {
      plugins: {
        autoprefixer: { grid: true },
      },
    },
    /*extend(config) {
      config.module.rules.push({
        test: /\.vue/g,
        loader: 'string-replace-loader',
        options: {
          search: /(\/logo\/icons\/gs\/.*png)/g,
          // replace: 'https://freepngimg.com/download/star/22-star-png-image.png',
          replace: (match, p1) => `https://freepngimg.com/download/star/22-star-png-image${p1}`,
        },
      });
    },*/
    extend(config) {
      // replace image and script paths to point to the CDN
      [
        new RegExp('(/logo/.*)', 'g'),
        new RegExp('(/certificate//scripts/.*)', 'g'),
        new RegExp('(/certificate/images/.*)', 'g'),
        new RegExp('(/home/classic-b2c/.*png)', 'g'),
        new RegExp('(/home/classic-b2c/.*svg)', 'g'),
        new RegExp('(/home/classic-b2c/.*jpg)', 'g'),
      ].forEach((search) => {
        config.module.rules.push({
          test: /\.vue/g,
          loader: 'string-replace-loader',
          options: {
            search,
            replace: (match, p1) => `${CDN}${p1}`,
          },
        });
      });
    },
  },
};

/** emails rendered with nuxt, create a route for every vues pages found in frontend/pages-extended/emails */

const walkSync = (dir, filePath = '', emailRoutes) => {
  try {
    fs.readdirSync(dir).forEach((file) => {
      if (fs.statSync(path.join(dir, file)).isDirectory()) {
        walkSync(path.join(dir, file), filePath ? `${filePath}/${file}` : file, emailRoutes);
      } else {
        const route = `${filePath}/${file}`;
        emailRoutes.push({
          path: `/${route.replace('.vue', '')}`,
          name: route.replace(/\//g, '_').replace('.vue', ''),
          component: `~/pages-extended/${route}`,
        });
      }
    });
  } catch (e) {
    console.error(e);
  }
};

const extendedRoutes = [];
const emailRoutes = [];
const smsRoutes = [];

walkSync(path.resolve(__dirname, './frontend/pages-extended/emails'), 'emails', emailRoutes);

walkSync(path.resolve(__dirname, './frontend/pages-extended/sms'), 'sms', smsRoutes);

emailRoutes.forEach((r) => {
  extendedRoutes.push(r);
});
smsRoutes.forEach((r) => {
  extendedRoutes.push(r);
});

if (
  !process.env.NODE_APP_INSTANCE ||
  process.env.NODE_APP_INSTANCE === 'custeedbook' ||
  process.env.NODE_ENV !== 'production'
) {
  extendedRoutes.push({
    name: 'custeedbook',
    path: '/custeedbook',
    component: '~/pages-extended/custeedbook/index.vue',
  });
}

if (
  process.env.NODE_APP_INSTANCE === 'www' ||
  process.env.NODE_APP_INSTANCE === 'review' ||
  // we also need to take into account the staging heroku app where we build the production app
  // staging use 'production' for its NODE_APP_INSTANCE value
  process.env.NODE_APP_INSTANCE === 'production'
) {
  // home page & i18n
  extendedRoutes.push({
    name: 'home-www_fr_FR',
    path: '/',
    component: '~/pages-extended/b2c/home.vue',
  });
  extendedRoutes.push({
    name: 'home-www_es_ES',
    path: '/es_ES',
    component: '~/pages-extended/b2c/home.vue',
  });
  extendedRoutes.push({
    name: 'home-www_ca_ES',
    path: '/ca_ES',
    component: '~/pages-extended/b2c/home.vue',
  });
  extendedRoutes.push({
    name: 'home-www_en_US',
    path: '/en_US',
    component: '~/pages-extended/b2c/home.vue',
  });
  extendedRoutes.push({
    name: 'siteindex-www_fr_FR',
    path: '/fr_FR/siteindex',
    component: '~/pages-extended/b2c/siteindex.vue',
  });
  extendedRoutes.push({
    name: 'siteindex-www_es_ES',
    path: '/es_ES/siteindex',
    component: '~/pages-extended/b2c/siteindex.vue',
  });
  extendedRoutes.push({
    name: 'siteindex-www_ca_ES',
    path: '/es_ES/siteindex',
    component: '~/pages-extended/b2c/siteindex.vue',
  });
  extendedRoutes.push({
    name: 'siteindex-www_en_US',
    path: '/en_US/siteindex',
    component: '~/pages-extended/b2c/siteindex.vue',
  });

  // certificate & i18n
  extendedRoutes.push({
    name: 'certificate-slug_garage_fr_FR',
    path: '/garage/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  });
  extendedRoutes.push({
    name: 'certificate-slug_garage__es_ES',
    path: '/garaje/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  });
  extendedRoutes.push({
    name: 'certificate-slug_garage__ca_ES',
    path: '/garatge/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  });
  extendedRoutes.push({
    name: 'certificate-slug_garage__en_US',
    path: '/rooftop/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  });
  extendedRoutes.push({
    name: 'certificate-slug_inspection_fr_FR',
    path: '/controle-technique/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  }); // eslint-disable-line max-len
  extendedRoutes.push({
    name: 'certificate-slug_inspection_es_ES',
    path: '/inspeccion-tecnica/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  }); // eslint-disable-line max-len
  extendedRoutes.push({
    name: 'certificate-slug_inspection_ca_ES',
    path: '/inspeccio-tecnica/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  }); // eslint-disable-line max-len
  extendedRoutes.push({
    name: 'certificate-slug_inspection_en_US',
    path: '/technical-inspection/:slug',
    component: '~/pages-extended/b2c/_slug.vue',
  }); // eslint-disable-line max-len
  // Widget
  extendedRoutes.push({
    name: 'widget-images-merger',
    path: '/badges/images-merger',
    component: '~/pages-extended/b2c/badges/images-merger.vue',
  }); // eslint-disable-line max-len

  // Auth routes, but not for www instance
}

if (['app', 'review', 'prod', 'production'].includes(process.env.NODE_APP_INSTANCE)) {
  extendedRoutes.push({
    name: 'auth-signin',
    path: '/auth/signin',
    component: '~/pages-extended/auth/signin.vue',
  });
  extendedRoutes.push({
    name: 'auth-msg',
    path: '/auth/msg',
    component: '~/pages-extended/auth/msg.vue',
  });
  extendedRoutes.push({
    name: 'auth-bdoor',
    path: '/auth/bdoor',
    component: '~/pages-extended/auth/bdoor.vue',
  });
  extendedRoutes.push({
    name: 'auth-reset_password-token',
    path: '/auth/reset_password/:token?',
    component: '~/pages-extended/auth/reset_password/_token.vue',
  }); // eslint-disable-line max-len
  extendedRoutes.push({
    name: 'error-no-cockpit-access',
    path: '/no-access',
    component: '~/pages-extended/auth/noaccess.vue',
  }); // eslint-disable-line max-len
  // Google validation needs an oath page
  extendedRoutes.push({
    name: 'about-oauth',
    path: '/about-oauth',
    component: '~/pages-extended/auth/about-oauth.vue',
  });
}

if (extendedRoutes.length > 0) {
  nuxtConfig.router.extendRoutes = (routes) => {
    extendedRoutes.forEach((r) => {
      routes.push(r);
    });
  };
}

module.exports = nuxtConfig;
