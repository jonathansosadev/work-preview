const gsAPISignature = require('../../../common/lib/garagescore/api/signature.js');
const { GaragesTest } = require('../../../frontend/utils/enumV2');

/**
 * generate a valide api url to add reviews or leads to Garage Dupond
 * You will need to res.url.replace('[type]', 'leads') for example to add leads
 */
function _generateUrl(app, req, res) {
  if (!req.query || !req.query.type) {
    res.status(400).json({ status: 'KO', message: 'Error: res.query.type not found' });
    return;
  }
  const garageId = req.query.garageId || GaragesTest.GARAGE_DUPONT;
  let url = `${process.env.APP_URL}/public-api/${req.query.type}/${garageId}/add`;
  if (process.env.NODE_ENV === 'production' && process.env.NODE_APP_INSTANCE === 'app') {
    url = url.replace(/^.*\/public-api/, process.env.PUBLIC_API_URL);
  }
  const signature = gsAPISignature.sign(
    '6441beaf9960158586fced4bf3cf7738',
    '0JgsLtlGxiA95CajLIXBQZ7XYwnkLYha',
    'POST',
    url,
    '',
    gsAPISignature.currentTimestamp()
  );
  const finalUrl = `${url}?signature=${signature}&appId=6441beaf9960158586fced4bf3cf7738`;
  res.json({ url: finalUrl, status: 'ok', signature, appId: '6441beaf9960158586fced4bf3cf7738' });
}

function _sign(app, req, res) {
  if (!req.body || !req.body.appId) {
    res.status(400).json({ status: 'KO', message: 'Error: req.body.appId not found' });
    return;
  }
  if (!req.body || !req.body.appSecret) {
    res.status(400).json({ status: 'KO', message: 'Error: req.body.appSecret not found' });
    return;
  }
  if (!req.body || !req.body.method) {
    res.status(400).json({ status: 'KO', message: 'Error: req.body.method not found' });
    return;
  }
  if (!req.body || !req.body.uri) {
    res.status(400).json({ status: 'KO', message: 'Error: req.body.uri not found' });
    return;
  }
  let url = `${process.env.PUBLIC_API_URL}${req.body.uri}`;
  console.log(`SIGN : Method : ${req.body.method} Url: ${url} paramStr: ${req.body.queryParams}`);
  let signature = gsAPISignature.sign(
    req.body.appId,
    req.body.appSecret,
    req.body.method,
    url,
    req.body.queryParams || ''
  );
  if (req.body.queryParams) req.body.queryParams += '&';
  url += `?${req.body.queryParams}appId=${req.body.appId}&signature=${signature}`;
  res.json({ url, signature, status: 'OK' });
}

module.exports = {
  generateUrl: _generateUrl,
  sign: _sign,
};
