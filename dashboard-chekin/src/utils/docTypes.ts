import i18n from '../i18n';
import {COUNTRY_CODES, EU_MEMBERS} from './constants';
import {SelectOption, valueof} from './types';

const DRIVING_LICENSES = {
  drivingLicense: 'DL',
  drivingLicenseES: 'ES_C',
  drivingLicenseCZ: 'CZ_DL',
  drivingLicenseAT: 'AT_DL',
  drivingLicenseGR: 'GR_DL',
  drivingLicenseGB: 'GB_DL',
  drivingLicenseIT: 'IT_PATEN',
};

const IDENTITY_CARDS = {
  id: 'I',
  identityCardES: 'ES_I',
  identityCardIT: 'IT_IDELE',
  identityCardPaperIT: 'IT_IDENT',
  identityCardPT: 'PT_B',
  identityCardCZ: 'CZ_ID',
  identityCardAT: 'AT_ID',
  identityCardGR: 'GR_ID',
  identityCardGB: 'GB_ID',
};

const PASSPORTS = {
  passport: 'P',
  passportPT: 'PT_P',
  passportIT: 'IT_PASOR',
  passportCZ: 'CZ_P',
  passportAT: 'AT_P',
  passportGR: 'GR_P',
  passportGB: 'GB_P',
  passportES: 'ES_P',
  passportCO: 'CO_P',
  armyIdGR: 'GR_ARMY_ID',
};

const RESIDENCE_PERMITS = {
  dubaiResidencePermit: 'AE_RP',
  spanishResidencePermitNIE: 'ES_N',
  spanishResidencePermitEU: 'ES_X',
  residencePermitCO: 'CO_FID',
};

const DOCUMENTS_TYPES = {
  diplomaticPassportIT: 'IT_PASDI',
  diplomaticIdentityIT: 'IT_CIDIP',
  diplomaticIdCO: 'CO_DIP',
  servicePassportIT: 'IT_PASSE',
  othersDocumentsPT: 'PT_O',
  othersDocumentsAT: 'AT_O',
  workPermitGR: 'GR_WORK_PERMIT',
  foreignDocumentCO: 'CO_FD',
  identityCertificateIT: 'IT_CERID',
  dniES: 'ES_D',
  ...RESIDENCE_PERMITS,
  ...PASSPORTS,
  ...IDENTITY_CARDS,
  ...DRIVING_LICENSES,
};
type DOCUMENTS_TYPES_VALUES = valueof<typeof DOCUMENTS_TYPES>;

const DOC_TYPES_WITH_FRONT_AND_BACK_SIDES_SCAN = [
  ...Object.values(IDENTITY_CARDS),
  DOCUMENTS_TYPES.dniES,
  DOCUMENTS_TYPES.dubaiResidencePermit,
];

const identityCardsLabel = 'documents.identity_card';
const passportLabel = 'documents.passport';

