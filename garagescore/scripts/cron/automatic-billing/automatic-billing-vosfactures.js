/* eslint-disable no-plusplus,no-await-in-loop */
/*
  Script generating VosFactures bills for the day and actualizing billingAccounts/garages.

  node scripts/cron/automatic-billing/automatic-billing-vosfactures.js --force n[1-31]
  --force : to force the execution
  --day=2 : if given, will generate the invoices normally generated at this day number
  --month=2 : if given, will generate the invoices normally generated at this month number
  --send : will also send the invoices
  --fullMonth : will generate for the whole month (either the one given or the current month
*/
const app = require('../../../server/server');
const axios = require('axios');
const aws = require('aws-sdk');
const moment = require('moment');
const CronRunner = require('../../../common/lib/cron/runner');
const BillingHandler = require('../../../common/lib/garagescore/automatic-billing/automatic-billing-handler.js');
const config = require('config');
const TimeHelper = require('../../../common/lib/util/time-helper');
const { ObjectId } = require('mongodb');

let processed = 0;
let billed = 0;
let alreadyBilled = 0;
let unprocessed = 0;
const unprocessedArray = [];
const alreadyBilledArray = [];

const _getEndOfBilledMonth = (billDate) => {
  const returnDate = new Date(billDate.getTime());
  returnDate.setMonth(returnDate.getMonth() + 1);
  returnDate.setDate(returnDate.getDate() - 1);
  return returnDate;
};

const _getInvoiceNumber = (n, invoiceNumberOffset) => {
  const width = 5;
  n = `${n - invoiceNumberOffset}`; // eslint-disable-line no-param-reassign
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
};

const getInvoiceReference = (country, billDate, invoiceNumber) => {
  const prefixes = { FR: 'FF', ES: 'FE' };
  const formattedBillDate = moment(billDate).format('YYYYMM');
  return `${prefixes[country]}${formattedBillDate}_${invoiceNumber}`;
};

const _sendInvoice = async (billingAccount, prefix, token, id, billDate) => {
  const historyItem = billingAccount.invoices.find((element) => {
    return element.sentAt === moment(billDate).format('YYYY-MM-DD');
  });
  if (historyItem) {
    return { message: 'alreadySent' };
  }
  const response = await axios.post(
    `https://${prefix}.vosfactures.fr/invoices/${id}/send_by_email.json?api_token=${token}`
  );
  if (!response.data || response.data.status !== 'ok') {
    throw new Error(
      `_sendInvoice : ${id} : Couldn't send the invoice. ${
        response.data ? response.data.message : 'No message from server.'
      }`
    );
  }
  const historyItemIndex = billingAccount.invoices.findIndex((element) => {
    return element.createdAt === moment(billDate).format('YYYY-MM-DD');
  });
  billingAccount.invoices[historyItemIndex].sentAt = moment(billDate).format('YYYY-MM-DD'); // eslint-disable-line no-param-reassign
  await billingAccount.save(); // eslint-disable-line no-param-reassign
  return 'ok';
};

