const chalk = require('chalk');
const UserAuthorization = require('../../../../../../models/user-autorization');

/**
 * Interface for the components routes
 * @interface
 */
class IApiRoutes {
  // ==============================
  // =        CONSTRUCTOR         =
  // ==============================

  /**
   * Build the IApiRoutes Instance
   * @param app the express 'app'
   * @param baseUrl the baseUrl for this component RESTful API Route
   * for instance it could be '/api/v1/myComponent'
   * @param parentComponent the main module 'component'
   */
  constructor(app, routes, policy) {
    this._app = app;
    this._routes = routes;
    this._policy = policy;
    this._methods = {
      get: ['get', 'find', 'retrieve'],
      post: ['post', 'create', 'add', 'webhook', 'hook'],
      put: ['put', 'update', 'upgrade', 'modify'],
      delete: ['delete', 'destroy', 'trash', 'eliminate', 'stop', 'remove'],
    };
  }

  // ==============================
  // =      PUBLIC METHODS        =
  // ==============================
  /**
   * Start the Routes module
   * @public
   */
  start(staticModules) {
    this._registerRoutes(this._routes, staticModules.controller.Class);
  }

  /**
   * GET the baseUrl for the component route
   * @returns {String} the baseUrl
   */
  get baseUrl() {
    return this._baseUrl;
  }

  // ==============================
  // =      PRIVATE METHODS       =
  // ==============================

  _registerRoutes(routes, ctrl, parents = []) {
    if (typeof routes !== 'object' || Array.isArray(routes)) {
      throw new Error(`api.interface.routes::_registerRoutes::not an object::${typeof routes}`);
    }
    for (const elem of Object.keys(routes)) {
      if (typeof routes[elem] === 'string') {
        this._registerRoute(elem, routes[elem], ctrl, parents);
      } else if (typeof routes[elem] === 'object') {
        this._registerRoutes(routes[elem], ctrl, parents ? parents.concat([elem]) : [elem]);
      } else {
        throw new Error(`api.interface.routes::_registerRoutes2::not an object::${typeof elem}`);
      }
    }
  }

  _registerRoute(key, val, ctrl, parents = []) {
    const funcName = this._buildFuncName(key, parents);
    const httpMethod = this._findHttpMethod(funcName);
    const urlParams = this._findUrlParams(val);

    if (!ctrl[funcName]) {
      console.warn(
        chalk.red(
          `Error:: Trying to register a function that does not exist:: ${funcName} :: Controller :: ${ctrl.name}`
        )
      );
    } else {
      this._app[httpMethod](val, this._policy, this._genericRequestFunction.bind(this, ctrl, funcName, urlParams));
    }
  }

  _buildFuncName(key, parents) {
    let result = key;
    let tokens = [];

    for (const token of parents) {
      result += `_${token}`;
    }
    tokens = result.toLowerCase().split(/_|-| /);
    result = tokens[0];
    for (const token of tokens.slice(1) || []) {
      result += token.charAt(0).toUpperCase() + token.slice(1);
    }
    return result;
  }

  _findHttpMethod(funcName) {
    for (const tokens of Object.keys(this._methods)) {
      for (const token of this._methods[tokens]) {
        if (funcName.toLowerCase().indexOf(token.toLowerCase()) === 0) {
          return tokens;
        }
      }
    }
    return 'get';
  }

  _findUrlParams(url) {
    const tokens = url.split('/');
    const result = [];

    for (const token of tokens) {
      if (token.charAt(0) === ':') {
        result.push(`${token.slice(1).charAt(0).toUpperCase() + token.slice(2)}.Strict`);
      }
    }
    return result;
  }

  _genericRequestFunction(ctrl, funcName, urlParams, req, res) {
    try {
      if (!req.user || !req.user.email) {
        console.error('Cannot connect as admin, no req.user.email defined');
        res.redirect(302, '/');
        return;
      }
      if (!req.user.email.match(/@garagescore\.com|@custeed\.com/)) {
        console.error(`DBO access denied, user doesn't have a garagescore email ${req.user}`);
        res.redirect(302, '/');
        return;
      }
      if (!req.user.hasAuthorization(UserAuthorization.ACCESS_TO_GREYBO)) {
        console.error(`DBO access denied, user doesn't have ACCESS_TO_DARKBO ${req.user}`);
        res.redirect(302, '/');
        return;
      }
      ctrl[funcName](this._app, urlParams, req, res);
    } catch (e) {
      res.status(500).send(`Fatal Error In api.interface.routes::${ctrl.name}::${funcName}`);
    }
  }
}

module.exports = IApiRoutes;
