const chai = require('chai');
const GMB = require('../../../../../../common/lib/garagescore/google-my-business/gmb');

const expect = chai.expect;
describe('GMB', () => {
  it('generateCertificateTextFromGarage', async () => {
    const x = GMB.generateCertificateTextFromGarage(
      {
        locale: 'es-ES',
        publicDisplayName: 'Toto',
      },
      {
        respondentsCount: 45,
        rating: 10,
      }
    );
    expect(x).includes('Toto');
    expect(x).includes('45');
    expect(x).includes('clientes');
  });
});
