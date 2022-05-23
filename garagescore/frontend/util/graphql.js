import crypto from 'crypto';
import axios from 'axios';
import queries from '../api/graphql/definitions/queries.json';
import mutations from '../api/graphql/definitions/mutations.json';
import mockQueries from '../api/graphql/mock/mockQueries.json';

const CancelToken = axios.CancelToken;
const alreadyCalledQueries = {};

const getCookie = (name, documentCookies) => {
  const cookie = documentCookies || (typeof document !== "undefined" && document.cookie) || '';
  let value = "; " + cookie;
  let parts = value.split("; " + name + "=");
  if (parts.length === 2) return parts.pop().split(";").shift();
};

const getHashCode = (str) => {
  if (!str) {
    return '';
  }
  let key = crypto.createHash('md5').update(str).digest('hex');
  let newKey = '';
  for (let i = 0; i < key.length; i++) {
    if (key[i] >= '0' && key[i] <= '9') {
      newKey += String.fromCharCode((key[i].charCodeAt(0) + 17))
    } else {
      newKey += key[i]
    }
  }
  return newKey;
};

function getLocale() {
  const gsLocaleCookie = typeof document !== "undefined" && document.cookie && document.cookie.split('; ').find(c => c.split('=').shift() === 'gs-locale');
  const navigatorLang = navigator.language || navigator.userLanguage;
  return gsLocaleCookie ? gsLocaleCookie.split('=').pop() : (navigatorLang || 'fr');
}

const parseArgs = (givenQueries) => {
  const args = [];
  const parsedArgs = [];
  let i = 0;
  for (const query of givenQueries) {
    parsedArgs.push([]);
    const queryItem = queries[query.name] || mutations[query.name];
    if (!queryItem) {
      throw new Error(`parseArgs : query ${query.name} doesn't exist.`)
    }
    query.args = query.args || {};
    for (const availableDefaultArg of queryItem.args.filter((e) => e.defaultValue)) {
      if (query.args[availableDefaultArg.name] === null || query.args[availableDefaultArg.name] === undefined) {
        query.args[availableDefaultArg.name] = availableDefaultArg.default;
      }
    }
    for (const argName of Object.keys(query.args)) {
      const queryItemArgument = queryItem.args.find((e) => e.name === argName);
      if (!queryItemArgument) {
        throw new Error(`parseArgs : query ${query.name} doesn't have argument ${argName}.`)
      }
      const argKey = `${query.name}${i}${argName}`;
      args.push({ name: argKey, type: queryItemArgument.type, value: query.args[argName]});
      parsedArgs[i].push({ name: argName, value: argKey });
    }
    i++;
  }
  return { args, parsedArgs };
};


const generateRequestKey = (givenQueries, documentCookies) => {
  return `${givenQueries.map((q) => q.name + '_').join('')}${getHashCode(getCookie('auth-token', documentCookies) + new Date().getTime())}`;
};

const generateArgsString = (argsList) => {
  return argsList.length ? `(${argsList.map((arg) => `$${arg.name}: ${arg.type}`).toString()})` : '';
};

