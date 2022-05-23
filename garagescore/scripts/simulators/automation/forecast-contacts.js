/** Forcast how many contacts are going to be send in the next days */
'use strict';

const timeHelper = require('../../../common/lib/util/time-helper');

const app = require('../../../server/server');
async function main([days = 30]) {
  console.log(`${days} day(s) forecast`);
  try {
    const allCampaigns = await app.models.AutomationCampaign.find({
      where: { status: 'RUNNING', frequency: 'DAILY' },
    });
    for (let i = 1; i <= days; i += 1) {
      const day = timeHelper.todayDayNumber() + i;
      for (let c = 0; c < allCampaigns.length; c += 1) {
        const campaign = allCampaigns[c];
        const customers = await campaign.getTargetedCustomers(day);
        console.log(`${i};${campaign.garageId};${campaign.displayName};${customers.length}`);
      }
    }
  } catch (e) {
    console.error(e);
  }
  console.log('bye');
  process.exit();
}
app.on('booted', async () => {
  main(process.argv.slice(2));
});
