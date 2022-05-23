function isFieldValid(formFields, fieldId) {
  if (!formFields[fieldId]) return false;

  switch (fieldId) {
    case "email":
      return /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/.test(
        formFields[fieldId]
      );

    case "re_email":
      return formFields[fieldId] === formFields["email"];

    // case "password":
    //   const pass = formFields[fieldId];

    //   const length = pass.length > 7;

    //   const numbers = Array.from(pass)
    //     .map((letter) => !isNaN(letter))
    //     .some((b) => b === true);

    //   const upperCase = Array.from(pass)
    //     .map(
    //       (letter) =>
    //         letter === letter.toUpperCase() &&
    //         isNaN(letter) &&
    //         !"<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=".includes(letter)
    //     )
    //     .some((b) => b === true);

    //   const special = Array.from(pass)
    //     .map((letter) => "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=".includes(letter))
    //     .some((b) => b === true);

    //   return length && numbers && upperCase && special;

    // case "re_password":
    //   return formFields[fieldId] === formFields.password;

    case "pin":
      return formFields[fieldId].length === 4;

    case "re_pin":
      return formFields[fieldId] === formFields.pin;

    case "password_old":
      return formFields[fieldId].length === 4;

    case "password_new":
      return formFields[fieldId].length === 4;

    // Default set to true for use in fields that need no validation other that completion
    default:
      return true;
  }
}

//Dates range validation
export function daysWithinRange(dateString1, dateString2, range) {
  let date1 = new Date(dateString1);
  let date2 = new Date(dateString2);

  // To calculate the time difference of two dates
  let timeDiff = date2.getTime() - date1.getTime();

  // To calculate the no. of days between two dates
  let daysDiff = timeDiff / (1000 * 3600 * 24);

  return daysDiff >= range;
}

function isFieldComplete(formFields, fieldId) {
  return formFields[fieldId] && formFields[fieldId] !== "";
}

export function validFormField(formFields, fieldId) {
  return (
    isFieldValid(formFields, fieldId) && isFieldComplete(formFields, fieldId)
  );
}

export function completeForm(formData, fieldIdArray, allFields = true) {
  return allFields
    ? fieldIdArray
        .map((field) => validFormField(formData, field))
        .every((value) => value === true)
    : fieldIdArray
        .map((field) => validFormField(formData, field))
        .some((value) => value === true);
}

export function validFormFieldClass(formFields, fieldId) {
  if (!isFieldComplete(formFields, fieldId)) return "";

  return validFormField(formFields, fieldId) ? "is-valid" : "is-invalid";
}