const graphQlQuery = (query, variables, { documentCookies, requestKey = 'unknown_' } = {}) => {
  let cancelX;
  const key = requestKey.split('_');
  const options = {
    url: `${process.env.graphQLApiUrl}/${key[0]}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      // Authorization not used with legacy GQL, but I guess it doesn't disturb it, so I keep it
      'Authorization': `Bearer ${ getCookie('auth-token', documentCookies) }`,
    },
    cancelToken: new CancelToken(function executor(c) {
      cancelX = c;
    }),
    data: JSON.stringify({ query, variables })
  };
  if (!process.server) options.headers['gs-locale'] = getLocale();
  const promise = axios(options).then((resp) => {
    const unauthenticated = e => e.extensions && e.extensions.code && e.extensions.code.includes('UNAUTHENTICATED');
    if (resp.data && resp.data.errors && resp.data.errors.find(unauthenticated)) {
      // We have detected an auth error, so we go back to auth/signin page through a proper logout
      // It helps us clean the cookies and prevents ugly oops layout inside cockpit
     if(typeof window !== 'undefined') {
       window.location = `${window.origin}/auth/signout`;
     }
    } else {
      return Promise.resolve(resp.data)
    }
    console.log("graphQLquery returned null, auth problems?");
    return null;
  });

  if (process.server && process.env.NODE_APP_INSTANCE === 'www') {
    // we have some problem with SSR
    // when you try to reload the page quickly
    // nuxt cancel the loading and return a 500
    // so just do nothing
    promise.cancel = function cancel() { };
  } else {
    promise.cancel = function cancel() {
      cancelX('Operation canceled by the user.');
    };
  }

  return promise;
};

const graphQlQueryLegacy = (queryName, query, app) => {
  const finalAxios = (process.server && app ? app.$axios : axios);
  const getUrl = () => {
    // For our legacy graphQL system
    // on app & review, server side and browser side can be on /graphql
    // on www, server side and browser side MUST be on APP_URL/graphql
    // server side we always have process.env.APP_URL, no problem
    // browser side, we never have process.env
    // the certificate has its own hack
    // the homepage only does serverside (fetch) request
    if (process.server && (process.env.NODE_APP_INSTANCE === 'www' || process.env.NODE_APP_INSTANCE === 'review')) {
      return `${process.env.APP_URL}/graphql`;
    }
    return '/graphql'
  };

  let cancelX;
  const options = {
    url: `${getUrl()}/${queryName}`,
    method: 'post',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    cancelToken: new CancelToken(function executor(c) {
      cancelX = c;
    }),
    data: { query }
  };
  if (!process.server) options.headers['gs-locale'] = getLocale();

  const promise = finalAxios(options).then((resp) => {
    const unauthenticated = e => e.extensions && e.extensions.code && e.extensions.code.includes('UNAUTHENTICATED');
    if (resp.data && resp.data.errors && resp.data.errors.find(unauthenticated)) {
      // We have detected an auth error, so we go back to auth/signin page through a proper logout
      // It helps us clean the cookies and prevents ugly oops layout inside cockpit
      window.location = `${window.origin}/auth/signout`;
    } else {
      return Promise.resolve(resp.data)
    }
    return null;
  });

  if (process.server && process.env.NODE_APP_INSTANCE === 'www') {
    // we have some problem with SSR
    // when you try to reload the page quickly
    // nuxt cancel the loading and return a 500
    // so just do nothing
    promise.cancel = function cancel() { };
  } else {
    promise.cancel = function cancel() {
      cancelX('Operation canceled by the user.');
    };
  }

  return promise;
};

/*
    GivenQueries is an array of queries containing graphQLRequests

    Each object of the array (request) should have
    1 - a "name" attribute, that's the name of the graphQL query you want to call
    2 - a "fields" attribute, the fields you want to fetch from the request. This argument should be a string (see example below)
    3 - an "args" attribute, a simple object defining every argument passed to the graphQL query
    4 - an "alias" attribute, optional, will replace the name of the query in the return value. Commonly used when you call the same query twice with different arguments.

    EXAMPLE OF AN ARRAY OF REQUESTS TO PASS TO GivenQueries PARAMETER

    [{
      name: 'ErepKpis',
      fields:
       `source
        rating
        countReviews
        countRecommend
        countDetractorsWithResponse
        countDetractors
      `,
      args: {
        period: rootState.cockpit.current.periodId,
        garageId: rootState.cockpit.current.garageId,
        cockpitType: rootState.cockpit.current.cockpitType
      },
      alias: 'ErepKpisAliased'
      //
      //
    },
    {
      name: 'ErepKpis',
      fields:
        `source
        rating
        countReviews
        countRecommend
        countDetractorsWithResponse
        countDetractors
      `,
      args: {
        period: rootState.cockpit.current.periodId,
        garageId: rootState.cockpit.current.garageId,
        cockpitType: rootState.cockpit.current.cockpitType
      },
      alias: 'ErepKpisAliased2'
      //
      //
    }];
 */

const makeApolloQueries = (givenQueries, { useMock, documentCookies } = {}) => {
  const { args, parsedArgs } = parseArgs(givenQueries);
  const requestKey = generateRequestKey(givenQueries, documentCookies);
  let finalQuery = `query ${requestKey} ${generateArgsString(args)} {\n`;
  let mockData = { data: {} };
  let i = 0;
  for (const query of givenQueries) {
    const queryItem = queries[query.name];
    if (!queryItem) {
      throw new Error(`makeApolloQueries : query ${query.name} doesn't exist.`)
    }
    if (useMock) {
      mockData.data[query.name] = mockQueries[query.name];
    } else {
      let parameters = parsedArgs[i].length ? `(${parsedArgs[i].map((e) => `${e.name}: $${e.value}`).toString()})` : '';
      finalQuery = `${finalQuery} ${query.alias ? query.alias + ': ' : ''} ${query.name} ${parameters} { ${query.fields} }\n`;
    }
    i++;
  }
  finalQuery = `${finalQuery} }`;
  const variables = {};
  for (const arg of args) {
    variables[arg.name] = arg.value;
  }
  // Returning fake value for development purpose if useMock is toggled on
  if (useMock) {
    return mockData;
  }

  return graphQlQuery(finalQuery, variables, { documentCookies, requestKey });
};

