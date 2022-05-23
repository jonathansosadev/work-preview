const app = require('../../../server/server');
const Writable = require('stream').Writable;

/* eslint-disable no-console */

app.on('booted', () => {
  console.log('Civilité;Nom;Prénom;Nom et Prenom;Ville;');
  const customerModel = app.models.Customer;
  const date2017 = new Date(2017, 0, 1, 0, 0, 0, 0);

  const searchObj = {
    where: {
      createdAt: {
        gte: date2017,
      },
    },
  };

  const customerR = customerModel.findStream(searchObj);

  const customerW = new Writable({
    objectMode: true,
  });

  customerR.pipe(customerW);

  customerR.on('error', (err) => {
    console.log(err);
    process.exit(1);
  });

  customerW.on('error', (err) => {
    console.log(err);
    process.exit(1);
  });

  /**
   * [handleCustomer format a customer into a csv format]
   * @param  {[type]} customer [object]
   * @param  {[type]} callBack [next funct]
   * @return {[type]}          [void]
   */
  function handleCustomer(customer, callBack) {
    const customerExport = {};
    let output;

    // set the customer Data in customer Export
    customerExport.civilite = customer.title;
    customerExport.lastName = customer.lastName;
    customerExport.firstName = customer.firstName;
    customerExport.fullName = customer.fullName;
    customerExport.city = 'Non renseigné';

    if (customer.contactChannel && customer.contactChannel.snailMail) {
      customerExport.city = customer.contactChannel.snailMail.city;
    }

    Object.keys(customerExport).forEach((key) => {
      if (!customerExport[key]) {
        customerExport[key] = 'Non renseigné';
      }
    });

    output = `${customerExport.civilite};`;
    output += `${customerExport.lastName};`;
    output += `${customerExport.firstName};`;
    output += `${customerExport.fullName};`;
    output += `${customerExport.city};`;

    console.log(output);

    callBack();
  }

  /* eslint-disable func-names */

  customerW._write = (customer, encoding, callBack) => {
    handleCustomer(customer, callBack);
  };

  customerR.on('finish', () => {
    process.exit(0);
  });
});
