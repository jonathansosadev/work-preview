const fs = require('fs');
const xml2js = require('xml2js');
const { updateData } = require('./export-leads-common');
const xmlBuilder = new xml2js.Builder();
const { ObjectId } = require('mongodb');
const config = require('config');
const app = require('../../../server/server');
const { slackMessage } = require('../../../common/lib/garagescore/cross-leads/util');
const { ExternalApi } = require('../../../frontend/utils/enumV2');
const mailgunApi = require('../../../common/lib/mailgun/api');

const timings = {
  Now: "Moins d'1 mois",
  ShortTerm: 'Dans 1 A 3 mois',
  MidTerm: 'Dans 3 A 6 mois',
  LongTerm: 'Dans 6 A 12 mois',
};

const buildJson = (lead, retailerid) => {
  return {
    mbflead: {
      $: { xmlns: 'xsd.mbf.cmx.consol.com' },
      retailerid: parseInt(retailerid),
      lead_source: 'GarageScore',
      lead_type: 'Formulaire Internet',
      campaignid: 'GarageScore Projet Achat',
      campaignname: 'GarageScore Projet Achat',
      mcpcode: '', // Pas encore interprété par MBParis
      contactdate: lead.reportedAt.toISOString().substring(0, 16).replace('T', ' '),
      aldms: '', // Pas encore interprété par MBParis
      ucid: '', // Pas encore interprété par MBParis
      smd: '', // Pas encore interprété par MBParis
      salutation: lead.title,
      firstname: lead.firstName,
      lastname: lead.lastName,
      birthdate_or_year: '', // On ne le connait pas
      companyname: '', // On ne le connait pas
      function: '', // On ne le connait pas
      occupation: '', // On ne le connait pas
      docmail: 1,
      docphonefax: 1,
      docemail: 1,
      customerflag: 'Client',
      comment: lead.comment,
      addresstype: 'privée',
      address: lead.streetAddress,
      address_ext: '', // On n'a qu'une ligne d'addresse
      zipcode: lead.postCode,
      city: lead.city,
      country: 'France', // Pour le moment on harcode France
      phone: '', // On n'utilise que le champ mobile
      phone2: '', // On n'utilise que le champ mobile
      mobile: lead.telephone,
      fax: '', // On ne le connait pas
      emailaddress: lead.email,
      emailaddress2: '', // On n'a qu'un seul email
      veh_brand1: lead.currentVehicle && lead.currentVehicle.brand,
      veh_type1: lead.currentVehicle && lead.currentVehicle.model,
      veh_body1: '', // On ne le connait pas
      veh_firstregistrationdate1: lead.currentVehicle && lead.currentVehicle.firstRegistration,
      veh_milage1: lead.currentVehicle && lead.currentVehicle.mileage,
      vi_brand: Array.isArray(lead.brand) ? lead.brand[0] : lead.model,
      vi_purchasetype: lead.saleType === 'UsedVehicleSale' ? 'VO' : 'VN',
      vi_type: '', // On va utiliser que brand je pense
      vi_body: Array.isArray(lead.bodyType) ? lead.bodyType[0] : 'Ne sait pas',
      vi_annotation: lead.comment,
      vi_pa: timings[lead.timing],
      testdrive: 0, // 0 par défaut car on ne le connait pas
      financing: lead.financing !== 'cash' ? 1 : 0,
      consultation: 0, // 0 par défaut car on ne le connait pas
      trade_in: lead.tradeIn === 'Yes' ? 1 : 0,
      contact_method: lead.telephone ? 'Téléphone' : 'Email',
      mbfs: {
        // Toutes les props ci-dessous ne seront pas interprétées
        contract_number: '',
        startdate: '',
        enddate: '',
        duration: '',
        brand: '',
        model: '',
        new_or_used: '',
        financed_amount: '',
        initial_capital: '',
        vin: '',
        financial_product: '',
        customer_number: '',
        salesperson: '',
        financial_rent: '',
        aftersales_rent: '',
        insurance_d_rent: '',
        insurance_cf_rent: '',
        insurance_gvn_rent: '',
        buy_back_value: '',
        offer_desc: '',
        offer_flag: '',
      },
    },
  };
};

