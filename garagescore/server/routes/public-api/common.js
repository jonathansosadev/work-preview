const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const apiSignature = require('../../../common/lib/garagescore/api/signature');
const Firewall = require('../../../common/lib/garagescore/firewall');

const customersIps = [
  '127.0.0.1', // Localhost
  '157.159.81.75', // Garagescore 1
  // '157.159.81.222', // Garagescore 1 Ouss
  // '157.159.81.85', // Garagescore Keysim personal IP
  '194.250.15.233', // Cobredia old
  '31.222.193.187', // Cobredia 1
  '92.154.32.166', // Cobredia add 26/02/2020
  '80.14.56.126', // Cobredia presta
  '37.71.36.196', // Pigeon
  // , '::1'
];

// a firewall to allow the chosen one who dont need a signature
const noSignatureAllowedIps = customersIps.slice();
const firewallNoSignature = new Firewall({ allowedIps: noSignatureAllowedIps });

// common response for forbidden access
const accessForbidden = function (req, res, data) {
  let ip = req.ip;
  ip = ip.replace('::ffff:', '');

  const fullUrl = `${req.protocol}://${req.get('host') + req.originalUrl}`;
  const errorMsg = ` accessforbidden for ip ${ip} on URL: ${fullUrl}`;

  console.error(new Error(errorMsg));
  res.status(403).send(data);
};
// common response for API error
const apiError = function (res, err) {
  res.status(err.status || 500).send(JSON.stringify({ error: err.message }));
};

// check api access
// if the ip is allowed or if the signature is correct
// TODO handle a granularity with 'method'
const isAuthorized = function (method, req, apiKey, cb) {
  // api must come from our proxy
  // we check the headers
  if (req.get('host') && req.get('host').indexOf('api.garagescore.com') >= 0) {
    const XAPIGateway = req.get('X-NginX-Proxy');
    if (!XAPIGateway) {
      cb(null, false, JSON.stringify({ source: 'forbidden' }));
      return;
    }
  }
  const authorizedIP = firewallNoSignature.isRequestAllowed(req);
  if (authorizedIP) {
    cb(null, true);
    return;
  }
  gsAPI.getAppSecret(apiKey, (apiSecretErr, apiSecret) => {
    if (apiSecretErr) {
      console.log(apiSecretErr);
      cb(apiSecretErr);
      return;
    }
    let signature;
    if (req.query) {
      signature = req.query.signature;
    }
    if (req.body && !signature) {
      signature = req.body.signature;
    }
    if (!signature) {
      cb(null, false, JSON.stringify({ signature: 'missing' }));
    } else if (apiSignature.verifyRequest(apiKey, apiSecret, req)) {
      cb(null, true);
    } else {
      cb(
        null,
        false,
        JSON.stringify({
          error: 'invalid signature',
          signature: apiSignature.signatureRequest(req),
          method: apiSignature.methodRequest(req),
          url: apiSignature.urlRequest(req),
          parametersString: apiSignature.parametersRequest(req),
          currentTimestamp: apiSignature.currentTimestamp(),
        })
      );
    }
  });
};

module.exports = {
  customersIps,
  accessForbidden,
  apiError,
  isAuthorized,
};
