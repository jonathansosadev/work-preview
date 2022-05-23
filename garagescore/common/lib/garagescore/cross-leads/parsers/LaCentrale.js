const { fm, sm, lm, decode, decodePhone } = require('../util.js');

module.exports = {
  minimumFieldsToParse: 3,
  parsers: [
    {
      sourceSubtype: 'LaCentraleVo',
      email: ({ html }) => lm(html.match(/Email&nbsp;:.*\n.*black'>([^<]*)/)),
      phone: ({ html }, { locale }) =>
        decodePhone(lm(html.match(/T&eacute;l&eacute;phone&nbsp;:.*\n.*\n.*black'>([^<]*)/)), locale),
      adId: ({ subject }) => lm(subject.match(/[A-Z][0-9]{7,10}/)),
      adUrl({ subject }) {
        const adId = this.adId({ subject }); // E105644463 to 69105644463
        return `https://www.lacentrale.fr/auto-occasion-annonce-${
          adId.charCodeAt(0) + adId.slice(1, adId.length)
        }.html`;
      },
      message: ({ html }) =>
        decode(sm(html.match(/Message&nbsp;:.*\n.*black'>((.|\n)*?)(?=<\/td)/)))
          .replace(/[ ]+/g, ' ')
          .trim(),
      lastName: ({ html }) =>
        decode(lm(html.match(/Contact&nbsp;:.*\n.*black'>(Monsieur|Madame|M ou Mme) ([^<]*)/)).trim()),
      brandModel: ({ subject }) =>
        lm(subject.match(/[A-Z][0-9]{7,10}(.*)/))
          .replace(/[\s-?]+/g, ' ')
          .trim(),
      gender: ({ html }) => {
        if (html.includes('Monsieur')) return 'M';
        if (html.includes('Madame')) return 'F';
        throw new Error('fail');
      },
    },
    {
      sourceSubtype: 'LaCentraleVo/NewFormat', // new email format
      email: ({ html }) =>
        lm(html.match(/<td>(Email|Mail)([\w\W\s]*?)<\/td>/))
          .replace(':', '')
          .trim(),
      phone: ({ html }, { locale }) => {
        const phone = lm(html.match(/<td>Tél( |):( |)([\W\w\s]+?)<\/td>/)).replace(/ |-|\./g, '');
        return decodePhone(phone, locale);
      },
      adId: ({ subject }) => lm(subject.match(/[A-Z][0-9]{7,10}/)),
      adUrl({ subject }) {
        try {
          const adId = this.adId({ subject });
          if (adId) {
            return `https://www.lacentrale.fr/auto-occasion-annonce-${
              adId.charCodeAt(0) + adId.slice(1, adId.length)
            }.html`;
          }
        } catch (err) {
          throw new Error(err);
        }
      },
      message({ html, subject }) {
        try {
          const adId = this.adId({ subject });
          if (adId) {
            return `${decode(fm(html.match(/Message([\w\W\s]+?)<\/table>/)))
              .replace(/^\)/, ' ')
              .trim()}\nref: ${adId}`;
          }
        } catch (err) {
          return decode(lm(html.match(/Message([\w\W\s]+?)<\/table>/))).trim();
        }
      },
      lastName: ({ html }) =>
        decode(lm(html.match(/<td>Nom( |):( |)([\W\w\s]+?)<\/td>/)))
          .replace('-', '')
          .trim(),
      brandModel: ({ subject }) =>
        lm(subject.match(/[A-Z][0-9]{7,10}(.*)/))
          .replace(/[\s-?]+/g, ' ')
          .trim(),
      gender: ({ html }) => {
        if (html.includes('Monsieur')) return 'M';
        if (html.includes('Madame')) return 'F';
        throw new Error('fail');
      },
    },
    {
      sourceSubtype: 'LaCentraleVo/Vitrine',
      email: ({ html }) => lm(html.match(/mailto:([a-zA-Z0-9.a-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)),
      phone: ({ html }, { locale }) => decodePhone(lm(html.match(/<strong> ([0-9 ]*) <\/strong>/)), locale),
      adId: ({ html }) => lm(html.match(/ ([A-Z][0-9]{7,10}) /)),
      adUrl({ html }) {
        const adId = this.adId({ html }); // E105644463 to 69105644463
        return `https://www.lacentrale.fr/auto-occasion-annonce-${
          adId.charCodeAt(0) + adId.slice(1, adId.length)
        }.html`;
      },
      message: ({ html }) =>
        decode(sm(html.match(/> Message ((.|\n)+?)(?=<\/table>)/)))
          .replace(/[ ]+/g, ' ')
          .trim(),
      lastName: ({ html }) => lm(html.match(/<strong>[ ]{2}(M\.|Mme) ([^<]*)/)).trim(),
      brandModel: ({ html }) =>
        lm(html.match(/<strong>(.*-.*)<\/strong>/))
          .replace(/[\s-?]+/g, ' ')
          .trim(),
      gender: ({ html }) => {
        if (html.includes('<strong>  M. ')) return 'M';
        if (html.includes('<strong>  Mme ')) return 'F';
        throw new Error('fail');
      },
    },
    {
      sourceSubtype: 'LaCentraleVo/xml', // new email format
      email: ({ xml }) => {
        if (xml) {
          return lm(xml.match(/<email>(.+)<\/email>/));
        }
      },
      phone: ({ xml }, { locale }) => {
        if (xml) {
          return decodePhone(lm(xml.match(/<phone>([\d]+)<\/phone>/)), locale);
        }
      },
      adId: ({ xml }) => {
        if (xml) {
          return lm(xml.match(/<groupId>(.+)<\/groupId>/));
        }
      },
      adUrl({ xml }) {
        if (xml) {
          const adId = this.adId({ xml });
          return `https://www.lacentrale.fr/auto-occasion-annonce-${
            adId.charCodeAt(0) + adId.slice(1, adId.length)
          }.html`;
        }
      },
      message({ xml }) {
        if (xml) {
          const adId = this.adId({ xml });
          return `${lm(xml.match(/<content>([\w\W\s]+)<\/content>/))}\nref: ${adId}`;
        }
      },
      lastName: ({ xml }) => {
        if (xml) {
          return lm(xml.match(/<name part="full">(.*)<\/name>/));
        }
      },
      brandModel: ({ xml }) => {
        if (xml) {
          const make = lm(xml.match(/<make>(.*)<\/make>/));
          const model = lm(xml.match(/<model>(.*)<\/model>/));
          const comments = lm(xml.match(/<comments>(.*)<\/comments>/));
          return decode([make, model, comments].join(' ').replace('\n', '').trim());
        }
      },
      gender: ({ xml }) => {
        if (xml) {
          if (xml.includes('Monsieur')) return 'M';
          if (xml.includes('Madame')) return 'F';
          throw new Error('fail');
        }
      },
    },
  ],
};
