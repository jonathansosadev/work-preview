const { lm, decode, decodePhone, autoDefiMessageGenerator } = require('../../util');
const { LeadTicketRequestTypes } = require('../../../../../../frontend/utils/enumV2.js');

module.exports = {
  email: ({ html }) => {
    return decode(lm(html.match(/Email: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
  },
  phone: ({ html }, { locale }) => {
    return decodePhone(decode(lm(html.match(/Téléphone: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))), locale);
  },
  lastName: ({ html }) => decode(lm(html.match(/Nom: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  firstName: ({ html }) => decode(lm(html.match(/Prénom: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  vehicleRegistrationPlate: ({ html }) =>
    decode(lm(html.match(/Numéro d'immatriculation: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  requestType: () => LeadTicketRequestTypes.APPOINTMENT_REQUEST,
  googleReffered: ({ html }) => decode(lm(html.match(/Google Référé :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  message: function ({ html }) {
    const toFind = [
      '#--- Informations Distributeur ---',
      'Adresse Url du site Internet',
      'Nom du distributeur',
      'Lieu',
      '#--- Informations du véhicule ---',
      "Avez-vous besoin d'un véhicule de remplacement",
      'PREFERRED_DATE',
      'Preferred time',
      'Prestation choisie',
      '#--- Informations client ---',
      'Informations complémentaires',
      'Commentaires',
      '#--- Informations référence ---',
      'Provenance',
      'Date de rendez-vous',
      'Heure de rendez-vous',
      'Google Référé',
    ];

    return autoDefiMessageGenerator(html, toFind);
  },
};
