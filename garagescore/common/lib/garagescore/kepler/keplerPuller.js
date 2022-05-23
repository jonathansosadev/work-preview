const axios = require('axios');
const moment = require('moment');

const BASE_URL = 'https://www.kepler-soft.net/api/';
const TOKEN_URL = `${BASE_URL}v3.0/auth-token/`; // POST with apiKey as payload
const INVOICE_URL = `${BASE_URL}v3.0/invoice/`; // GET with header X-Auth-Token, page ? , count ?
const VEHICLE_URL = `${BASE_URL}v3.0/vehicles/`; // GET with header X-Auth-Token,

const emptyObject = [
  {
    maintenanceDate: '',
    amount: '',
    civility: '',
    firstName: '',
    lastName: '',
    mobilePhone: '',
    telephone: '',
    faxNumber: '',
    email: '',
    streetAddress: '',
    postCode: '',
    city: '',
    externalCustomerId: '',
    seller: '',
    brand: '',
    model: '',
    mileage: '',
    licensePlate: '',
    firstRegistration: '',
    site: '',
    vehicleLocation: '',
    vehicleFleet: '',
  },
];

const getAuthToken = async function (apiKey) {
  try {
    const authToken = await axios.post(TOKEN_URL, { apiKey });
    return authToken.data.value;
  } catch (e) {
    throw e;
  }
};

const getInvoices = async function (authToken, date, dataType) {
  const headers = { 'X-Auth-Token': authToken };
  const invoiceTypes = {
    UsedVehicleSales: 'invoice.type.vehicle',
    MixedehicleSales: 'invoice.type.vehicle',
    Maintenances: 'invoice.type.repair_order',
  };
  try {
    let params = { invoiceDateFrom: date, invoiceDateTo: date, count: 100 };
    let result = await axios.get(INVOICE_URL, { headers, params });
    result = result.data.filter((invoice) => invoice.type === (invoiceTypes[dataType] || 'invoice.type.vehicle'));
    for (const invoice of result) {
      invoice.vehicles = [];
      if (invoice.vehicleSellingList && invoice.vehicleSellingList.length) {
        for (const vehicle of invoice.vehicleSellingList) {
          if (vehicle.vehicleReference) {
            params = { reference: vehicle.vehicleReference, state: 'vehicle.state.out,vehicle.state.out_ar' };
            const vehicleResult = await axios.get(VEHICLE_URL, { headers, params });
            invoice.vehicles.push(vehicleResult.data[0]);
          }
        }
      }
    }
    return result;
  } catch (e) {
    throw e;
  }
};

const translateCivility = (civility) => {
  switch (civility) {
    case 'contact.civility.mister':
      return 'Monsieur';
    case 'contact.civility.madam':
      return 'Madame';
    default:
      return '';
  }
};

const cleanInvoices = function (invoices, refDate) {
  return invoices
    .filter(
      (invoice) =>
        invoice.invoiceDate && moment(invoice.invoiceDate).format('YYYY-MM-DD') === refDate.format('YYYY-MM-DD')
    )
    .map((invoice) => {
      const customer = invoice.customer || invoice.owner || {};
      const vehicle = invoice.vehicles[0] || {};
      return {
        maintenanceDate: invoice.invoiceDate,
        amount: invoice.sellPriceWithTax,
        civility: translateCivility(customer.civility),
        firstName: customer.firstname || '',
        lastName: customer.lastname || customer.corporateNameContact,
        mobilePhone: customer.cellPhoneNumber,
        telephone: customer.phoneNumber,
        faxNumber: customer.faxNumber,
        email: customer.email,
        streetAddress: customer.addressAddress,
        postCode: customer.addressPostalCode,
        city: customer.addressCity,
        externalCustomerId: customer.idContact,
        seller: invoice.seller ? invoice.seller.split('<').shift().trim() : '',
        brand: vehicle.brand && vehicle.brand.name,
        model: vehicle.model && vehicle.model.name,
        mileage: vehicle.distanceTraveled,
        licensePlate: vehicle.licenseNumber,
        firstRegistration: vehicle.dateOfDistribution || vehicle.year,
        site: vehicle.groupFleet || 'DEFAULT',
        saleType: vehicle.typeVoVn && vehicle.typeVoVn.name,
        vehicleLocation: vehicle.location,
        vehicleFleet: vehicle.fleet,
      };
    });
};

const getKeplerInvoices = async function (apiKey, date, dataType) {
  try {
    const authToken = await getAuthToken(apiKey);
    let invoices = await getInvoices(authToken, date.format('YYYY-MM-DD'), dataType);
    invoices = cleanInvoices(invoices, date);
    return invoices.length ? invoices : emptyObject;
  } catch (e) {
    console.error(e);
    return null;
  }
};

module.exports = { getKeplerInvoices };
