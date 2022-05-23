/**
 * this script must reset the counter user.countActiveLeadTicket which will be shown in the lead page KPI on cockpit for a given userId
 */
const fs = require('fs');
const app = require('../../../server/server.js');
const promises = require('../../../common/lib/util/promises');

const run = async function () {
  const allGarages = await app.models.Garage.find({});
  const billingAccounts = await app.models.BillingAccount.find({});
  const allDisparitiesArray = [];
  for (let k = 0; k < allGarages.length; k++) {
    const garage = allGarages[k];
    if (garage.automaticBillingSubscriptionIds && garage.automaticBillingSubscriptionIds.length > 0) {
      let sub = null;
      for (let i = 0; i < garage.automaticBillingSubscriptionIds.length; i++) {
        sub = await app.models.AutomaticBillingSubscription.findById(garage.automaticBillingSubscriptionIds[i]);
        if (sub.active) {
          i = garage.automaticBillingSubscriptionIds.length;
        } else {
          sub = null;
        }
      }
      const disparities = [];
      if (sub) {
        if (
          !!(sub && sub.subApv && sub.subApv.enabled) !==
          !!(garage && garage.subscriptions && garage.subscriptions.Maintenance)
        ) {
          disparities.push('APV - ');
        }
        if (
          !!(sub && sub.subSale && sub.subSale.enabled) !==
          !!(
            (garage && garage.subscriptions && garage.subscriptions.NewVehicleSale) ||
            (garage && garage.subscriptions && garage.subscriptions.UsedVehicleSale)
          )
        ) {
          disparities.push('VN or VO - ');
        }
        if (
          !!(sub && sub.subLeads && sub.subLeads.enabled) !==
          !!(garage && garage.subscriptions && garage.subscriptions.Lead)
        ) {
          disparities.push('Leads - ');
        }
        if (
          !!(sub && sub.subEReputation && sub.subEReputation.enabled) !==
          !!(garage && garage.subscriptions && garage.subscriptions.EReputation)
        ) {
          disparities.push('E-rep - ');
        }
        if (
          !!(sub && sub.subVehicleInspection && sub.subVehicleInspection.enabled) !==
          !!(garage && garage.subscriptions && garage.subscriptions.VehicleInspection)
        ) {
          disparities.push('Vehicle Inspection - ');
        }
      } else {
        if (garage && garage.subscriptions && garage.subscriptions.Maintenance) {
          disparities.push('APV - ');
        }
        if (
          (garage && garage.subscriptions && garage.subscriptions.NewVehicleSale) ||
          (garage && garage.subscriptions && garage.subscriptions.UsedVehicleSale)
        ) {
          disparities.push('VN or VO - ');
        }
        if (garage && garage.subscriptions && garage.subscriptions.Lead) {
          disparities.push('Leads - ');
        }
        if (garage && garage.subscriptions && garage.subscriptions.EReputation) {
          disparities.push('E-rep - ');
        }
        if (garage && garage.subscriptions && garage.subscriptions.VehicleInspection) {
          disparities.push('Vehicle Inspection - ');
        }
      }
      if (disparities.length > 0) {
        const bAcc = billingAccounts.find((b) => {
          return b && b.garageIds && b.garageIds.find((id) => (id = garage.getId())) !== undefined;
        });
        // let url = `app.custeed.com/grey-bo/automatic-billing/billing-account/${bAcc.name.toLowerCase().replace(/[\s+]/g, '-')}/garages/${garage.slug}`;
        let url = '';
        let log = `${garage.getId().toString()} / ${garage.slug} / ${url} : `;
        for (let p = 0; p < disparities.length; p++) {
          log += disparities[p];
        }
        log += '\n';
        allDisparitiesArray.push(log);
      }
    }
  }
  let result = '';
  for (let i = 0; i < allDisparitiesArray.length; i++) {
    result += allDisparitiesArray[i];
  }
  fs.writeFileSync('resultsDisparities.txt', result, 'utf8');
};

app.on('booted', () => {
  console.log(`Check started : ${new Date()}`);
  run()
    .then(() => {
      console.log(`Check ended : ${new Date()}`);
      process.exit(0);
    })
    .catch((err) => {
      console.error(`Error: ${err}`);
      process.exit(-1);
    });
});