const _getProducts = async (billingAccount, allBills, billDate, debug) => {
  const bills = allBills.filter((line) => line.billingAccountAccountingId === billingAccount.accountingId);
  const result = [];
  const subscriptions = [];
  let fullPrice = 0;
  let hasAlreadyBilledTransfer = false;
  for (let i = 0; i < bills.length; i++) {
    const garage = await app.models.Garage.getMongoConnector().findOne(
      { _id: ObjectId(bills[i].garageId) },
      { projection: { tva: true } }
    );

    if (bills[i].optionName === 'Set-up') {
      if (bills[i].shouldBeBilled) {
        result.push({
          name: `${bills[i].garageName} - Setup --${bills[i].optionAccountingId}--`,
          tax: garage.tva,
          code: garage._id.toString(),
          price_net: bills[i].basePrice,
          total_price_net: bills[i].totalPrice,
          total_price_gross: bills[i].totalPriceWithTaxes,
          accounting_id: bills[i].optionAccountingId,
          quantity: 1,
        });
        fullPrice += bills[i].totalPrice;
        // Setup is only paid once
        if (!debug) {
          await app.models.Garage.findByIdAndUpdateAttributes(bills[i].garageId, {
            'subscriptions.setup.alreadyBilled': true,
          });
        }
      }
    } else if (bills[i].optionName.includes('Utilisateurs')) {
      result.push({
        name: `${bills[i].garageName} - Utilisateurs --${bills[i].optionAccountingId}--`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: bills[i].quantity,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName.includes('Traitement du règlement par virement')) {
      if (!hasAlreadyBilledTransfer) {
        result.push({
          name: `Traitement du règlement par virement --${bills[i].optionAccountingId}--`,
          tax: garage.tva,
          code: garage._id.toString(),
          additional_info: '',
          price_net: bills[i].basePrice,
          total_price_net: bills[i].totalPrice,
          total_price_gross: bills[i].totalPriceWithTaxes,
          accounting_id: bills[i].optionAccountingId,
          quantity: bills[i].quantity,
        });
      }
      hasAlreadyBilledTransfer = true;
    } else if (bills[i].optionName.includes('Coût au contact')) {
      result.push({
        name: `${bills[i].garageName} - GarageScore Contacts du ${moment(
          new Date(billDate.getFullYear(), billDate.getMonth() - 1, 1)
        ).format('DD/MM/YYYY')} au ${moment(new Date(billDate.getFullYear(), billDate.getMonth(), 0)).format(
          'DD/MM/YYYY'
        )} --${bills[i].optionAccountingId}--`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: bills[i].quantity,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName.includes('E-Réputation')) {
      result.push({
        name: `${bills[i].garageName} - E-Réputation --${bills[i].optionAccountingId}-- du ${moment(billDate).format(
          'DD/MM/YYYY'
        )} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: 1,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName.includes('Manager')) {
      const optionAccountingId = bills[i].optionAccountingId;
      const isMirror = optionAccountingId.charAt(5) === '3';
      const label = isMirror ? 'Miroir' : 'Manager';
      result.push({
        name: `${bills[i].garageName} - ${label} --${optionAccountingId}-- du ${moment(billDate).format(
          'DD/MM/YYYY'
        )} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: 1,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName.includes('Coaching')) {
      result.push({
        name: `${bills[i].garageName} - Coaching --${bills[i].optionAccountingId}-- du ${moment(billDate).format(
          'DD/MM/YYYY'
        )} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: 1,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName.includes('Connect')) {
      result.push({
        name: `${bills[i].garageName} - Connect --${bills[i].optionAccountingId}-- du ${moment(billDate).format(
          'DD/MM/YYYY'
        )} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: 1,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName.includes('Automation Contacts')) {
      result.push({
        name: `${bills[i].garageName} - ${bills[i].optionName} --${bills[i].optionAccountingId}-- du ${moment(
          new Date(billDate.getFullYear(), billDate.getMonth() - 1, 1)
        ).format('DD/MM/YYYY')} au ${moment(new Date(billDate.getFullYear(), billDate.getMonth(), 0)).format(
          'DD/MM/YYYY'
        )}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: bills[i].quantity,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName === 'Automation') {
      result.push({
        name: `${bills[i].garageName} - Abonnement Automation --${bills[i].optionAccountingId}-- du ${moment(
          billDate
        ).format('DD/MM/YYYY')} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: 1,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName === 'X-Leads sources supplémentaires') {
      result.push({
        name: `${bills[i].garageName} - X-Leads sources supplémentaires --${bills[i].optionAccountingId}-- du ${moment(
          billDate
        ).format('DD/MM/YYYY')} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: bills[i].quantity,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName === 'X-Leads consommation mobile') {
      result.push({
        name: `${bills[i].garageName} - X-Leads consommation mobile --${bills[i].optionAccountingId}-- du ${moment(
          billDate
        )
          .subtract(1, 'month')
          .startOf('month')
          .format('DD/MM/YYYY')} au ${moment(billDate).subtract(1, 'month').endOf('month').format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: bills[i].quantity,
      });
      fullPrice += bills[i].totalPrice;
    } else if (bills[i].optionName === 'X-Leads') {
      result.push({
        name: `${bills[i].garageName} - Abonnement X-Leads --${bills[i].optionAccountingId}-- du ${moment(
          billDate
        ).format('DD/MM/YYYY')} au ${moment(_getEndOfBilledMonth(billDate)).format('DD/MM/YYYY')}`,
        tax: garage.tva,
        code: garage._id.toString(),
        additional_info: bills[i].garageName,
        price_net: bills[i].basePrice,
        total_price_net: bills[i].totalPrice,
        total_price_gross: bills[i].totalPriceWithTaxes,
        accounting_id: bills[i].optionAccountingId,
        quantity: 1,
      });
      fullPrice += bills[i].totalPrice;
    } else {
      const index = subscriptions.findIndex((e) => e.additional_info === bills[i].garageName);
      if (index !== -1) {
        subscriptions[index].name += `, ${bills[i].optionName}`;
        subscriptions[index].price_net += bills[i].basePrice;
        subscriptions[index].total_price_net += bills[i].totalPrice;
        subscriptions[index].total_price_gross += bills[i].totalPriceWithTaxes;
      } else {
        subscriptions.push({
          name: `${bills[i].garageName} - Abonnement GarageScore --${bills[i].optionAccountingId}-- (${bills[i].optionName}`,
          tax: garage.tva,
          code: garage._id.toString(),
          additional_info: bills[i].garageName,
          price_net: bills[i].basePrice,
          total_price_net: bills[i].totalPrice,
          total_price_gross: bills[i].totalPriceWithTaxes,
          accounting_id: bills[i].optionAccountingId,
          quantity: 1,
        });
      }
      fullPrice += bills[i].totalPrice;
    }
  }
  subscriptions.forEach((e) => {
    e.name += `) du ${moment(billDate).format('DD/MM/YYYY')} au ${moment(_getEndOfBilledMonth(billDate)).format(
      'DD/MM/YYYY'
    )}`; // eslint-disable-line
  });
  return fullPrice > 0 ? [...result, ...subscriptions].sort((a, b) => a.name.localeCompare(b.name)) : [];
};

const _getOrCreateClient = async (billingAccount, prefix, token) => {
  // Determine the route used (client existing -> modify, client nonexistent -> create)
  let route = `https://${prefix}.vosfactures.fr/clients.json`;
  let requestMethod = 'post';
  if (billingAccount.vfClientId) {
    route = `https://${prefix}.vosfactures.fr/clients/${billingAccount.vfClientId}.json`;
    requestMethod = 'put';
  }
  let response = null;
  try {
    response = await axios[requestMethod](route, {
      api_token: token,
      client: {
        name: billingAccount.companyName,
        city: billingAccount.city,
        email:
          (config.has('billing.overrideBuyerEmail') && config.get('billing.overrideBuyerEmail')) ||
          billingAccount.email,
        post_code: billingAccount.postalCode,
        street: billingAccount.address,
        note: billingAccount.note,
        accounting_id: '411000',
        accounting_id2: billingAccount.accountingId,
      },
    });
  } catch (e) {
    console.log(e);
    throw new Error(
      `_getOrCreateClient : Something went wrong with the creation by VF. ${billingAccount.getId().toString()}. ${e}`
    );
  }
  if (!response || !response.data || !response.data.id) {
    throw new Error(
      `_getOrCreateClient : No ID returned from api, something went wrong with the creation. ${billingAccount
        .getId()
        .toString()}`
    );
  }
  await billingAccount.updateAttribute('vfClientId', response.data.id);
  return response.data.id;
};

const _createProduct = async (product, prefix, token) => {
  let response = null;
  try {
    response = await axios.post(`https://${prefix}.vosfactures.fr/products.json`, {
      api_token: token,
      name: product.name,
      tax: product.tax,
      additional_info: product.additional_info,
      price_net: product.price_net,
      accounting_id: product.accounting_id,
    });
  } catch (e) {
    throw new Error(`_createProduct : Something went wrong with the creation by VF. ${e}`);
  }
  if (!response || !response.data || !response.data.id) {
    throw new Error('_createProduct : No ID returned from api, something went wrong with the creation.');
  }
  return response.data.id;
};

const _createInvoice = async (
  billingAccount,
  prefix,
  token,
  invoiceNumber,
  allBills,
  billDate,
  debug,
  upload,
  departments
) => {
  // Check if the invoice already exist,a dn if it does, returns the corresponding history item
  processed++;
  const historyItem = billingAccount.invoices.find((element) => {
    return element.createdAt === moment(billDate).format('YYYY-MM-DD');
  });
  if (historyItem) {
    alreadyBilled++;
    alreadyBilledArray.push(billingAccount.accountingId);
    historyItem.message = 'alreadyCreated';
    return historyItem;
  }

  // Get the clientId, and if it doesn't exist, set a new Client to the billingAccount
  const clientId = debug ? 'debug' : await _getOrCreateClient(billingAccount, prefix, token);

  // Generate the invoice
  console.log(billingAccount.accountingId);
  // positions are products. Here, we generate them through GS then we create them through VF.
  const positions = await _getProducts(billingAccount, allBills, billDate, debug);
  for (const pos of positions) {
    pos.product_id = debug ? `debug${pos.name}` : await _createProduct(pos, prefix, token);
    delete pos.name;
    delete pos.additional_info;
    delete pos.price_net;
    delete pos.accounting_id;
  }
  const invoiceNumberToSend =
    (!process.env.APP_URL.includes('app.custeed.com') ? Date.now() : '') +
    getInvoiceReference(billingAccount.country, billDate, invoiceNumber);
  // Invoice creation
  const invoice = {
    internal_note: billingAccount.accountingId,
    kind: 'vat',
    number: invoiceNumberToSend,
    income: 1,
    issue_date: moment(billDate).format('YYYY-MM-DD'),
    payment_type: billingAccount.billingType === 'debit' ? 'direct_debit' : 'transfer',
    seller_email: 'compta@garagescore.com', // ??? Bizarre, sur garagescore.vosfactures.fr, je vois que c'est bbodrefaux@garagescore.com...
    client_id: clientId,
    show_discount: 0,
    payment_to: moment(billDate).format('YYYY-MM-DD'),
    currency: 'EUR',
    category_id: '',
    calculating_strategy: {
      position: 'default',
      sum: 'keep_net',
      invoice_form_price_kind: 'net',
    },
    positions,
    test: !process.env.APP_URL.includes('app.custeed.com'),
  };
  // send invoice for specific department, get department_id: by @bb
  // doc: https://github.com/vosfactures/API/#documents-de-facturation--actions-et-champs
  if (departments && departments.length > 0 && billingAccount.country) {
    const departmentId = departments.filter((d) => d.shortcut === `Custeed_${billingAccount.country}`);
    invoice.department_id = departmentId[0].id;
    console.log(`create invoice department: ${billingAccount.country} - ${departmentId[0].id}`); // eslint-disable-line max-len
  } else {
    console.log(`No departments find billing Account: ${billingAccount.id} filiale: ${billingAccount.country}`);
  }
  if (invoice.positions.length === 0) {
    unprocessed++;
    unprocessedArray.push(billingAccount.accountingId);
    return { message: 'noGarageToBill' };
  }
  if (debug) {
    billed++;
    console.log(JSON.stringify(positions));
    return {};
  }
  let response = {};
  try {
    response = await axios.post(`https://${prefix}.vosfactures.fr/invoices.json`, { api_token: token, invoice });
  } catch (e) {
    console.error(e);
    throw new Error(
      `_createInvoice : Something went wrong with the creation by VF. ${invoice.client_id} - ${JSON.stringify(
        invoice
      )}. ${e}, ${JSON.stringify(e.response.data)}`
    );
  }
  if (!response || !response.data || !response.data.id) {
    throw new Error(
      `_createInvoice : No ID returned from api, something went wrong with the creation. ${billingAccount
        .getId()
        .toString()} - ${JSON.stringify(invoice)}`
    );
  }
  billingAccount.invoices.push({
    createdAt: moment(billDate).format('YYYY-MM-DD'),
    sentAt: null,
    id: response.data.id,
  });
  billingAccount.sentLastAt = moment(billDate).format('YYYYMM'); // eslint-disable-line no-param-reassign
  if (!debug) {
    await billingAccount.save();
  }

  // Now we download the pdf and save it on S3
  if (!debug && upload) {
    try {
      const pdf = (
        await axios.get(`https://${prefix}.vosfactures.fr/invoices/${response.data.id}.pdf?api_token=${token}`, {
          responseType: 'arraybuffer',
          responseEncoding: 'null',
        })
      ).data;

      aws.config.region = 'eu-central-1';
      const awsS3Bucket = new aws.S3({ params: { Bucket: 'facturation-automatique' } });

      await new Promise((res) => awsS3Bucket.createBucket(() => res()));
      const id = billingAccount.id.toString();
      const name = billingAccount.name.toLowerCase().trim().replace(/\s+/g, '-');
      const year = moment(billDate).year();
      const monthName = moment(billDate).format('MMMM').toLowerCase();
      const month = moment(billDate).format('MM');
      const day = moment(billDate).date();
      const uploadParameters = {
        Key: `${id}/${year}/${month}-${monthName}/facture-${name}-${day}-${month}-${year}.pdf`,
        ACL: 'private',
        ContentType: 'application/pdf',
        Body: pdf,
      };

      await new Promise((res, rej) => awsS3Bucket.upload(uploadParameters, (e) => (e ? rej(e) : res())));
    } catch (e) {
      console.error(`Unable to fetch PDF from VosFactures or unable to upload it to S3 : ${JSON.stringify(e)}`);
    }
  }
  return response.data;
};

const _getToken = async () => {
  // // INVALID MDP/EMAIL ERROR (Ticket #2700)
  // const response_login = await axios.post(
  //   'https://app.vosfactures.fr/login.json',
  //   {
  //     login: process.env.VOSFACTURES_LOGIN,
  //     password: process.env.VOSFACTURES_PASSWORD
  //   }
  // );
  // console.log(response_login);
  const response = {
    data: {
      prefix: process.env.VOSFACTURES_PREFIX,
      api_token: process.env.VOSFACTURES_API_TOKEN,
    },
  };
  if (response.data && response.data.prefix && response.data.api_token) {
    return response.data;
  }
  throw new Error('_getToken : Login failed. Could not retrieve prefix or api_token');
};

const _getBillingAccountsForTheDay = async (billDate, billingAccountsIds) => {
  const where = {};
  const tommorow = new Date(billDate);
  tommorow.setDate(tommorow.getDate() + 1);
  if (tommorow.getDate() < billDate.getDate()) {
    where.or = [];
    for (let i = billDate.getDate(); i < 32; i++) {
      where.or.push({ billingDate: i });
    }
  } else {
    where.billingDate = billDate.getDate();
  }
  if (Array.isArray(billingAccountsIds)) {
    where._id = { in: billingAccountsIds.map((id) => new ObjectId(id)) };
  }

  return app.models.BillingAccount.find({ where });
};

const _getPaddingBillingAccounts = async (billDate) => {
  // That will get an array like [{ _id: 'FR', count: 357 }, { _id: 'ES', count: 911 }, ...]
  const rawAggregateResult = await app.models.BillingAccount.getMongoConnector()
    .aggregate([
      { $match: { 'invoices.createdAt': new RegExp(moment(billDate).format('YYYY')) } },
      { $unwind: '$invoices' },
      { $match: { 'invoices.createdAt': new RegExp(moment(billDate).format('YYYY')) } },
      { $project: { country: { $ifNull: ['$country', 'FR'] } } },
      { $group: { _id: { $ifNull: ['$country', 'FR'] }, count: { $sum: 1 } } },
    ])
    .toArray();

  // Tranform it into : { FR: 357, ES: 911, ... }
  return Object.fromEntries(rawAggregateResult.map(({ _id, count }) => [_id, count]));
};

const _generateAllInvoices = async (billDate, shouldSend, debug, upload, billingAccountsIds) => {
  try {
    const loginData = await _getToken();
    const billingAccounts = await _getBillingAccountsForTheDay(billDate, billingAccountsIds);
    const departments = await axios.get(
      `https://${loginData.prefix}.vosfactures.fr/departments.json?api_token=${loginData.api_token}`
    );
    const paddings = await _getPaddingBillingAccounts(billDate);
    const billingHandler = new BillingHandler(moment(billDate).tz('UTC').endOf('month').valueOf(), app);
    const allBills = await new Promise((resolve) => {
      billingHandler.forceGenerateBill((err, bill) => {
        resolve(bill);
      });
    });
    // Incremented when there's an error on invoice creation, so we don't skip a number
    const invoiceNumberOffsets = {};

    for (let i = 0; i < billingAccounts.length; i++) {
      if (!billingAccounts[i].invoices) {
        billingAccounts[i].invoices = []; // eslint-disable-line no-param-reassign
      }

      const billingCountry = billingAccounts[i].country || 'FR';
      invoiceNumberOffsets[billingCountry] = invoiceNumberOffsets[billingCountry] || 0;
      paddings[billingCountry] = paddings[billingCountry] || 0;
      paddings[billingCountry]++;
      const invoiceNumber = _getInvoiceNumber(paddings[billingCountry], invoiceNumberOffsets[billingCountry]);

      const invoiceCreationData = await _createInvoice(
        billingAccounts[i],
        loginData.prefix,
        loginData.api_token,
        invoiceNumber,
        allBills,
        billDate,
        debug,
        upload,
        departments.data
      );
      const { companyName } = billingAccounts[i];
      const billingAccountId = billingAccounts[i].getId().toString();

      if (invoiceCreationData && invoiceCreationData.message === 'noGarageToBill') {
        console.log(`Invoice not created for ${companyName}: ${billingAccountId} . No garage to bill.`);
        invoiceNumberOffsets[billingCountry]++;
      } else {
        if (invoiceCreationData && invoiceCreationData.message === 'alreadyCreated') {
          console.log(
            `Invoice already created successfully for ${companyName}: ${billingAccountId}. Invoice ID: ${invoiceCreationData.id}`
          );
          invoiceNumberOffsets[billingCountry]++;
        } else {
          console.log(
            `${invoiceNumber}: Invoice created successfully for ${companyName}: ${billingAccountId}. Invoice ID: ${invoiceCreationData.id}`
          );
        }
        if (shouldSend && !debug) {
          const invoiceSendingData = await _sendInvoice(
            billingAccounts[i],
            loginData.prefix,
            loginData.api_token,
            invoiceCreationData.id,
            billDate
          );
          if (invoiceSendingData && invoiceSendingData.message === 'alreadySent') {
            console.log(
              `Invoice already sent successfully for ${companyName}: ${billingAccountId}. Invoice ID: ${invoiceCreationData.id}`
            );
          } else {
            console.log(
              `${invoiceNumber}: Invoice sent successfully for ${companyName}: ${billingAccountId}. Invoice ID: ${invoiceCreationData.id}`
            );
          }
        }
      }
    }
    return null;
  } catch (e) {
    return e;
  }
};

const main = async (args, options, callback) => {
  let billDate = new Date();

  if (args.month) {
    billDate.setMonth(args.month - 1); // Dates en JS
  }
  if (args.day) {
    billDate.setDate(args.day);
  } else if (options && options.executionStepNumber) {
    billDate = new Date(TimeHelper.dayNumberToDate(options.executionStepNumber));
  }
  if (args.pastYear) {
    billDate.setFullYear(billDate.getFullYear() - 1);
  }
  if (args.fullMonth) {
    billDate.setDate(1);
    const month = billDate.getMonth();
    while (billDate.getMonth() === month) {
      const invoiceGenerationErrorMonth = await _generateAllInvoices(
        billDate,
        args.send,
        args.debug,
        args.upload,
        args.billingAccountsIds
      );
      if (invoiceGenerationErrorMonth) {
        callback(invoiceGenerationErrorMonth);
        return;
      }
      billDate.setDate(billDate.getDate() + 1);
    }
    callback();
    return;
  }
  const invoiceGenerationError = await _generateAllInvoices(
    billDate,
    args.send,
    args.debug,
    args.upload,
    args.billingAccountsIds
  );
  callback(invoiceGenerationError);
};

const _parseArgs = (args) => {
  const options = {};
  const day = args.find((arg) => arg.indexOf('--day=') !== -1);
  const month = args.find((arg) => arg.indexOf('--month=') !== -1);
  const pastYear = args.find((arg) => arg.indexOf('--pastYear') !== -1);
  const billingAccountsIdsArgs = args.find((arg) => arg.indexOf('--billingAccountsIds=') !== -1);
  options.force = args.includes('--force');
  options.send = args.includes('--send');
  options.fullMonth = args.includes('--fullMonth');
  options.day = day ? parseInt(day.substr(6), 10) : null;
  options.month = month ? parseInt(month.substr(8), 10) : null;
  options.pastYear = !!pastYear;
  options.debug = args.includes('--debug');
  options.upload = args.includes('--upload'); // enable upload pdf to S3
  options.billingAccountsIds = billingAccountsIdsArgs
    ? billingAccountsIdsArgs.replace('--billingAccountsIds=', '').split(',')
    : null;
  return options;
};

app.on('booted', () => {
  const parsedArgs = _parseArgs(process.argv);
  if (parsedArgs.force) {
    // running outside of cron
    console.log('[Automatic Billing VosFactures] Running without cronRunner');
    main(parsedArgs, null, (err) => {
      if (err) {
        console.log(err);
      }
      if (err && err.response && err.response.data && err.response.data.message) console.log(err.response.data.message);
      if (parsedArgs.debug) {
        console.log(
          `Debug ended. ${
            billed + alreadyBilled
          }/${processed} accounts billed.\n${unprocessed} accounts unprocessed : ${unprocessedArray.join(
            ', '
          )}\n${alreadyBilled} accounts already billed : ${alreadyBilledArray.join(', ')}`
        );
      }
      console.log('Script end successful !');
      process.exit(err ? -1 : 0);
    });
  } else {
    console.log('[Automatic Billing VosFactures] Running inside cronRunner');
    const runner = new CronRunner({
      frequency: CronRunner.supportedFrequencies.DAILY,
      description: 'Facturation des comptes via VosFactures',
    });
    runner.execute = (options, callback) => {
      main(parsedArgs, options, callback);
    };
    runner.run((err) => {
      err ? console.log(err) : console.log('Génération des factures via VosFactures terminé sans un pépin'); // eslint-disable-line
      if (parsedArgs.debug) {
        console.log(
          `Debug ended. ${
            billed + alreadyBilled
          }/${processed} accounts billed.\n${unprocessed} accounts unprocessed : ${unprocessedArray.join(
            ', '
          )}\n${alreadyBilled} accounts already billed : ${alreadyBilledArray.join(', ')}`
        );
      }
      process.exit(err ? -1 : 0);
    });
  }
});
