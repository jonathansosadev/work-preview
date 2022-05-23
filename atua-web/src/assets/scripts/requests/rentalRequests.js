import {
  apiURI,
  userInfoEP,
  availableCarsEP,
  publishCarEP,
  checkDateEP,
  reservationEP,
  paymentsEP,
} from "./dbUri";

//api/rental/post/
//GET
//Get all published cars
export const getAvailableCarsRequest = async (params = {}) => {
  let searchParams = Object.entries(params);

  let init = { method: "GET" };

  let url = apiURI + availableCarsEP;

  let queryParams = "";

  // Query preparation
  if (searchParams.length > 0) {
    searchParams.forEach((filter, i, arr) => {
      if (i === 0) {
        queryParams += "?";
      }

      queryParams += filter[0] + "=" + filter[1];

      if (i !== arr.length - 1) {
        queryParams += "&";
      }
    });
  }

  try {
    let publishedCarsRequest = await fetch(url + queryParams, init);

    return publishedCarsRequest;
  } catch (error) {
    console.log(error);
  }
};

//api/rental/ p2p - premium /post/
//POST
//Publish user Car
export const createCarPostRequest = async (publishData, token, publishType) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  let init = { method: "POST", headers, body: JSON.stringify(publishData) };

  let requestUrl = publishCarEP(publishType);

  try {
    let publishCar = await fetch(apiURI + requestUrl, init);

    return publishCar;
  } catch (error) {
    console.log(error);
  }
};

//api/rental/ p2p - premium /post/
//DELETE
//Deletes car post
export const deleteCarPostRequest = async (token, publishType, id) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  let init = { method: "DELETE", headers };

  let requestUrl = publishCarEP(publishType);

  try {
    let deletePost = await fetch(`${apiURI + requestUrl + id}/`, init);

    return deletePost;
  } catch (error) {
    console.log(error);
  }
};

//api/ p2p - premium /reservations
//GET
// Gets reservations for a publication
export const getPostInfoRequest = async (id) => {
  let init = { method: "GET" };

  let reservationRequest = await fetch(
    apiURI + availableCarsEP + id + "/",
    init
  );

  return reservationRequest;
};

//api/users/me/posts - reservations
//GET
//Gets user posts or reservations
export const getUserPostsOrReservations = async (token, type) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
  });

  let init = { method: "GET", headers };

  let postsOrReservations = await fetch(apiURI + userInfoEP + type + "/", init);

  return postsOrReservations;
};

// api/rental/post/check-availability/{post_id}/{from}/{to}/
// Checks reservation availability
export const checkPublicationAvailabilityRequest = async (
  token,
  postID,
  from,
  to
) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
  });

  let init = { headers };

  try {
    let checkRequest = fetch(
      `${apiURI + checkDateEP}${postID}/${from}/${to}/`,
      init
    );

    return checkRequest;
  } catch (error) {
    console.log(error);
  }
};

// api/ p2p - premium /reservations
// POST
// Creates reservation
export const createReservationRequest = async (
  token,
  publishType,
  formData
) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  let requestUrl = reservationEP(publishType);

  let init = { method: "POST", headers, body: JSON.stringify(formData) };

  try {
    let reserveRequest = await fetch(apiURI + requestUrl, init);

    return reserveRequest;
  } catch (error) {
    console.log(error);
  }
};

// api/ p2p - premium /reservations
// DELETE
// Deletes reservation
export const deleteReservationRequest = async (token, publishType, id) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  let requestUrl = reservationEP(publishType);

  let init = { method: "DELETE", headers };

  try {
    let deleteReserveRequest = await fetch(
      `${apiURI + requestUrl + id}/`,
      init
    );

    return deleteReserveRequest;
  } catch (error) {
    console.log(error);
  }
};

// api/payments/mp/
// Create Payment in backend
// POST
export const createPaymentRequest = async (token, formData) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
    "Content-Type": "application/json",
  });

  let init = { method: "POST", headers, body: JSON.stringify(formData) };

  try {
    let createPaymentRequest = await fetch(`${apiURI + paymentsEP}`, init);

    return createPaymentRequest;
  } catch (error) {
    console.log(error);
  }
};

export const readUserPaymentsRequest = async (token, id = null) => {
  let headers = new Headers({
    Authorization: `token ${token}`,
  });

  let init = { method: "GET", headers };

  try {
    let readUserPayments = await fetch(
      `${apiURI + paymentsEP}${id ? id + "/" : ""}`,
      init
    );

    return readUserPayments;
  } catch (error) {
    console.log(error);
  }
};