const makeApolloQuery = (queryName, args, fieldToRequestString, useMock) => {
  const query = queries[queryName];
  if (!query || !query.query) {
    throw new Error(`makeApolloQuery : query ${queryName} doesn't exist or is incomplete.`)
  }
  // Returning fake value for development purpose if useMock is toggled on
  if (useMock) {
    return queries[queryName].mock;
  }
  var queryString = `${query.query} { ${fieldToRequestString} } }`;

  return graphQlQuery(queryString, args);
};


const makeApolloMutations = (givenQueries, { useMock, documentCookies } = {}) => {
  const { args, parsedArgs } = parseArgs(givenQueries);
  const requestKey = generateRequestKey(givenQueries, documentCookies);
  let finalQuery = `mutation ${requestKey} ${generateArgsString(args)} {\n`;
  let mockData = { data: {} };
  let i = 0;
  for (const query of givenQueries) {
    const queryItem = mutations[query.name];
    if (!queryItem) {
      throw new Error(`makeApolloMutations : mutation ${query.name} doesn't exist.`)
    }
    if (useMock) {
      mockData.data[query.name] = mockQueries[query.name];
    } else {
      let parameters = parsedArgs[i].length ? `(${parsedArgs[i].map((e) => `${e.name}: $${e.value}`).toString()})` : '';
      finalQuery = `${finalQuery} ${query.alias ? query.alias + ': ' : ''} ${query.name} ${parameters} { ${query.fields} }\n`;
    }
    i++;
  }
  finalQuery = `${finalQuery} }`;
  const variables = {};
  for (const arg of args) {
    variables[arg.name] = arg.value;
  }
  // Returning fake value for development purpose if useMock is toggled on
  if (useMock) {
    return mockData;
  }

  return graphQlQuery(finalQuery, variables, { documentCookies, requestKey });
};

const makeApolloMutation = (queryName, args, fieldToRequestString, useMock) => {
  const query = mutations[queryName];
  if (!query || !query.query) {
    throw new Error(`makeApolloMutation : mutation ${queryName} doesn't exist or is incomplete.`)
  }
  // Returning fake value for development purpose if useMock is toggled on
  if (useMock) {
    return mutations[queryName].mock;
  }
  var queryString = `${query.query} { ${fieldToRequestString} } }`;

  return graphQlQuery(queryString, args);
};

