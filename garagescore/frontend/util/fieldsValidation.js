import { phoneNumberSpecs, validatePhoneNumberFromInput, parsePhoneNumber } from "~/utils/phone";

export default function (input, type, { required = false, enumValues = null, country = 'FR' } = {}) {
  if (!Array.isArray(input)) {
    input = !input ? '' : input.trim();
  }

  if(required && (!input || !input.length)){
    return {status: 'Invalid', message: "Information requise"};
  } else if(!required && (!input || !input.length)){
    return {status: 'Valid', message: ""};
  }

  if (type === 'enum') {
    if (!enumValues || !Array.isArray(enumValues) || !enumValues.length) {
      console.error('fieldsValidation for enum invalid, expected enumValues to be an array');
      return { status: 'Invalid', message: "Config de la validation erronée pour l'enum" };
    }
    const result = enumValues.includes(input);
    if (!result) {
      return { status: 'Invalid', message: `${input} n'est pas une valeur autorisée` };
    } else {
      return { status: 'Valid', message: '' };
    }
  }

  if (type === 'text') {
    // const result = input.match(/^[\w\-\.\séèçàùâêîô&'"\/\\|\(\)\]\[]*$/);
    const result = input.match(/^[\w\-\.\séèêëçúùûüáàâäíîïóôöñÿ&'"(\)]*$/); // Update with @Fed
    if(!result){
      return {status: 'Invalid', message: "text non valide"};
    } else {
      return {status: 'Valid', message: ""};
    }
  }

  if (type === 'email') {
    // const result = input.match(/^[\w\-\.]+@[\w\-\.]+\.\w{2,5}$/);
    const result = input.match(/^.+@[\w\-\.]+\.\w{2,20}$/);
    if(!result){
      return {status: 'Invalid', message: "Email non valide"};
    } else {
      return {status: 'Valid', message: ""};
    }
  }

  if (type === 'mobile'){
    return input === 'Valid' ? {status: 'Valid', message: ""} : {status: 'Invalid', message: "Numéro téléphone mobile non valide"};
  }

  if (type === 'phone') {
    return input === 'Valid' ? {status: 'Valid', message: ""} : {status: 'Invalid', message: "Numéro téléphone fixe non valide"};
  }

  if (type === 'allPhoneTypes') {
    const modes = ['mobile', 'landLine'];
    if (!input) {
      return {status: 'Invalid', message: "Numéro de téléphone non valide"};
    }
    const countryCode = (phoneNumberSpecs[country] && country) || 'FR';
    const toReplaceRegex = new RegExp('^\\' + phoneNumberSpecs[countryCode].code);
    const shortPhoneNumber = input.replace(toReplaceRegex, '');
    const result = modes.some((mode) => validatePhoneNumberFromInput(shortPhoneNumber, mode, countryCode));
    return result ? {status: 'Valid', message: ""} : {status: 'Invalid', message: "Numéro de téléphone non valide"};
  }

  if (type === 'postCode') {
    const result = input.match(/^\d{5}$/);
    if (!result) {
      return {status: 'Invalid', message: "Code Postal non valide"};
    } else {
      return {status: 'Valid', message: ""};
    }
  }

  if (type === 'mileage') {
    const result = input.match(/^[0-9]{1,6}$/);
    if (!result) {
      return {status: 'Invalid', message: "Kilométrage non valide"};
    } else {
      return {status: 'Valid', message: ""};
    }
  }

  return {status: 'Valid', message: ""};
}
