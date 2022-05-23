const TestApp = require('../../../../common/lib/test/test-app');
const chai = require('chai');
const render = require('../../../../common/lib/garagescore/contact/render');

const app = new TestApp();
const expect = chai.expect;

describe('Test greeting intro:', function () {
  const renderTxt = async (data) => await render.txt('emails/tests/only-greetings', data);
  before(async function beforeEach() {
    await app.reset();
    await app.allowContactsRender();
  });

  it('test greeting', async () => {
    await render.setTestMode();

    let rendered;

    rendered = await renderTxt({});
    expect(rendered).equal('Cher client,');

    rendered = await renderTxt({ addressee: { gender: 'M' } });
    expect(rendered).equal('Cher client,');

    rendered = await renderTxt({ addressee: { gender: 'F' } });
    expect(rendered).equal('Chère cliente,');

    rendered = await renderTxt({ addressee: { fullName: 'Tata', gender: 'F' } });
    expect(rendered).equal('Bonjour,');

    rendered = await renderTxt({ addressee: { fullName: 'Toto', gender: 'M' } });
    expect(rendered).equal('Bonjour,');

    rendered = await renderTxt({ addressee: { title: 'Madame', fullName: 'Tata', gender: 'F' } });
    expect(rendered).equal('Bonjour Madame Tata,');

    rendered = await renderTxt({ addressee: { title: 'Monsieur', fullName: 'Toto', gender: 'M' } });
    expect(rendered).equal('Bonjour Monsieur Toto,');
  });
});
