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
const CHANOINE_CUSTOM_VN = require('../../../common/lib/garagescore/cross-leads/examples/CustomVn/CustomVn-Chanoine-lead.json');
const AUTO_DEFI_CUSTOM_VN = require('../../../common/lib/garagescore/cross-leads/examples/CustomVn/CustomVn-AutoDefi.json');
const VULCAIN_CUSTOM_VN = require('../../../common/lib/garagescore/cross-leads/examples/CustomVn/CustomVn-Vulcain.json');

describe('Test cross leads incoming emails', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Test cross leads incoming emails for CustomVn/ChanoineVn', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CHANOINE_CUSTOM_VN);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'rbourbilieres@custeed.com',
      '+33634187168',
      'https://chanoine.fr/catalogue-voiture-neuve/gamme-renault/clio-e-tech-hybride',
      'La demande concerne: Un essai\nSouhaite être recontacté: 2021-09-21T17:00\nPréférence de contact: E-mail',
      'TEST CUSTEED NE PAS ME RAPPELER',
      'clio-e-tech-hybride',
      undefined,
      undefined,
      'CustomVn/ChanoineVn',
    ]);
  });

  it('Test cross leads incoming emails for CustomVn/AutoDefiVn', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), AUTO_DEFI_CUSTOM_VN);
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
        "Niveau d'intérêt: Buy\n" +
        'Année: 2017\n' +
        'Type de véhicule: Neuf\n' +
        'Carrosserie: Coupe\n' +
        '--- Informations client ---\n' +
        'Code postal: 40360\n' +
        '--- Informations référence ---\n' +
        'Provenance: https://www.autodefi.com/toolkit/ford-ford-gt-fr-fr.htm\n' +
        'Google Référé: Non\n',
      'JUSTIN DEBOVES',
      'Ford - Ford GT',
      undefined,
      undefined,
      'CustomVn/AutoDefiVn',
    ]);
  });

  it('Test cross leads incoming emails for CustomVn/VulcainVn', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), VULCAIN_CUSTOM_VN);
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
Code postal: 69230
Commentaires: Pour un essai e Niro elec samedi matin svp
--- Informations du véhicule ---
Niveau d'intérêt: Buy
Année: 2022
Type de véhicule: Neuf
--- Informations référence ---
Provenance: https://www.kia-lyon.com/promotions-kia-e-niro-electrique-%C3%A0-partir-de-167%E2%82%ACmois-32800-fr-fr.htm`,
      'Jean Custeed',
      'kia - e-Niro',
      undefined,
      undefined,
      'CustomVn/VulcainVn',
    ]);
  });
});
