/**
 * New Email to parse ?
 * COPY / PASTE the json "incomingCrossLeads" into common/lib/garagescore/cross-leads/examples/{sourceType}/X.json
 * Then import it here : const {SOURCE_TYPE}_X = require('../../../common/lib/garagescore/cross-leads/examples/{sourceType}/X.json');
 * Remove all dates (.json doesn't support it) AND replace "_id" by "externalId" AND change the status to "New"
 * Then do your test on it ! using https://regex101.com/, and https://codebeautify.org/htmlviewer/ to see the html content
 */
const chai = require('chai');
const decodeEntity = require('parse-entities');
const crypto = require('crypto');
const { promisify } = require('util');
const TestApp = require('../../../common/lib/test/test-app');
const app = new TestApp();
const { incomingEmailCustomExpect, generateMockIncomingEmail, generateMockIncomingCall, routine } = require('./_utils')(
  app
);
const crossLeadsIncomingEmail = require('../../../workers/jobs/scripts/cross-leads-incoming-email.js');
const crossLeadsIncomingCall = require('../../../workers/jobs/scripts/cross-leads-incoming-call.js');
const crossLeadsSendSelfAssignReminder = require('../../../workers/jobs/scripts/cross-leads-send-self-assign-reminder.js');
const { LaCentrale, Common } = require('../../../common/lib/garagescore/cross-leads/parser.js');
const handleIncomingEmail = require('../../../common/lib/garagescore/cross-leads/handle-incoming-email.js');
const _sendQueryAs = require('../../apollo/_send-query-as');

// Enums
const { ContactTypes, TicketActionNames, JobTypes } = require('../../../frontend/utils/enumV2');
const SourceTypes = require('../../../common/models/data/type/source-types.js');
const SourceBy = require('../../../common/models/data/type/source-by.js');
const IncomingCrossLeadsStatus = require('../../../common/models/incoming-cross-leads.status.js');
const LeadTimings = require('../../../common/models/data/type/lead-timings.js');
const KpiTypes = require('../../../common/models/kpi-type.js');

// Email samples
const LA_CENTRALE = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale.json');
const LA_CENTRALE_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-1.json');
const LA_CENTRALE_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-2.json');
const LA_CENTRALE_LEAD_3 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-3.json');
const LA_CENTRALE_LEAD_4 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-updated-email-format-and-phone-with-dots.json');
const LA_CENTRALE_LEAD_5 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-updated-email-format-and-phone-with-prefix.json');
const LA_CENTRALE_LEAD_6 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-updated-name-format.json');
const LA_CENTRALE_LEAD_VITRINE_1 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-vitrine-1.json');
const LA_CENTRALE_LEAD_VITRINE_2 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-vitrine-2.json');
const LA_CENTRALE_LEAD_VITRINE_3 = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-vitrine-3.json');
const LA_CENTRALE_RAPPORT_APPELS_MANQUE = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/rapport-appels-manque.json');
const LA_CENTRALE_LARGUS_MATCH_FAIL = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale/lead-largus-match-fail.json');
const L_ARGUS = require('../../../common/lib/garagescore/cross-leads/examples/Largus.json');
const L_ARGUS_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/Largus/lead-1.json');
const L_ARGUS_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/Largus/lead-2.json');
const PARU_VENDU = require('../../../common/lib/garagescore/cross-leads/examples/ParuVendu.json');
const PARU_VENDU_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/ParuVendu/lead-1.json');
const PARU_VENDU_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/ParuVendu/lead-2.json');
const OUEST_FRANCE_AUTO = require('../../../common/lib/garagescore/cross-leads/examples/OuestFranceAuto.json');
const OUEST_FRANCE_AUTO_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/OuestFranceAuto/lead-1.json');
const OUEST_FRANCE_AUTO_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/OuestFranceAuto/lead-2.json');
const OUESTFRANCE_LEAD_WITHOUT_PHONE = require('../../../common/lib/garagescore/cross-leads/examples/OuestFranceAuto/lead-without-phone.json');
const OUESTFRANCE_LEAD_WITHOUT_BODY = require('../../../common/lib/garagescore/cross-leads/examples/OuestFranceAuto/lead-without-body-html.json');
const CUSTOM_VO_MOTOR_K = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/MotorK.json');
const CUSTOM_VO_MOTOR_K_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/MotorK-lead-1.json');
const CUSTOM_VO_MOTOR_K_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/MotorK-lead-2.json');
const CUSTOM_VO_AUTOTHIVOLLE = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/AutoThivolles.json');
const CUSTOM_VO_AUTOTHIVOLLE_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/AutoThivolles-lead-1.json');
const CUSTOM_VO_AUTOTHIVOLLE_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/AutoThivolles-lead-2.json');
const CUSTOM_VO_AUTOTHIVOLLE_LEAD_3 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/AutoThivolles-lead-3.json');
const ZOOMCAR = require('../../../common/lib/garagescore/cross-leads/examples/Zoomcar.json');
const ZOOMCAR_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/Zoomcar/lead-1.json');
const ZOOMCAR_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/Zoomcar/lead-2-without-ref.json');
const { getTestEmailFromInput, getTestPhoneFromInput } = require('../../../common/lib/garagescore/cross-leads/util');
const LA_CENTRALE_FILTER_TEST = require('../../../common/lib/garagescore/cross-leads/examples/LaCentrale_filter_test.json');
const { getFilters, insertFilters, removeFilters } = require('../../../server/routes/backoffice/xLeadsFilters');
const CUSTOM_VO_ALHENA_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-Alhena-lead-1');
const CUSTOM_VO_ALHENA_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-Alhena-lead-2-with-vehicule-plate.json');
const CUSTOM_VO_ALHENA_LEAD_WITH_2_PHONES = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-Alhena-lead-with-2-phones.json');
const CUSTOM_APV_ALHENA_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/CustomApv-Alhena-lead-1.json');
const CUSTOM_APV_ALHENA_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/CustomApv-Alhena-lead-2.json');
const CUSTOM_APV_ALHENA_LEAD_3 = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/CustomApv-Alhena-lead-3-without-first-name.json');
const CUSTOM_APV_ALHENA_LEAD_DOUBLE_PHONE = require('../../../common/lib/garagescore/cross-leads/examples/CustomApv/Alhena-lead-double-phone.json');
const CUSTOM_VN_ALHENA_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVn/CustomVn-Alhena-lead-1.json');
const CUSTOM_VN_SNDIFFUSION_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVn/CustomVn-SnDiffusion-lead-1.json');
const CUSTOM_VN_SNDIFFUSION_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVn/CustomVn-SnDiffusion-lead-2.json');
const CUSTOM_VO_SNDIFFUSION_LEAD_1 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-SnDiffusion-lead-1.json');
const CUSTOM_VO_SNDIFFUSION_LEAD_2 = require('../../../common/lib/garagescore/cross-leads/examples/CustomVo/CustomVo-SnDiffusion-lead-2.json');
const EKONSILIO_VO = require('../../../common/lib/garagescore/cross-leads/examples/Ekonsilio/lead-vo.json');
const EKONSILIO_VN = require('../../../common/lib/garagescore/cross-leads/examples/Ekonsilio/lead-vn.json');
const EKONSILIO_VN_WITHOUT_FIRSTNAME = require('../../../common/lib/garagescore/cross-leads/examples/Ekonsilio/leads-vn-without-firstname.json');
const { expect } = chai;

/**
 * New Email to parse ?
 * COPY / PASTE the json "incomingCrossLeads" into common/lib/garagescore/cross-leads/examples/{sourceType}/lead-X.json
 * Then import it here : const {SOURCE_TYPE}_X = require('../../../common/lib/garagescore/cross-leads/examples/{sourceType}/X.json');
 * Remove all dates (.json doesn't support it) AND REPLACE "_id" by "externalId"
 * Then do your test on it ! using https://regex101.com/, and https://codebeautify.org/htmlviewer/ to see the html content
 */