const DOCUMENTS_LABELS: {[key in DOCUMENTS_TYPES_VALUES]: string} = {
  [DOCUMENTS_TYPES.id]: identityCardsLabel,
  [DOCUMENTS_TYPES.passport]: passportLabel,
  [DOCUMENTS_TYPES.identityCardPT]: identityCardsLabel,
  [DOCUMENTS_TYPES.identityCardCZ]: identityCardsLabel,
  [DOCUMENTS_TYPES.identityCardES]: identityCardsLabel,
  [DOCUMENTS_TYPES.identityCardIT]: identityCardsLabel,
  [DOCUMENTS_TYPES.identityCardAT]: identityCardsLabel,
  [DOCUMENTS_TYPES.identityCardGR]: identityCardsLabel,
  [DOCUMENTS_TYPES.identityCardGB]: identityCardsLabel,
  [DOCUMENTS_TYPES.armyIdGR]: 'documents.army_id_gr',
  [DOCUMENTS_TYPES.passportIT]: passportLabel,
  [DOCUMENTS_TYPES.passportPT]: passportLabel,
  [DOCUMENTS_TYPES.passportCZ]: passportLabel,
  [DOCUMENTS_TYPES.passportAT]: passportLabel,
  [DOCUMENTS_TYPES.passportGR]: passportLabel,
  [DOCUMENTS_TYPES.passportGB]: passportLabel,
  [DOCUMENTS_TYPES.passportES]: passportLabel,
  [DOCUMENTS_TYPES.passportIT]: passportLabel,
  [DOCUMENTS_TYPES.passportCO]: passportLabel,
  [DOCUMENTS_TYPES.dniES]: 'documents.dni',
  [DOCUMENTS_TYPES.identityCertificateIT]: 'documents.identity_certificate',
  [DOCUMENTS_TYPES.diplomaticIdentityIT]: 'documents.identity_diplomatic',
  [DOCUMENTS_TYPES.identityCardPaperIT]: 'documents.identity_card_paper',
  [DOCUMENTS_TYPES.diplomaticIdCO]: 'documents.diplomatic_id',
  [DOCUMENTS_TYPES.foreignDocumentCO]: 'documents.foreign_document',
  [DOCUMENTS_TYPES.dubaiResidencePermit]: 'documents.residence_permit',
  [DOCUMENTS_TYPES.residencePermitCO]: 'documents.residence_permit',
  [DOCUMENTS_TYPES.spanishResidencePermitNIE]: 'documents.spanish_residence_permit',
  [DOCUMENTS_TYPES.spanishResidencePermitEU]: 'documents.eu_residence_permit',
  [DOCUMENTS_TYPES.diplomaticPassportIT]: 'documents.diplomatic_passport',
  [DOCUMENTS_TYPES.servicePassportIT]: 'documents.service_passport',
  [DOCUMENTS_TYPES.workPermitGR]: 'documents.work_permit_gr',
  [DOCUMENTS_TYPES.drivingLicense]: 'documents.driving_license',
  [DOCUMENTS_TYPES.drivingLicenseCZ]: 'documents.driving_license_cz',
  [DOCUMENTS_TYPES.drivingLicenseAT]: 'documents.driving_license',
  [DOCUMENTS_TYPES.drivingLicenseGR]: 'documents.driving_license_gr',
  [DOCUMENTS_TYPES.drivingLicenseGB]: 'documents.driving_license_gb',
  [DOCUMENTS_TYPES.drivingLicenseIT]: 'documents.driving_license_eu',
  [DOCUMENTS_TYPES.drivingLicenseES]: 'documents.driving_license_es',
  [DOCUMENTS_TYPES.othersDocumentsPT]: 'documents.other_document',
  [DOCUMENTS_TYPES.othersDocumentsAT]: 'documents.other',
  default: 'document',
};

const passport = () => ({
  value: DOCUMENTS_TYPES.passport,
  label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
});

const identityCard = () => ({
  value: DOCUMENTS_TYPES.id,
  label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.id]),
});

const general = () => [
  {
    value: DOCUMENTS_TYPES.passport,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
  },
  {
    value: DOCUMENTS_TYPES.id,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.id]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicense,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicense]),
  },
];

const portugal = () => [
  {
    value: DOCUMENTS_TYPES.identityCardPT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardPT]),
  },
  {
    value: DOCUMENTS_TYPES.passportPT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportPT]),
  },
  {
    value: DOCUMENTS_TYPES.othersDocumentsPT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.othersDocumentsPT]),
  },
];

const czech = () => [
  {
    value: DOCUMENTS_TYPES.identityCardCZ,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardCZ]),
  },
  {
    value: DOCUMENTS_TYPES.passportCZ,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportCZ]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicenseCZ,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicenseCZ]),
  },
];

const austria = () => [
  {
    value: DOCUMENTS_TYPES.identityCardAT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardAT]),
  },
  {
    value: DOCUMENTS_TYPES.passportAT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportAT]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicenseAT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicenseAT]),
  },
  {
    value: DOCUMENTS_TYPES.othersDocumentsAT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.othersDocumentsAT]),
  },
];

const czechEU = general;

const czechNonEU = () => [
  {
    value: DOCUMENTS_TYPES.passport,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
  },
];

const greece = () => [
  {
    value: DOCUMENTS_TYPES.identityCardGR,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardGR]),
  },
  {
    value: DOCUMENTS_TYPES.passportGR,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportGR]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicenseGR,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicenseGR]),
  },
  {
    value: DOCUMENTS_TYPES.armyIdGR,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.armyIdGR]),
  },
  {
    value: DOCUMENTS_TYPES.workPermitGR,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.workPermitGR]),
  },
];

