/*
Algo : Le client reçoit  une clef (ajout de 2 champs APIKEY et APISECRET pour chaque users)
Le client signe ces messages avec la clef
(> Signature = hex( HMAC-SHA1( APP_SECRET, (API_ID + HTTP_method + url + timestamp + parametersString ) ) );
Le serveur ne renvoie une réponse que si la signature est correcte (en testant les timestamp entre -300 et + 300 secondes)
*/

const crypto = require('crypto');
const nodeUrl = require('url');

/** Authorized interval in seconds before and after a signature is valid */
let AUTORIZED_INTERVAL = 300;

const setAutorizedInterval = function setAutorizedInterval(interval) {
  AUTORIZED_INTERVAL = interval;
};

/** Create a parameterString from an req object */
const parametersRequest = function parametersRequest(req) {
  const keys = Object.keys(req.query || req.body);
  keys.sort();
  let s = '';
  keys.forEach((key) => {
    if (key === 'signature') return;
    if (key === 'appId') return;
    if (s) s += '&';
    s += `${key}=${encodeURI(req.query ? req.query[key] : req.body[key])}`;
  });
  return s;
};

// other helpers...
const methodRequest = (req) => req.method;
const signatureRequest = (req) => (req.query ? req.query.signature : req.body.signature);
const urlRequest = (req) => {
  let protocol = req.protocol;
  const envPublicApiUrlHost = nodeUrl.parse(process.env.PUBLIC_API_URL || '').host;
  if (
    (envPublicApiUrlHost && req.get('host') === envPublicApiUrlHost) ||
    req.get('host').indexOf('api.garagescore.com') >= 0 ||
    req.get('host').indexOf('api-no-proxy.garagescore.com') >= 0 ||
    req.get('host').indexOf('next.garagescore.com') >= 0
  ) {
    protocol = 'https'; // api must be contacted only with https
  }
  let url = `${protocol}://${req.get('host')}${req.originalUrl.split('?').shift()}`;
  if (process.env.PUBLIC_API_URL) {
    url = url.replace(`${process.env.PUBLIC_API_URL}/public-api`, process.env.PUBLIC_API_URL);
  }
  url = url.replace('api-no-proxy.garagescore.com/public-api', 'api.garagescore.com');
  return url;
};
const currentTimestamp = () => Math.round(new Date().getTime() / 1000);
/*
  Create a signature
  @timestamp a timestamp in second, if not provided use the current Time
  @method HTTP method in uppercase
  @url urlencoded with get parameters https://en.wikipedia.org/wiki/Percent-encoding
  @parametersString parameters, values escaped sorted by param name : a=xxxx&b=yyyy
*/
const sign = (API_KEY, API_SECRET, method, url, parametersString, timestamp) => {
  timestamp = timestamp || currentTimestamp(); // eslint-disable-line no-param-reassign
  const signatureString = API_KEY + method + encodeURI(url) + parametersString + timestamp;
  return crypto.createHmac('sha1', API_SECRET).update(signatureString).digest('hex');
};

/*
  Verify a signature, timestamp must be from -AUTORIZED_INTERVALs to +AUTORIZED_INTERVALs
*/
const verify = (signature, API_KEY, API_SECRET, method, url, parametersString) => {
  if (!signature) return false;
  const timestamp = currentTimestamp();
  for (let t = timestamp - AUTORIZED_INTERVAL; t < timestamp + AUTORIZED_INTERVAL; t++) {
    if (signature === sign(API_KEY, API_SECRET, method, url, parametersString, t)) {
      return true;
    }
  }
  return false;
};

/** Create a signature from an req object, signature must be a req.query */
const signRequest = (API_KEY, API_SECRET, req) => {
  const method = methodRequest(req);
  const url = urlRequest(req);
  const parametersString = parametersRequest(req);
  return sign(API_KEY, API_SECRET, method, url, parametersString);
};

/** Verify a signature from an req object, signature must be a req.query */
const verifyRequest = (API_KEY, API_SECRET, req) => {
  const method = methodRequest(req);
  const signature = signatureRequest(req);
  const url = urlRequest(req);
  const parametersString = parametersRequest(req);
  console.log(`VERIFY : Method: ${method} Url: ${url} ParamStr: ${parametersString}`);
  return verify(signature, API_KEY, API_SECRET, method, url, parametersString);
};

module.exports = {
  parametersRequest,
  methodRequest,
  currentTimestamp,
  signatureRequest,
  setAutorizedInterval,
  sign,
  verify,
  urlRequest,
  signRequest,
  verifyRequest,
};
