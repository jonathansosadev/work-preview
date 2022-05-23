const app = require('../../server/server');
const Writable = require('stream').Writable;

/* eslint-disable no-console */

app.on('booted', () => {
  console.log('Civilité;Nom;Prénom;Nom et Prenom;Ville;');
  const customerModel = app.models.Customer;
  const searchObj = {
    where: {},
  };

  const customerR = customerModel.findStream(searchObj);

  const customerW = new Writable({
    objectMode: true,
  });

  customerR.pipe(customerW);

  customerR.on('error', (err) => {
    console.log(err);
  });

  customerW.on('error', (err) => {
    console.log(err);
  });

  function handleCustomer(customer, callBack) {
    const customerExport = {};

    customerExport.civilite = customer.title;
    customerExport.gender = customer.gender;
    customerExport.lastName = customer.lastName;
    customerExport.firstName = customer.firstName;

    if (customer.contactChannel && customer.contactChannel.snailMail) {
      customerExport.city = customer.contactChannel.snailMail.city;
    }

    for (const key in customerExport) {
      if (!customerExport[key]) {
        customerExport[key] = 'Non renseigné';
      }
    }

    let output = `${customerExport.civilite};`;
    output += `${customerExport.lastName};`;
    output += `${customerExport.firstName};`;

    if (customerExport.lastName && customerExport.firstName) {
      output += `${customerExport.lastName} ${customerExport.firstName};`;
    } else if (customer.fullName) {
      output += `${customerExport.fullName};`;
    } else {
      output += 'Non renseigné;';
    }

    output += `${customerExport.city};`;

    console.log(output);

    callBack();
  }

  /* eslint-disable func-names */

  customerW._write = (customer, encoding, callBack) => {
    handleCustomer(customer, callBack);
  };

  customerR.on('finish', () => {});
});
