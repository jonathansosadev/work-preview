const { fm, sm, lm, decode, decodePhone } = require('../../util.js');

module.exports = {
  email: ({ html }) => decode(lm(html.match(/Email :[\w\W\s]+?(?=<\/span>)([\w\W\s]+?)(?=<\/div>)/))).trim(),
  lastName: ({ html }) => {
    const lastname = decode(lm(html.match(/Nom :[\w\W\s]+?(?=<\/span>)([\w\W\s]+?)(?=<\/div>)/)));
    // Firstname is optional
    let firstname;

    const firtnameMatches = html.match(/Prénom :[\w\W\s]+?(?=<\/span>)([\w\W\s]+?)(?=<\/div>)/);

    if (firtnameMatches) {
      firstname = decode(lm(firtnameMatches));
    }
    return [firstname, lastname]
      .filter((e) => e)
      .map((e) => e.trim())
      .join(' ');
  },
  phone: ({ html }, { locale }) =>
    decodePhone(decode(lm(html.match(/Téléphone :[\w\W\s]+?(?=<\/span>)([\w\W\s]+?)(?=<\/div>)/))), locale),
  message: ({ html }) => decode(lm(html.match(/Commentaires([\w\W\s]+?)<\/table>/))).trim(),
  vehicleBrand: ({ html }) =>
    decode(lm(html.match(/Projet([\w\W\s]+?)Marque :[\w\W\s]+?(?=<\/span>)([\w\W\s]+?)(?=<\/div>)/))),
  vehicleModel: ({ html }) =>
    decode(lm(html.match(/Projet([\w\W\s]+?)Modèle :[\w\W\s]+?(?=<\/span>)([\w\W\s]+?)(?=<\/div>)/))),
  brandModel: function ({ html }) {
    return [this.vehicleBrand, this.vehicleModel]
      .map((func) => {
        return func({ html }).trim();
      })
      .filter((e) => e)
      .join(' ');
  },
  gender: ({ html }) => {
    if (html.includes('<span>M.</span>')) return 'M';
    if (html.includes('<span>Mme</span>')) return 'F';
    throw new Error('fail');
  },
};
