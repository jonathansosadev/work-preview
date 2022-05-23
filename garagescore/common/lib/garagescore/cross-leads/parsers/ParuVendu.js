const { lm, decode, decodePhone } = require('../util.js');

module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'ParuVenduVo',
      adId: ({ html }) => lm(html.match(/Réf\. Pro :(.*)?(?=<\/span>)/)).trim(),
      adUrl: ({ html }) => lm(html.match(/<a href="(.*)?(?=\?)/)),
      email: ({ html }) => decode(lm(html.match(/Email :(.*)?(?=<\/span>)/))).trim(),
      phone: ({ html }, { locale }) =>
        decodePhone(decode(lm(html.match(/Téléphone :(.*)?(?=<\/span>)/)).trim()), locale),
      lastName: ({ html }) => decode(lm(html.match(/Internet\)([\w\W\s]*)?(?=Téléphone)/))).trim(),
      brandModel: ({ html }) => decode(lm(html.match(/&euro;([\w\W\s]*)?(?=Voir l'annonce)/))).trim(),
      message: ({ html }) => decode(lm(html.match(/message :([\w\W\s]*)?(?=Répondre)/))).trim(),
      vehiclePrice: function ({ html }) {
        const adId = this.adId({ html });
        const reg = new RegExp(`${adId}([\\w\\W]*)?(?=&euro;)`);
        return parseFloat(
          decode(lm(html.match(reg)))
            .replace(/\s/g, '')
            .replace(',', '.')
            .trim()
        );
      },
    },
  ],
};
