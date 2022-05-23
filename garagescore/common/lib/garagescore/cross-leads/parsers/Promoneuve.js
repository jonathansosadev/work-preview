const { lm, fm, decode, decodePhone } = require('../util.js');

module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'PromoneuveVn',
      adUrl: ({ html }) => `https://www.promoneuve.fr/secured/${lm(html.match(/secured\/(.*)?(?=\?xtor)/))}`,
      adId: ({ html }) => lm(html.match(/Promoneuve : (.*)\)/)).trim(),
      email: ({ html }) => decode(lm(html.match(/><a href=\"mailto:([^"]*)/))),
      phone: ({ html }, { locale }) =>
        decodePhone(decode(fm(html.match(/([0-9]{2}&nbsp;){4}[0-9]{2}/)).trim()), locale),
      lastName: ({ html }) =>
        decode(lm(html.match(/<strong>\W*([\S\s]*?)\n\s*</)))
          .replace(/ +|\w\./g, '')
          .trim()
          .replace(/\n/, ' '),
      message: ({ html }) => decode(fm(html.match(/&nbsp;\n {20}<\/td>([\s\S]*?)<\/td>/))),
      brandModel: ({ html }) => decode(lm(html.match(/pour votre([\w\W\s]*)\(R/))),
    },
  ],
};
