const { lm, decode, decodePhone } = require('../../util');
const { LeadTicketRequestTypes } = require('../../../../../../frontend/utils/enumV2.js');

const checkLineValidity = (line, getHtmlValueFn) => {
  try {
    return getHtmlValueFn() !== '';
  } catch (e) {
    return false;
  }
};

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
  adUrl: ({ html }) => decode(lm(html.match(/Provenance[\s\S]*<a\shref="([\s\S]*?)"/))),
  message: ({ html }) => {
    const distributorWebSite = () =>
      decode(lm(html.match(/Adresse Url du site Internet: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const distributorName = () =>
      decode(lm(html.match(/Nom du distributeur: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const distributorLocation = () => decode(lm(html.match(/Lieu: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));

    const zipCode = () => decode(lm(html.match(/Code postal: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const origin = () => decode(lm(html.match(/Provenance[\s\S]*<a\shref="([\s\S]*?)"/)));
    const comment = () => decode(lm(html.match(/Commentaires :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));

    const loanVehicle = () =>
      decode(
        lm(
          html.match(/Avez-vous besoin d'un véhicule de remplacement\?: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)
        )
      );
    const preferredDate = () =>
      decode(lm(html.match(/PREFERRED_DATE: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const preferredTime = () =>
      decode(lm(html.match(/Preferred time: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const benefit = () => decode(lm(html.match(/Prestation choisie: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const otherInfos = () =>
      decode(lm(html.match(/Informations complémentaires :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));

    const appointmentDate = () =>
      decode(lm(html.match(/Date de rendez-vous :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const appointmentTime = () =>
      decode(lm(html.match(/Heure de rendez-vous :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));

    return [
      [`--- Informations Distributeur ---`],
      ['Url: ', distributorWebSite],
      ['Nom:', distributorName],
      ['Lieu: ', distributorLocation],
      ['--- Informations client ---'],
      ['Code postal: ', zipCode],
      ['Commentaires: ', comment],
      ['--- Informations du véhicule ---'],
      ['Véhicule de remplacement: ', loanVehicle],
      ['Date préférée: ', preferredDate],
      ['Heure préférée: ', preferredTime],
      ['Prestation choisie: ', benefit],
      ['Informations complémentaires: ', otherInfos],
      ['--- Informations référence ---'],
      ['Provenance: ', origin],
      ['Date du rendez-vous: ', appointmentDate],
      ['Heure du rendez-vous: ', appointmentTime],
    ]
      .map(([line, getValueFn]) =>
        getValueFn ? (checkLineValidity(line, getValueFn) ? `${line}${getValueFn()}` : false) : line
      )
      .filter((line) => line)
      .join('\n');
  },
};
