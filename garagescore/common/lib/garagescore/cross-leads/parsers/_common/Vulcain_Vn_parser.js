const { lm, decode, decodePhone } = require('../../util');

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
  brandModel: ({ html }) => {
    const brand = decode(lm(html.match(/Marque: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const model = decode(lm(html.match(/Modèle: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    return `${brand} - ${model}`;
  },
  city: ({ html }) => decode(lm(html.match(/Ville: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/))),
  adUrl: ({ html }) => decode(lm(html.match(/Provenance: <\/strong><\/div><\/td>([\s\S]*?)\n?<\/div><\/td>/))),
  message: ({ html }) => {
    const distributorWebSite = () =>
      decode(lm(html.match(/Adresse Url du site Internet: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const distributorName = () =>
      decode(lm(html.match(/Nom du distributeur: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const distributorLocation = () => decode(lm(html.match(/Lieu: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));

    const zipCode = () => decode(lm(html.match(/Code postal: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const origin = () => decode(lm(html.match(/Provenance: <\/strong><\/div><\/td>([\s\S]*?)\n?<\/div><\/td>/)));
    const comment = () => decode(lm(html.match(/Commentaires :<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const levelOfInterest = () =>
      decode(lm(html.match(/Niveau d'intérêt: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const vehicleType = () =>
      decode(lm(html.match(/Type de véhicule: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const year = () => decode(lm(html.match(/Année: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
    const bodyType = () => decode(lm(html.match(/Carrosserie: <\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));

    return [
      [`--- Informations Distributeur ---`],
      ['Url: ', distributorWebSite],
      ['Nom:', distributorName],
      ['Lieu: ', distributorLocation],
      ['--- Informations client ---'],
      ['Code postal: ', zipCode],
      ['Commentaires: ', comment],
      ['--- Informations du véhicule ---'],
      ["Niveau d'intérêt: ", levelOfInterest],
      ['Année: ', year],
      ['Type de véhicule: ', vehicleType],
      ['Carrosserie: ', bodyType],
      ['--- Informations référence ---'],
      ['Provenance: ', origin],
    ]
      .map(([line, getValueFn]) =>
        getValueFn ? (checkLineValidity(line, getValueFn) ? `${line}${getValueFn()}` : false) : line
      )
      .filter((line) => line)
      .join('\n');
  },
  pageCategory: ({ html }) => {
    return decode(lm(html.match(/Field PageCategory<\/strong><\/div><\/td>([\s\S]*?)<\/div><\/td>/)));
  },
};
