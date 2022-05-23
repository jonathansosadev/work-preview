import merge from 'lodash/merge';

// fetchJSON is bundled wrapper around fetch which simplifies working
// with JSON API:
//   * Automatically adds Content-Type: application/json to request headers
//   * Parses response as JSON when Content-Type: application/json header is
//     present in response headers
//   * Converts non-ok responses to errors
import {configureRefreshFetch, fetchJSON} from 'refresh-fetch';
import api, {
  getTokenFromLocalStorage,
  removeUserTokenFromLocalStorage,
  getURL,
  persistUserTokenToLocalStorage,
} from '../api';

// Add token to the request headers
const fetchJSONWithToken = (url: string, initOptions: RequestInit = {}) => {
  const token = getTokenFromLocalStorage();
  let options = initOptions;

  if (token !== null) {
    options = merge({}, initOptions, {
      headers: {
        Authorization: `JWT ${token}`,
      },
    });
  }
  return fetchJSON(url, options);
};

// Decide whether this error returned from API means that we want
// to try refreshing the token. error.response contains the fetch Response
// object, error.body contains the parsed JSON response body
const shouldRefreshToken = (error: {response: Response}) => {
  return error.response && error.response.status === 401;
};

const refreshToken = async () => {
  const storedToken = getTokenFromLocalStorage();

  try {
    const body = JSON.stringify({token: storedToken});
    const result = await fetchJSONWithToken(getURL(api.auth.ENDPOINTS.refresh()), {
      body,
      method: 'POST',
    });

    const token = (result.body as {token: string})?.token;
    persistUserTokenToLocalStorage(token);
  } catch (err) {
    removeUserTokenFromLocalStorage();
    window.location.reload();
  }
};

const refreshFetch = configureRefreshFetch({
  shouldRefreshToken,
  refreshToken,
  fetch: fetchJSONWithToken,
});

export {refreshFetch};
