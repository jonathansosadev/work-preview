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
const CHANOINE_CUSTOM_APV = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/CustomApv-Chanoine-lead.json');
const AUTO_DEFI_CUSTOM_APV = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/CustomApv-AutoDefi.json');
const VULCAIN_CUSTOM_APV = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/CustomApv-Vulcain.json');

describe('Test cross leads incoming emails', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
  });

  it('Test cross leads incoming emails for CustomVo/ChanoineApv', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CHANOINE_CUSTOM_APV);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'florenceazard@yahoo.com',
      '+33683562376',
      undefined,
      'Service: Révision\nDate du Rendez-vous: 2021-08-05\nHeure du Rendez-vous: 10:00\nSolution de mobilité: NC\nInformations supplémentaires: NC',
      'Florence Azard',
      undefined,
      undefined,
      undefined,
      'CustomApv/ChanoineApv',
      undefined,
      undefined,
      'Dacia Sandro stepway',
      'FK391HN',
      '30000',
    ]);
  });

  it('Test cross leads incoming emails for CustomApv/AutoDefiApv', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), AUTO_DEFI_CUSTOM_APV);
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
        "Avez-vous besoin d'un véhicule de remplacement: Non\n" +
        'PREFERRED_DATE: 26 Nov 2021\n' +
        'Preferred time: 15h00m\n' +
        'Prestation choisie: Pneumatiques\n' +
        '--- Informations client ---\n' +
        'Informations complémentaires: Type de véhicule: UTLTS ,N° immatriculation:AA-0000-AA,\n' +
        'Commentaires: LEAD CUSTEED\n' +
        '--- Informations référence ---\n' +
        'Provenance: https://www.autodefi.com/atelier-fr-fr.htm\n' +
        'Date de rendez-vous: 11/26/2021\n' +
        'Heure de rendez-vous: 15h00m\n' +
        'Google Référé: Non\n',
      'JUSTIN DEBOVES',
      undefined,
      undefined,
      undefined,
      'CustomApv/AutoDefiApv',
    ]);
  });

  it('Test cross leads incoming emails for CustomApv/VulcainApv', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), VULCAIN_CUSTOM_APV);
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
Commentaires: Révision annuelle
--- Informations du véhicule ---
Date préférée: 21/03/2022
Heure préférée: 14h00m
Prestation choisie: Révision
--- Informations référence ---
Provenance: https://www.kia-lyon.com/atelier-fr-fr.htm`,
      'Jean Custeed',
      undefined,
      undefined,
      undefined,
      'CustomApv/VulcainApv',
    ]);
  });
});
