/**
 * New Email to parse ?
 * COPY / PASTE the json "incomingCrossLeads" into common/lib/garagescore/cross-leads/examples/{sourceType}/X.json
 * Then import it here : const {SOURCE_TYPE}_X = require('../../../common/lib/garagescore/cross-leads/examples/{sourceType}/X.json');
 * Remove all dates (.json doesn't support it) AND replace "_id" by "externalId" AND change the status to "New"
 * Then do your test on it ! using https://regex101.com/, and https://codebeautify.org/htmlviewer/ to see the html content
 */

const TestApp = require('../../../common/lib/test/test-app');
const app = new TestApp();
const crossLeadsIncomingEmail = require('../../../workers/jobs/scripts/cross-leads-incoming-email.js');
const { generateMockIncomingEmail, incomingEmailCustomExpect } = require('./_utils')(app);
const CHANOINE_CUSTOM_VO = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-Chanoine-lead.json');
const CHANOINE_CUSTOM_VO_CUSTOM_SEARCH = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-Chanoine-lead-custom-search.json');
const AUTO_DEFI_CUSTOM_VO = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-AutoDefi.json');
const VULCAIN_CUSTOM_VO = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-Vulcain.json');
describe('Test cross leads incoming emails', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Test cross leads incoming emails for CustomVo/ChanoineVo', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CHANOINE_CUSTOM_VO);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'christophe.bourdon77@sfr.fr',
      '+33612273386',
      'https://chanoine.fr/voiture-occasion/Renault-TALISMAN-dCi+160+Energy+EDC+Initiale+Paris-a238522422',
      'Bonjour la talisman initiale 160ch a 13450euros est-elle encore disponible svp',
      'Christophe Bourdon',
      undefined,
      undefined,
      undefined,
      'CustomVo/ChanoineVo',
    ]);
  });

  it('Test cross leads incoming emails for CustomVo/ChanoineVoCustomSearch', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CHANOINE_CUSTOM_VO_CUSTOM_SEARCH);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'rb@custeed.com',
      '+33634187168',
      undefined,
      'Année minimum: 2010\nKilométrage maximum: NC\nCouleur extérieur: Blanche\nCouleur intérieur: NC\nOptions: Jantes carbones\n\nMessage: Ceci est un test de la société Custeed dans le cadre de notre partenariat.',
      'Test Custeed Ne pas rappeler',
      'Renault / Megane / RS Trophy R / RS Trophy R',
      undefined,
      undefined,
      'CustomVo/ChanoineVoCustomSearch',
      0,
      'fuel',
    ]);
  });

  it('Test cross leads incoming emails for CustomVo/AutoDefiVo', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), AUTO_DEFI_CUSTOM_VO);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'autodefi-fake@gmail.com',
      '+33701010101',
      undefined,
      '--- Informations Distributeur ---\n' +
        'Adresse Url du site Internet: www.synergie-automobile-lescar.com\n' +
        'Nom du distributeur: Ford Lescar\n' +
        'Lieu: Rue Jean Jaures\n' +
        '--- Informations du véhicule ---\n' +
        "Niveau d'intérêt: buy\n" +
        "Numéro d'immatriculation: AA001AA\n" +
        'Kms: 4500\n' +
        'N ° de série: SNSNSNSNSNSNSNSN\n' +
        'Année: 2021\n' +
        'Type de véhicule: Occasion , Véhicule Particulier\n' +
        'Carrosserie: Tout-Terrain\n' +
        'Transmission: 1 Automate à fonct. Continu\n' +
        'Energie: Courant électrique\n' +
        "Date d'inscription: 2021-10-19\n" +
        '--- Informations client ---\n' +
        'Code postal: 40360\n' +
        '--- Informations référence ---\n' +
        'Provenance: https://www.autodefi.com/stock/occasion-2021-seres-seres-3-seres-3-luxury-2732696-fr-fr.htm\n' +
        'Source Listing Url: https://www.autodefi.com/voitures-occasions-fr-fr.htm\n' +
        'Google Référé: Non\n',
      'JUSTIN DEBOVES',
      'SERES - SERES 3 - Seres 3 Luxury',
      undefined,
      undefined,
      'CustomVo/AutoDefiVo',
    ]);
  });

  it('Test cross leads incoming emails for CustomVo/VulcainVo', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), VULCAIN_CUSTOM_VO);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'fake-vulcain@gmail.com',
      '+33607080807',
      undefined,
      `--- Informations Distributeur ---
Url: www.kia-lyon.com
Nom:Kia Lyon
Lieu: Lyon Elite Motors Kia Vénissieux - 51 rue Roger Salengro
--- Informations client ---
--- Informations du véhicule ---
--- Informations référence ---`,
      'Custeed',
      undefined,
      undefined,
      undefined,
      'CustomVo/VulcainVo',
    ]);
  });
});
