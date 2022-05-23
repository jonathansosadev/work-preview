const { fm, lm, decode, decodePhone } = require('../util.js');
const AlhenaCommonParser = require('./_common/Alhena_common_parser');
const SnDiffusionCommonParserOld = require('./_common/SnDiffusion_common_parser_old');
const SnDiffusionCommonParserNew = require('./_common/SnDiffusion_common_parser_new');
const ChanoineVoParser = require('./_common/Chanoine_Vo_parser');
const ChanoineVoCustomSearchParser = require('./_common/Chanoine_Vo_custom_search_parser');
const AutoDefiVoParser = require('./_common/AutoDefi_Vo_parser');
const VulcainVoParser = require('./_common/Vulcain_Vo_parser');

module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'CustomVo/MotorK',
      adUrl: ({ html }) => lm(html.match(/URL de provenance: .*(https:\/\/[^<]*)/)),
      adId: ({ html }) =>
        decode(lm(html.match(/Détails véhicules([\w\W\r]*?)?(?=<\/a)/)))
          .replace(/\(/g, '')
          .trim(),
      email: ({ html }) => lm(html.match(/mailto:([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/)),
      phone: ({ html }, { locale }) =>
        decodePhone(decode(lm(html.match(/Téléphone:([\w\W\r]{1,}?)(?=<\/tr>)/))), locale),
      firstName: ({ html }) => {
        const firstname = decode(lm(html.match(/Prénom:([\w\W\r]{1,}?)(?=<\/tr>)/))).trim();
        const lastname = decode(lm(html.match(/Nom:([\w\W\r]*?)?(?=<\/tr>)/))).trim();
        return `${firstname} ${lastname}`;
      },
      vehicleBrand: ({ html }) => decode(lm(html.match(/Marque:([\w\W\r]*?)(?=<\/tr>)/))).trim(),
      vehicleModel: ({ html }) => decode(lm(html.match(/Modèle:([\w\W\r]*?)(?=<\/tr>)/))).trim(),
      vehicleInterior: ({ html }) => decode(lm(html.match(/Intérieur:([\w\W\r]*?)(?=<\/tr>)/))).trim(),
      brandModel: function ({ html }) {
        return [this.vehicleBrand, this.vehicleModel, this.vehicleInterior]
          .map((func) => {
            return func({ html });
          })
          .filter((e) => e)
          .join(' ');
      },
      vehicleRegistrationPlate: ({ html }) => decode(lm(html.match(/Immatriculation:([\w\W\r]*?)(?=<\/tr>)/))).trim(),
      vehiclePrice: ({ html }) =>
        parseFloat(
          decode(lm(html.match(/Prix:([\w\W\r]*?)(?=<\/tr>)/)))
            .replace(/€/, '')
            .trim()
        ),
      vehicleVin: ({ html }) =>
        decode(lm(html.match(/Vehicle Identification Number[\w\W]+?(?=<span)([\w\W]+?)(?=<\/tr>)/))).trim(),
      idDms: ({ html }) => decode(lm(html.match(/ID DMS[\w\W]+?(?=<span)([\w\W]+?)(?=<\/tr>)/))).trim(),
      concession: ({ html }) => decode(lm(html.match(/Concession[\w\W]+?(?=<span)([\w\W]+?)(?=<\/tr>)/))).trim(),
      message: function ({ html }) {
        const details = [
          this.adId,
          this.vehicleBrand,
          this.vehicleModel,
          (arg) => `VIN: ${this.vehicleVin(arg)}`,
          (arg) => `ID DMS: ${this.idDms(arg)}`,
        ]
          .map((func) => {
            try {
              return func({ html });
            } catch (err) {
              return null;
            }
          })
          .filter((e) => e)
          .join(' ');
        return `${decode(lm(html.match(/Notes[\w\W]+?(?=<span)([\w\W]+?)(?=<\/tr>)/))).trim()}\nref: ${details}`;
      },
    },
    {
      sourceSubtype: 'CustomVo/AutoThivolle',
      adId: ({ html }) => decode(lm(html.match(/VO[0-9]{6,10}/))),
      email: ({ html }) => lm(html.match(/\S+@\S+\.\S+?(?=<)/)),
      phone: ({ html }, { locale }) => decodePhone(decode(lm(html.match(/([\d]{8,10})/))), locale),
      lastName: ({ html }) => decode(lm(html.match(/client :([\w\W\r]*?)?(?=[0-9]{5} \w)/))).trim(),
      brandModel: ({ html }) => {
        if (/VO([\w\W\s]*)VO[0-9]{6,10}/.test(html)) {
          return decode(fm(html.match(/VO : ([\w\W\s]*)VO[0-9]{6,10}/)))
            .replace('VO :', '')
            .trim();
        }
        return undefined;
      },
      message: function ({ html }) {
        const brandModel = this.brandModel({ html }) ? `${this.brandModel({ html })}\n` : '';
        return `${brandModel}${decode(fm(html.match(/Message[\w\W\r]+<p.*>([\w\w])?(?=<\/p><p)/)))
          .replace(/^Message :/, '')
          .trim()}`;
      },
    },
    {
      sourceSubtype: 'CustomVo/AlhenaVo',
      ...AlhenaCommonParser,
    },
    {
      sourceSubtype: 'CustomVo/SnDiffusionVo',
      ...SnDiffusionCommonParserOld,
    },
    {
      sourceSubtype: 'CustomVo/SnDiffusionVo',
      ...SnDiffusionCommonParserNew,
    },
    {
      sourceSubtype: 'CustomVo/ChanoineVo',
      ...ChanoineVoParser,
    },
    {
      sourceSubtype: 'CustomVo/ChanoineVoCustomSearch',
      ...ChanoineVoCustomSearchParser,
    },
    {
      sourceSubtype: 'CustomVo/AutoDefiVo',
      ...AutoDefiVoParser,
    },
    {
      sourceSubtype: 'CustomVo/VulcainVo',
      ...VulcainVoParser,
    },
  ],
};
