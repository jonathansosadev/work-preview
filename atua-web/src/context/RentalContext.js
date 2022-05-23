import React, { createContext, useContext, useState } from "react";

import { ModalContext } from "./ModalContext";

import { storage } from "../assets/scripts/idbAccess";

import { createCardFormInstance } from "../assets/scripts/mercado_pago";

import {
  getAvailableCarsRequest,
  getPostInfoRequest,
  checkPublicationAvailabilityRequest,
  createReservationRequest,
  deleteReservationRequest,
  getUserPostsOrReservations,
  createPaymentRequest,
  readUserPaymentsRequest,
} from "../assets/scripts/requests/rentalRequests";

export const RentalContext = createContext();

const RentalContextProvider = (props) => {
  const { showAlertModal, toggleLoadingModal } = useContext(ModalContext);

  const [publicationInfo, setPublicationInfo] = useState({});

  const [availableCars, setAvailableCars] = useState({});

  const [userReservations, setUserReservations] = useState([]);

  const [userPayments, setUserPayments] = useState([]);

  const getPublicationInfo = async (id, reload = false) => {
    // If info already exists, dont fetch
    if (publicationInfo.id !== id || reload) {
      toggleLoadingModal.on();

      try {
        const publicationRequest = await getPostInfoRequest(id);

        if (publicationRequest.ok) {
          const publicationInfo = await publicationRequest.json();

          await setPublicationInfo(publicationInfo);

          toggleLoadingModal.off();
        }
      } catch (error) {
        console.log(error);

        toggleLoadingModal.off();

        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Error en búsqueda de datos",
        });
      }
    }
  };

  const clearPublicationInfo = () => setPublicationInfo({});

  const getAvailableCars = async (filters = {}) => {
    const availableCars = await getAvailableCarsRequest(filters);

    if (availableCars.ok) {
      const list = await availableCars.json();

      await setAvailableCars(list);
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Error en búsqueda de publicaciones",
      });
    }
  };

  const checkPublicationAvailability = async (from, to) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    const availability = await checkPublicationAvailabilityRequest(
      token,
      publicationInfo.id,
      from,
      to
    );

    const data = await availability.json();

    return data;
  };

  const getUserReservations = async () => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    if (token) {
      const userReservations = await getUserPostsOrReservations(
        token,
        "reservations"
      );

      if (userReservations.ok) {
        const reservations = (await userReservations.json()).results;

        await setUserReservations(reservations);
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Algo no salió bien en búsqueda de reservaciones",
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
      });
    }
  };

  const createReservation = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      const reservationCreation = await createReservationRequest(
        token,
        "p2p",
        formData
      );

      if (reservationCreation.ok) {
        showAlertModal({
          isAlert: false,
          title: "Reservación creada",
          body: "Proceda a pagar",
        });

        const reservationData = await reservationCreation.json();

        console.log(reservationData);

        await createCardFormInstance(
          reservationData.paid_amount,
          reservationData.id,
          createPayment
        );
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Algo no salió bien en el proceso de reservación",
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
      });
    }
  };

  const deleteReservation = async (reservationId) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      const reservationDeletion = await deleteReservationRequest(
        token,
        "p2p",
        reservationId
      );

      if (reservationDeletion.ok) {
        showAlertModal({
          isAlert: false,
          title: "Reservación borrada",
          body: "Se borro la reserva",
        });
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "No se pudo borrar la reserva",
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
      });
    }
  };

  const createPayment = async (formData) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      const payment = await createPaymentRequest(token, formData);

      if (payment.ok) {
        console.log(await payment.json());
      } else {
        console.log("fail in payment process", await payment.json());
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
      });
    }
  };

  //Provisoy, needs rework in chain fetching
  const readUserPayments = async () => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      const payments = await readUserPaymentsRequest(token);

      if (payments.ok) {
        const paymentsData = (await payments.json()).results;

        const detailedPaymentsData = paymentsData.map(async (payment) => {
          const paymentRead = await readUserPaymentsRequest(token, payment.id);

          return await paymentRead.json();
        });
        console.log(Promise.all(detailedPaymentsData));
        await setUserPayments(detailedPaymentsData);
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Failed to fetch user Payments",
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
      });
    }
  };

  const rentalActions = {
    getPublicationInfo,
    clearPublicationInfo,
    getAvailableCars,
    checkPublicationAvailability,
    createReservation,
    deleteReservation,
    getUserReservations,
    createPayment,
    readUserPayments,
  };

  return (
    <RentalContext.Provider
      value={{
        rentalActions,
        publicationInfo,
        availableCars,
        userReservations,
        userPayments,
      }}
    >
      {props.children}
    </RentalContext.Provider>
  );
};

export default RentalContextProvider;
