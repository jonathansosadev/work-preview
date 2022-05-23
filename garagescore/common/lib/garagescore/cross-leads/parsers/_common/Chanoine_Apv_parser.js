const { LeadTicketRequestTypes } = require('../../../../../../frontend/utils/enumV2.js');
const { lm, decode, decodePhone } = require('../../util');

module.exports = {
  email: ({ html }) => {
    return decode(lm(html.match(/E-mail:([\s\S]*?)<br><b>/)));
  },
  phone: ({ html }, { locale }) => {
    return decodePhone(decode(lm(html.match(/Téléphone:([\s\S]*?)<br><b>/))), locale);
  },
  lastName: ({ html }) => decode(lm(html.match(/Nom:([\s\S]*?)<br><b>/))),
  firstName: ({ html }) => decode(lm(html.match(/Prénom:([\s\S]*?)<br><b>/))),
  makeModel: ({ html }) => {
    const brand = decode(lm(html.match(/Marque:([\s\S]*?)<br><b>/)));
    const model = decode(lm(html.match(/Modèle:([\s\S]*?)<br><b>/)));
    return `${brand} ${model}`;
  },
  vehicleRegistrationPlate: ({ html }) => {
    return decode(lm(html.match(/Immatriculation:([\s\S]*?)<br><b>/)));
  },
  mileage: ({ html }) => decode(lm(html.match(/Kilométrage:([\s\S]*?)<br><b>/))),
  message: function ({ html }) {
    const service = decode(lm(html.match(/Service:([\s\S]*?)<br><b>/)));
    const appointmentDate = decode(lm(html.match(/Date_du_RDV:([\s\S]*?)<br><b>/)));
    const appointmentHour = decode(lm(html.match(/Heure_du_RDV:([\s\S]*?)<br><b>/)));
    const mobilitySolution = decode(
      lm(html.match(/\(possibilité_de_solution_de_mobilité_à_15€_\/_jour\):([\s\S]*?)<br><b>/))
    );
    const moreInformations = decode(lm(html.match(/Complétez_votre_demande_ici:([\s\S]*?)<br><b>/)));
    return `Service: ${service}\nDate du Rendez-vous: ${appointmentDate}\nHeure du Rendez-vous: ${appointmentHour}\nSolution de mobilité: ${mobilitySolution}\nInformations supplémentaires: ${moreInformations}`;
  },
  requestType: () => LeadTicketRequestTypes.APPOINTMENT_REQUEST,
};
