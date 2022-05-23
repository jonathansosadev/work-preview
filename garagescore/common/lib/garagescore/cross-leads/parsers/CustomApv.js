const { fm, lm, decode, decodePhone } = require('../util.js');
const AlhenaCommonParser = require('./_common/Alhena_common_parser');
const ChanoineApvParser = require('./_common/Chanoine_Apv_parser');
const AutoDefiApvParser = require('./_common/AutoDefi_Apv_parser');
const VulcainApvParser = require('./_common/Vulcain_Apv_parser');

module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'CustomApv/AlhenaApv',
      ...AlhenaCommonParser,
    },
    {
      sourceSubtype: 'CustomApv/ChanoineApv',
      ...ChanoineApvParser,
    },
    {
      sourceSubtype: 'CustomApv/AutoDefiApv',
      ...AutoDefiApvParser,
    },
    {
      sourceSubtype: 'CustomApv/VulcainApv',
      ...VulcainApvParser,
    },
  ],
};
