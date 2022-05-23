const app = require('../../../server/server');
const { AutomationCampaignTargets } = require('../../../frontend/utils/enumV2');
/**
 * Script one shoot à delete après la MEP du ticket #4378
 * le script à juste pour but d'activer les campages M-14 et M-26 si la campagne M-11 et M-23 est en RUNNING
 */

const runScript = async (app) => {
  console.log('---> Retrieve campaign M-11 & M-23 RUNNING on going...');
  // 2: update campaign for running immediately
  const campaignsRunning = await app.models.AutomationCampaign.getMongoConnector()
    .find({
      target: {
        $in: [
          AutomationCampaignTargets.M_M,
          AutomationCampaignTargets.M_UVS,
          AutomationCampaignTargets.M_M_23,
          AutomationCampaignTargets.M_UVS_23,
        ],
      },
      status: 'RUNNING',
    })
    .toArray();

  console.log(`---> Retrieve ${campaignsRunning.length} campaigns`);

  let total = 0;
  for (const campaign of campaignsRunning) {
    let target = '';
    if (campaign.target === AutomationCampaignTargets.M_M) {
      target = AutomationCampaignTargets.M_M_14;
    }
    if (campaign.target === AutomationCampaignTargets.M_UVS) {
      target = AutomationCampaignTargets.M_UVS_14;
    }
    if (campaign.target === AutomationCampaignTargets.M_M_23) {
      target = AutomationCampaignTargets.M_M_26;
    }
    if (campaign.target === AutomationCampaignTargets.M_UVS_23) {
      target = AutomationCampaignTargets.M_UVS_26;
    }

    const result = await app.models.AutomationCampaign.getMongoConnector().updateOne(
      {
        garageId: campaign.garageId,
        target: target,
        frequency: campaign.frequency,
      },
      {
        $set: { status: 'RUNNING' },
      }
    );

    total += result.modifiedCount;
  }

  console.log(`---> Enable campaign ${total} campaign M-14 & M-26`);
};

// start CRON
app.on('booted', async () => {
  try {
    console.log('==============start');
    await runScript(app);
    console.log('==============script end without error');
    process.exit(0);
  } catch (err) {
    console.log(err);
    process.exit(2);
  }
});
