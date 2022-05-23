const app = require('../../server/server');
const BillingHandler = require('../../common/lib/garagescore/automatic-billing/automatic-billing-handler.js');
const moment = require('moment');
const fs = require('fs');
const { ObjectID } = require('mongodb');

function old_billGarageContacts(billingAccount, garage, eachCb) {
  console.log('old method called : old_billGarageContacts');
  const month = this._now.month() === 0 ? 12 : this._now.month();
  const year = this._now.month() === 0 ? this._now.year() - 1 : this._now.year();
  const period = `${year}-month${month < 10 ? `0${month}` : month}`;
  const garageId = [new ObjectID(garage.id.toString())];

  app.models.GarageHistory.generateForPeriod(period, garageId, false, true, true, 'ALL_USERS', true)
    .then((history) => {
      this._billGarageContactsType(billingAccount, garage, history);
      eachCb();
    })
    .catch(eachCb);
}

function old_getGarageAutomationContacts(garage, cb) {
  console.log('old method called : old_getGarageAutomationContacts');
  const month = this._now.month() === 0 ? 12 : this._now.month();
  const year = this._now.month() === 0 ? this._now.year() - 1 : this._now.year();
  const period = parseInt(`${year}-month${month < 10 ? `0${month}` : month}`, 10);
  const garageId = [new ObjectID(garage.id.toString())];

  app.models.KpiByPeriod.findOne(
    {
      where: { garageId, period, kpiType: 10 },
      fields: { KPI_automationCountSentSales: 1, KPI_automationCountSentMaintenances: 1 },
    },
    (err, kpiObj) => {
      if (err || !kpiObj || (!kpiObj.KPI_automationCountSentSales && !kpiObj.KPI_automationCountSentMaintenances)) {
        console.error(`_getGarageAutomationContacts: No KPI for Garage ${garage.id.toString()} on period ${period}`);
        cb(0);
        return;
      }
      const isValidKPINumber = (count) => Number.isFinite(count) && count > 0;
      const { KPI_automationCountSentSales, KPI_automationCountSentMaintenances } = kpiObj;
      if (!isValidKPINumber(KPI_automationCountSentSales) && !isValidKPINumber(KPI_automationCountSentMaintenances)) {
        console.error(
          `_getGarageAutomationContacts: Invalid amount of Automation contacts sent for garage ${garage.id.toString()}`
        );
        cb(0);
        return;
      }
      const nContactsSent = (KPI_automationCountSentSales || 0) + (KPI_automationCountSentMaintenances || 0);
      cb(nContactsSent);
    }
  );
}

const parseArgs = (args) => {
  const isBillingAccountProvided = args.find((arg) => arg.indexOf('--billingAccounts=') !== -1);
  if (!isBillingAccountProvided) {
    throw new Error('No BillingAccount provided');
  }
  const billingAccount = isBillingAccountProvided.split('=')[1].split(',') || [];
  return {
    billingAccount,
  };
};

function generateCSV(allBills) {
  return [
    [...Object.keys(allBills[0])].join(';'),
    ...allBills
      .filter(
        (bill) =>
          ['Coût au contact', 'Coût au contact par tranche de 100'].includes(bill.optionName) ||
          bill.optionName.match(/Automation Contacts/)
      )
      .map((bill) => Object.values(bill).join(';')),
  ].join('\n');
}

async function generateKBPBills() {
  const billingHandler = new BillingHandler(moment().tz('UTC').endOf('month').valueOf(), app);
  // billingHandler._billingAccountsToBill = billingAccounts;
  return new Promise((resolve) => {
    billingHandler.forceGenerateBill((err, bill) => {
      resolve(bill);
    });
  });
}

async function generateOldMethodBills() {
  const billingHandler = new BillingHandler(moment().tz('UTC').endOf('month').valueOf(), app);
  // billingHandler._billingAccountsToBill = billingAccounts;
  billingHandler._billGarageContacts = old_billGarageContacts;
  billingHandler._getGarageAutomationContacts = old_getGarageAutomationContacts;
  return new Promise((resolve) => {
    billingHandler.forceGenerateBill((err, bill) => {
      resolve(bill);
    });
  });
}

const compareBills = (oldBills, newBills) => {
  const oldBillsKeys = Object.keys(oldBills);
  const newBillsKeys = Object.keys(newBills);
  if (oldBillsKeys.length !== newBillsKeys.length) {
    console.error('Bills are not the same');
    return false;
  }
  const isSame = oldBillsKeys.every((key) => {
    if (oldBills[key] !== newBills[key]) {
      console.error(`${key} is not the same`);
      return false;
    }
    return true;
  });
  return isSame;
};

app.on('booted', async () => {
  // const { billingAccount } = parseArgs(process.argv);

  const allBillsKbp = await generateKBPBills();
  const billsCSVKbp = generateCSV(allBillsKbp);

  fs.writeFile('automatic_billing_qa_result_kbp.csv', billsCSVKbp, 'utf8', function (err) {
    if (err) {
      console.log('error - file either not saved or corrupted file saved.');
    } else {
      console.log('file kbp saved!');
    }
  });

  const allBillsOld = await generateOldMethodBills();
  const billsCSVOld = generateCSV(allBillsOld);

  fs.writeFile('automatic_billing_qa_result_old.csv', billsCSVOld, 'utf8', function (err) {
    if (err) {
      console.log('error - file either not saved or corrupted file saved.');
    } else {
      console.log('file old saved!');
    }
  });
});