const greeceEU = general;

const greeceNonEU = () => [
  {
    value: DOCUMENTS_TYPES.passport,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
  },
];

const slovenia = () => [
  {
    value: 'SL_P',
    label: i18n.t('documents.passport'),
  },
  {
    value: 'SL_I',
    label: i18n.t('documents.identity_card'),
  },
  {
    value: 'SL_V',
    label: i18n.t('documents.driving_license'),
  },
  {
    value: 'SL_F',
    label: i18n.t('documents.border_pass'),
  },
  {
    value: 'SL_L',
    label: i18n.t('documents.children_citizens_slovenian'),
  },
  {
    value: 'SL_H',
    label: i18n.t('documents.travel_documents'),
  },
  {
    value: 'SL_U',
    label: i18n.t('documents.administrative_documents'),
  },
  {
    value: 'SL_O',
    label: i18n.t('documents.weapon_certificate'),
  },
];

const greatBritain = () => [
  {
    value: DOCUMENTS_TYPES.identityCardGB,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardGB]),
  },
  {
    value: DOCUMENTS_TYPES.passportGB,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportGB]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicenseGB,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicenseGB]),
  },
];

const greatBritainEU = general;

const greatBritainNonEU = () => [passport()];

const thailand = general;

const thailandAllNationalities = () => [
  {
    value: DOCUMENTS_TYPES.passport,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
  },
];

const spanishAllNationalitiesDocuments = () => [
  {
    value: DOCUMENTS_TYPES.passportES,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportES]),
  },
];

const italianAllNationalities = () => [
  {
    value: DOCUMENTS_TYPES.passportIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportIT]),
  },
  {
    value: DOCUMENTS_TYPES.identityCardIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardIT]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicenseIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicenseIT]),
  },
  {
    value: DOCUMENTS_TYPES.diplomaticPassportIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.diplomaticPassportIT]),
  },
  {
    value: DOCUMENTS_TYPES.servicePassportIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.servicePassportIT]),
  },
];

const dubai = () => [
  {
    value: DOCUMENTS_TYPES.passport,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
  },
  {
    value: DOCUMENTS_TYPES.id,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.id]),
  },
];

const dubaiAllNationalities = () => [
  {
    value: DOCUMENTS_TYPES.passport,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passport]),
  },
  {
    value: DOCUMENTS_TYPES.dubaiResidencePermit,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.dubaiResidencePermit]),
  },
];

const colombia = () => [
  {
    value: DOCUMENTS_TYPES.passportCO,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.passportCO]),
  },
  {
    value: DOCUMENTS_TYPES.foreignDocumentCO,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.foreignDocumentCO]),
  },
  {
    value: DOCUMENTS_TYPES.residencePermitCO,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.residencePermitCO]),
  },
  {
    value: DOCUMENTS_TYPES.diplomaticIdCO,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.diplomaticIdCO]),
  },
];

