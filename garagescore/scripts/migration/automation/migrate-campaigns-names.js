const app = require('../../../server/server');
const { ObjectId } = require('mongodb');
const { AutomationCampaignTargets, JobTypes, ContactTypes } = require('../../../frontend/utils/enumV2');
const AutomationCampaignTypes = require('../../../common/models/automation-campaign.type');
const { concurrentpromiseAll } = require('../../../common/lib/util/concurrentpromiseAll');

/**
 * script oneShoot for update target name TRIAL, SCORING and VS_M
 * delete me when https://github.com/garagescore/garagescore/issues/4731 is merge with master
 */
const _updateTargetName = (target) => {
  switch (target) {
    case 'TRIAL_APV_18':
      return AutomationCampaignTargets.VS_M_6;
    case 'TRIAL_NVS_18':
      return AutomationCampaignTargets.VS_NVS_18;
    case 'TRIAL_UVS_18':
      return AutomationCampaignTargets.VS_UVS_18;
    case 'SCORING_APV_24':
      return AutomationCampaignTargets.VS_M_12;
    case 'SCORING_NVS_24':
      return AutomationCampaignTargets.VS_NVS_24;
    case 'SCORING_UVS_24':
      return AutomationCampaignTargets.VS_UVS_24;
    case 'VS_M':
      return AutomationCampaignTargets.VS_M_11;
    default:
      return target;
  }
};

const updateCustomerTarget = async (customer) => {
  const automationCampaignsEvents = customer.automationCampaignsEvents.map((campaign) => {
    campaign.target = _updateTargetName(campaign.target);
    return campaign;
  });
  const automationCampaigns = customer.automationCampaigns.map((campaign) => {
    campaign.target = _updateTargetName(campaign.target);
    return campaign;
  });

  return app.models.Customer.getMongoConnector().updateOne(
    { _id: ObjectId(customer._id.toString()) },
    { $set: { automationCampaignsEvents, automationCampaigns } }
  );
};

const _parseArgs = (args) => {
  let start = null;
  let limit = 9999999;
  if (args.includes('--start')) {
    start = parseInt(args[process.argv.indexOf('--start') + 1]);
  }
  if (args.includes('--limit')) {
    limit = parseInt(args[process.argv.indexOf('--limit') + 1]);
  }
  return { start, limit };
};

app.on('booted', async () => {
  console.time('-----running_script');
  const { start, limit } = _parseArgs(process.argv);
  /*------------------ update customers ------------------*/
  /*----------------------------------------------------- */
  if (start === 0) {
    const customersToUpdate = await app.models.Customer.getMongoConnector()
      .find({
        'automationCampaigns.campaignType': AutomationCampaignTypes.AUTOMATION_VEHICLE_SALE,
      })
      .project({ _id: 1, automationCampaignsEvents: 1, automationCampaigns: 1 })
      .limit(limit)
      .toArray();

    const promisesCustomers = customersToUpdate.map((customer) => {
      return () => updateCustomerTarget(customer);
    });

    await concurrentpromiseAll(promisesCustomers, 250, true);
    console.log(`updated ${customersToUpdate.length} customer done`);
  }

  /*--------------------- update jobs --------------------*/
  /*----------------------------------------------------- */
  if (start === 1) {
    const targets = [
      'TRIAL_APV_18',
      'TRIAL_NVS_18',
      'TRIAL_UVS_18',
      'SCORING_APV_24',
      'SCORING_NVS_24',
      'SCORING_UVS_24',
      'VS_M',
    ];

    for (target of targets) {
      const jobsToUpdate = await app.models.Job.getMongoConnector().updateMany(
        {
          type: JobTypes.AUTOMATION_SEND_CONTACT_TO_CUSTOMER,
          scheduledAt: { $gte: 27000000 }, // just before TRIAL and SCORING was merge in prod
          'payload.target': target,
        },
        {
          $set: {
            'payload.target': _updateTargetName(target),
          },
        }
      );
      console.log(`updated ${jobsToUpdate.modifiedCount} jobs target ${target} done`);
    }
  }
  /*------------------- update contacts ------------------*/
  /*----------------------------------------------------- */
  if (start === 2) {
    const types = [
      ContactTypes.AUTOMATION_CAMPAIGN_EMAIL,
      ContactTypes.AUTOMATION_CAMPAIGN_SMS,
      ContactTypes.AUTOMATION_GDPR_EMAIL,
      ContactTypes.AUTOMATION_GDPR_SMS,
    ];
    const targets = [
      'TRIAL_APV_18',
      'TRIAL_NVS_18',
      'TRIAL_UVS_18',
      'SCORING_APV_24',
      'SCORING_NVS_24',
      'SCORING_UVS_24',
      'VS_M',
    ];
    for (const type of types) {
      console.log(`updated contacts type: ${type}`);
      for (const target of targets) {
        const contactToUpdate = await app.models.Contact.getMongoConnector().updateMany(
          {
            type: type,
            'payload.target': target,
          },
          {
            $set: { 'payload.target': _updateTargetName(target) },
          }
        );
        console.log(`updated ${contactToUpdate.modifiedCount} contacts done for ${target}`);
      }
    }
  }

  console.timeEnd('-----running_script');
  process.exit(0);
});