function arrayToGraphQLQuery(array) {
  if (array && array.length) {
    let formattedArray = '[';
    for (let i = 0; i < array.length; i++) {
      if (typeof array[i] === 'object' && array[i] !== null) {
        if (Array.isArray(array[i])) {
          formattedArray += arrayToGraphQLQuery(array[i]);
        } else if (array[i] instanceof Date && !isNaN(array[i].valueOf())) {
          formattedArray += array[i].toISOString();
        } else {
          const keys = Object.keys(array[i]);
          formattedArray += '{';
          let first = true;
          for (let j = 0; j < keys.length; ++j) {
            const value = array[i][keys[j]];
            formattedArray += `${first ? '' : ', '}${keys[j]}: "${value}"`;
            first = false;
          }
          formattedArray += '}';
        }
      } else {
        formattedArray += `"${encodeURIComponent(array[i])}"`;
      }
      if (i < array.length - 1) {
        formattedArray += ', ';
      }
    }
    formattedArray += ']';
    return formattedArray;
  }
  return 'null';
}
export async function post(app, authToken, path, data = {}, baseUrl = null) {
  const finalAxios = app.$axios || axios;
  let url = `${baseUrl || process.env.APP_URL}${path}`;

  const options = {
    url,
    method: "post",
    headers: {
      'Authorization': `Bearer ${authToken}`
    },
    data
  };
  if (!process.server) options.headers = { "gs-locale": getLocale() };
  return finalAxios(options).then(resp => {
    if (resp.data && resp.data.errors && resp.data.errors.find((e) => e.extensions && e.extensions.code && e.extensions.code.includes('UNAUTHENTICATED'))) {
      window.location = `${window.origin}/auth/signout`;
    } else {
      return Promise.resolve(resp.data)
    }
    return null;
  });
}

function buildQuery(queryName, argumentValues, fieldsList, isMutation, oldQueriesNotCancellable, app, noEncoding) {
  let listArgs = '';
  let first = true;
  Object.keys(argumentValues).forEach(arg => {
    let isArray = false;
    let value = argumentValues[arg];
    const isString = typeof value === 'string' || (typeof value === 'object' && value !== null);
    if (!noEncoding) {
      if (typeof value === 'string') {
        value = encodeURIComponent(value);
      }
      if (typeof value === 'object' && value !== null) {
        if (Array.isArray(value)) {
          value = arrayToGraphQLQuery(value);
          isArray = true;
        } else if (value instanceof Date && !isNaN(value.valueOf())) {
          value = value.toISOString();
        } else {
          value = encodeURIComponent(JSON.stringify(value));
        }
      }
    }
    if (value || value === false || value === 0) {
      listArgs += `${first ? '' : ', '}${arg}: ${isString && !isArray ? '"' : ''}${value}${isString && !isArray ? '"' : ''}`;
      first = false;
    }
  });
  const parseFiledListObject = function parseFiledListObject(obj) {
    return Object.keys(obj).map((key) => {
      if (obj[key] === String || obj[key] === Number || obj[key] === Boolean) {
        return `${key}\n`;
      }
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        return `${key} {
          ${parseFiledListObject(obj[key])}
        }`;
      }
      return '';
    }).join('');
  };

  const queryString = `${isMutation ? 'mutation ' : ''}{
          ${queryName}${listArgs ? `(${listArgs})` : ''} {
            ${parseFiledListObject(fieldsList)}
          }
        }`;
  const newQuery = graphQlQueryLegacy(queryName, queryString, app);
  if (alreadyCalledQueries[queryName] && !isMutation && !oldQueriesNotCancellable) {
    alreadyCalledQueries[queryName].cancel();
  }
  alreadyCalledQueries[queryName] = newQuery;
  return newQuery;
}

function getGqlString(doc) {
  return doc.loc && doc.loc.source.body;
}

export {
  buildQuery,
  makeApolloQuery,
  makeApolloQueries,
  makeApolloMutations,
  makeApolloMutation,
  graphQlQuery,
  getGqlString
};
