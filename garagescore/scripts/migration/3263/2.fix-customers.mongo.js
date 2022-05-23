/**
 * Fix la bdd,
 * Récup les customers avec tickets leads
 * Va voir les datas associés à ces customers
 * Remple les customers avec les infos trouvées dans les datas
 */
// limit to only one garage
var garage = null; //'5b4cbe85bb59c30013f3d8aa';
////
var phoneNumberSpecs = {
  FR: {
    code: '+33',
    // flagUrl: '/flags/france.svg', // Images are not working in <select>
    numberLength: { mobile: 10, landLine: 10 },
    leadingZero: true,
    validators: {
      mobile: (input) => /^0?[67]\d{8}$/.test(input.replace(/\s/g, '')),
      landLine: (input) => /^0?[1-59]\d{8}$/.test(input.replace(/\s/g, '')),
    },
    formatter(input) {
      // Output example: 6 89 68 96 89
      return input
        .replace(/[^0-9+]+/g, '')
        .replace(/^\+33/, '')
        .replace(/^0/, '') // Removes the eventual leading zero, now we got: 689689689
        .replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    },
  },
  NC: {
    code: '+687',
    // flagUrl: '/flags/france.svg', // Images are not working in <select>
    numberLength: { mobile: 6, landLine: 6 },
    leadingZero: false,
    validators: {
      // For those, I refered to https://github.com/giggsey/libphonenumber-for-php/blob/master/src/data/PhoneNumberMetadata_NC.php
      // Double check on : https://www.itu.int/dms_pub/itu-t/oth/02/02/T02020000980001PDFF.pdf
      mobile: (input) => /^(5[0-4]|[79]\d|8[0-79])\d{4}$/.test(input.replace(/(\s|\.)/g, '')),
      landLine: (input) => /^(2[03 -9]|3[0-5]|4[1-7])\d{4}$/.test(input.replace(/(\s|\.)/g, '')),
    },
    formatter(input) {
      // Output example: 54.95.49
      return input
        .replace(/[^0-9+]+/g, '')
        .replace(/^\+687/, '')
        .replace(/(\d{2})(\d{2})(\d{2})/, '$1.$2.$3');
    },
  },
  BE: {
    code: '+32',
    // flagUrl: '/flags/belgium.svg', // Images are not working in <select>
    numberLength: { mobile: 10, landLine: 9 },
    leadingZero: true,
    validators: {
      // Was taken from : https://github.com/giggsey/libphonenumber-for-php/blob/master/src/data/PhoneNumberMetadata_BE.php
      // Then I followed : https://en.wikipedia.org/wiki/Telephone_numbers_in_Belgium
      mobile: (input) => /^0?4[5-9]\d{7}$/.test(input.replace(/(\s|\.)/g, '')),
      landLine: (input) =>
        /^0?([1-356]\d{2}|4[0-5]\d|71\d|[89][1-9]\d|80[1-9])\d{5}$/.test(input.replace(/(\s|\.)/g, '')),
    },
    formatter(input) {
      // 2 551 20 20
      var cleanInput = input
        .replace(/[^0-9+]+/g, '')
        .replace(/^\+32/, '')
        .replace(/^0/, '');
      // Mobile
      if (cleanInput.length === 9) return cleanInput.replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      if (cleanInput.length === 8) {
        // Big cities: Bruxelles, Antwerpen, Liège and Gent
        if (['2', '3', '4', '9'].includes(cleanInput[0]))
          return cleanInput.replace(/(\d{1})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4');
        // Other places
        return cleanInput.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      }
      return cleanInput;
    },
  },
  LU: {
    /**
     * WTF is this spec !!!
     * https://github.com/giggsey/libphonenumber-for-php/blob/master/src/data/PhoneNumberMetadata_LU.php
     * */
    code: '+352',
    // flagUrl: '/flags/luxembourg.svg', // Images are not working in <select>
    numberLength: { mobile: 9, landLine: null }, // Numbers can have a length from 5 to 11
    leadingZero: false,
    validators: {
      // I will follow: https://en.wikipedia.org/wiki/Telephone_numbers_in_Luxembourg
      mobile: (input) => /^6[25679]1\d{6}$/.test(input.replace(/\s/g, '')),
      landLine: (input) => /^(4|67|2[0-3589]|[3-57-9]\d|2[467](67|[2-57-9]\d))\d{4}$/.test(input.replace(/\s/g, '')),
    },
    formatter(input) {
      var cleanInput = input.replace(/[^0-9+]+/g, '').replace(/^\+352/, '');
      // Length 5,6,8 for landLines
      if (cleanInput.length === 5) return cleanInput.replace(/(\d{1})(\d{4})/, '$1 $2');
      if (cleanInput.length === 6) return cleanInput.replace(/(\d{2})(\d{2})(\d{2})/, '$1 $2 $3');
      if (cleanInput.length === 8) return cleanInput.replace(/(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
      // Mobile
      if (cleanInput.length === 9) return cleanInput.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
      return cleanInput;
    },
  },
  ES: {
    code: '+34',
    // flagUrl: '/flags/spain.svg', // Images are not working in <select>
    numberLength: { mobile: 9, landLine: 9 },
    leadingZero: false,
    validators: {
      // https://github.com/giggsey/libphonenumber-for-php/blob/master/src/data/PhoneNumberMetadata_ES.php
      // That should be the regex : 9(6906(09|10)|7390\d\d)\d\d|(?:6\d|7[1-48])\d{7}
      mobile: (input) => /^[67]\d{8}$/.test(input.replace(/\s/g, '')),
      // That should be the regex : 96906(0[0-8]|1[1-9]|[2-9]\d)\d\d|9(69(0[0-57-9]|[1-9]\d)|73([0-8]\d|9[1-9]))\d{4}|(8([1356]\d|[28][0-8]|[47][1-9])|9([135]\d|[268][0-8]|4[1-9]|7[124-9]))\d{6}
      landLine: (input) => /^[589]\d{8}$/.test(input.replace(/\s/g, '')),
    },
    formatter(input) {
      // +34 689 68 96 89
      return input
        .replace(/[^0-9+]+/g, '')
        .replace(/^\+34/, '')
        .replace(/(\d{3})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4');
    },
  },
  US: {
    code: '+1',
    // flagUrl: '/flags/usa.svg', // Images are not working in <select>
    numberLength: { mobile: 10, landLine: 10 },
    leadingZero: false,
    validators: {
      // https://github.com/giggsey/libphonenumber-for-php/blob/master/src/data/PhoneNumberMetadata_US.php
      mobile: (input) => /^[2-9]\d{9}$/.test(input.replace(/(\s|-)/g, '')),
      landLine: (input) => /^[2-9]\d{9}$/.test(input.replace(/(\s|-)/g, '')),
    },
    formatter(input) {
      // +1 541-754-3010
      return input
        .replace(/[^0-9+]+/g, '')
        .replace(/^\+1/, '')
        .replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    },
  },
  MC: {
    code: '+377',
    numberLength: { mobile: 10, landLine: 8 },
    leadingZero: true,
    validators: {
      mobile: function (input) {
        return /^0[67]\d{8}$/.test(input.replace(/\s/g, ''));
      },
      landLine: function (input) {
        return /^9\d{7}$/.test(input.replace(/\s/g, ''));
      },
    },
    formatter: function (input) {
      return input
        .replace(/[^0-9+]+/g, '')
        .replace(/^\+377/, '')
        .replace(/^0/, '') // Removes the eventual leading zero, now we got: 689689689
        .replace(/(\d)(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    },
  },
};

var parsePhoneNumber = (input) => {
  if (!input) return null;
  var cleanedInput = input.replace(/[^0-9+]+/g, '');
  // 1st round: if the +xxx code is specified and recognized return countryCode
  let country = Object.keys(phoneNumberSpecs).find(
    (countryCode) => cleanedInput.indexOf(phoneNumberSpecs[countryCode].code) === 0
  );
  // 2nd round: if the number doesn't have +xxx code but passes a validator
  if (!country) {
    country = Object.keys(phoneNumberSpecs).find((countryCode) => {
      var spec = phoneNumberSpecs[countryCode];
      return Object.keys(spec.validators).some(
        (type) =>
          spec.validators[type](cleanedInput) &&
          (!spec.numberLength[type] || cleanedInput.length === spec.numberLength[type])
      );
    });
  }
  // 3rd round: not validated, no +xxx code but matches length (does not work with LU spec)
  if (!country) {
    country = Object.keys(phoneNumberSpecs).find((countryCode) =>
      [phoneNumberSpecs[countryCode].numberLength.mobile, phoneNumberSpecs[countryCode].numberLength.landLine].includes(
        cleanedInput.length
      )
    );
  }
  if (!country) return null;
  return { country, nationalPhoneNumber: cleanedInput.replace(phoneNumberSpecs[country].code, '') };
};

var getInternationalPhoneNumber = (input, E164 = false) => {
  var parsedNumber = parsePhoneNumber(input);
  if (!parsedNumber) return null;
  var { country, nationalPhoneNumber } = parsedNumber;
  if (!E164) return `${phoneNumberSpecs[country].code}${nationalPhoneNumber}`;
  return `${phoneNumberSpecs[country].code} ${phoneNumberSpecs[country].formatter(nationalPhoneNumber)}`;
};
///////phone
var dbCustomers = db.getCollection('customers');
// run
db.tmpFixCustomers.find(garage ? { _id: ObjectId(garage) } : { status: 'WAITING' }).forEach((g) => {
  var customersUpdated = 0;
  var customersNotUpdated = 0;
  var customersFound = 0;
  // on récupère les customers du garages qui ont des leads et plusieurs dataIds
  var customers = dbCustomers
    .aggregate([
      { $match: { garageId: g._id, leads: { $exists: true, $not: { $size: 0 } }, 'dataIds.1': { $exists: true } } },
      { $project: { dataIds: 1, fusedCustomerIds: 1, emailList: 1, phoneList: 1 } },
    ])
    .toArray();
  customersFound = customers.length;
  // on normalise
  customers = customers.map((c) => ({
    _id: c._id,
    dataIds: c.dataIds || [],
    fusedCustomerIds: c.fusedCustomerIds || [],
    emailList: c.emailList || [],
    phoneList: c.phoneList || [],
  }));
  customers.forEach((c) => {
    // on récup les infos dans les datas du customer //  'leadTicket.createdAt': {$gt: new Date(0)}
    var datas = db.datas
      .aggregate([
        { $match: { _id: { $in: c.dataIds } } },
        {
          $project: {
            customerId: '$leadTicket.automationCustomerId',
            email: '$customer.contact.email.value',
            phone: '$customer.contact.mobilePhone.value',
          },
        },
      ])
      .toArray();
    var customerToUpdate = false;
    if (datas.length > 0) {
      // on va regarder si les datas ont des infos qui ne sont pas dans le customer
      var datasFound = 0;
      var $set = {
        emailList: JSON.parse(JSON.stringify(c.emailList)),
        phoneList: JSON.parse(JSON.stringify(c.phoneList)),
        fusedCustomerIds: c.fusedCustomerIds.map((i) => new ObjectId(i.valueOf())),
      }; // avec parse/string, robo3t transforme en "$oid" : "5f04c505ce8764000393a724"
      datas.forEach((d) => {
        datasFound++;
        var email = d.email;
        var phone = d.phone && getInternationalPhoneNumber(d.phone);
        var customerId = d.customerId;
        if (email && $set.emailList.indexOf(email) < 0) {
          customerToUpdate = 'missing email ' + email;
          $set.emailList.push(email);
        }
        if (phone && $set.phoneList.indexOf(phone) < 0) {
          customerToUpdate = 'missing phone ' + phone;
          $set.phoneList.push(phone);
        }

        if (
          customerId &&
          customerId.valueOf() !== c._id.valueOf() &&
          $set.fusedCustomerIds.map((i) => i.valueOf()).indexOf(customerId.valueOf()) < 0
        ) {
          customerToUpdate = 'missing customerId ' + customerId;
          $set.fusedCustomerIds.push(customerId);
        }
      }); // end of datas loop
      // on update le customer
      if (customerToUpdate) {
        dbCustomers.updateOne({ _id: c._id }, { $set });
        //customersUpdated.push({log:customerToUpdate, id: c._id, $set});
        customersUpdated++;
      } else {
        customersNotUpdated++;
      }
    }
  });
  db.tmpFixCustomers.updateOne(
    { _id: g._id },
    {
      $set: {
        status: 'COMPLETE',
        completedAt: new Date(),
        completionLogs: { customersFound, customersUpdated, customersNotUpdated },
      },
    }
  );
});