const allItalian = () => [
  ...italianAllNationalities(),
  {
    value: DOCUMENTS_TYPES.identityCardPaperIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardPaperIT]),
  },
  {
    value: DOCUMENTS_TYPES.identityCertificateIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCertificateIT]),
  },
  {
    value: DOCUMENTS_TYPES.diplomaticIdentityIT,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.diplomaticIdentityIT]),
  },
  {
    value: 'IT_ACMIL',
    label: i18n.t('documents.tess__app_to_ag_custodia'),
  },
  {
    value: 'IT_ACSOT',
    label: i18n.t('documents.tess__sott_li_ag_custodia'),
  },
  {
    value: 'IT_ACUFF',
    label: i18n.t('documents.tess__uff_li_ag_custodia'),
  },
  {
    value: 'IT_AMMIL',
    label: i18n.t('documents.tess__militare_truppa_a_m'),
  },
  {
    value: 'IT_AMSOT',
    label: i18n.t('documents.tess__sottufficiali_a_m_'),
  },
  {
    value: 'IT_AMUFF',
    label: i18n.t('documents.tess__ufficiali_a_m_'),
  },
  {
    value: 'IT_CCMIL',
    label: i18n.t('documents.tess__app_to_carabinieri'),
  },
  {
    value: 'IT_CCSOT',
    label: i18n.t('documents.tess__sottufficiali_cc'),
  },
  {
    value: 'IT_CCUFF',
    label: i18n.t('documents.tess__ufficiale'),
  },
  {
    value: 'IT_CFMIL',
    label: i18n.t('documents.tess__ag__e_ag_sc__c_f_s_'),
  },
  {
    value: 'IT_CFSOT',
    label: i18n.t('documents.tess__sottuficiali_c_f_s_'),
  },
  {
    value: 'IT_CFUFF',
    label: i18n.t('documents.tess__ufficiali_c_f_s_'),
  },
  {
    value: 'IT_DESIS',
    label: i18n.t('documents.tess__s_i_s_d_e_'),
  },
  {
    value: 'IT_EIMIL',
    label: i18n.t('documents.tess__militare_e_i_'),
  },
  {
    value: 'IT_EISOT',
    label: i18n.t('documents.tess__sottufficiali_e_i_'),
  },
  {
    value: 'IT_EIUFF',
    label: i18n.t('documents.tess__ufficiali_e_i_'),
  },
  {
    value: 'IT_GFMIL',
    label: i18n.t('documents.tess__app_to_finanziere'),
  },
  {
    value: 'IT_GFSOT',
    label: i18n.t('documents.tess__sott_li_g_d_f_'),
  },
  {
    value: 'IT_GFTRI',
    label: i18n.t('documents.tess__pol__trib__g_d_f_'),
  },
  {
    value: 'IT_GFUFF',
    label: i18n.t('documents.tess__ufficiali_g_d_f_'),
  },
  {
    value: 'IT_MAGIS',
    label: i18n.t('documents.tess__pers__magistrati'),
  },
  {
    value: 'IT_MMMIL',
    label: i18n.t('documents.tess__milit__m_m_'),
  },
  {
    value: 'IT_MMSOT',
    label: i18n.t('documents.tess__sottuficiali_m_m_'),
  },
  {
    value: 'IT_MMUFF',
    label: i18n.t('documents.tess__ufficiali_m_m_'),
  },
  {
    value: 'IT_PARLA',
    label: i18n.t('documents.tess__parlamentari'),
  },
  {
    value: 'IT_PATNA',
    label: i18n.t('documents.patente_nautica'),
  },
  {
    value: 'IT_PORM1',
    label: i18n.t('documents.porto_fucile_uso_caccia'),
  },
  {
    value: 'IT_PORM2',
    label: i18n.t('documents.porto_fucile_dif__person_'),
  },
  {
    value: 'IT_PORM3',
    label: i18n.t('documents.porto_darmi_uso_sportivo'),
  },
  {
    value: 'IT_PORM4',
    label: i18n.t('documents.porto_pistola_dif__person'),
  },
  {
    value: 'IT_PORM5',
    label: i18n.t('documents.porto_darmi_guardie_giur'),
  },
  {
    value: 'IT_PPAGE',
    label: i18n.t('documents.tess__agenti/ass_ti_p_p_'),
  },
  {
    value: 'IT_PPISP',
    label: i18n.t('documents.tess__ispettori_p_p_'),
  },
  {
    value: 'IT_PPSOV',
    label: i18n.t('documents.tess__sovrintendenti_p_p_'),
  },
  {
    value: 'IT_PPUFF',
    label: i18n.t('documents.tess__ufficiali_p_p_'),
  },
  {
    value: 'IT_PSAPP',
    label: i18n.t('documents.tess__agenti/ass_ti_p_s_'),
  },
  {
    value: 'IT_PSFEM',
    label: i18n.t('documents.tess__polizia_femminile'),
  },
  {
    value: 'IT_PSFUN',
    label: i18n.t('documents.tess__funzionari_p_s_'),
  },
  {
    value: 'IT_PSISP',
    label: i18n.t('documents.tess__ispettori_p_s_'),
  },
  {
    value: 'IT_PSSOT',
    label: i18n.t('documents.tess__sovrintendenti_p_s_'),
  },
  {
    value: 'IT_PSUFF',
    label: i18n.t('documents.tess__ufficiali_p_s_'),
  },
  {
    value: 'IT_RIFUG',
    label: i18n.t('documents.titolo_viaggio_rif_polit_'),
  },
  {
    value: 'IT_SDMIL',
    label: i18n.t('documents.tess__milit__truppa_sismi'),
  },
  {
    value: 'IT_SDSOT',
    label: i18n.t('documents.tess__sottufficiali_sismi'),
  },
  {
    value: 'IT_SDUFF',
    label: i18n.t('documents.tess__ufficiali_sismi'),
  },
  {
    value: 'IT_TEAMC',
    label: i18n.t('documents.tess__iscr__albo_med/chi_'),
  },
  {
    value: 'IT_TEAOD',
    label: i18n.t('documents.tess__iscriz__albo_odont_'),
  },
  {
    value: 'IT_TECAM',
    label: i18n.t('documents.tes__unico_per_la_camera'),
  },
  {
    value: 'IT_TECOC',
    label: i18n.t('documents.tess__corte_dei_conti'),
  },
  {
    value: 'IT_TEDOG',
    label: i18n.t('documents.tes__doganale_ril_min_fin_'),
  },
  {
    value: 'IT_TEFSE',
    label: i18n.t('documents.tess__ferrov__senato'),
  },
  {
    value: 'IT_TEMPI',
    label: i18n.t('documents.tess__min_pubb_istruzione'),
  },
  {
    value: 'IT_TENAT',
    label: i18n.t('documents.tess__militare_nato'),
  },
  {
    value: 'IT_TENAV',
    label: i18n.t('documents.tes__ente_naz__assis_volo'),
  },
  {
    value: 'IT_TEPOL',
    label: i18n.t('documents.tess__min_polit_agric_for_'),
  },
  {
    value: 'IT_TESAE',
    label: i18n.t('documents.tess__min__affari_esteri'),
  },
  {
    value: 'IT_TESAR',
    label: i18n.t('documents.tess__iscr_albo_architetti'),
  },
  {
    value: 'IT_TESAV',
    label: i18n.t('documents.tessera_iscr__albo_avvoc_'),
  },
  {
    value: 'IT_TESCA',
    label: i18n.t('documents.tess__corte_dappello'),
  },
  {
    value: 'IT_TESCS',
    label: i18n.t('documents.tess__consiglio_di_stato'),
  },
  {
    value: 'IT_TESDI',
    label: i18n.t('documents.tessera_riconosc__d_i_a_'),
  },
  {
    value: 'IT_TESEA',
    label: i18n.t('documents.tess__membro_equip__aereo'),
  },
  {
    value: 'IT_TESIN',
    label: i18n.t('documents.tess__iscr__albo_ingegneri'),
  },
  {
    value: 'IT_TESLP',
    label: i18n.t('documents.tess__ministero_lavori_pu'),
  },
  {
    value: 'IT_TESMB',
    label: i18n.t('documents.tess__min_ben_e_att_cult_'),
  },
  {
    value: 'IT_TESMD',
    label: i18n.t('documents.tess__ministero_difesa'),
  },
  {
    value: 'IT_TESMF',
    label: i18n.t('documents.tess__ministero_finanze'),
  },
  {
    value: 'IT_TESMG',
    label: i18n.t('documents.tess__ministero_giustizia'),
  },
  {
    value: 'IT_TESMI',
    label: i18n.t('documents.tess__ministero_interno'),
  },
  {
    value: 'IT_TESMN',
    label: i18n.t('documents.tess__minist__trasp/navig'),
  },
  {
    value: 'IT_TESMS',
    label: i18n.t('documents.tess__ministero_sanita'),
  },
  {
    value: 'IT_TESMT',
    label: i18n.t('documents.tess__ministero_tesoro'),
  },
  {
    value: 'IT_TESNO',
    label: i18n.t('documents.tessera_dellordine_notai'),
  },
  {
    value: 'IT_TESOG',
    label: i18n.t('documents.tess__ordine_giornalisti'),
  },
  {
    value: 'IT_TESPC',
    label: i18n.t('documents.tess__pres_za_cons__min_'),
  },
  {
    value: 'IT_TESPI',
    label: i18n.t('documents.tess__pubblica_istruzione'),
  },
  {
    value: 'IT_TESPT',
    label: i18n.t('documents.tes__poste_e_telecomunic_'),
  },
  {
    value: 'IT_TESUN',
    label: i18n.t('documents.tessera_u_n_u_c_i_'),
  },
  {
    value: 'IT_TETEL',
    label: i18n.t('documents.tess__identif_telecom_it_'),
  },
  {
    value: 'IT_TFERD',
    label: i18n.t('documents.tes__ferroviaria_deputati'),
  },
  {
    value: 'IT_TFEXD',
    label: i18n.t('documents.tes__ferrov__ex_deputati'),
  },
  {
    value: 'IT_VIMIL',
    label: i18n.t('documents.tess__app_to/vig__urbano'),
  },
  {
    value: 'IT_VISOT',
    label: i18n.t('documents.tess__sott_li_vig__urbani'),
  },
  {
    value: 'IT_VIUFF',
    label: i18n.t('documents.tess__uff_li_vig_urbani'),
  },
  {
    value: 'IT_VVMIL',
    label: i18n.t('documents.tess__app_to/vig__vv_ff_'),
  },
  {
    value: 'IT_VVSOT',
    label: i18n.t('documents.tess__sottuff_li_vv_ff_'),
  },
  {
    value: 'IT_VVUFF',
    label: i18n.t('documents.tess__ufficiali_vv_ff_'),
  },
];

