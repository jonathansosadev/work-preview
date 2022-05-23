const SourceTypes = require('../../../models/data/type/source-types.js');
const { getSourceId } = require('./util.js');

const LaCentrale = require('./parsers/LaCentrale.js');
const LeBonCoin = require('./parsers/LeBonCoin.js');
const Largus = require('./parsers/Largus.js');
const ParuVendu = require('./parsers/ParuVendu.js');
const Promoneuve = require('./parsers/Promoneuve.js');
const OuestFranceAuto = require('./parsers/OuestFranceAuto.js');
const Zoomcar = require('./parsers/Zoomcar');
const EkonsilioVo = require('./parsers/EkonsilioVo');
const EkonsilioVn = require('./parsers/EkonsilioVn');
const CustomVo = require('./parsers/CustomVo.js');
const CustomVn = require('./parsers/CustomVn.js');
const CustomApv = require('./parsers/CustomApv.js');

const WEIRDLY_LONG = 1500; // Size max per field

const _config = {
  Common: {
    // COMMON FIELDS
    parsers: {
      garageId: (payload) => payload.to.match(/\b([\w]*)\.([^@]*)@discuss\.garagescore\.com/)[2],
      sourceType: (payload) =>
        SourceTypes.getValue(payload.to.match(/\b([\w]*)\.([^@]*)@discuss\.garagescore\.com/)[1].toLowerCase()),
      webSite: (payload, raw) => raw.from.match(/([a-z]+)\.[a-z]+(>|)$/)[1],
    },
  },
};

_config[SourceTypes.LA_CENTRALE] = LaCentrale;
_config[SourceTypes.LE_BON_COIN] = LeBonCoin;
_config[SourceTypes.L_ARGUS] = Largus;
_config[SourceTypes.PARU_VENDU] = ParuVendu;
_config[SourceTypes.PROMONEUVE] = Promoneuve;
_config[SourceTypes.OUEST_FRANCE_AUTO] = OuestFranceAuto;
_config[SourceTypes.CUSTOM_VO] = CustomVo;
_config[SourceTypes.CUSTOM_VN] = CustomVn;
_config[SourceTypes.CUSTOM_APV] = CustomApv;
_config[SourceTypes.ZOOMCAR] = Zoomcar;
_config[SourceTypes.EKONSILIO_VO] = EkonsilioVo;
_config[SourceTypes.EKONSILIO_VN] = EkonsilioVn;

const initResult = () => ({
  garageId: null,
  sourceType: null,
  success: false,
  sourceId: null,
  fields: {},
  parsedCount: 0,
  totalCount: 0,
});

const parseBinaryToXml = (buffer) => {
  const type = Object.keys(buffer.buffer)[0];
  let stringify = null;
  if (type === '_bsontype') {
    stringify = JSON.stringify(buffer.buffer); // base64 encoding
  } else {
    const binary = Object.keys(buffer.buffer)[0]; // binary or $binary
    stringify = buffer.buffer[`${binary}`];
  }
  const buff = Buffer.from(stringify, 'base64');
  return buff.toString('utf-8'); // magic!, get the XML document
};

module.exports = {
  ..._config,
  parseBinaryToXml,
  parseEmail: async (email, garage) => {
    let result = initResult();
    const parsedResults = [];
    let parserIndex = 0;
    // backup if the payload do not have html
    if (email.payload && !email.payload.html) {
      email.payload.html = email.raw['body-html'];
    }
    if (email.payload.attachments) {
      // convert binary to xml
      try {
        const buffer = email.payload.attachments.find((a) => a.buffer);
        if (buffer && buffer.buffer) {
          email.payload.xml = parseBinaryToXml(buffer);
        }
      } catch (err) {
        // nothing now
      }
    }
    for (const field of Object.keys(_config.Common.parsers)) {
      try {
        result[field] = _config.Common.parsers[field](email.payload, email.raw);
      } catch (e) {
        return result; // Stop now, we can't go further
      }
    }
    /** Try all parsers of a source until one of them works, otherwise, return the best one */
    while (_config[result.sourceType].parsers[parserIndex]) {
      const parsed = { fields: {}, parsedCount: 0, totalCount: 0 };
      for (const field of Object.keys(_config[result.sourceType].parsers[parserIndex])) {
        try {
          if (field === 'sourceSubtype') {
            parsed.sourceSubtype = _config[result.sourceType].parsers[parserIndex][field];
            continue;
          }
          parsed.fields[field] = _config[result.sourceType].parsers[parserIndex][field](
            email.payload,
            garage,
            email.raw
          );
          if (!parsed.fields[field]) {
            delete parsed.fields[field];
            throw new Error(`${field} is empty`);
          }
          if (parsed.fields[field].length > WEIRDLY_LONG) {
            // Fail Safe if it's weirdly long
            delete parsed.fields[field];
            throw new Error(`${field} weirdly long`);
          }
          parsed.parsedCount += 1;
        } catch (e) {
          // fail to parse field
          // do nothing for now
        }
        parsed.totalCount += 1;
      }
      parsed.success = !!(
        parsed.parsedCount >= _config[result.sourceType].minimumFieldsToParse &&
        (parsed.fields.email || parsed.fields.phone)
      );
      parsedResults.push(parsed);
      parserIndex += 1;
    }
    const [bestResult] = parsedResults.sort((res1, res2) => {
      // Try to find best parsing result
      if (res1.success && !res2.success) return -1; // Success ones goes first no matter what
      if (res2.success && !res1.success) return 1; // Success ones goes first no matter what
      return res2.parsedCount - res1.parsedCount; // Otherwise, get the best parsedCount
    });
    result = { ...result, ...bestResult };
    result.sourceId = getSourceId(result.fields);
    return result;
  },
  parseCall: async () => null,
};
