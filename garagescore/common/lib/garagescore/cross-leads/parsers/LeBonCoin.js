const { lm, decode, decodePhone } = require('../util.js');

module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'LeBonCoinVo',
      adUrl: (_payload, _garage, { 'body-html': html }) => lm(html.match(/href="(http[^"]*)/)),
      adId: (_payload, _garage, { 'body-html': html }) => lm(html.match(/([0-9]+).htm/)),
      email: (_payload, _garage, { 'body-html': html }) => lm(html.match(/E-mail : <\/span><strong>(.*)<\/strong>/)),
      phone: (_payload, { locale }, { 'body-html': html }) =>
        decodePhone(lm(html.match(/Téléphone : <\/span><strong>(.*)<\/strong>/)), locale),
      lastName: (_payload, _garage, { 'body-html': html }) => lm(html.match(/Nom : <\/span><strong>(.*)<\/strong>/)),
      firstName: (_payload, _garage, { 'body-html': html }) => lm(html.match(/Prénom : <\/span><strong>(.*)<\/strong>/)),
      brandModel: (_payload, _garage, { 'body-html': html }) => {
        return lm(html.match(/padding-left: 24px;">(\s*)<b>(.*)<\/b>/))
          .replace('...', '')
          .trim()
      },
      message(_payload, _garage, { 'body-html': html }) {
        let ref = '';
        try {
          ref = '\n' + this.vehicleReference(null, null, { 'body-html': html });
        } catch (e) {}
        return decode(lm(html.match(/&laquo; (.*) &raquo;/)) + ref)
          .replace(/[ ]+/g, ' ')
          .trim();
      },
      vehiclePrice: (_payload, _garage, { 'body-html': html }) => parseFloat(decode(lm(html.match(/([0-9]*)&nbsp;&euro;/))).trim()),
      vehicleReference: (_payload, _garage, { 'body-html': html }) => decode(lm(html.match(/Référence : <\/span>[^<]*/))),
    },
  ],
};