const allSpanishSpecific = () => [
  ...spanishAllNationalitiesDocuments(),
  {
    value: DOCUMENTS_TYPES.dniES,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.dniES]),
  },
  {
    value: DOCUMENTS_TYPES.drivingLicenseES,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.drivingLicenseES]),
  },
];

const allSpanish = () => [
  ...spanishAllNationalitiesDocuments(),
  {
    value: DOCUMENTS_TYPES.identityCardES,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.identityCardES]),
  },
  {
    value: DOCUMENTS_TYPES.spanishResidencePermitNIE,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.spanishResidencePermitNIE]),
  },
  {
    value: DOCUMENTS_TYPES.spanishResidencePermitEU,
    label: i18n.t(DOCUMENTS_LABELS[DOCUMENTS_TYPES.spanishResidencePermitEU]),
  },
];
const dniValidation = [DOCUMENTS_TYPES.dniES, DOCUMENTS_TYPES.drivingLicenseES];
const nieValidation = [DOCUMENTS_TYPES.spanishResidencePermitNIE];

function getRemappedDocType({
  docType,
  countryCode,
}: {
  docType: string;
  countryCode: string;
}) {
  const REMAPPED_ITALIAN_PASSPORT = 'IT_PASOR';
  const ELECTRONIC_ITALIAN_ID = 'IT_IDELE';
  const FOREIGN_DOC_TYPE = 'ID';
  const REMAPPED_FOREIGN_DOC_TYPE = 'I';
  const RESIDENCE_PERMIT = 'IX';
  const REMAPPED_RESIDENCE_PERMIT = 'X';
  const PORTUGAL_ID = 'PT_B';
  const PORTUGAL_PASSPORT = 'PT_P';
  const SPANISH_RESIDENCE_PERMIT = 'ES_N';
  const PORTUGAL_OTHER_DOCUMENT = 'PT_O';
  const SPANISH_PASSPORT = 'ES_P';
  const ES_DNI_CODE = 'ES_D';

  if (docType === FOREIGN_DOC_TYPE) {
    if (countryCode === COUNTRY_CODES.spain) {
      return ES_DNI_CODE;
    } else if (countryCode === COUNTRY_CODES.italy) {
      return ELECTRONIC_ITALIAN_ID;
    } else if (countryCode === COUNTRY_CODES.portugal) {
      return PORTUGAL_ID;
    } else {
      return REMAPPED_FOREIGN_DOC_TYPE;
    }
  } else if (docType === RESIDENCE_PERMIT) {
    if (countryCode === COUNTRY_CODES.spain) {
      return SPANISH_RESIDENCE_PERMIT;
    } else if (countryCode === COUNTRY_CODES.italy) {
      return ELECTRONIC_ITALIAN_ID;
    } else if (countryCode === COUNTRY_CODES.portugal) {
      return PORTUGAL_OTHER_DOCUMENT;
    } else {
      return REMAPPED_RESIDENCE_PERMIT;
    }
  } else if (docType === passport().value) {
    if (countryCode === COUNTRY_CODES.spain) {
      return SPANISH_PASSPORT;
    } else if (countryCode === COUNTRY_CODES.italy) {
      return REMAPPED_ITALIAN_PASSPORT;
    } else if (countryCode === COUNTRY_CODES.portugal) {
      return PORTUGAL_PASSPORT;
    } else {
      return passport().value;
    }
  } else {
    return docType;
  }
}

