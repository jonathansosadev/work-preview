const { lm, decode, decodePhone } = require('../../util');

module.exports = {
  // second format email
  email: ({ html }) => {
    const email = lm(html.match(/Email\s?:?\s?:([\w\W\s]+?)<\/li>/));
    if (email.includes('@')) return decode(email);
  },
  phone: ({ html }, { locale }) => {
    const rawPhone = decode(lm(html.match(/T[ée]l[ée]phone\s?:?\s?:([\w\W\s]+?)?<\/li>/)));
    if (rawPhone) return decodePhone(rawPhone, locale);
  },
  lastName: ({ html }) => {
    const firstName = decode(lm(html.match(/Nom\s?:?\s?:([\w\W\s]+?)<\/li>/)));
    const lastName = decode(lm(html.match(/Pr[ée]nom\s?:?\s?:([\w\W\s]+?)<\/li>/)));
    return [firstName, lastName].filter((e) => e).join(' ');
  },
  vehicleBrand: ({ html }) => {
    return decode(lm(html.match(/Marque\s?:?\s?:([\w\W\s]+?)<\/li>/)));
  },
  vehicleModel: ({ html }) => {
    return decode(lm(html.match(/Mod[èe]le\s?:?\s?:([\w\W\s]+?)<\/li>/)));
  },
  vehicleVersion: ({ html }) => {
    return decode(lm(html.match(/Version\s?:?\s?:([\w\W\s]+?)<\/li>/)));
  },
  vehiclePrice: ({ html }) => {
    return decode(lm(html.match(/Prix([\w\W\s]+?)\r/)));
  },
  brandModel: function ({ html }) {
    return [this.vehicleBrand, this.vehicleModel, this.vehicleVersion]
      .map((func) => {
        return func({ html });
      })
      .filter((e) => e)
      .join(' ');
  },
  vehicleRegistrationPlate: ({ html }) => {
    return decode(lm(html.match(/Immat\s?:?\s?:([\w\W\s]+?)<\/li>/)));
  },
  recontact: ({ html }) => {
    const recontact = decode(lm(html.match(/A recontacter par([\w\W\s]+?)<\/li>/)));
    if (recontact) return 'Préférence de contact: ' + recontact;
  },
  mileage: ({ html }) => {
    return decode(lm(html.match(/Kilom[ée]trage\s?:?\s?:([\w\W\s]+?)<\/li>/)));
  },
  message: function ({ html }) {
    let plate = this.vehicleRegistrationPlate({ html });
    let mileage = this.mileage({ html });
    let recontact = this.recontact({ html });
    if (plate) plate = 'Immat: ' + plate;
    if (mileage) mileage = 'Kilométrage: ' + mileage;
    return (
      decode(lm(html.match(/<\/em><\/h3>([\w\W\s]+?)<\/table>/))) +
      `\n\n${[plate, mileage, recontact].filter((e) => e).join('\n')}`
    );
  },
};
