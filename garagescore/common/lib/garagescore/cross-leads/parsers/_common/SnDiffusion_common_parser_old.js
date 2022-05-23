const { lm, decode, decodePhone } = require('../../util');

module.exports = {
  // first format email
  email: ({ html }) => {
    const email = lm(html.match(/E-mail([\w\W\s]+?)\r/));
    if (email.includes('@')) return email.replace(':', '').trim();
  },
  phone: ({ html }, { locale }) => {
    const rawPhone = decode(lm(html.match(/T[ée]l[ée]phone([\w\W\s]+?)\r/))).replace(':', '');
    if (rawPhone) return decodePhone(rawPhone, locale);
  },
  lastName: ({ html }) => {
    const fullname = decode(lm(html.match(/Nom([\w\W\s]+?)\r/)));
    return fullname.replace(':', '');
  },
  vehicleBrand: ({ html }) => {
    return decode(lm(html.match(/Marque([\w\W\s]+?)\r/)))
      .replace(':', '')
      .trim();
  },
  vehicleModel: ({ html }) => {
    return decode(lm(html.match(/Mod[èe]le([\w\W\s]+?)\r/)))
      .replace(':', '')
      .trim();
  },
  vehicleVersion: ({ html }) => {
    return decode(lm(html.match(/Version([\w\W\s]+?)\r/)))
      .replace(':', '')
      .trim();
  },
  vehiclePrice: ({ html }) => {
    return decode(lm(html.match(/Prix([\w\W\s]+?)\r/))).replace(':', '');
  },
  brandModel: function ({ html }) {
    return [this.vehicleBrand, this.vehicleModel, this.vehicleVersion]
      .map((func) => {
        return func({ html });
      })
      .filter((e) => e)
      .join(' ');
  },
  message: ({ html }) => {
    return decode(lm(html.match(/Message de l'internaute :\r\n([\w\W\s]+?)\r/))).replace(':', '');
  },
};
