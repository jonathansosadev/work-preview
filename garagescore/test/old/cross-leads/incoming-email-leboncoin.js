/**
 * New Email to parse ?
 * COPY / PASTE the json "incomingCrossLeads" into common/lib/garagescore/cross-leads/examples/{sourceType}/X.json
 * Then import it here : const {SOURCE_TYPE}_X = require('../../../common/lib/garagescore/cross-leads/examples/{sourceType}/X.json');
 * Remove all dates (.json doesn't support it) AND replace "_id" by "externalId" AND change the status to "New"
 * Then do your test on it ! using https://regex101.com/, and https://codebeautify.org/htmlviewer/ to see the html content
 */

// Email samples
const LE_BON_COIN_EXAMPLE = require('../../../common/lib/garagescore/cross-leads/examples/LeBonCoin.json');
const LE_BON_COIN_LEAD_NEW_FORMAT = require('../../../common/lib/garagescore/cross-leads/examples/LeBonCoin/lead-new-format.json');
const LE_BON_COIN_LEAD_NEW_FORMAT_WITHOUT_FIRST_NAME = require('../../../common/lib/garagescore/cross-leads/examples/LeBonCoin/lead-new-format-without-firstName.json');
const LE_BON_COIN_LEAD_NEW_FORMAT_BODY_HTML_DIFFERENT_FROM_STRIPPED_HTML = require('../../../common/lib/garagescore/cross-leads/examples/LeBonCoin/lead-new-format-body-html-different-from-stripped-html.json');

const TestApp = require('../../../common/lib/test/test-app');
const app = new TestApp();
const { incomingEmailCustomExpect, routine } = require('./_utils')(app);

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
  });
  it('Incoming emails: Parsing LE_BON_COIN_LEAD', async function test() {
    const data = await routine(LE_BON_COIN_EXAMPLE);
    incomingEmailCustomExpect(data, [
      'olivierbesnard@sfr.fr',
      '+33674824455',
      'https://www.leboncoin.fr/voitures/1939128075.htm',
      "Bonjour, votre annonce m'intéresse ! Est-elle toujours disponible ? Pouvez vous me confirmer que ce véhicule a été immatriculé en France et qu'il ne présente plus de malus ecologique\nCordialement\n olivierb37\nRéférence : 19972x173873",
      'Olivier BESNARD',
      'Audi Q5 NEW 40 TDI 204 BVA QUATTRO SLINE Export',
      '1939128075',
      undefined,
      'LeBonCoinVo',
      53880,
    ]);
  });
  it('Incoming emails: Parsing LE_BON_COIN_LEAD_NEW_FORMAT', async function test() {
    const data = await routine(LE_BON_COIN_LEAD_NEW_FORMAT);
    incomingEmailCustomExpect(data, [
      'sebrault22@orange.fr',
      '+33689176500',
      'https://www.leboncoin.fr/utilitaires/1978139935.htm',
      "Bonjour, votre annonce m'intéresse ! Est-elle toujours disponible ? Patachou\nRéférence : 7381",
      'sebastien rault',
      'Opel Movano II FOURGON F3300 L2H2 2.3 CDTI 130',
      '1978139935',
      undefined,
      'LeBonCoinVo',
      16658,
    ]);
  });
  it('Incoming emails: Parsing LE_BON_COIN_LEAD_NEW_FORMAT_WITHOUT_FIRST_NAME', async function test() {
    const data = await routine(LE_BON_COIN_LEAD_NEW_FORMAT_WITHOUT_FIRST_NAME);
    incomingEmailCustomExpect(data, [
      'francoise.alexander@gmail.com',
      undefined,
      'https://www.leboncoin.fr/voitures/1996641505.htm',
      'Bonjour,\n' + 'Quelle est la garantie pour cette voiture ?\n' + 'Cordialement,\nRéférence : 340x173361',
      'Fran',
      'Citroën C3 Aircross PureTech 130 SHINE EAT6 Toi',
      '1996641505',
      undefined,
      'LeBonCoinVo',
      21650,
    ]);
  });
  it('Incoming emails: Parsing LE_BON_COIN_LEAD_NEW_FORMAT_BODY_HTML_DIFFERENT_FROM_STRIPPED_HTML', async function test() {
    const data = await routine(LE_BON_COIN_LEAD_NEW_FORMAT_BODY_HTML_DIFFERENT_FROM_STRIPPED_HTML);
    incomingEmailCustomExpect(data, [
      'durand.philippe07@yahoo.fr',
      '+33385531037',
      'https://www.leboncoin.fr/voitures/1963686415.htm',
      'Bonjour,\n\n' +
        `Je suis professionnel de l'automobile en Saone et Loire,pouvez vous me donner un prix à négociant pour ce véhicule?\n\n` +
        'Merci de votre retour.\nBien cordialement\nPh DURAND\nGarage ROTAT-réseau AD N° siret 448289850\n71160 Rigny sur Arroux\n03/85/53/10/37\nRéférence : 7jbjxd3p',
      'PHILIPPE DURAND',
      'Renault Kadjar BUSINESS dCi 110 Energy',
      '1963686415',
      undefined,
      'LeBonCoinVo',
      16700,
    ]);
  });
});