const createDirectory = (path) => {
  path.split('/').reduce((directories, directory) => {
    directories += `${directory}/`;
    if (!fs.existsSync(directories)) {
      fs.mkdirSync(directories);
    }
    return directories;
  }, '');
};

const sendMessage = async (daimler, saveDir, lead, dateStr, job) => {
  return new Promise((resolve, reject) => {
    // create attachment file
    const fileName = `${saveDir}/${dateStr}_1.xml`;
    const leadXml = xmlBuilder.buildObject(lead);
    fs.writeFileSync(fileName, leadXml);
    // for recette/test, return fake response
    if (!config.get('publicUrl.app_url') || !config.get('publicUrl.app_url').includes('app.custeed.com')) {
      resolve({ fileName, name: daimler.name, success: true });
    }

    mailgunApi
      .initFromDomainKey('mg')
      .messages()
      .send(
        {
          from: 'no-reply-export-leads@custeed.com',
          to: daimler.urlApi,
          subject: `GarageScore - Demande ${lead.mbflead.vi_purchasetype}`,
          text: ' ',
          attachment: fileName,
        },
        async (err, res) => {
          if (err) {
            await slackMessage(`${ExternalApi.DAIMLER}:: error ${job}: ${err}`, ExternalApi.DAIMLER, '#çavapastrop');
            reject(err);
          }
          resolve({ res, fileName, name: daimler.name, success: true });
        }
      );
  });
};

const getLead = async (dataId) => {
  return app.models.Data.getMongoConnector().findOne(
    {
      _id: ObjectId(dataId.toString()),
    },
    {
      projection: {
        _id: true,
        reportedAt: '$lead.reportedAt',
        title: '$customer.title.value',
        firstname: '$customer.firstname.value',
        lastname: '$customer.lastname.value',
        comment: '$review.comment.text',
        streetAddress: '$customer.street.value',
        postCode: '$customer.postalCode.value',
        city: '$customer.city.value',
        telephone: '$customer.contact.mobilePhone.value',
        email: '$customer.contact.email.value',
        brand: '$lead.brands',
        model: '$leadTicket.brandModel',
        saleType: '$lead.saleType',
        bodyType: '$lead.bodyType',
        timing: '$lead.timing',
        financing: '$lead.financing',
        tradeIn: '$lead.tradeIn',
        currentVehicle: {
          brand: '$vehicle.make.value',
          model: '$vehicle.model.value',
          firstRegistration: '$vehicle.registrationDate.value',
          mileage: '$vehicle.mileage.value',
        },
      },
    }
  );
};

const getGarageConfig = async (garageId) => {
  return app.models.Garage.getMongoConnector().findOne(
    { _id: ObjectId(garageId.toString()) },
    { projection: { daimler: true } }
  );
};

const sendLeadByEmail = async (job) => {
  const { dataId, garageId } = job.payload;
  const date = new Date();
  const day = date.getDate();
  const month = date.getMonth() + 1; // january = 1
  const year = date.getFullYear();
  const dateStr = `${day}-${month}-${year}`;
  const [garageConfig, lead] = await Promise.all([getGarageConfig(garageId), getLead(dataId)]);

  if (!garageConfig) {
    const text = `${ExternalApi.DAIMLER} API:: error ${job._id}, garage not found :: ${JSON.stringify(job)}`;
    await slackMessage(text, ExternalApi.DAIMLER, '#çavapastrop');
    throw new Error(text);
  }

  const saveDir = `./tmp/${garageConfig.daimler.name.toLowerCase()}`;
  createDirectory(saveDir);
  const leadToSend = buildJson(lead, garageConfig.daimler.retailerId);
  const response = await sendMessage(garageConfig.daimler, saveDir, leadToSend, dateStr, job);
  await updateData(app, dataId, response, ExternalApi.DAIMLER);
};

module.exports = {
  sendLeadByEmail,
};
