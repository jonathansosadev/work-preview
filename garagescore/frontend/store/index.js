import { makeApolloMutations } from "~/util/graphql";

const getCookie = (cookie, name) => {
  let value = "; " + cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length === 2)
    return parts
      .pop()
      .split(";")
      .shift();
};
import * as urls from "~/utils/urls";

var urlChangeTimeout = null;
export const state = () => ({
  mountApp:
    process.env.NODE_APP_INSTANCE === "review" ||
    process.env.NODE_APP_INSTANCE === "app" ||
    process.env.NODE_APP_INSTANCE === "staging",
  mountWww:
    process.env.NODE_APP_INSTANCE === "review" ||
    process.env.NODE_APP_INSTANCE === "www" ||
    process.env.NODE_APP_INSTANCE === "staging",
  wwwUrl: process.env.WWW_URL,
  appUrl: process.env.APP_URL,

  modal: {
    fullScreen: false,
    adaptive: false,
    component: null,
    props: {}
  },
  sidebarOpen: false,
  sidebarTiny: false,
  sidebarOpenSubmenu: false,
  // lang
  locale: "fr",
  timezone: "Europe/Paris",
  locales: [
    {
      code: "fr",
      name: "FR"
    },
    {
      code: "en",
      name: "EN"
    },
    {
      code: "es",
      name: "ES"
    },
    {
      code: "ca",
      name: "CA"
    },
    {
      code: "nl",
      name: "NL"
    },
    {
      code: "pt",
      name: "PT"
    },
    {
      code: "sv",
      name: "SV"
    },
    {
      code: "it",
      name: "IT"
    },
    {
      code: "de",
      name: "DE"
    }
  ],
  // email
  emailData: {},

  // Widget publisher, images to be merged
  badgeData: {},

  // auth
  authData: {
    postUrl: null,
    language: "",
    captcha: null,
    captchaSiteKey: ""
  }
});

export const getters = {
  getModalComponent: state => state.modal.component,
  getModalProps: state => state.modal.props,
  getModalIsFullScreen: state => state.modal.fullScreen,
  getModalIsAdaptive: state => state.modal.adaptive,
  wwwUrl: state => state.wwwUrl,
  sidebarTiny: state => state.sidebarTiny && !state.sidebarOpenSubmenu,
  emailData: state => field => state.emailData[field],
  badgeData: state => state.badgeData,
  payload: state => state.emailData,
  locale: state => state.locale,
  getAuthData: state => state.authData,
  isCaptchaActivated: state => state.authData && state.authData.captcha,

  isFiltersVisible: state => {
    return ![
      'cockpit-unsatisfied-id',
      'cockpit-leads-id',
      'cockpit-automation',
      'cockpit-admin-profile',
      'cockpit-admin-users',
      'cockpit-admin-garages',
      'cockpit-admin-user-id',
      'cockpit-admin-sources',
      'cockpit-admin-surveys',
      'cockpit-admin-widget',
      'cockpit-cross-leads',
      'cockpit-automation-campaigns-manage-target',
      'cockpit-analytics',
      'cockpit-analytics-id',
      'cockpit-admin-pageCustomResponses'
    ].includes(state.route.name);
  }
};

export const mutations = {
  // set data for renderer email
  setEmailData(state, emailData) {
    state.emailData = emailData;
  },
  // set the images to be merged for trophy badges and the final size
  setBadgeData(state, badgeData) {
    state.badgeData = badgeData;
  },
  setLang(state, lang) {
    if (state.locales.find(el => el.code === lang)) {
      state.locale = lang;
    }
  },
  setTimezone(state, timezone) {
    if (timezone) {
      state.timezone = timezone;
    }
  },
  setModal(state, component) {
    state.modal.component = component;
  },

  setModalProps(state, props) {
    state.modal.props = props;
  },

  updateModalProp(state, { name, value }) {
    state.modal.props[name] = value;
  },

  setModalIsFullScreen(state, value) {
    state.modal.fullScreen = value;
  },

  setModalIsAdaptive(state, value) {
    state.modal.adaptive = value;
  },

  setSidebarOpen(state, value) {
    state.sidebarOpen = value;
  },

  setSidebarTiny(state, value) {
    state.sidebarTiny = value;
  },

  hasSidebarSubmenu(state, value) {
    state.sidebarOpenSubmenu = value;
  },

  setAuthData(state, { postUrl, language, captcha, captchaSiteKey }) {
    console.log('#2794 setAuthData', { postUrl, language, captcha, captchaSiteKey })
    state.authData = { postUrl, language, captcha, captchaSiteKey };
  },
  activateCaptcha(state) {
    state.authData.captcha = true;
  }
};

export const strict = false;

