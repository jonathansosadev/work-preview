const TestApp = require('../../../common/lib/test/test-app');
const chai = require('chai');
const { renderEmailSubjectForUnitTest } = require('../../../common/lib/garagescore/contact/render-campaign-contact.js');
const contactsConfigs = require('../../../common/lib/garagescore/data-campaign/contacts-config');

const expect = chai.expect;
const app = new TestApp();

/**
 * Tests templating !
 */
describe('Check contacts-configs data', () => {
  before(async function beforeEach() {
    await app.reset();
    await app.allowContactsRender();
  });
  it('Test if string template is correctly rendered', async function test() {
    const templates = contactsConfigs.maintenance_email_thanks_3.templates;
    const subject = await renderEmailSubjectForUnitTest(
      contactsConfigs.maintenance_email_thanks_3,
      templates,
      {
        garage: {
          publicDisplayName: 'bouh',
          locale: 'fr_FR',
        },
      },
    );
    expect(subject).equal("N'oubliez pas de finir votre avis sur notre établissement bouh");
  });
  it('Test if file template is correctly rendered', async function test() {
    const templates = contactsConfigs.sale_email_followup.templates;
    const subject = await renderEmailSubjectForUnitTest(contactsConfigs.sale_email_followup, templates, {
      garage: { locale: 'fr_FR' },
      addressee: { title: 'Monsieur', fullName: 'Prout' },
    });
    expect(subject).equal('Monsieur Prout, votre garage a-t-il apporté une réponse à votre insatisfaction ?');
  });
  it('Contacts-configs templates path are corrects', async function test() {
    expect(contactsConfigs.filesExistsErrors()).equal(null);
  });
});
