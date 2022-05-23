const { fm, lm, decode, decodePhone } = require('../../util');
const VehicleEnergyTypes = require('../../../../../models/data/type/vehicle-energytypes');

module.exports = [
  {
    sourceSubtype: 'OuestFranceAutoVo',
    adUrl: ({ html }) =>
      lm(html.match(/https:\/\/www\.ouestfrance-auto\.com\/event\/mail\?userId[^[>]*3Dvisualiser_annonce/)),
    adId: ({ html }) => {
      try {
        const adId = lm(html.match(/<td>([a-zA-Z0-9]*)<\/td>/));
        return adId && adId.trim();
      } catch (err) {
        return '';
      }
    },
    email: ({ html }) => decode(lm(html.match(/E-mail :([\w\W\r])+?(?=<\/td>)([\w\W\s]+?)(?=<\/tr>)/))),
    phone: ({ html }, { locale }) => decodePhone(decode(lm(html.match(/tel:([0-9]+)/)).trim()), locale),
    lastName: ({ html }) => decode(lm(html.match(/Message de ([\w\W\r])+?(?=<\/td>)([\w\W\s]+?)(?=<\/tr>)/))),
    brandModel: ({ html }) => decode(lm(html.match(/Un client a consulté votre annonce([\w\W\r]*?)<\/strong>/))),
    energyType: ({ html }) => {
      const energy = decode(lm(html.match(/km([\w\W\r]*)<\/span>/)));
      return VehicleEnergyTypes[energy.toLowerCase()] ? [VehicleEnergyTypes[energy.toLowerCase()]] : null;
    },
    vehiclePrice: ({ html }) => parseFloat(decode(lm(html.match(/([\d| \d ]*) &euro/))).replace(/ /g, '')),
    mileage: ({ html }) => parseInt(decode(lm(html.match(/([\d| \d ]*) km/))).replace(/ /g, '')),
    message: function ({ html }) {
      const adId = this.adId({ html });
      const ref = [this.adId, (arg) => `${this.vehiclePrice(arg)}€`, (arg) => `${this.mileage(arg)}km`, this.energyType]
        .map((func) => {
          try {
            return func({
              html,
            });
          } catch (err) {
            return null;
          }
        })
        .filter((e) => e)
        .join(' - ');
      return `${decode(lm(html.match(/Référence :[\w\W\r]*?<div.*>([\w\W]*?)<\/div>/)))
        .replace(`${adId}`, '')
        .trim()} \n Référence: ${ref}`;
    },
  },
  {
    sourceSubtype: 'OuestFranceAutoVo/OuestFranceAutoVoNewFormat',
    adUrl: ({ html }) =>
      lm(html.match(/https:\/\/www\.ouestfrance-auto\.com\/event\/mail\?userId[^[>]*3Dvisualiser_annonce/)),
    adId: ({ html }) => {
      try {
        const adId = lm(html.match(/<td>([a-zA-Z0-9]*)<\/td>/));
        return adId && adId.trim();
      } catch (err) {
        return '';
      }
    },
    email: ({ html }) => decode(lm(html.match(/E-mail :([\w\W\r])+?(?=<\/td>)([\w\W\s]+?)(?=<\/tr>)/))),
    phone: ({ html }, { locale }) => decodePhone(decode(lm(html.match(/tel:([0-9]+)/)).trim()), locale),
    lastName: ({ html }) => decode(lm(html.match(/Message de <\/strong>([\w\W\s]+?)(?=<\/tr>)/))),
    brandModel: ({ html }) => decode(lm(html.match(/Un client a consulté votre annonce([\w\W\r]*?)<\/strong>/))),
    energyType: ({ html }) => {
      const energy = decode(lm(html.match(/km([\w\W\r]*)<\/span>/)));
      return VehicleEnergyTypes[energy.toLowerCase()] ? [VehicleEnergyTypes[energy.toLowerCase()]] : null;
    },
    vehiclePrice: ({ html }) => parseFloat(decode(lm(html.match(/([\d| \d ]*) &euro/))).replace(/ /g, '')),
    mileage: ({ html }) => parseInt(decode(lm(html.match(/([\d| \d ]*) km/))).replace(/ /g, '')),
    message: function ({ html }) {
      const reg = new RegExp(
        /Message de la personne int(&eacute;|é|e)ress(&eacute;|é|e)e : ([\w\W\r])+?(?=<\/td>)([\w\W\s]+?)(?=<\/tr>)/
      );
      const message = fm(html.match(reg));
      return message && decode(message).trim();
    },
  },
  {
    sourceSubtype: 'ZoomcarVo',
    adUrl: ({ html }) => {
      const defaultUrl = html.match(/<a href="([^>]*)visualiser_annonce/);
      const secondUrl = html.match(/href="(.*)\.html\?/);
      if (defaultUrl) return `${lm(defaultUrl).replace(/\n|\t/g, '').trim()}visualiser_annonce`;
      if (secondUrl) return lm(secondUrl).replace(/\n|\t/g, '').trim() + '.html';
      return null;
    },
    adId: ({ html }) => {
      const adId = html.match(/R&eacute;f\.[\w\W\d]+?<\/table>/);
      if (adId) return decode(lm(adId)).replace('Réf. :', '').trim();
      return null;
    },
    email: ({ html }) => decode(lm(html.match(/([a-zA-Z0-9.a-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)<\/td>/))),
    phone: ({ html }, { locale }) => decodePhone(decode(lm(html.match(/phone :([\w\W\s]*)?(?=Email)/)).trim()), locale),
    lastName: ({ html }) =>
      decode(lm(html.match(/Nom :[\w\W]*?<\/table>/)))
        .replace('Nom :', '')
        .trim(),
    brandModel: ({ html }) => {
      return decode(lm(html.match(/votre annonce[\w\W\r]*?(?=<\/table>)/)))
        .replace('votre annonce', '')
        .split('\n')
        .map((brand) => brand.trim()) // remove big space
        .join(' ')
        .trim();
    },
    message: function ({ html }) {
      const ref = this.adId({ html });
      return `${decode(
        lm(html.match(/Message de la personne int&eacute;ress&eacute;e :([\w\W\r]*)(?=<strong> Pour)/))
      ).trim()}${ref ? '\nRef: ' + ref : ''}`;
    },
    vehiclePrice: ({ html }) => parseFloat(decode(lm(html.match(/([\d ]+) &euro;/))).replace(' ', '')),
  },
];
