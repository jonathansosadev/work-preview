import {
  apiURI,
  requestValidationCodeEP,
  sendValidationCodeEP,
  registerEP,
  logInEP,
  refreshTokenEP,
} from "./dbUri";

import { headers } from "./universalHeader";

// api/v1/phone/sendconde/
// POST
// User phone validation request

export const verificationCodeRequest = async (formData) => {
  try {
    const init = {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      redirect: "follow",
    };

    let requestCode = await fetch(apiURI + requestValidationCodeEP, init);

    return requestCode;
  } catch (error) {
    console.log("at code request", error);

    return error;
  }
};

// api/v1/phone/validate/
// POST
// User phone validation
export const validateUserRequest = async (formData) => {
  try {
    const init = {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      redirect: "follow",
    };

    let validateRequest = fetch(apiURI + sendValidationCodeEP, init);

    return validateRequest;
  } catch (error) {
    console.log("at sending validation code", error);

    return error;
  }
};

//  api/users/
//  POST
//  User registration
export const signUpUserRequest = async (formData) => {
  try {
    const init = {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      redirect: "follow",
    };

    let sign = await fetch(apiURI + registerEP, init);

    return sign;
  } catch (error) {
    console.log("at register", error);

    return error;
  }
};

//  api/token/login/
//  POST
//  User log in, does not call reducer
//  Calls action to get user info
export const logInUserRequest = async (formData) => {
  try {
    let init = {
      method: "POST",
      headers,
      body: JSON.stringify(formData),
      redirect: "follow",
    };

    let login = await fetch(apiURI + logInEP, init);

    return login;
  } catch (error) {
    console.log("at log in", error);

    return error;
  }
};

export const refreshTokenRequest = async (refreshToken) => {
  try {
    let init = {
      method: "POST",
      headers,
      body: JSON.stringify({ refresh: refreshToken }),
      redirect: "follow",
    };

    let request = await fetch(apiURI + refreshTokenEP, init);

    return request;
  } catch (error) {
    console.log("at token refresh", error);

    return error;
  }
};
