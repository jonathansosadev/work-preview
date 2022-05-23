const phoneNumberSpecs = {
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
      mobile: (input) => /^0?[4-7]\d{7,8}$/.test(input.replace(/(\s|\.)/g, '')),
      landLine: (input) =>
        /^0?([1-356]\d{2}|4[0-5]\d|71\d|[89][1-9]\d|80[1-9])\d{5}$/.test(input.replace(/(\s|\.)/g, '')),
    },
    formatter(input) {
      // 2 551 20 20
      const cleanInput = input
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
      const cleanInput = input.replace(/[^0-9+]+/g, '').replace(/^\+352/, '');
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
};

const _findSpec = (phoneNumber) => {
  const found = Object.keys(phoneNumberSpecs).find((spec) => phoneNumber.indexOf(phoneNumberSpecs[spec].code) === 0);
  return found && phoneNumberSpecs[found];
};

/**
 * This function validates a phone number given in parameter
 * @param {String} input Phone number to be validated, format is strict as the country code is mandatory
 * @param {String} mode Choses between mobile, landline or any type of number
 * @param {String} forceCountry Forces the validation to be made against a countrie's spec
 */
const validatePhoneNumberFromInput = (input, mode = 'any', forcedCountry = null) => {
  // Find the spec to use;
  const cleanedInput = input.replace(/(\s|\.|-)/g, '');
  const spec = phoneNumberSpecs[forcedCountry] || _findSpec(cleanedInput);

  if (!spec) return false;
  if (mode !== 'any' && spec.validators[mode]) return spec.validators[mode](cleanedInput);
  return Object.values(spec.validators).some((validator) => validator(cleanedInput));
};

/**
 * This function will extract the relevant information of a phone number given in argument
 * It will guess the country and then extract the national phone number
 * @param {String} input Phone number to be decoded
 */
const parsePhoneNumber = (input) => {
  if (!input) return null;
  const cleanedInput = input.replace(/[^0-9+]+/g, '');
  // 1st round: if the +xxx code is specified and recognized return countryCode
  let country = Object.keys(phoneNumberSpecs).find(
    (countryCode) => cleanedInput.indexOf(phoneNumberSpecs[countryCode].code) === 0
  );
  // 2nd round: if the number doesn't have +xxx code but passes a validator
  if (!country) {
    country = Object.keys(phoneNumberSpecs).find((countryCode) => {
      const spec = phoneNumberSpecs[countryCode];
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

const getInternationalPhoneNumber = (input, E164 = true) => {
  const parsedNumber = parsePhoneNumber(input);
  if (!parsedNumber) return null;
  const { country, nationalPhoneNumber } = parsedNumber;
  if (!nationalPhoneNumber) return null;
  if (E164) return `${phoneNumberSpecs[country].code}${nationalPhoneNumber}`;
  return `${phoneNumberSpecs[country].code} ${phoneNumberSpecs[country].formatter(nationalPhoneNumber)}`;
};

module.exports = {
  phoneNumberSpecs,
  validatePhoneNumberFromInput,
  parsePhoneNumber,
  getInternationalPhoneNumber,
};
