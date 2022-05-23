/**
 * Html examples for unit tests. KEEP IT UP TO DATE so the parsers works
 * To add a new html, look into the incomingEmails collection and retrieve the html.
 * Tips:
 * Html viewer too see it: https://codebeautify.org/htmlviewer/
 */
const LaCentrale = require('./examples/LaCentrale.json'); // LA_CENTRALE
const LaCentraleSlackTest = require('./examples/LaCentrale_filter_test.json'); // LA_CENTRALE
const NewFormat = require('./examples/LaCentrale/lead-updated-email-format-and-phone-with-dots.json'); // LA_CENTRALE
const LeBonCoin = require('./examples/LeBonCoin.json'); // LE_BON_COIN
const Largus = require('./examples/Largus.json'); // L_ARGUS
const ParuVendu = require('./examples/ParuVendu.json'); // PARU_VENDU
const Promoneuve = require('./examples/Promoneuve/lead-new-format-12-07-2021.json'); // PROMONEUVE NEW FORMAT
const OuestFranceAuto = require('./examples/OuestFranceAuto.json'); // OUEST_FRANCE_AUTO
const OuestFranceAutoNewFormat = require('./examples/OuestFranceAuto/lead-2.json'); // OUEST_FRANCE_AUTO
const OuestFranceAutoLeadWithoutBodyHtml = require('./examples/OuestFranceAuto/lead-without-body-html.json');
const MotorK = require('./examples/CustomVo/MotorK-lead-2.json'); // CUSTOM_VO_MOTOR_K
const AutoThivolle = require('./examples/CustomVo/AutoThivolles.json'); // CUSTOM_VO_AUTOTHIVOLLE
const Zoomcar = require('./examples/Zoomcar.json'); // ZOOMCAR
const AlhenaVo = require('./examples/CustomVo/CustomVo-Alhena-lead-2-with-vehicule-plate.json'); // CUSTOM_VO_ALHENA
const AlhenaVn = require('./examples/CustomVn/CustomVn-Alhena-lead-1.json'); // CUSTOM_VN_ALHENA
const AlhenaApv = require('./examples/CustomApv/CustomApv-Alhena-lead-1.json'); // CUSTOM_APV_ALHENA
const SnDiffusionVn = require('./examples/CustomVn/CustomVn-SnDiffusion-lead-1.json'); // CUSTOM_VN_SNDIFFUSION
const SnDiffusionVo = require('./examples/CustomVo/CustomVo-SnDiffusion-lead-1.json'); // CUSTOM_VO_SNDIFFUSION
const SnDiffusionVnNewFormat = require('./examples/CustomVn/CustomVn-SnDiffusion-lead-2.json'); // CUSTOM_VN_SNDIFFUSION
const SnDiffusionVoNewFormat = require('./examples/CustomVo/CustomVo-SnDiffusion-lead-2.json'); // CUSTOM_VO_SNDIFFUSION
const EkonsilioVo = require('./examples/Ekonsilio/lead-vo.json'); // EKONSILIO_VO
const EkonsilioVn = require('./examples/Ekonsilio/lead-vn.json'); // EKONSILIO_VN
const ChanoineApv = require('./examples/CustomApv/CustomApv-Chanoine-lead.json');
const ChanoineVo = require('./examples/CustomVo/CustomVo-Chanoine-lead.json');
const ChanoineVoCustomSearch = require('./examples/CustomVo/CustomVo-Chanoine-lead-custom-search.json');
const ChanoineVn = require('./examples/CustomVn/CustomVn-Chanoine-lead.json');
const AutoDefiVn = require('./examples/CustomVn/CustomVn-AutoDefi.json');
const AutoDefiVo = require('./examples/CustomVo/CustomVo-AutoDefi.json');
const AutoDefiApv = require('./examples/CustomApv/CustomApv-AutoDefi.json');
const VulcainVn = require('./examples/CustomVn/CustomVn-Vulcain.json');
const VulcainVo = require('./examples/CustomVo/CustomVo-Vulcain.json');
const VulcainApv = require('./examples/CustomApv/CustomApv-Vulcain.json');
module.exports = {
  LaCentrale: {
    LaCentrale,
    NewFormat,
    LaCentraleSlackTest,
  },
  LeBonCoin,
  Largus,
  ParuVendu,
  Promoneuve,
  OuestFranceAuto,
  OuestFranceAutoLeadWithoutBodyHtml,
  OuestFranceAutoNewFormat,
  Zoomcar,
  CustomVo: {
    MotorK,
    AutoThivolle,
    AlhenaVo,
    SnDiffusionVo,
    SnDiffusionVoNewFormat,
    ChanoineVo,
    ChanoineVoCustomSearch,
    AutoDefiVo,
    VulcainVo,
  },
  CustomVn: {
    AlhenaVn,
    SnDiffusionVn,
    SnDiffusionVnNewFormat,
    ChanoineVn,
    AutoDefiVn,
    VulcainVn,
  },
  CustomApv: {
    AlhenaApv,
    ChanoineApv,
    AutoDefiApv,
    VulcainApv,
  },
  EkonsilioVo,
  EkonsilioVn,
};
