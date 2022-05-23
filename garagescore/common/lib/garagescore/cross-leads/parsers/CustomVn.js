const AlhenaCommonParser = require('./_common/Alhena_common_parser');
const SnDiffusionCommonParserOld = require('./_common/SnDiffusion_common_parser_old');
const SnDiffusionCommonParserNew = require('./_common/SnDiffusion_common_parser_new');
const ChanoineVnParser = require('./_common/Chanoine_Vn_parser');
const AutoDefiVnParser = require('./_common/AutoDefi_Vn_parser');
const VulcainVnParser = require('./_common/Vulcain_Vn_parser');
module.exports = {
  minimumFieldsToParse: 4,
  parsers: [
    {
      sourceSubtype: 'CustomVn/AlhenaVn',
      ...AlhenaCommonParser,
    },
    {
      sourceSubtype: 'CustomVn/SnDiffusionVn',
      ...SnDiffusionCommonParserOld,
    },
    {
      sourceSubtype: 'CustomVn/SnDiffusionVn',
      ...SnDiffusionCommonParserNew,
    },
    {
      sourceSubtype: 'CustomVn/ChanoineVn',
      ...ChanoineVnParser,
    },
    {
      sourceSubtype: 'CustomVn/AutoDefiVn',
      ...AutoDefiVnParser,
    },
    {
      sourceSubtype: 'CustomVn/VulcainVn',
      ...VulcainVnParser,
    },
  ],
};
