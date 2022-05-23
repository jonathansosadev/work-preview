const axios = require('axios');
require('dotenv').config({ silent: true });

const getApi = async (route, params = {}, valueOnError = []) => {
  if (!route) {
    return valueOnError;
  }
  let url = route.indexOf('https:') === 0 ? route : `https://api.github.com${route}`;
  if (params) {
    if (url.indexOf('?') < 0) {
      url += '?';
    }
    Object.keys(params).forEach((p) => {
      url += `&${p}=${encodeURIComponent(params[p])}`;
    });
    console.log(url);
  }
  try {
    return (
      await axios({
        method: 'GET',
        url,
        headers: {
          Authorization: `token ${process.env.GITHUB_API_TOKEN}`, // should be a token with (only) repo access
          Accept: 'application/vnd.github.v3+json',
        },
      })
    ).data;
  } catch (e) {
    return valueOnError;
  }
};
const postApi = async (route, params = {}) => {
  if (!route) {
    return valueOnError;
  }
  let url = route.indexOf('https:') === 0 ? route : `https://api.github.com${route}`;

  try {
    return (
      await axios({
        method: 'POST',
        url,
        data: params,
        headers: {
          Authorization: `token ${process.env.GITHUB_API_TOKEN}`, // should be a token with (only) repo access
          Accept: 'application/vnd.github.v3+json',
        },
      })
    ).data;
  } catch (e) {
    console.error(e);
    return false;
  }
};
const patchApi = async (route, params = {}) => {
  if (!route) {
    return valueOnError;
  }
  let url = route.indexOf('https:') === 0 ? route : `https://api.github.com${route}`;

  try {
    return (
      await axios({
        method: 'PATCH',
        url,
        data: params,
        headers: {
          Authorization: `token ${process.env.GITHUB_API_TOKEN}`, // should be a token with (only) repo access
          Accept: 'application/vnd.github.v3+json',
        },
      })
    ).data;
  } catch (e) {
    console.error(e);
    return false;
  }
};
module.exports = {
  getApi,
  postApi,
  patchApi,
};