function getShouldResetDocTypes(
  nextDocTypes: Array<SelectOption>,
  docType?: SelectOption | null,
) {
  if (docType) {
    return !nextDocTypes.find((t) => {
      return t.value === docType.value;
    });
  }
  return false;
}

function getDocTypes(
  countryCode = '',
  nationality = '',
  residence = '',
  citizenship = '',
) {
  switch (countryCode) {
    case COUNTRY_CODES.portugal: {
      return portugal();
    }
    case COUNTRY_CODES.italy: {
      if (nationality === COUNTRY_CODES.italy) {
        return allItalian();
      }
      return italianAllNationalities();
    }
    case COUNTRY_CODES.spain: {
      if (nationality === COUNTRY_CODES.spain) {
        return allSpanishSpecific();
      }
      return allSpanish();
    }
    case COUNTRY_CODES.czech: {
      if (citizenship === COUNTRY_CODES.czech) {
        return czech();
      }
      if (EU_MEMBERS.includes(String(citizenship))) {
        return czechEU();
      }
      return czechNonEU();
    }
    case COUNTRY_CODES.slovenia: {
      return slovenia();
    }
    case COUNTRY_CODES.greece: {
      if (residence === COUNTRY_CODES.greece) {
        return greece();
      }
      if (EU_MEMBERS.includes(String(residence))) {
        return greeceEU();
      }
      return greeceNonEU();
    }
    case COUNTRY_CODES.uk: {
      if (nationality === COUNTRY_CODES.uk) {
        return greatBritain();
      }
      if (EU_MEMBERS.includes(String(nationality))) {
        return greatBritainEU();
      }
      return greatBritainNonEU();
    }
    case COUNTRY_CODES.austria: {
      return austria();
    }
    case COUNTRY_CODES.colombia: {
      return colombia();
    }
    case COUNTRY_CODES.thailand: {
      if (nationality === COUNTRY_CODES.thailand) {
        return thailand();
      }
      return thailandAllNationalities();
    }
    case COUNTRY_CODES.uae: {
      if (nationality === COUNTRY_CODES.uae) {
        return dubai();
      }
      return dubaiAllNationalities();
    }
    default: {
      return general();
    }
  }
}

type CheckIsDocTypeWithDuplexScan = {
  docType?: DOCUMENTS_TYPES_VALUES;
  nationality?: valueof<typeof COUNTRY_CODES>;
};
function checkIsDocTypeWithDuplexScan({
  docType = '',
  nationality = '',
}: CheckIsDocTypeWithDuplexScan) {
  if (DOC_TYPES_WITH_FRONT_AND_BACK_SIDES_SCAN.includes(docType)) {
    const isIdDocType = Object.values(IDENTITY_CARDS).includes(docType);
    if (nationality === COUNTRY_CODES.romania && isIdDocType) {
      return false;
    }
    return true;
  }
  return false;
}

const docTypes = {
  portugal,
  czech,
  czechEU,
  czechNonEU,
  thailand,
  spanishAllNationalitiesDocuments,
  italianAllNationalities,
  general,
  colombia,
  allItalian,
  allSpanishSpecific,
  allSpanish,
  dniValidation,
  nieValidation,
  passport,
  identityCard,
  types: DOCUMENTS_TYPES,
  labels: DOCUMENTS_LABELS,
};

export {
  getDocTypes,
  getShouldResetDocTypes,
  getRemappedDocType,
  checkIsDocTypeWithDuplexScan,
};
export default docTypes;
