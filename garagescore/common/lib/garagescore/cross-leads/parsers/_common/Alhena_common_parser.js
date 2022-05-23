const { fm, lm, decode, decodePhone } = require('../../util');

module.exports = {
  adId: ({ html }) => decode(lm(html.match(/VO[0-9]{6,10}/))),
  email: ({ html }) => {
    const email = lm(html.match(/E-mail([\w\W\s]+?)<br/));
    if (email.includes('@')) return email.replace(':', '').trim();
  },
  phone: ({ html }, { locale }) => {
    let rawPhone = decode(lm(html.match(/T[ée]l[ée]phone([\w\W\s]+?)<br/)))
      .replace(':', '')
      .trim();

    // Case where there's 2 phones in the same field : "0960532219 ou 0602417675" or "0960532219 0602417675"
    rawPhone = fm(rawPhone.match(/[0-9]*/));

    if (rawPhone) return decodePhone(rawPhone, locale);
  },
  lastName: ({ html }) => {
    const lastname = html.match(/Nom\s?:?\s?([\w\W\s]+?)<br/);
    const firstname = html.match(/Prénom\s?:?\s?([\w\W\s]+?)??<br/);
    return [firstname, lastname]
      .map((item) => item && lm(item) && decode(lm(item)).trim())
      .filter((e) => e)
      .join(' ');
  },
  brandModel: ({ html }) => {
    if (/VO([\w\W\s]*)VO[0-9]{6,10}/.test(html)) {
      return decode(fm(html.match(/VO : ([\w\W\s]*)VO[0-9]{6,10}/)))
        .replace('VO :', '')
        .trim();
    }
    return undefined;
  },
  message: function ({ html }) {
    const reg = html.includes('Métier concerné')
      ? /Message client([\w\W\s]+?)Métier concerné/
      : /Message client([\w\W\s]+?)<br/;
    return decode(lm(html.match(reg)))
      .replace(':', '')
      .trim();
  },
  vehicleRegistrationPlate: function ({ html }) {
    return decode(lm(html.match(/Immatriculation([\w\W\s]+?)<br/)))
      .replace(':', '')
      .trim();
  },
  gender: ({ html }) => {
    if (html.includes('Monsieur')) return 'M';
    if (html.includes('Madame')) return 'F';
    throw new Error('fail');
  },
  type: ({ html }) =>
    decode(lm(html.match(/Métier concerné([\w\W\s]+?)<br/)))
      .replace(':', '')
      .trim(),
};
