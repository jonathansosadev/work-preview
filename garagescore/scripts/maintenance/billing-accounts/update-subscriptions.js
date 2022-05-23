const { ObjectId } = require('mongodb');
const readline = require("readline");

const app = require ('../../../server/server.js');
const garageSubscriptions = require('../../../common/models/garage.subscription.type.js');

const subscriptionsName = garageSubscriptions.values()

// if you need help: update-subscriptions.js --help
const HELP_MESSAGE =  `
Input asked:
  * \x1b[34mBilling Account ID:\x1b[0m must be an ObjectID
  * \x1b[34mName of the subscription:\x1b[0m must be one of the following options: ${subscriptionsName.join(', ')}
  * \x1b[34mEnable:\x1b[0m is the subscription should be enable or not: value --> "true" or "false"
  * \x1b[34mPrice:\x1b[0m Number between 0 and Infinity (use dot not comma for float)
  * \x1b[34mEvery:\x1b[0m Number between 0 and Infinity (only for Automation)
  * \x1b[34mIncluded:\x1b[0m Number between 0 and Infinity (only for Automation and CrossLeads)
  * \x1b[34mUnit Price:\x1b[0m Number between 0 and Infinity (only for CrossLeads)
`;

const ERROR_MESSAGE = {
  ARGUMENT_REQUIRED: '\x1b[31mARGUMENTS ARE MISSING\x1b[0m',
  INVALID_ID: '\x1b[31mINVALID BILLING ACCOUNT ID\x1b[0m',
  INVALID_SUBSCRIPTION_NAME: `\x1b[31mSUBSCRIPTION_NAME IS INVALID, must be one of the following options: ${subscriptionsName.join(', ')}\x1b[0m`,
  INVALID_INT: '\x1b[31mINVALID NUMBER\x1b[0m',
  NO_BILLING_ACCOUNT: '\x1b[31mNO BILLING ACCOUNT FOUND\x1b[0m',
  NO_VALUE_UPDATE: '\x1b[31mNO VALUE TO UPDATE FOUND\x1b[0m',
  INVALID_ENABLE: '\x1b[31mEnable is invalid must be one of the following value: "true" or "false" \x1b[0m',
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.on("close", function() {
  process.exit(0);
});

const needHelp = () => {
  if (['help', '--help', '-h'].includes(process.argv[2])) {
    console.log(HELP_MESSAGE);
    return 1;
  }
  return 0;
};

const getValidNumber = (value) => {
  if (!value && value !== 0) return false;
  const num = Number(value);
  if ((!num && num !== 0) || num < 0) throw Error(ERROR_MESSAGE.INVALID_INT);
  return num
}


const askArgument = (question, isRequired) => new Promise((resolve, reject) => {
  rl.question(question, (answer) => {
    if (!isRequired || answer) resolve(answer);
    else reject(ERROR_MESSAGE.ARGUMENT_REQUIRED);
  });
});

const getBillingAccount = async () => {
  const billingAccountId = await askArgument('\x1b[34mBilling Account Id: \x1b[0m', true)
  if (!ObjectId.isValid(billingAccountId)) throw Error(ERROR_MESSAGE.INVALID_ID)
  const billingAccount = await app.models.BillingAccount.getMongoConnector().findOne({ _id: ObjectId(billingAccountId) });

  if (!billingAccount) throw Error(ERROR_MESSAGE.NO_BILLING_ACCOUNT);
  console.log(`
  billing Account Name: \x1b[32m${billingAccount.name}\x1b[0m
  garages count: \x1b[32m${billingAccount.garageIds.length}\x1b[0m
  `)
  return billingAccount;
}

const getSubscriptionName = async () => {
  const subscriptionName = await askArgument('\x1b[34mSubscription name: \x1b[0m', true);
  if (!subscriptionsName.includes(subscriptionName)) throw Error(ERROR_MESSAGE.INVALID_SUBSCRIPTION_NAME)
  return subscriptionName;
}

const getEnable = async () => {
  const enable = await askArgument('\x1b[34mEnable (true/false | enter to skip): \x1b[0m');
  if (!enable) return undefined
  if (['true', 'false'].includes(enable)) return enable;
  throw Error(ERROR_MESSAGE.INVALID_ENABLE)
}

const getOptionalValue = async (key) => {
  const value = await askArgument(`\x1b[34m${key} (enter to skip): \x1b[0m`)
  return getValidNumber(value);
}

const updateGaragesSubscription = async ({
  billingAccount,
  subscriptionName,
  enable,
  price,
  every,
  unitPrice,
  included
}) => {
  console.log('\nUpdating subscription... \n')
  const result = await app.models.Garage.getMongoConnector().updateMany(
    {
      _id: {
        $in: billingAccount.garageIds.map(ObjectId),
      },
     'subscriptions.active': true,
    },
    {
      $set: {
        ...(enable && { [`subscriptions.${subscriptionName}.enabled`]: enable === 'true' }),
        ...((price || price === 0) && { [`subscriptions.${subscriptionName}.price`]: price }),
        ...((every || every === 0) && { [`subscriptions.${subscriptionName}.every`]: every }),
        ...((unitPrice || unitPrice === 0) && { [`subscriptions.${subscriptionName}.unitPrice`]: unitPrice }),
        ...((included || included === 0) && { [`subscriptions.${subscriptionName}.included`]: included }),
      },
    }
  );
  console.log(`
Total garages modified: \x1b[32m${result.modifiedCount}\x1b[0m`
);
};

app.on('booted', async () => {
  try {
    console.clear()
    console.log('\n*** START Update Subscription Script ***\n\n');
    if (needHelp()) return process.exit(0);
    const billingAccount = await getBillingAccount();
    const subscriptionName = await getSubscriptionName();
    const enable = await getEnable();
    const price = await getOptionalValue('Price');

    const every = subscriptionName === 'Automation' ? await getOptionalValue('Every') : false;
    const included = ['Automation', 'CrossLeads'].includes(subscriptionName) ? await getOptionalValue('Included') : false;
    const unitPrice = subscriptionName === 'CrossLeads' ? await getOptionalValue('Unit Price') : false;

    await updateGaragesSubscription({
      billingAccount,
      subscriptionName,
      enable,
      price,
      every,
      included,
      unitPrice,
    });

    console.log('\n\n*** END Update Subscription Script (no error) ***\n');
    process.exit(0);
  } catch (err) {
    console.log(err);
    console.log('\n \x1b[31m*** END Update Subscription Script with errors *** \x1b[0m\n');
    process.exit(1);
  }
});
