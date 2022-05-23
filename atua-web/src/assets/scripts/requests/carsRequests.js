import {
  apiURI,
  addressEP,
  carEP,
  carDetailEP,
  carDocEP,
  carDocExtEP,
  carDocIntEP,
} from "./dbUri";

import { headers } from "./universalHeader";

//POST
//api/v1/cars/documents_*
//Posts car docuemntation
//3 types (documentation, documentation_exterior, docuementation_interior)

const postCarDocumentation = async (headers, formData, type) => {
  const docType =
    type === "Doc" ? carDocEP : type === "Ext" ? carDocExtEP : carDocIntEP;

  const url = apiURI + docType;

  const formattedHeaders = headers;
  formattedHeaders.delete("Content-Type");

  const init = {
    method: "POST",
    headers: formattedHeaders,
    body: formData,
    redirect: "follow",
  };

  try {
    const request = await fetch(url, init);

    return request;
  } catch (error) {
    console.log(error);
  }
};

// POST
// api/cars/
// Creates and registers a car
// Contrary to every other request, this one needs to alter the body of the request intensively
// Reason being the fact that in other to create and fill a car's data, 3 requests are necesary
// One request to create an address and get it's id, one to create the car and one to fill pictures and documentation

export const registerCarRequest = async (
  token,
  carAddress,
  carData,
  carDocPictures,
  carExtPictures,
  carIntPictures
) => {
  const headersWithAuth = headers;

  headersWithAuth.set("Authorization", `Bearer ${token}`);

  //ADDRESS REQUEST
  let addressId;

  try {
    const init = {
      method: "POST",
      headers: headersWithAuth,
      body: JSON.stringify(carAddress),
      redirect: "follow",
    };

    const addressRequest = await fetch(apiURI + addressEP, init);

    if (addressRequest.ok) {
      addressId = (await addressRequest.json()).data.address_id;
    } else {
      return addressRequest;
    }
  } catch (error) {
    console.log(`At registering car address`, error);

    return error;
  }

  //CAR CREATION
  //carId can be either a number/string with it's value or a request obj
  //the latter is in the case of a failed request and carries the "ok: false" needed for conditional
  //CarCreationRequest is defined outside to return when successfully created
  let carId;
  let carCreationRequest;

  try {
    let carRegisterBody = { ...carData, address_id: addressId };

    const init = {
      method: "POST",
      headers: headersWithAuth,
      body: JSON.stringify(carRegisterBody),
      redirect: "follow",
    };

    carCreationRequest = await fetch(apiURI + carEP, init);

    if (carCreationRequest.ok) {
      carId = (await carCreationRequest.json()).data.id;
    } else {
      return carCreationRequest;
    }
  } catch (error) {
    console.log(error);
  }

  //DOCUMENTATION
  //Requires Car Id obtained from car creation request
  let carDocPicturesFormData = carDocPictures;
  let carExtPicturesFormData = carExtPictures;
  let carIntPicturesFormData = carIntPictures;

  if (typeof carId === "number" || typeof carId === "string") {
    carDocPicturesFormData.set("car", carId);
    carExtPicturesFormData.set("car", carId);
    carIntPicturesFormData.set("car", carId);

    //Multiple fetching
    const carDocsRequest = await postCarDocumentation(
      headersWithAuth,
      carDocPicturesFormData,
      "Doc"
    );
    const carDocsExtRequest = await postCarDocumentation(
      headersWithAuth,
      carExtPicturesFormData,
      "Ext"
    );
    const carDocsIntRequest = await postCarDocumentation(
      headersWithAuth,
      carIntPicturesFormData,
      "Int"
    );

    if (!carDocsRequest.ok) console.log("Failed to post car docs");
    if (!carDocsExtRequest.ok) console.log("Failed to post car ext imgs");
    if (!carDocsIntRequest.ok) console.log("Failed to post car int imgs");

    if (carDocsRequest.ok && carDocsExtRequest.ok && carDocsIntRequest.ok)
      return carCreationRequest;
  } else {
    console.log("failed id recognition", carId);

    return carId;
  }
};

//GET
// api/v1/cars/my_cars or api/v1/car_detail/
// Gets user cars
export const userCarsRequest = async (token, carId) => {
  try {
    const headersWithAuth = headers;

    headersWithAuth.set("Authorization", `Bearer ${token}`);

    let init = {
      method: "GET",
      headers: headersWithAuth,
      redirect: "follow",
    };

    let url = carId
      ? `${apiURI}${carDetailEP}?car_id=${carId}`
      : `${apiURI}${carEP}`;

    let request = await fetch(url, init);

    return request;
  } catch (error) {
    console.log(error);
  }
};

//***************************OLD*************************** */

//api/cars
//PATCH
//Update user car information

export const updateCarRequest = async (
  token,
  carData = null,
  carAddress = null,
  carId
) => {
  const headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  if (carAddress) {
    try {
      let init = { method: "POST", headers, body: JSON.stringify(carAddress) };

      let addressRequest = await fetch(apiURI + addressEP, init);

      if (addressRequest.ok) {
        if (!carData) {
          return addressRequest;
        }
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }

  if (carData && carId) {
    try {
      headers.delete("Content-Type");

      let init = { method: "PATCH", headers, body: carData };

      let carUpdateRequest = await fetch(apiURI + carEP + `${carId}/`, init);

      if (carUpdateRequest.ok) {
        return carUpdateRequest;
      } else {
        return false;
      }
    } catch (error) {
      console.log(error);
    }
  }
};

//api/cars/
//DELETE
//Delete user car and all of its parts
export const deleteUserCarRequest = async (carId, token) => {
  const headers = new Headers({
    Authorization: `token ${token}`,
  });

  let init = { method: "DELETE", headers };

  let deleteUserCar = await fetch(apiURI + carEP + `${carId}/`, init);

  return deleteUserCar;
};

//api/cars/{id}
//GET
//Gets one car data
export const getCarInfoRequest = async (carId, token) => {
  const headers = new Headers({
    Authorization: `token ${token}`,
  });

  try {
    let init = { method: "GET", headers };

    let getCarInfo = await fetch(apiURI + carEP + `${carId}/`, init);

    return getCarInfo;
  } catch (error) {
    console.log(error);
  }
};

//Testing
export const deleteCarsAddress = async (addressId, token) => {
  const headers = new Headers({
    Authorization: `token ${token}`,
  });

  let init = { method: "DELETE", headers };

  try {
    let deleteCarsAddress = await fetch(
      apiURI + addressEP + `${addressId}/`,
      init
    );

    return deleteCarsAddress;
  } catch (error) {
    console.log(error);
  }
};
