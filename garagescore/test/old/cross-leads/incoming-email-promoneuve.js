/**
 * New Email to parse ?
 * COPY / PASTE the json "incomingCrossLeads" into common/lib/garagescore/cross-leads/examples/{sourceType}/X.json
 * Then import it here : const {SOURCE_TYPE}_X = require('../../../common/lib/garagescore/cross-leads/examples/{sourceType}/X.json');
 * Remove all dates (.json doesn't support it) AND replace "_id" by "externalId" AND change the status to "New"
 * Then do your test on it ! using https://regex101.com/, and https://codebeautify.org/htmlviewer/ to see the html content
 */

const TestApp = require('../../../common/lib/test/test-app');
const crossLeadsIncomingEmail = require('../../../workers/jobs/scripts/cross-leads-incoming-email.js');

// Email samples
const PROMONEUVE_NEW_FORMAT_120721 = require('../../../common/lib/garagescore/cross-leads/examples/Promoneuve/lead-new-format-12-07-2021.json');

const app = new TestApp();
const { incomingEmailCustomExpect, generateMockIncomingEmail } = require('./_utils')(app);

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

  it('Incoming emails: Parsing PROMONEUVE_NEW_FORMAT_120721', async function test() {
    const garage = await app.addGarage();
    const email = await generateMockIncomingEmail(garage.id.toString(), PROMONEUVE_NEW_FORMAT_120721);
    const job = { payload: { emailId: email.id.toString() } };
    await crossLeadsIncomingEmail(job);
    const [data] = await garage.datas();
    incomingEmailCustomExpect(data, [
      'pena.orthophonie@orange.fr',
      '+33670512815',
      'https://www.promoneuve.fr/secured/L2NvbXB0ZS1wcm8v/05f9c937dca77e339f60a6b60fa77163',
      'Le message provenant de Promoneuve',
      'Vincent Pena',
      'KIA E-SOUL',
      '836965416085388',
      undefined,
      'PromoneuveVn',
    ]);
  });
});
