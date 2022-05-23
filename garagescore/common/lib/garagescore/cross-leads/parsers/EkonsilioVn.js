const EkonsilioCommonParser = require('./_common/Ekonsilio_common_parser');

module.exports = {
  minimumFieldsToParse: 3,
  parsers: [
    {
      sourceSubtype: 'EkonsilioVn',
      ...EkonsilioCommonParser
    }
  ]
}