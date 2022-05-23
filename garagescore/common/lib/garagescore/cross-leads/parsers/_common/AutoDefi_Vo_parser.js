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
    const version = decode(lm(html.match(/Version: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    return `${brand} - ${model}${version ? ' - ' + version : ''}`;
  },
  vehiclePrice: ({ html }) => decode(lm(html.match(/Prix: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  adUrl: ({ html }) => decode(lm(html.match(/Référence: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  city: ({ html }) => decode(lm(html.match(/Ville: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  message: function ({ html }) {

    const toFind = [
      '#--- Informations Distributeur ---',
      'Adresse Url du site Internet',
      'Nom du distributeur',
      'Lieu',
      '#--- Informations du véhicule ---',
      'Niveau d\'intérêt',
      'Numéro d\'immatriculation',
      'Kms',
      'N ° de série',
      'Année',
      'Type de véhicule',
      'Carrosserie',
      'Transmission',
      'Energie',
      'Date d\'inscription',
      '#--- Informations client ---',
      'Code postal',
      '#--- Informations référence ---',
      'Provenance',
      'Source Listing Url',
      'Google Référé',
    ];

    return autoDefiMessageGenerator(html, toFind)
  },
};
