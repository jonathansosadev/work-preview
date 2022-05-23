const debug = require('debug')('garagescore:test:data-file:importer'); // eslint-disable-line max-len,no-unused-vars
const app = require('../../../server/server.js');
const chai = require('chai');
const expect = chai.expect;
chai.should();

describe('CRON monitoring tools for bizdev and PM', () => {
  it('should calculte the price monthly', async () => {
    const assignBizdevToGarage = async (userId, area) => {
      const countrys = [
        { name: 'france', locale: '/fr_FR|fr_NC/' },
        { name: 'belgium', locale: '/fr_BE|nl_BE/' },
        { name: 'spain', locale: '/es_ES|ca_ES/' },
        { name: 'netherlands', locale: '/nl_NL/' },
      ];
      for (const country of countrys) {
        for (const postal of area[country.name]) {
          if (country.name === 'belgium') {
            // Belgium, need to check if postal Code is beetween min and max
            const garages = await app.models.Garage.find({
              where: {
                and: [
                  { locale: { regexp: country.locale } },
                  { postalCode: { gt: postal.min } },
                  { postalCode: { lt: postal.max } },
                ],
              },
            });
            for (const updateBiz of garages) {
            }
          } else {
            const garages = await app.models.Garage.find({
              where: {
                and: [{ postalCode: { regexp: `/^${postal.code}/` } }, { locale: { regexp: country.locale } }],
              },
            });
            for (const updateBiz of garages) {
            }
          }
        }
      }
    };

    const userId = '561b6b61ddf187190075b9a2';
    const area = {
      france: [{ code: 54, name: 'Meurthe-et-Moselle' }],
      belgium: [{ min: 1000, max: 1299, name: 'Bruxelles-Capitale' }],
      netherlands: [{ code: 10, name: 'Amsterdam' }],
      spain: [{ code: 2, name: 'Albacete' }],
    };
    await assignBizdevToGarage(userId, area);
  });
});