export const actions = {
  // -----------------------
  // Modals ----------------
  // -----------------------

  openModal(
    { commit },
    { component, props = {},  fullScreen = false, adaptive = false }
  ) {
    commit("setModal", component);
    commit("setModalProps", props);
    commit("setModalIsFullScreen", fullScreen);
    commit("setModalIsAdaptive", adaptive);
  },

  closeModal({ commit }) {
    commit("setModal", null);
    commit("setModalProps", {});
    commit("setModalIsFullScreen", false);
    commit("setModalIsAdaptive", false);
  },

  toggleSidebar({ commit, state }, value) {
    commit("setSidebarOpen", value === undefined ? !state.sidebarOpen : value);
  },

  toggleSidebarTiny({ commit, state }, value) {
    commit("setSidebarTiny", value === undefined ? !state.sidebarTiny : value);
  },

  hasSidebarSubmenu({ commit, state }, value) {
    commit("hasSidebarSubmenu", value);
  },

  async processUrlChange({ commit, state, dispatch, getters }, route) {
	const isBackdoor = getters['auth/isBackdoor'];
    const UserUpdateCockpitHistory = {
      name: "UserUpdateCockpitHistory",
      args: { routeName: route, isBackdoor},
      fields: "status"
    };
    /* We dont want to run it too many times
    So we wait 5 seconds until sending the request
    If processUrlChange is called during this time, we wait again
    (debounce like)
    */
    if (urlChangeTimeout) {
      console.log('processUrlChange called too many times');
      clearTimeout(urlChangeTimeout);
    }
    urlChangeTimeout = setTimeout(() => {
      // we dont care about the results
      makeApolloMutations([UserUpdateCockpitHistory]);
      urlChangeTimeout = null;
    }, 5000);

  },

  async sendSlackMessage({ commit, state, dispatch }, {message, channel}) {
    const request = {
      name: 'userSetSendSlackMessage',
      args: {
        message,
        channel,
      },
      fields: `
        status
      `
    };
    await makeApolloMutations([request]);
  },

  // ------------------------
  // ServerInit -------------
  // ------------------------
  async nuxtServerInit(
    { dispatch, commit, state, getters },
    { req, route, app, redirect }
  ) {
    // time(JS, "#1335 nuxtServerInit");
    const routeMatches = str => route && route.name && route.name.includes(str);
    if (req.user) {
      commit("auth/SET_CURRENT_USER", req.user);
      if (req.user.authorization)
        commit("auth/SET_ACCESS", req.user.authorization);
      if (
        state.auth.ACCESS_TO_COCKPIT &&
        (routeMatches("cockpit") || routeMatches("grey-bo") || routeMatches("learn"))
      ) {
        const init = await dispatch("cockpit/initCockpit", {
          authToken: getCookie(req.headers.cookie, "auth-token"),
          app: req.app,
          user: req.user,
          refresh: !!route.query.refresh,
          isCockpit: routeMatches("cockpit"),
          timeLog: !!route.query.timeLog // Prints execution times of steps in fetchFrontEndUserContexts
        });
        if (!init) {
          console.error('Could not init nuxt');
          redirect('/auth/signout');
        }
      }
    }

    // home
    if (routeMatches("home-www_fr_FR")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "fr_FR" });
    }
    if (routeMatches("home-www_es_ES")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "es_ES" });
    }
    if (routeMatches("home-www_ca_ES")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "ca_ES" });
    }
    if (routeMatches("home-www_en_US")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "en_US" });
    }
    // site index
    if (routeMatches("siteindex-www_fr_FR")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "fr_FR" });
    }
    if (routeMatches("siteindex-www_es_ES")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "es_ES" });
    }
    if (routeMatches("siteindex-www_ca_ES")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "ca_ES" });
    }
    if (routeMatches("siteindex-www_en_US")) {
      await commit("b2c/SET_B2C_LOCALE", { locale: "en_US" });
    }
    // emails
    if (req.emailData) {
      // Setting language for emails : (buzzwords) emailLocale, i18nEmail, emaili18n, emailLang
      await commit("setEmailData", req.emailData);
      commit("setTimezone", req.emailData.timezone);
      if (req.emailData.locale === "es_ES") {
        app.i18n.locale = "es";
        await commit("setLang", "es");
      }
      if (req.emailData.locale === "ca_ES") {
        app.i18n.locale = "ca";
        await commit("setLang", "ca");
      }
      if (["nl_BE", "nl_NL"].includes(req.emailData.locale)) {
        app.i18n.locale = "nl";
        await commit("setLang", "nl");
      }
      if (req.emailData.locale === "en_US") {
        app.i18n.locale = "en";
        await commit("setLang", "en");
      }
    }
    // trophy badges
    if (req.badgeData) {
      await commit("setBadgeData", req.badgeData);
    }

    // Auth routes
    if (routeMatches("auth")) {
      let postUrl = null;
      if (route.name === "auth-bdoor") {
        postUrl = urls.getUrl("AUTH_SIGNIN_BACKDOOR");
      } else {
        postUrl = urls.getUrl("AUTH_SIGNIN_LOCAL");
      }
      await commit("setAuthData", {
        postUrl,
        captcha:
          req.session && req.session.remainingLoginAttemptBeforeCaptcha <= 0, // (undefined <= 0) => false
        captchaSiteKey: process.env.GOOGLE_CAPTCHA_SITE_KEY,
        language: "fr"
      });
    }
    if (req.accessToken && req.accessToken.backdoor)
      await commit("auth/setBackdoor", true);
    // timeEnd(JS, "#1335 nuxtServerInit");
  }
};
