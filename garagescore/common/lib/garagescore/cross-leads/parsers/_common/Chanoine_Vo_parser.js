const { lm, decode, decodePhone } = require('../../util');

module.exports = {
  email: ({ html }) => {
    return decode(lm(html.match(/E-mail:([\s\S]*?)<br><b>/)));
  },
  phone: ({ html }, { locale }) => {
    return decodePhone(decode(lm(html.match(/Téléphone:([\s\S]*?)<br><b>/)).trim()), locale);
  },
  lastName: ({ html }) => decode(lm(html.match(/Nom:([\s\S]*?)<br><b>/))),
  firstName: ({ html }) => decode(lm(html.match(/Prénom:([\s\S]*?)<br><b>/))),
  message: function ({ html }) {
    return decode(lm(html.match(/Message:([\s\S]*?)<br><b>/)));
  },
  adUrl: ({ html }) => {
    return decode(lm(html.match(/Lien_vers_le_formulaire:[\s\S]*(https?:\/\/[\s\S]*)<br>/)));
  },
};
