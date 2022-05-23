const config = require('config');
const chai = require('chai');
const { getStatus } = require('../../workers/jobs/scripts/export-leads-to-salesforce');
const crypto = require('../../common/lib/util/crypto');
const expect = chai.expect;

const decryptPassword = (rawPassword) => {
  const [secretKey, alg] = config.has('salesforce.cryptoAlgo') && config.get('salesforce.cryptoAlgo').split('.');
  if (!secretKey || !alg) {
    return rawPassword;
  }
  return crypto.decrypt(rawPassword, alg, secretKey);
};

describe('Test SalesForce API', () => {
  it('should return status from API', async function () {
    const clientId = '71752f5231da4d05a82e49caef943bd8';
    const clientSecret = 'fac1c93b30c8175f88d0a777edbae7051e2419311bdf3c5d857b4539b83a6991';
    const date = new Date();
    const urlApi = 'https://int.api.rspretailcrm.bmwgroup.com/extlead/api/v1';
    const salesforce = {
      clientId: clientId,
      clientSecret: decryptPassword(clientSecret),
    };
    const reponse = await getStatus(urlApi, salesforce);

    expect(reponse.status).equal('OK');
    expect(new Date(reponse.time).getTime()).to.be.above(date.getTime());
  });
});
