import {
  apiURI,
  userInfoEP,
  userProfileInfoEP,
  deleteUserEP,
  addressEP,
  pinChangeEP,
  documentationRegisterEP,
} from "./dbUri";

import { headers } from "./universalHeader";

//  api/v1/users/details/
//  GET
//  User information request
//  Requires "access" token
export const getUserInfoRequest = async (token) => {
  try {
    let headerWithAuth = new Headers(headers);

    headerWithAuth.set("Authorization", `Bearer ${token}`);

    const init = {
      method: "GET",
      headers: headerWithAuth,
      redirect: "follow",
    };

    const userInfoReq = await fetch(apiURI + userInfoEP, init);

    return userInfoReq;
  } catch (error) {
    console.log("at fetching user info", error);

    return error;
  }
};

// api/v1/users/change_pin/
// POST
// Changes pin
// Requires "access" token, current and new pin
export const pinChangeRequest = async (formData, token) => {
  try {
    let headerWithAuth = new Headers(headers);

    headerWithAuth.set("Authorization", `Bearer ${token}`);

    const init = {
      method: "POST",
      headers: headerWithAuth,
      body: JSON.stringify(formData),
      redirect: "follow",
    };

    const userInfoReq = await fetch(apiURI + pinChangeEP, init);

    return userInfoReq;
  } catch (error) {
    console.log("at pinchange", error);

    return error;
  }
};

// api/v1/users/documents/register/
// POST
// User Id register
// Requires "access" token
export const documentationRegisterRequest = async (token, formData) => {
  let headerWithAuth = new Headers(headers);

  headerWithAuth.set("Authorization", `Bearer ${token}`);
  headerWithAuth.delete("Content-Type");

  const formatedData = new FormData();

  Object.entries(formData).forEach((field) => {
    // Extra spicyness
    if (
      field[0] === "document_picture_front" ||
      field[0] === "document_picture_back"
    ) {
      formatedData.set(
        field[0],
        field[1],
        `${field[0]}.${field[1].type.slice(6)}`
      );
    } else formatedData.set(field[0], field[1]);
  });

  console.log("request", formatedData);

  const init = {
    method: "POST",
    headers: headerWithAuth,
    body: formatedData,
    redirect: "follow",
  };

  try {
    const documentationRegisterRequest = await fetch(
      apiURI + documentationRegisterEP,
      init
    );

    return documentationRegisterRequest;
  } catch (error) {
    console.log("at registering user documentation", error);

    return error;
  }
};

// api/v1/address/
// POST
// User address register
// Requires "access" token
export const userAddressRequest = async (token, formData) => {
  let headerWithAuth = new Headers(headers);

  headerWithAuth.set("Authorization", `Bearer ${token}`);

  //Adds "default" field, user specific field in address submition
  let formatedData = { ...formData, default: true };

  const init = {
    method: "POST",
    headers: headerWithAuth,
    body: JSON.stringify(formatedData),
    redirect: "follow",
  };

  try {
    const request = await fetch(apiURI + addressEP, init);

    return request;
  } catch (error) {
    console.log(`At registering user address`, error);

    return error;
  }
};

// ****** OLD - LEFT AS REFERENCE **************
// USERS/ME/
// Update main info (registry information)
export const mainInfoUpdateRequest = async (token, formData) => {
  const headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  //Base uri
  let requestURL = apiURI + userInfoEP;

  //Base init
  let init = {
    method: "PATCH",
    headers: headers,
    body: JSON.stringify(formData),
    redirect: "follow",
  };
  try {
    const request = await fetch(requestURL, init);

    return request;
  } catch (error) {
    console.log(error);
  }
};

//USERS/ME/PROFILE_DATA
//Update non registry data (address, documentation)
export const profileInfoUpdateRequest = async (
  token,
  formData,
  address = false
) => {
  const headers = new Headers({
    Authorization: `token ${token}`,
  });

  let formatedData;

  if (address) {
    headers.set("Content-Type", "application/json");

    formatedData = JSON.stringify(formData);
  } else {
    formatedData = new FormData();

    Object.entries(formData).forEach((field) => {
      // Extra spicyness
      if (
        field[0] === "dni_front" ||
        field[0] === "dni_back" ||
        field[0] === "passport_front" ||
        field[0] === "passport_back" ||
        field[0] === "driver_license_front" ||
        field[0] === "driver_license_back"
      ) {
        formatedData.set(
          field[0],
          field[1],
          `${field[0]}.${field[1].type.slice(6)}`
        );
      } else formatedData.set(field[0], field[1]);
    });
  }

  //Base uri
  let requestURL = apiURI + userProfileInfoEP;

  //Base init
  let init = {
    method: "PATCH",
    headers: headers,
    body: formatedData,
    redirect: "follow",
  };
  try {
    const request = await fetch(requestURL, init);

    return request;
  } catch (error) {
    console.log(error);
  }
};

// users/me/
// DELETE
// Deletes user
// Requires Token and current pin
export const deleteUserRequest = async (formData, userId, token) => {
  try {
    let init = {
      method: "DELETE",
      headers: {
        Authorization: `token ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formData),
      redirect: "follow",
    };

    const deleteRequest = await fetch(
      apiURI + deleteUserEP + `${userId}/`,
      init
    );

    return deleteRequest;
  } catch (error) {
    console.log(error);
  }
};
