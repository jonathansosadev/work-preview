const { lm, decode, decodePhone, autoDefiMessageGenerator } = require('../../util');
module.exports = {
  email: ({ html }) => {
    return decode(lm(html.match(/Email: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
  },
  phone: ({ html }, { locale }) => {
    return decodePhone(decode(lm(html.match(/Téléphone: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))), locale);
  },
  lastName: ({ html }) => decode(lm(html.match(/Nom: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  firstName: ({ html }) => decode(lm(html.match(/Prénom: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  brandModel: ({ html }) => {
    const brand = decode(lm(html.match(/Marque: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const model = decode(lm(html.match(/Modèle: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    return `${brand} - ${model}`;
  },
  city: ({ html }) => decode(lm(html.match(/Ville: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  adUrl: ({ html }) => decode(lm(html.match(/Provenance :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  message: function ({ html }) {

    const toFind = [
      '#--- Informations Distributeur ---',
      'Adresse Url du site Internet',
      'Nom du distributeur',
      'Lieu',
      '#--- Informations du véhicule ---',
      'Niveau d\'intérêt',
      'Année',
      'Type de véhicule',
      'Carrosserie',
      '#--- Informations client ---',
      'Code postal',
      '#--- Informations référence ---',
      'Provenance',
      'Google Référé',
    ];

    return autoDefiMessageGenerator(html, toFind)
  },
};
