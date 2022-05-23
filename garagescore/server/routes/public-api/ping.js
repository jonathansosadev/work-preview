const gsAPI = require('../../../common/lib/garagescore/api/public-api');
const common = require('./common');
const apiSignature = require('../../../common/lib/garagescore/api/signature');

// ping only if (the ip is allowed or signature is correct) AND the appId has some garage auth
const ping = function (req, res) {
  const appId = req.query.appId;
  const { allGaragesAuthorized, authorizedGarages } = gsAPI.getAppAuthorizations(appId)
  if (!allGaragesAuthorized && authorizedGarages.length === 0) {
    common.accessForbidden(req, res, errAuth || new Error('No garages'));
    return;
  }
  res.status(200).end('pong');
};
// helper for signature generation,
// send any request, the `help-signature/` will be removed and
// display the variables that must be used to generate the signature
const helpSignature = function (req, res) {
  const appId = req.query.appId;
  if (!appId) {
    res.status(404).send(JSON.stringify({ error: 'No appId' }));
    return;
  }
  req.originalUrl = req.originalUrl.replace('/help-signature', ''); // eslint-disable-line
  let content = '';
  content += `method() => ${req.method}`;
  content += `\nparametersRequest() => ${apiSignature.parametersRequest(req)}`;
  content += `\nurlRequest() => ${apiSignature.urlRequest(req)}`;
  content += `\ncurrentTimestamp() => ${apiSignature.currentTimestamp()}`;
  res.send(`<html><body><xmp>${content}</xmp></body></html>`).end();
};

module.exports = {
  ping,
  helpSignature,
};
