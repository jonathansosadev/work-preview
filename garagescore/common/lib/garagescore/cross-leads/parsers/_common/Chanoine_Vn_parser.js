const { lm, decode, decodePhone } = require('../../util');

let url = '';
const getAddUrl = (html) => {
  if (!url) url = decode(lm(html.match(/Lien_vers_le_formulaire:[\s\S]*(https?:\/\/[\s\S]*)<br>/)));
  return url;
};

module.exports = {
  email: ({ html }) => {
    return decode(lm(html.match(/E-mail:([\s\S]*?)<br><b>/)));
  },
  phone: ({ html }, { locale }) => {
    return decodePhone(decode(lm(html.match(/Téléphone:([\s\S]*?)<br><b>/))), locale);
  },
  lastName: ({ html }) => decode(lm(html.match(/Nom:([\s\S]*?)<br><b>/))),
  firstName: ({ html }) => decode(lm(html.match(/Prénom:([\s\S]*?)<br><b>/))),
  message: function ({ html }) {
    const request = decode(lm(html.match(/Votre_demande_concerne:([\s\S]*?)<br><b>/)));
    const recontact = decode(lm(html.match(/Vous_souhaitez_être_recontacté:([\s\S]*?)<br><b>/)));
    const contactPreference = decode(lm(html.match(/Votre_préférence_de_contact:([\s\S]*?)<br><b>/)));
    return `La demande concerne: ${request}\nSouhaite être recontacté: ${recontact}\nPréférence de contact: ${contactPreference}`;
  },
  brandModel: ({ html }) =>
    getAddUrl(html) && lm(getAddUrl(html).match(/https:\/\/chanoine\.fr\/catalogue-voiture-neuve\/(.*)\/(.*)/)),
  adUrl: ({ html }) => getAddUrl(html),
};