describe('Test cross leads incoming emails', () => {
  beforeEach(async function beforeEach() {
    await app.reset();
    await app.models.Configuration.create({
      reserved_field_name: 'XLeadsFilters',
      xLeadsFilters: {
        emails: [
          null,
          'agent',
          { value: 'banane verte', enabled: true },
          { value: 'rdebrito@custeed.com', enabled: true },
          { value: 'bbodrefaux@garagescore.com', enabled: true },
        ],
        phones: [
          null,
          'n° 47',
          { value: '0604654053', enabled: true },
          { value: '0603875692', enabled: true },
          { value: '0033603875692', enabled: true },
          { value: '0033699999999', enabled: false },
        ],
      },
    });
  });
  it('Test decodeEntity for special characters', function test(done) {
    const text = 'My email is &#66;ob&#52;&#45;&#54;&#57;.bob.com. &#182;&#61;3.1415&euro; &Ecirc;TRE moi';
    const result = decodeEntity(text);
    expect(result).equal('My email is Bob4-69.bob.com. ¶=3.1415€ ÊTRE moi');
    done();
  });
  it('Test isSourceEnabled', async function test() {
    // should fail until all parser are done.

    const garage = await app.addGarage();
    const garage2 = await app.addGarage({
      crossLeadsConfig: {
        sources: [
          {
            enabled: false,
            type: 'LeBonCoin',
            followed_email: 'keysim.fr@gmail.com',
            followed_phones: ['+33621982935'],
          },
        ],
      },
    });
    expect(await app.models.Garage.isSourceEnabled(garage.id, 'LeBonCoin')).equal(true);
    expect(await app.models.Garage.isSourceEnabled(garage2.id, 'LeBonCoin')).equal(false);
  });
  it('Should create only one ticket for both call and email', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    await crossLeadsIncomingEmail({ payload: { emailId: email.id.toString() } });
    const [leadEmail, shouldBeUndefined] = await garage.datas();
    expect(shouldBeUndefined, 'shouldBeUndefined').to.be.undefined;
    expect(leadEmail.get('leadTicket.actions').length).equal(2);
    expect(leadEmail.get('leadTicket.actions')[1].name).equal(TicketActionNames.INCOMING_EMAIL);
    const call = await generateMockIncomingCall(
      garage.id.toString(),
      'LaCentrale',
      { calling: '0033766711636' },
      false
    );
    await crossLeadsIncomingCall({ payload: { callId: call.id.toString() } });
    const [leadEmailAndPhone, shouldBeUndefinedAgain] = await garage.datas();
    expect(shouldBeUndefinedAgain, 'shouldBeUndefinedAgain').to.be.undefined;
    expect(leadEmailAndPhone.get('leadTicket.actions').length).equal(3);
    expect(leadEmailAndPhone.get('leadTicket.actions')[1].name).equal(TicketActionNames.INCOMING_EMAIL);
    expect(leadEmailAndPhone.get('leadTicket.actions')[2].name).equal(TicketActionNames.INCOMING_CALL);
  });
  it('Incoming emails: Parsing LA_CENTRALE', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const datas = await garage.datas();
    expect(datas.length).equal(1);
    const data = datas[0];
    incomingEmailCustomExpect(data, [
      'hai.li200888@gmail.com',
      '+33766711636',
      'https://www.lacentrale.fr/auto-occasion-annonce-69105644463.html',
      "Bonjour,\nJe suis intéressé par votre Toyota Yaris Iii hybrid 100h dynamic 5p à 9 490€.\nPourrions-nous convenir d'un rendez-vous pour voir le véhicule le 7/02/2020 ?\nCordialement",
      'LI',
      'TOYOTA YARIS III HYBRID 100H DYNAMIC 5P',
      'E105644463',
      'M',
      'LaCentraleVo',
    ]);
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_1', async function test() {
    const data = await routine(LA_CENTRALE_LEAD_1);
    incomingEmailCustomExpect(data, [
      'pierre.enguehard.60240@gmail.com',
      '+33613134115',
      'https://www.lacentrale.fr/auto-occasion-annonce-69106198267.html',
      'bonjour . \n' + '\n' + 'le véhicule est-il disponible pour passer le voir demain ? \n' + '\n' + 'merci .',
      'pierre enguehard',
      'VOLKSWAGEN TOURAN III 1.5 TSI 150 EVO BLUEMOTION TECHNOLOGY CONNECT DSG7 7PL',
      'E106198267',
      'M',
      'LaCentraleVo',
    ]);
  });
  it('Incoming emails: Parsing xml LA_CENTRALE_LEAD_2', async function test() {
    const data = await routine(LA_CENTRALE_LEAD_2);
    incomingEmailCustomExpect(data, [
      'mickael.lebarbu@gmail.com',
      '+33677500875',
      'https://www.lacentrale.fr/auto-occasion-annonce-69107480127.html',
      '- Bonjour,\n' +
        '\n' +
        'ce véhicule est il hybride rechargeable? est il éligible à la prime à la conversion? \n' +
        'Merci pour votre reponse \n' +
        '\n' +
        '\n' +
        'Contact:\n' +
        '- Le Barbu Mickaël \n' +
        '- mickael.lebarbu@gmail.com \n' +
        '- 0677500875 \n' +
        '\n' +
        'ref: E107480127',
      'Le Barbu Mickaël',
      'SEAT LEON IV ST 1.5 ETSI 150 H S&S FR ONE DSG',
      'E107480127',
      undefined,
      'LaCentraleVo/xml',
    ]);
    expect(data.leadTicket.sourceSubtype).equal('LaCentraleVo/xml');
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_3', async function test() {
    const data = await routine(LA_CENTRALE_LEAD_3);
    incomingEmailCustomExpect(data, [
      'ol.delforge@gmail.com',
      '+33685710746',
      'https://www.lacentrale.fr/auto-occasion-annonce-69107474503.html',
      'Message de  DELFORGE    Bonjour,\n' +
        "Ma femme et moi sommes intéressés par l'essai de la SEAT IBIZA pour un achat éventuel ? N'étant pas disponible avant samedi, nous avons pris RDV pour samedi à 10H; Pour cette rencontre , je souhaiterais avoir quelques infos :\n" +
        '- Carnet entretien ?, prochain contrôle technique?  + seriez vous successible de faire une reprise sur notre véhicule SEAT TOLEDO TDI 115CH année 2004 , 306 000Km compteur ?\n' +
        "Afin d'avancer dans nos démarches auprès de notre assureur et banquier , pourriez vous nous transmettre la fiche technique de la voiture ?\n" +
        'En attente de vous rencontrer,\n' +
        'Bien Cordialement,\n' +
        'Mr DELFORGE Olivier ( 06 85 71 07 46  )\n' +
        'ref: E107474503',
      'DELFORGE',
      'SEAT IBIZA IV (2) 1.2 TSI 90 STYLE',
      'E107474503',
      undefined,
      'LaCentraleVo/NewFormat',
    ]);
    expect(data.leadTicket.sourceSubtype).equal('LaCentraleVo/NewFormat');
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_4', async function test() {
    // check phone number 06.17.13.08.46 -> +33617130846
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE_LEAD_4);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      '23ef9528-e88a-5f07-bf06-0fd52b578e2c@messagerie.lacentrale.fr',
      '+33617130846',
      'https://www.lacentrale.fr/auto-occasion-annonce-69107655009.html',
      'Message de  GALBES    Bonjour,\n' +
        "Ce véhicule est-il toujours disponible ?  S'il l'est, pourriez-vous me dire dans quel état se trouve la carrosserie ainsi que l'intérieur  (rayures, chocs, tâches...) ?\n" +
        'Avez-vous la possibilité de livré ce véhicule à Auxerre et si oui, à quel prix ?\n' +
        'Cordialement\n' +
        'Christel GALBES\n' +
        'ref: E107655009',
      'GALBES',
      'VOLKSWAGEN COCCINELLE CABRIOLET 1.2 TSI 105 BLUEMOTION TECHNOLOGY VINTAGE DSG7',
      'E107655009',
      undefined,
      'LaCentraleVo/NewFormat',
    ]);
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_5', async function test() {
    // check phone number +33646493994 -> +33646493994
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE_LEAD_5);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      '60055373-7e0e-523f-aba2-0dced6f4ae56@messagerie.lacentrale.fr',
      '+33646493994',
      'https://www.lacentrale.fr/auto-occasion-annonce-69107923106.html',
      'Message de  Maxime Melloul    Bonjour,\n' +
        'Je suis intéressé par votre Toyota C-hr 1.8 hybride 122 dynamic à 17 990€.\n' +
        'Le véhicule est-il toujours disponible ? \n' +
        'Cordialement\n' +
        'ref: E107923106',
      'Maxime Melloul',
      'TOYOTA C HR 1.8 HYBRIDE 122 DYNAMIC',
      'E107923106',
      undefined,
      'LaCentraleVo/NewFormat',
    ]);
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_6', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE_LEAD_6);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'fe7d7cf5-bb9a-599d-8908-419e21f4186b@messagerie.lacentrale.fr',
      undefined,
      undefined,
      'Bonjours je me permet de prendre les devant et de vous envoyer ce mail j’ai vue une offre d’emploi de préparateur de véhicule pour la quel j’ai postuler sur indeed j’ai déjà de l’expérience dans ce domaine, j’espère que vous la tiendrai en compte merci beaucoup bonne journée .',
      'Laroui',
      undefined,
      undefined,
      undefined,
      'LaCentraleVo/NewFormat',
    ]);
  });
  it('Incoming emails check download Attachments LA_CENTRALE_LEAD_2', async function test() {
    // tips: put a wrong url and he always dowload the same message: 'Attachment not found'
    const testEmail = JSON.parse(JSON.stringify(LA_CENTRALE_LEAD_2));
    const newReq = {
      body: {
        isATest: true,
        ...testEmail.raw,
      },
    };
    await handleIncomingEmail(newReq);
    const incomingEmails = await app.models.IncomingCrossLead.findOne();

    expect(incomingEmails.payload.attachments[0].buffer._bsontype).equal('Binary');
    expect(incomingEmails.payload.attachments.length).equal(1);
    expect(incomingEmails.payload.attachments[0].url).equal(
      'https://storage.eu.mailgun.net/v3/domains/discuss.garagescore.com/messages/AgEFwuGwcLOp2AF0z-9N1bD8b41l2HiUZA==/attachments/1'
    );
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_VITRINE_1', async function test() {
    const data = await routine(LA_CENTRALE_LEAD_VITRINE_1);
    incomingEmailCustomExpect(data, [
      'stef44nantes@gmail.com',
      '+33669677936',
      'https://www.lacentrale.fr/auto-occasion-annonce-69106660354.html',
      "Bonjour,\nje souhaiterai savoir si la voiture correspondant à l'annonce ci-dessous est toujours à vendre\n\nRéf. pro : bm56c2_214020 | Réf. annonce : E106660354\n\nMerci d'avance de votre retour\nCordialement\nWAROUX Stephan", // eslint-disable-line
      'WAROUX STEPHAN',
      'BMW SERIE 1 F20 5 PORTES',
      'E106660354',
      'F',
      'LaCentraleVo/Vitrine',
    ]);
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_VITRINE_2', async function test() {
    const data = await routine(LA_CENTRALE_LEAD_VITRINE_2);
    incomingEmailCustomExpect(data, [
      'clement.vb.ferrer@free.fr',
      '+33769965999',
      'https://www.lacentrale.fr/auto-occasion-annonce-69106757071.html',
      'Bonjour, si la voiture est bien à 100 euros et est roulante, je peux venir la chercher dans la journée. \nPouvez vous me contactez ?\nCordialement,\n\nFERRER Clément', // eslint-disable-line
      'FERRER Clément',
      'VOLKSWAGEN POLO 3',
      'E106757071',
      'M',
      'LaCentraleVo/Vitrine',
    ]);
  });
  it('Incoming emails: Parsing LA_CENTRALE_LEAD_VITRINE_3', async function test() {
    const data = await routine(LA_CENTRALE_LEAD_VITRINE_3);
    incomingEmailCustomExpect(data, [
      'rdebrito@garagescore.com',
      undefined,
      'https://www.lacentrale.fr/auto-occasion-annonce-6918623845.html',
      'CECI EST UN TEST',
      'CUSTEED',
      'RENAULT KADJAR',
      'E18623845',
      'F',
      'LaCentraleVo/Vitrine',
    ]);
  });
  it('Incoming emails: Parsing L_ARGUS', async function test() {
    const data = await routine(L_ARGUS);
    incomingEmailCustomExpect(data, [
      'Arbaa.sabrina@live.fr',
      '+33646781229',
      'https://pro.largus.fr/login/',
      "Un client est intéressé par l'une de vos annonces diffusées sur les sites de la Galaxie Argus (incluant la Marketplace Facebook).\n" +
        '\n' +
        'Veuillez trouver également plus d’informations :\n' +
        '\tLe véhicule concerné est : VOLKSWAGEN Touran 1.6 TDI 115ch FAP IQ.Drive 7 places Euro6d-T (FJ-720-AE)\n' +
        '\tID du véhicule : Spg-540bf073-ce95-4a45-8bc4-ab433c0f49e7\n' +
        '\tType de carburant: DIESEL\n' +
        '\tCouleur du véhicule : REFLET D ARGENT\n' +
        '\tAnnée du véhicule : 2019',
      'Sabrina Grira',
      'VOLKSWAGEN Touran 1.6 TDI 115ch FAP IQ.Drive 7 places Euro6d-T (FJ-720-AE)',
      undefined,
      undefined,
      'LargusVo',
    ]);
    expect(data.get('leadTicket.energyType')[0]).equal('diesel');
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(24490);
    expect(data.get('leadTicket.parsedRawData.0.vehicleId')).equal('Spg-540bf073-ce95-4a45-8bc4-ab433c0f49e7');
    expect(data.get('leadTicket.parsedRawData.0.vehicleEnergy')).equal('DIESEL');
    expect(data.get('leadTicket.parsedRawData.0.vehicleColor')).equal('REFLET D ARGENT');
    expect(data.get('leadTicket.parsedRawData.0.vehicleYear')).equal('2019');
    expect(data.get('leadTicket.parsedRawData.0.vehicleRegistrationPlate')).equal('FJ-720-AE');
  });
  it('Incoming emails: Parsing L_ARGUS_LEAD_1', async function test() {
    const data = await routine(L_ARGUS_LEAD_1);
    incomingEmailCustomExpect(data, [
      undefined,
      '+33787849727',
      'https://pro.largus.fr/login/',
      "Un client est intéressé par l'une de vos annonces diffusées sur les sites de la Galaxie Argus (incluant la Marketplace Facebook).\n" +
        '\n' +
        'Veuillez trouver également plus d’informations :\n' +
        '\tLe véhicule concerné est : VOLKSWAGEN Tiguan 2.0 TDI 150ch BlueMotion Technology FAP Lounge (EA-181-QP)\n' +
        '\tID du véhicule : Spg-68534bd5-26e0-4aa9-bd3c-940dd5362c3d\n' +
        '\tType de carburant: DIESEL\n' +
        '\tCouleur du véhicule : BLANC\n' +
        '\tAnnée du véhicule : 2016',
      'Denis Desquilbet',
      'VOLKSWAGEN Tiguan 2.0 TDI 150ch BlueMotion Technology FAP Lounge (EA-181-QP)',
      undefined,
      undefined,
      'LargusVo',
    ]);
    expect(data.get('leadTicket.energyType')[0]).equal('diesel');
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(17390);
    expect(data.get('leadTicket.parsedRawData.0.vehicleId')).equal('Spg-68534bd5-26e0-4aa9-bd3c-940dd5362c3d');
    expect(data.get('leadTicket.parsedRawData.0.vehicleEnergy')).equal('DIESEL');
    expect(data.get('leadTicket.parsedRawData.0.vehicleColor')).equal('BLANC');
    expect(data.get('leadTicket.parsedRawData.0.vehicleYear')).equal('2016');
  });
  it('Incoming emails: Parsing L_ARGUS_LEAD_2 without energy type', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), L_ARGUS_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'essalmourad@hotmail.com',
      undefined,
      'https://pro.largus.fr/login/',
      "Un client est intéressé par l'une de vos annonces diffusées sur les sites de la Galaxie Argus (incluant la Marketplace Facebook).\n" +
        '\n' +
        'Veuillez trouver également plus d’informations :\n' +
        '\tLe véhicule concerné est : AUDI A3 Sportback 35 TDI 150ch S line S tronic 7 Euro6d-T (FE-921-BZ)\n' +
        '\tID du véhicule : Spg-ba026201-a2cf-4337-8909-e294f6a21a22\n' +
        '\tType de carburant: GAZOLINE\n' +
        '\tCouleur du véhicule : BLANC IBIS\n' +
        '\tAnnée du véhicule : 2019',
      'Bn Fth Mourad',
      'AUDI A3 Sportback 35 TDI 150ch S line S tronic 7 Euro6d-T (FE-921-BZ)',
      undefined,
      undefined,
      'LargusVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(28900);
    expect(data.get('leadTicket.energyType')).equal(undefined);
  });
  it('Incoming emails: Parsing PARU_VENDU', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), PARU_VENDU);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'happyly_2006@hotmail.com',
      '+33651917517',
      'https://www.paruvendu.fr/a/voiture-occasion/volkswagen/polo/1244846126A1KVVOVWPOL',
      "Bonjour, je suis intéressé par l'annonce Volkswagen Polo à 8 990 , pouvez-vous me recontacter ?",
      'M  MUTLU AKYOLLU',
      'Volkswagen Polo 1.6 TDI 90 CR FAP Série Spéciale Match II DSG7  Berline - Diesel - Année 2014 - 77 872 km - 91940 Les Ulis',
      'VO111129',
      undefined,
      'ParuVenduVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(8990);
  });
  it('Incoming emails: Parsing PARU_VENDU_LEAD_1', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), PARU_VENDU_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'carine.bourlon@gmail.com',
      '+33635145016',
      'https://www.paruvendu.fr/a/voiture-occasion/renault/twingo-iii/1242556668A1KVVORETW3',
      'Bonjour, votre annonce référence : VO110993 "RENAULT TWINGO III - Twingo III 1.0 SCe 70 E6C Life" m\'intéresse, merci de me recontacter aux coordonnées indiquées.',
      'Carine BOURLON',
      'Renault Twingo III 1.0 SCe 70 BC Life  Berline - Essence - Année 2018 - 20 063 km - 91940 Les Ulis',
      'VO110993',
      undefined,
      'ParuVenduVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(8390);
  });
  it('Incoming emails: Parsing PARU_VENDU_LEAD_2', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), PARU_VENDU_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'jadallap6@gmail.com',
      '+33768394762',
      'https://www.paruvendu.fr/a/voiture-occasion/volkswagen/polo/1244846126A1KVVOVWPOL',
      'Bonjour, je suis intéressé par votre véhicule VOLKSWAGEN Polo de 2014 à 8 990, merci de me recontacter.',
      'M Philip JADALLA',
      'Volkswagen Polo 1.6 TDI 90 CR FAP Série Spéciale Match II DSG7  Berline - Diesel - Année 2014 - 77 872 km - 91940 Les Ulis',
      'VO111129',
      undefined,
      'ParuVenduVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(8990);
  });

  it('Incoming emails: Parsing CUSTOM_VO_MOTOR_K', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_MOTOR_K);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'marine.ollivier-lestre@groupe-altair.fr',
      '+33623757741',
      'https://www.losangeautos.fr/voitures/occasion/les-ulis/renault/twingo/essence/iii-iii-1-0-sce-70-e6c-life/104336/',
      'TEST\nref: 104336 Renault Twingo',
      'Marine OLLIVIER-LESTRE',
      'Renault Twingo III III 1.0 SCe 70 E6C Life',
      '104336',
      undefined,
      'CustomVo/MotorK',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehicleBrand')).equal('Renault');
    expect(data.get('leadTicket.parsedRawData.0.vehicleModel')).equal('Twingo');
    expect(data.get('leadTicket.parsedRawData.0.vehicleInterior')).equal('III III 1.0 SCe 70 E6C Life');
    expect(data.get('leadTicket.parsedRawData.0.vehicleRegistrationPlate')).equal('EW-242-EC');
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(8390);
  });
  it('Incoming emails: Parsing CUSTOM_VO_MOTOR_K_LEAD_1', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_MOTOR_K_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'rb@custeed.com',
      '+33634187168',
      'https://www.losangeautos.fr/voitures/neuves-stock/les-ulis/renault/clio/autre/generation-tce-75-19/116373/',
      'Ceci est un test fait par Custeed. Merci à vous\nref: 116373 Renault Clio',
      'ROMAIN de Custeed',
      'Renault Clio Génération TCe 75 -19',
      '116373',
      undefined,
      'CustomVo/MotorK',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehicleBrand')).equal('Renault');
    expect(data.get('leadTicket.parsedRawData.0.vehicleModel')).equal('Clio');
    expect(data.get('leadTicket.parsedRawData.0.vehicleInterior')).equal('Génération TCe 75 -19');
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(11640);
  });
  it('Incoming emails: Parsing CUSTOM_VO_MOTOR_K_LEAD_2', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_MOTOR_K_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'p.malochet@online.fr',
      '+33619914015',
      'https://www.losangeautos.fr/voitures/occasion/les-ulis/dacia/sandero/diesel/1-5-dci-90-fap-laureate-black-touch/134064/',
      'Bonjour, ce véhicule est il toujours disponible?\n' +
        'ref: 134064 Dacia Sandero VIN: UU15SDCL551539949 ID DMS: VO111364',
      'Pascal Malochet',
      'Dacia Sandero 1.5 dCi 90 FAP Lauréate Black Touch',
      '134064',
      undefined,
      'CustomVo/MotorK',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehicleBrand')).equal('Dacia');
    expect(data.get('leadTicket.parsedRawData.0.vehicleModel')).equal('Sandero');
    expect(data.get('leadTicket.parsedRawData.0.vehicleInterior')).equal('1.5 dCi 90 FAP Lauréate Black Touch');
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(8490);
    expect(data.get('leadTicket.parsedRawData.0.vehicleVin')).equal('UU15SDCL551539949');
    expect(data.get('leadTicket.parsedRawData.0.idDms')).equal('VO111364');
    expect(data.get('leadTicket.parsedRawData.0.concession')).equal('Renault Les Ulis');
  });

  it('Incoming emails: Parsing OUEST_FRANCE_AUTO', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), OUEST_FRANCE_AUTO);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'alefebvre52@yahoo.com',
      '+33757901558',
      'https://www.ouestfrance-auto.com/event/mail?userId=4920628&campaign=pacontact&typeAction=click&keyUser=7b5ba3865187637134d610dd75afff9f9060e95c823f94de809111b61a004533&dateEnvoi=2020-10-12 16:45:54&redirect=https%3A%2F%2Fwww.ouestfrance-auto.com%2Fvoiture-occasion%2Fbmw-serie-1-diesel-lorient-16904748.html%3Futm_source%3Dtrigger%26utm_medium%3Demail_interne%26utm_campaign%3Dpacontactmail%26utm_content%3Dvisualiser_annonce',
      'Bonjour,\n' +
        " Est-ce que La BMW Serie 1 est toujours disponible? Offrez-vous une extension de garantie sur vos véhicules d'occasion?\n" +
        ' Merci. \n' +
        ' Référence: L20374 - 17290€ - 40699km - diesel',
      'Alice Lefebvre',
      'BMW Serie 1',
      'L20374',
      undefined,
      'OuestFranceAutoVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(17290);
    expect(data.get('leadTicket.parsedRawData.0.mileage')).equal(40699);
    expect(data.get('leadTicket.energyType')[0]).equal('diesel');
  });
  it('Incoming emails: Parsing OUEST_FRANCE_AUTO_LEAD_1', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), OUEST_FRANCE_AUTO_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'aitbouzid.linda@gmail.com',
      '+33686329723',
      'https://www.ouestfrance-auto.com/event/mail?userId=4918810&campaign=pacontact&typeAction=click&keyUser=283f8e64284bcfd2a8bae30c9743411606b3637b804722f0eff8cae280ea0fc1&dateEnvoi=2020-10-09 23:16:11&redirect=https%3A%2F%2Fwww.ouestfrance-auto.com%2Fvoiture-occasion%2Fmini-countryman-hybride-lorient-17223784.html%3Futm_source%3Dtrigger%26utm_medium%3Demail_interne%26utm_campaign%3Dpacontactmail%26utm_content%3Dvisualiser_annonce',
      'Bonjour,\n' +
        " Je souhaiterais obtenir plus d'informations sur ce véhicule,\n" +
        ' Merci. \n' +
        ' Référence: PO83743845 - 15360€ - 43000km',
      'Aït bouzid',
      'Mini Countryman',
      'PO83743845',
      undefined,
      'OuestFranceAutoVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(15360);
    expect(data.get('leadTicket.parsedRawData.0.mileage')).equal(43000);
  });
  it('Incoming emails: Parsing OUEST_FRANCE_AUTO_LEAD_2', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), OUEST_FRANCE_AUTO_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'aroland346@gmail.com',
      '+33767393149',
      undefined,
      'Message de la personne intéressée :  \n' +
        '\n' +
        "                                            Bonjour je souhaiterai obtenir plus d'information sur un véhicule",

      'ALEXIS ROLAND',
      undefined,
      undefined,
      undefined,
      'OuestFranceAutoVo/OuestFranceAutoVoNewFormat',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_AUTOTHIVOLLE', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_AUTOTHIVOLLE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'RB+AUTOTHIVOLLES@CUSTEED.COM',
      '+33634187168',
      undefined,
      'OPEL Corsa VO700706\n' +
        "Bonjour, ceci est un test fait par la société Custeed, ce n'est pas un lead à recontacter. Cordialement",
      'MR SOCIÉTÉ CUSTEED ROMAIN BOURBILIÈRES',
      'OPEL Corsa VO700706',
      'VO700706',
      undefined,
      'CustomVo/AutoThivolle',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_AUTOTHIVOLLE_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_AUTOTHIVOLLE_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'RB@CUSTEED.COM',
      '+33634187168',
      undefined,
      'RENAULT Grand Scenic VO700740\n' + 'Bonjour, ceci est un test fait par Custeed',
      'MR DE CUSTEED ROMAIN',
      'RENAULT Grand Scenic VO700740',
      'VO700740',
      undefined,
      'CustomVo/AutoThivolle',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_AUTOTHIVOLLE_LEAD_2', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_AUTOTHIVOLLE_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'JEREMY.PARRAT@HOTMAIL.COM',
      '+33617947921',
      undefined,
      'Bonjour je recherche voiture dans les 1800euro',
      'MR JEREMY JEREMY',
      undefined,
      undefined,
      undefined,
      'CustomVo/AutoThivolle',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_AUTOTHIVOLLE_LEAD_3', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_AUTOTHIVOLLE_LEAD_3);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'J_DISTINGUIN@HOTMAIL.COM',
      '+33659348639',
      undefined,
      "Bonjour Monsieur Massotier,<br/><br/>Nous avons à plusieurs reprises louer en LOA des véhicules auprès de votre concession en passant par votre intermédiaire. Le dernier étant notre Scénic actuel dont la LAO se termine en mars 2021.  Comme à chaque fois, nous nous manifestons environ 6 mois avant pour réfléchir à notre prochaine location. Je vous sollicite pour savoir, quel type de véhicule avez-vous à nous proposer en restant dans notre gamme de véhicule (Scénic, kadjar...) avec une mensualité proche de celle que nous avons actuellement (environ 300 ¤/mois).<br/><br/>Dans l'attente de vous lire.<br/><br/>Cordialement.<br/><br/>Jérôme DISTINGUIN",
      'MR DISTINGUIN JÉRÔME',
      undefined,
      undefined,
      undefined,
      'CustomVo/AutoThivolle',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_ALHENA_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_ALHENA_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'tutti.frutti@gmail.com',
      '+336001020304',
      undefined,
      'Test VO',
      'Frutti TUTTI',
      undefined,
      undefined,
      'M',
      'CustomVo/AlhenaVo',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_ALHENA_LEAD_2', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_ALHENA_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      undefined,
      '+33619563517',
      undefined,
      'La cliente à restituer un véhicule de location , elle à reçu une facture après la restitution. Elle aurait voulait parler avec le service comptabilité pour voir avec eux directement. Le véhicule restituer est immatriculée EY276QY.',
      null,
      undefined,
      undefined,
      'F',
      'CustomVo/AlhenaVo',
    ]);
    expect(data.get('leadTicket.vehicle.plate')).equal('EY276QY');
  });
  it('Incoming emails: Parsing CUSTOM_APV_ALHENA_LEAD_3', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_APV_ALHENA_LEAD_3);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'fab.morrax@gmail.com',
      '+33623839072',
      undefined,
      'Problème de Clé',
      'Morrax',
      undefined,
      undefined,
      undefined,
      'CustomApv/AlhenaApv',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VN_ALHENA_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VN_ALHENA_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'tutti.fruttiVn@gmail.com',
      '+336001020304',
      undefined,
      'Test VN',
      'Frutti TUTTI TEST',
      undefined,
      undefined,
      'M',
      'CustomVn/AlhenaVn',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_APV_ALHENA_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_APV_ALHENA_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'tutti.fruttiApv@gmail.com',
      '+336001020304',
      undefined,
      'Test APV',
      'Frutti TUTTI',
      undefined,
      undefined,
      'M',
      'CustomApv/AlhenaApv',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_APV_ALHENA_LEAD_2', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_APV_ALHENA_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      undefined,
      '+33659491443',
      undefined,
      'la cliente est très mécontente car son véhicule est depuis 5 semaines en ateliers mécanique pour un problème de durite à remplacer, pour elle, il est inconcevable de mettre autant de temps pour recevoir une durite.  \n' +
        "Elle m'informe aussi qu'elle va envoyer un courrier auprès de la direction. \n" +
        'Pourriez vous la recontacter assez rapidement afin de trouver une solution dès que possible ?',
      'robert',
      undefined,
      undefined,
      undefined,
      'CustomApv/AlhenaApv',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_APV_ALHENA_LEAD_DOUBLE_PHONE', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_APV_ALHENA_LEAD_DOUBLE_PHONE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      undefined,
      '+33237490824',
      undefined,
      'La cliente souhaite prendre un rendez vous pour la première révision de son Captur',
      'Nadine Guilbert',
      undefined,
      undefined,
      'F',
      'CustomApv/AlhenaApv',
    ]);
  });
  it('Incoming emails: Parsing ZOOMCAR', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), ZOOMCAR);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'dan.savasta@gmail.com',
      '+33612731670',
      'https://zoomcar.fr/citroen-c3-aircross-bluehdi-120-eat6-shine-toit-ouvrant-pano-camera-1-main-17508330.html?utm_source=trigger&utm_medium=email_interne&utm_campaign=pacontactmail&utm_content=visualiser_annonce',
      'Bonjour,\n' +
        ' je souhaite être rappelé être rappelé ou après 18h ou une offre de reprise de mon véhicule \n' +
        ' je souhaite après 18h\n' +
        ' je souhaite une offre de reprise de mon véhicule\n' +
        '\n' +
        ' Merci. 3008 crossway.dw021ak.110.000km.blanc nacré.\n' +
        'Ref: 166623',
      'SAVASTA DANIEL',
      'Citroen C3 Aircross  BlueHDi 120 EAT6 SHINE Toit Ouvrant Pano Caméra 1°Main',
      '166623',
      undefined,
      'ZoomcarVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(21390);
  });
  it('Incoming emails: Parsing ZOOMCAR_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), ZOOMCAR_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'barutel@yahoo.fr',
      '+33781019025',
      'https://zoomcar.fr/utilitaire-citroen-jumpy-combi-xl-bluehdi-120-bv6-confort-clim-9pl-17572088.html?utm_source=trigger&utm_medium=email_interne&utm_campaign=pacontactmail&utm_content=visualiser_annonce',
      'Bonjour,\n' +
        'je souhaiterai savoir la longueur et la hauteur de ce véhicule. Est il toujours disponible et visible ? MERCI\n' +
        'Ref: 167637',
      'BARUTEL',
      'Citroen Jumpy  COMBI XL BlueHDi 120 BV6 CONFORT CLIM 9PL',
      '167637',
      undefined,
      'ZoomcarVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(23250);
  });
  it('Incoming emails: Parsing ZOOMCAR_LEAD_2', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), ZOOMCAR_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'mf.guillouet@gmail.com',
      '+33689108983',
      'https://zoomcar.fr/pro/sn-diffusion-albi-v4262.html',
      'Disposez vous de grand C4 spacetourer 7 places ,tjrs essence et automatique ? Merci beaucoup.',
      'MarieFrance Guillouet',
      undefined,
      undefined,
      undefined,
      'ZoomcarVo',
    ]);
  });
  it('quick html regex LA_CENTRALE', async () => {
    // USE TO TEST QUICKLY, go to https://regex101.com/, https://codebeautify.org/htmlviewer/
    expect(LaCentrale.parsers[0].brandModel(LA_CENTRALE_LEAD_1.payload)).equal(
      'VOLKSWAGEN TOURAN III 1.5 TSI 150 EVO BLUEMOTION TECHNOLOGY CONNECT DSG7 7PL'
    );
    expect(LaCentrale.parsers[0].message(LA_CENTRALE_LEAD_1.payload)).equal(
      'bonjour . \n' + '\n' + 'le véhicule est-il disponible pour passer le voir demain ? \n' + '\n' + 'merci .'
    );
    expect(LaCentrale.parsers[0].message(LA_CENTRALE.payload)).equal(
      "Bonjour,\nJe suis intéressé par votre Toyota Yaris Iii hybrid 100h dynamic 5p à 9 490€.\nPourrions-nous convenir d'un rendez-vous pour voir le véhicule le 7/02/2020 ?\nCordialement"
    );
    expect(LaCentrale.parsers[0].message(LA_CENTRALE.payload)).equal(
      "Bonjour,\nJe suis intéressé par votre Toyota Yaris Iii hybrid 100h dynamic 5p à 9 490€.\nPourrions-nous convenir d'un rendez-vous pour voir le véhicule le 7/02/2020 ?\nCordialement"
    );
    expect(Common.parsers.webSite(null, LA_CENTRALE.raw)).equal('lacentrale');
    expect(Common.parsers.webSite(null, LA_CENTRALE_LEAD_1.raw)).equal('lacentrale');
    const webSite = Common.parsers.webSite(null, LA_CENTRALE_LEAD_1.raw);
    const sourceType = Common.parsers.sourceType(LA_CENTRALE_LEAD_1.payload);
    const wrongWebSite = Common.parsers.webSite(null, LA_CENTRALE_LEAD_1.raw);
    expect(!!(webSite && SourceTypes.getValue(webSite) && SourceTypes.getValue(webSite) !== sourceType)).equal(false);
  });
  it('quick html regex LE_BON_COIN', async () => {
    // USE TO TEST QUICKLY, go to https://regex101.com/, https://codebeautify.org/htmlviewer/
  });
  it('Incoming emails: Parse twice the same phone but not same email should work', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const email2 = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE, { externalId: 'somethingElse' });
    const job = { payload: { emailId: email.id.toString() } };
    const job2 = { payload: { emailId: email2.id.toString() } };
    await crossLeadsIncomingEmail(job);
    let datas = await garage.datas();
    expect(datas.length).equal(1);
    await crossLeadsIncomingEmail(job2);
    datas = await garage.datas();
    expect(datas.length).equal(1);
    expect(datas[0].get('leadTicket.actions').length).equal(3); // Two incomingCall action registered cause we didn't separate them
    expect(datas[0].get('leadTicket.actions')[1].name).equal(TicketActionNames.INCOMING_EMAIL);
  });
  it('Incoming emails: Parse twice the same email should fail', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    let datas = await garage.datas();
    expect(datas.length).equal(1);
    let error = null;
    try {
      await crossLeadsIncomingEmail(job);
    } catch (e) {
      error = e.message;
      datas = await garage.datas();
      expect(datas.length).equal(1);
      expect(datas[0].get('leadTicket.actions')[1].name).equal(TicketActionNames.INCOMING_EMAIL);
    }
    expect(error).equal('CROSS-LEADS: email status invalid for parsing: Parsed');
  });
  it('Should send alert when parsed', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' });
    const garage = await app.addGarage({ defaultManager: user });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: true, LeadVn: true, LeadVo: true });
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const contacts = await app.models.Contact.find();
    expect(contacts.length).equal(1);
    const [contact] = contacts;
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);
  });
  it('Send two cross-lead mails : first must be type CROSS_LEADS_SELF_ASSIGN_EMAIL the second must be type CROSS_LEADS_RECONTACT', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' });
    const garage = await app.addGarage({ defaultManager: user });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: true, LeadVn: true, LeadVo: true });
    const mailContent = [LA_CENTRALE, { ...LA_CENTRALE, externalId: '123456' }];
    //We generate two mails
    for (let i = 0; i < 2; i++) {
      const email = await generateMockIncomingEmail(garage.id.toString(), mailContent[i]);
      const job = { payload: { emailId: email.id.toString() } };
      await crossLeadsIncomingEmail(job);
    }
    const contacts = await app.models.Contact.getMongoConnector().find({}).toArray();
    expect(contacts.length).equal(2);
    expect(contacts[0].type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);
    expect(contacts[1].type).equal(ContactTypes.CROSS_LEADS_RECONTACT);
  });
  it('Mail should not be altered', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' });
    const garage = await app.addGarage({ defaultManager: user });
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    expect(crypto.createHash('md5').update(LA_CENTRALE.payload.html).digest('hex')).equal(
      crypto.createHash('md5').update(email.payload.html).digest('hex')
    );
  });
  it('Send first mail should be CROSS_LEADS_SELF_ASSIGN_EMAIL and second call should be CROSS_LEADS_RECONTACT', async function test() {
    const user = await app.addUser({ email: 'testAlert@gmail.com' });
    const garage = await app.addGarage({ defaultManager: user });
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: true, LeadVn: true, LeadVo: true });
    const call = await generateMockIncomingCall(garage.id.toString(), 'LaCentrale', {
      callerIdNumber: '33766711636',
      calling: '0033766711636',
    });
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    await crossLeadsIncomingEmail({ payload: { callId: call.id.toString(), emailId: email.id.toString() } });
    await crossLeadsIncomingCall({ payload: { callId: call.id.toString() } });
    const contacts = await app.models.Contact.getMongoConnector().find({}).toArray();
    expect(contacts.length).equal(2);
    expect(contacts[0].type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);
    expect(contacts[1].type).equal(ContactTypes.CROSS_LEADS_RECONTACT);
  });
  it('Is email status set to parsed', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const IncomingEmails = await app.models.IncomingCrossLead.find();
    expect(IncomingEmails.length).equal(1);
    expect(IncomingEmails[0].status).equal(IncomingCrossLeadsStatus.PARSED);
  });
  it("Is email status set to transferred when we couldn't parse it", async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), null); // set null to give unparseable email
    const job = { payload: { emailId: email.id.toString() } };
    let error = null;
    try {
      await crossLeadsIncomingEmail(job);
    } catch (e) {
      error = e.message;
    }
    const IncomingEmails = await app.models.IncomingCrossLead.find();
    expect(IncomingEmails.length).equal(1);
    expect(IncomingEmails[0].status).equal(IncomingCrossLeadsStatus.TRANSFERRED);
  });
  it('Is lead details correct', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const datas = await garage.datas();
    expect(datas.length).equal(1);
    const data = datas[0];
    expect(data.get('leadTicket.actions').length).equal(2);
    expect(data.get('source.by')).equal(SourceBy.EMAIL);
    expect(data.get('source.type')).equal(SourceTypes.LA_CENTRALE);
    expect(data.get('source.sourceId')).to.exists;
    expect(data.get('customer.lastName.value')).equal('LI');
    expect(data.get('customer.fullName.value')).equal('LI');
    expect(data.get('customer.gender.value')).equal('M');
    expect(data.get('leadTicket.timing')).equal(LeadTimings.NOW);
  });
  it('Is the followup programmed', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const jobs = await app.jobs({ where: { type: JobTypes.SEND_LEAD_FOLLOWUP } });
    expect(jobs.length).equal(1);
    expect(jobs[0].type).equal('SEND_LEAD_FOLLOWUP');
  });
  it('Should not crash when the email is wrong, we should still save it to the db', async function test() {
    const testEmail = JSON.parse(JSON.stringify(LA_CENTRALE));
    const newReq = {
      body: {
        isATest: true,
        ...testEmail.raw,
        ...{ recipient: 'WRONG_GARAGE_ID@discuss.garagescore.com' }, // set a stupid receiver
      },
    };
    await handleIncomingEmail(newReq);
    const IncomingEmails = await app.models.IncomingCrossLead.find();
    expect(IncomingEmails.length).equal(1);
    expect(IncomingEmails[0].error).equal(
      "handle-incoming-email: garageId wrong or not found in receiver 'WRONG_GARAGE_ID@discuss.garagescore.com'"
    );
    expect(IncomingEmails[0].status).equal(IncomingCrossLeadsStatus.ERROR);
  });
  it('Should not crash when the garageId is wrong, we should still save it to the db', async function test() {
    const testEmail = JSON.parse(JSON.stringify(LA_CENTRALE));
    const newReq = {
      body: {
        isATest: true,
        ...testEmail.raw,
        ...{ recipient: 'lacentrale.aze65651561azeaze@discuss.garagescore.com' }, // set a stupid garageId
      },
    };
    await handleIncomingEmail(newReq);
    const IncomingEmails = await app.models.IncomingCrossLead.find();
    expect(IncomingEmails.length).equal(1);
    expect(IncomingEmails[0].error).equal(
      "handle-incoming-email: garageId wrong or not found in receiver 'lacentrale.aze65651561azeaze@discuss.garagescore.com'"
    );
    expect(IncomingEmails[0].status).equal(IncomingCrossLeadsStatus.ERROR);
  });
  it("Should not crash when the garage dosn't exists, we should still save it to the db", async function test() {
    const testEmail = JSON.parse(JSON.stringify(LA_CENTRALE));
    const newReq = {
      body: {
        isATest: true,
        ...testEmail.raw,
        ...{ recipient: 'lacentrale.577a30d774616c1a0056c264@discuss.garagescore.com' }, // set a garageId which dosn't exists
      },
    };
    await handleIncomingEmail(newReq);
    const IncomingEmails = await app.models.IncomingCrossLead.find();
    expect(IncomingEmails.length).equal(1);
    expect(IncomingEmails[0].error).equal('cross-leads-incoming-email.js: garage not found: 577a30d774616c1a0056c264');
    expect(IncomingEmails[0].status).equal(IncomingCrossLeadsStatus.ERROR);
  });
  it("Should not crash when the sourceType dosn't exists, we should still save it to the db", async function test() {
    const garage = await app.addGarage();
    const testEmail = JSON.parse(JSON.stringify(LA_CENTRALE));
    const newReq = {
      body: {
        isATest: true,
        ...testEmail.raw,
        ...{ recipient: `lacentraleuh.${garage.id.toString()}@discuss.garagescore.com` }, // set a stupid sourceType
      },
    };
    await handleIncomingEmail(newReq);
    const IncomingEmails = await app.models.IncomingCrossLead.find();
    expect(IncomingEmails.length).equal(1);
    expect(IncomingEmails[0].error).equal(
      `handle-incoming-email: sourceType wrong or not found in receiver 'lacentraleuh.${garage.id.toString()}@discuss.garagescore.com'`
    );
    expect(IncomingEmails[0].status).equal(IncomingCrossLeadsStatus.ERROR);
  });
  it('Backlist the report emails', async function test() {
    let error = null;
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE_RAPPORT_APPELS_MANQUE);
    const job = { payload: { emailId: email.id.toString() } };
    await app.models.XLeadsBlacklist.create({ field: 'payload.subject', match: /Rapport de vos appels manqués/ });
    try {
      await crossLeadsIncomingEmail(job);
    } catch (e) {
      error = e.message;
    }
    expect(error).equal(null);
    const [incomingEmail] = await app.models.IncomingCrossLead.find();
    expect(incomingEmail.error).equal(
      "Couldn't parse email <RAYM077000IXE001TU7431583510407620@info.lacentrale.fr>: Blacklisted by payload.subject.match(/Rapport de vos appels manqués/)"
    );
    expect(incomingEmail.status).equal(IncomingCrossLeadsStatus.TRANSFERRED);
  });
  it('Should transfer when there is a match fail', async function test() {
    let error = null;
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE_LARGUS_MATCH_FAIL);
    const job = { payload: { emailId: email.id.toString() } };
    try {
      await crossLeadsIncomingEmail(job);
    } catch (e) {
      error = e.message;
    }

    const [incomingEmail] = await app.models.IncomingCrossLead.find();
    expect(incomingEmail.error).equal(
      `Couldn't parse email <b1c49d1b-e506-4dd9-98ee-285247f64708@ind1s06mta1262.xt.local>: parsedCount:0, email:not parsed, phone:not parsed, MATCH FAIL: (source=LaCentrale) !== webSite=Largus`
    );
    expect(incomingEmail.status).equal(IncomingCrossLeadsStatus.TRANSFERRED);
  });
  it('We should program a crossLeadsSendSelfAssignReminder job', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const jobs = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    expect(jobs.length).equal(1);
    expect(jobs[0].payload.stage).equal(1);
  });
  it('After each reminder, it should generate a contact and a other job until 4 reminder', async function test() {
    const garage = await app.addGarage();

    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: false, LeadVn: false, LeadVo: true }); // LeadVo should be enough

    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    await crossLeadsIncomingEmail({ payload: { emailId: email.id.toString() } });
    let [job, undefinedJob] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    let [contact, undefinedContact] = await app.models.Contact.find();
    /** First alert */
    expect(undefinedJob).equal(undefined);
    expect(undefinedContact).equal(undefined);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);
    expect(contact.payload.stage).equal(0);
    const contactSentAt = Math.floor(new Date(contact.createdAt).getTime() / 1000 / 60);
    expect(job.payload.stage).equal(1);
    expect(job.payload.contacts[0].payload.stage).equal(0); // test if the contacts are in the job payload
    expect(job.scheduledAt).to.be.above(contactSentAt + (15 - 1)); // Programmed in 15min

    /** Alert reminder 1/4 */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 2 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 1 } });
    expect(job.payload.stage).equal(2);
    expect(contact.payload.stage).equal(1);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);

    /** Alert reminder 2/4 */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 3 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 2 } });
    expect(job.payload.stage).equal(3);
    expect(contact.payload.stage).equal(2);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);

    /** Alert reminder 3/4 */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 4 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 3 } });
    expect(job.payload.stage).equal(4);
    expect(contact.payload.stage).equal(3);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);

    /** Alert reminder 4/4 LAST ONE, Should NOT create a new job */
    await crossLeadsSendSelfAssignReminder(job);
    [undefinedJob] = await app.jobs({
      where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 5 },
    });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 4 } });
    expect(undefinedJob).equal(undefined);
    expect(contact.payload.stage).equal(4);
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);

    /** SHOULD NOT SEND MORE ALERTS */
    [undefinedContact] = await app.models.Contact.find({ where: { 'payload.stage': 5 } });
    expect(undefinedContact).equal(undefined);
  });
  it('After a alert which someone click on self-assigned button, it should NOT send the other reminders', async function test() {
    const garage = await app.addGarage();

    const user = await app.addUser({ email: 'testAlert@gmail.com' }); // Add user to receive a contact
    await user.addGarage(garage);
    await user.addAlertSubscriptions({ Lead: false, LeadVn: false, LeadVo: true }); // LeadVo should be enough

    const email = await generateMockIncomingEmail(garage.id.toString(), LA_CENTRALE);
    await crossLeadsIncomingEmail({ payload: { emailId: email.id.toString() } });

    let [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER } });
    let [contact, undefinedContact] = await app.models.Contact.find();
    expect(undefinedContact).equal(undefined);

    /** First alert */
    expect(contact.type).equal(ContactTypes.CROSS_LEADS_SELF_ASSIGN_EMAIL);
    let [data] = await garage.datas();
    let res = await _sendQueryAs(
      app,
      `mutation dataSetLeadTicketSelfAssigned($dataId: String!) {
      DataSetLeadTicketSelfAssigned(dataId: $dataId) {
        status
        message
      }
    }`,
      { dataId: data.id.toString() },
      user.getId()
    );
    expect(res.data.DataSetLeadTicketSelfAssigned.status).to.be.equal(201);
    data = await app.models.Data.findById(data.id.toString());
    expect(data.get('leadTicket.manager')).to.be.equal(user.getId());
    expect(data.get('leadTicket.selfAssignedTo')).to.be.equal(user.getId());
    [undefined, undefinedContact] = await app.models.Contact.find(); // Should not sent a transfer alert
    expect(undefinedContact).equal(undefined);

    /** Alert reminder 1/4 - SHOULD NOT BE SENT */
    await crossLeadsSendSelfAssignReminder(job);
    [job] = await app.jobs({ where: { type: JobTypes.CROSS_LEADS_SEND_SELF_ASSIGN_REMINDER, 'payload.stage': 2 } });
    [contact] = await app.models.Contact.find({ where: { 'payload.stage': 1 } });
    expect(job).equal(undefined);
    expect(contact).equal(undefined);
  });
  it('Incoming emails: Parsing CUSTOM_VN_SNDIFFUSION_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VN_SNDIFFUSION_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'bernard.guiral@sfr.fr',
      '+33698804184',
      undefined,
      "Je suis intéressé(e) par ce véhicule et souhaite obtenir des informations complémentaires sur sa vente Bonsoir Pourriez vous m'indiquer votre proposition de reprise d'une mercedes classe a blanche essence 200 163cv de jjuillet 2018 ,18000kms avec option toit panoramique ouvrant ,pack black(jantes noires de 19 pouces,retros noirs,toit noir ) premiére main ,état irréprochable,grand écran. cordialement BERNARD GUIRAL (déjà client chez sn diffusion albi lors achat q3 en 2012)",
      'Bernard GUIRAL',
      'CITROEN C5 AIRCROSS Puretech 180 EAT8 SHINE Toit Ouvrant Hayon',
      undefined,
      undefined,
      'CustomVn/SnDiffusionVn',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VN_SNDIFFUSION_LEAD_2', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VN_SNDIFFUSION_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'jeromebalag@gmail.com',
      '+33618425625',
      undefined,
      'Jerome balaguer  \nJ ai déjà vu le véhicule et suis intéressé  \nMais je souhaiterais négocier le tarif\n\nImmat: SND131027\nKilométrage: 0\nPréférence de contact: Téléphone',
      'JEROME BALAGUER',
      'PEUGEOT 208 New BlueHDi 100 Allure LED Keyless Caméra Mirror Link',
      undefined,
      undefined,
      'CustomVn/SnDiffusionVn',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_SNDIFFUSION_LEAD_1', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_SNDIFFUSION_LEAD_1);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'guimeradominique@club-internet.fr',
      '+33626860352',
      undefined,
      "Je suis intéressé(e) par ce véhicule et souhaite obtenir des informations complémentaires sur sa vente, est-il toujours dispo, lieu ou nous pouvons le voir, garantie, kms actuel, votre meilleur offre sachant que l'achat est pour le mois à venir. Merci de votre réponse. Cdlt",
      'dominique guimera',
      'PEUGEOT 2008 PureTech 110 BV6 CROSSWAY Toit Pano Pack Confort',
      undefined,
      undefined,
      'CustomVo/SnDiffusionVo',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_SNDIFFUSION_LEAD_2', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_SNDIFFUSION_LEAD_2);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'guillaumebaillade@gmail.com',
      '+33681753853',
      undefined,
      'Bonjour,  \n' +
        ' \n' +
        'Je cherche une Cupra formentor essence avec faible kilométrage, et je souhaite me faire reprendre mes 2 véhicules (Renault Clio 3, dci 140000km et hyundai Tucson de 2019 diesel 40000km) \n' +
        ' \n' +
        'Est ce possible?\n\n' +
        'Immat: .\n' +
        'Kilométrage: 4900\n' +
        'Préférence de contact: Email',
      'Guillaume Baillade',
      'CUPRA Formentor 1.5 TSI 150 DSG7 GPS Caméra Hayon JA 18"',
      undefined,
      undefined,
      'CustomVo/SnDiffusionVo',
    ]);
  });
  it('test phone filter', async function test() {
    const isPhoneTest = await getTestPhoneFromInput('0033603875692');
    expect(isPhoneTest).equal('0033603875692');
  });
  it('test phone filter disabled', async function test() {
    const isPhoneTest = await getTestPhoneFromInput('0033699999999');
    expect(isPhoneTest).equal(null);
  });
  it('test phone filter wither html', async function test() {
    const isPhoneTest = await getTestPhoneFromInput(LA_CENTRALE_FILTER_TEST.raw['stripped-html']);
    expect(isPhoneTest).equal('0603875692');
  });
  it('test email filter', async function test() {
    const isEmailTest = await getTestEmailFromInput(LA_CENTRALE_FILTER_TEST.raw['Reply-To']);
    expect(isEmailTest).equal('bbodrefaux@garagescore.com');
  });
  it('test filter with sentece', async function test() {
    const isSentenceTest = await getTestEmailFromInput(
      LA_CENTRALE_FILTER_TEST.raw['Reply-To'] + LA_CENTRALE_FILTER_TEST.raw['stripped-html']
    );
    expect(isSentenceTest).equal('banane verte');
  });
  it('test getFilters', async function test() {
    const req = {};
    const res = {
      json: (input) => {
        expect(input.emails.length).equal(5);
        expect(input.phones.length).equal(6);
      },
    };
    await getFilters(app, req, res);
  });
  it('test removeFilters', async function test() {
    const xLeadsFiltersBefore = await promisify(app.models.Configuration.getXLeadsFilters)();
    const req = {
      body: {
        type: 'email',
        value: 'banane verte',
      },
    };
    const res = {
      json: (input) => {
        expect(input.status).equal('ok');
      },
    };
    await removeFilters(app, req, res);
    const xLeadsFiltersAfter = await promisify(app.models.Configuration.getXLeadsFilters)();
    expect(xLeadsFiltersBefore.emails.length > xLeadsFiltersAfter.emails.length).equal(true);
  });
  it('test insertFilters', async function test() {
    const req = {
      body: {
        filters: {
          email: 'banana@split.com',
          phone: '0636363636',
        },
      },
    };
    const res = {
      json: (input) => {
        expect(input.status).equal('ok');
      },
    };
    await insertFilters(app, req, res);
    const xLeadsFilters = await promisify(app.models.Configuration.getXLeadsFilters)();
    const isInsertEmail = xLeadsFilters.emails.find((mail) => mail && mail.value === 'banana@split.com');
    const isInsertPhone = xLeadsFilters.phones.find((phone) => phone && phone.value === '0636363636');

    expect(isInsertEmail.value).equal('banana@split.com');
    expect(isInsertEmail.enabled).equal(true);
    expect(isInsertPhone.value).equal('0636363636');
    expect(isInsertPhone.enabled).equal(true);
  });
  it('Incoming emails: Parsing EKONSILIO_VO', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), EKONSILIO_VO);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'fabrice.bossuyt@hotmail.fr',
      '+33630310953',
      undefined,
      'Bonjour, \n' +
        "Le client est à la recherche d'un Renault Megane diesel avec tres peu de km. 24000€ de budget. Sans reprise.",
      'Fabrice BOSSUYT',
      'RENAULT Mégane',
      undefined,
      'M',
      'EkonsilioVo',
    ]);
  });
  it('Incoming emails: Parsing EKONSILIO_VN', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), EKONSILIO_VN);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'kristel.fleureau@sfr.fr',
      '+33698596360',
      undefined,
      'Bonjour,\n' +
        '\n' +
        'Monsieur Fleureau désire obtenir une offre sur ce véhicule: https://www.chanoine.fr/voiture-occasion/renault/modele-espace/intens-blue-dci-200-edc-4734\n' +
        '\n' +
        "Il s'agit d'un projet à réaliser prochainement, il a actuellement une Loa qui se termine en juin \n" +
        '\n' +
        "Je vous souhaite une bonne vente ainsi qu'une excellente journée",
      'Daniel FLEUREAU',
      'RENAULT Espace',
      undefined,
      'M',
      'EkonsilioVn',
    ]);
  });
  it('Incoming emails: Parsing EKONSILIO_VN_WITHOUT_FIRSTNAME', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), EKONSILIO_VN_WITHOUT_FIRSTNAME);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'jocelynecorbel1955@orange.fr',
      '+33679785503',
      undefined,
      'Bonjour, \n' +
        "Le client est intéressé par une Twingo électrique et souhaite un rendez vous pour plus d'informations sur ce modèle. Reprise possible",
      'CORBELL',
      'RENAULT Twingo',
      undefined,
      'F',
      'EkonsilioVn',
    ]);
  });
  it('Incoming emails: Parsing CUSTOM_VO_ALHENA_LEAD_WITH_2_PHONES', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), CUSTOM_VO_ALHENA_LEAD_WITH_2_PHONES);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      undefined,
      '+33960532219',
      undefined,
      'La cliente à restituer un véhicule de location , elle à reçu une facture après la restitution. Elle aurait voulait parler avec le service comptabilité pour voir avec eux directement. Le véhicule restituer est immatriculée EY276QY.',
      null,
      undefined,
      undefined,
      'F',
      'CustomVo/AlhenaVo',
    ]);
    expect(data.get('leadTicket.vehicle.plate')).equal('EY276QY');
  });
  it('Incoming emails: Parsing OUESTFRANCE_LEAD_WITHOUT_PHONE', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), OUESTFRANCE_LEAD_WITHOUT_PHONE);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'clement.mf@laposte.net',
      '+33645490591',
      'https://www.ouestfrance-auto.com/event/mail?userId=4970385&campaign=pacontact&typeAction=click&keyUser=7350e3ae6ac4022ba7d24893d2b88e80dba50112c2cd32a1cb331933fca53516&dateEnvoi=2021-01-17 11:44:32&redirect=https%3A%2F%2Fwww.ouestfrance-auto.com%2Futilitaire-occasion%2Fford-ranger-diesel-lanester-17862468.html%3Futm_source%3Dtrigger%26utm_medium%3Demail_interne%26utm_campaign%3Dpacontactmail%26utm_content%3Dvisualiser_annonce',
      'Bonjour,\n' +
        " Je souhaiterais obtenir plus d'informations sur ce véhicule, la TVA est elle récupérable ? \n" +
        ' Merci. \n' +
        ' Référence: 20349 - 28900€ - 32060km - diesel',
      'Maxime Clement',
      'Ford Ranger',
      '20349',
      undefined,
      'OuestFranceAutoVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(28900);
  });
  it('Incoming emails: Parsing OUESTFRANCE_LEAD_WITHOUT_BODY', async function test() {
    this.timeout(999999999);
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), OUESTFRANCE_LEAD_WITHOUT_BODY);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'jfgilles3@gmail.com',
      '+33628538680',
      'https://www.ouestfrance-auto.com/event/mail?userId=5204879&campaign=pacontact&typeAction=click&keyUser=5c89f7f02aa5fcac5b5142c9d8dd4f7e026dbf2695e1f05fe0ffc9233a197817&dateEnvoi=2022-02-10 16:39:07&redirect=https%3A%2F%2Fwww.ouestfrance-auto.com%2Fcamping-car-occasion%2Fprofile-challenger-diesel-orgeres-22829834.html%3Futm_source%3Dtrigger%26utm_medium%3Demail_interne%26utm_campaign%3Dpacontactmail%26utm_content%3Dvisualiser_annonce',
      'Bonjour, \n' +
        " Je souhaiterais obtenir plus d'informations sur ce véhicule, \n" +
        ' Merci. \n' +
        ' Référence: 1014209 - 39000€ - 94000km - diesel',
      'J.F GILLES',
      'Profile Challenger',
      '1014209',
      undefined,
      'OuestFranceAutoVo',
    ]);
    expect(data.get('leadTicket.parsedRawData.0.vehiclePrice')).equal(39000);
  });
});
