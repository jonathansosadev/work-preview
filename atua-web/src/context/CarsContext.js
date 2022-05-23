import React, { createContext, useReducer, useContext } from "react";

import carReducer from "./reducers/carReducer";

import { ModalContext } from "./ModalContext";

import { storage } from "../assets/scripts/idbAccess";

import {
  userCarsRequest,
  registerCarRequest,
  updateCarRequest,
  deleteUserCarRequest,
} from "../assets/scripts/requests/carsRequests";

import { createCarPostRequest } from "../assets/scripts/requests/rentalRequests";

import { GET_USER_CARS, CARS_LOADING } from "./actionTypes";

import { userAddressRequest } from "../assets/scripts/requests/userRequests";

export const CarsContext = createContext();

const state = {
  userCars: [],
  loading: false,
};

const CarsContextProvider = (props) => {
  const [cars, dispatch] = useReducer(carReducer, state);

  const { showAlertModal, toggleLoadingModal } = useContext(ModalContext);

  const getUserCars = async (carId = false) => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);
    // If there's a token (user logged)
    if (token) {
      toggleLoadingModal.on();

      const request = await userCarsRequest(token, carId);

      // If request succeeds, store information
      if (request.ok) {
        const carsInfo = await request.json();

        if (!carId) {
          dispatch({ type: GET_USER_CARS, payload: carsInfo.data.results });

          toggleLoadingModal.off();

          return;
        }

        toggleLoadingModal.off();

        return carsInfo.data;
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Falla en carga de datos, intente nuevamente",
        });
      }
    }
  };

  // Post user new car
  // Requires Token, user ID, Car information
  // car address in a separate object (JSON, sent first)
  // Rest of car fields in FormData
  const registerUserCar = async (
    carAddress,
    carData,
    carDocPictures,
    carExtPictures,
    carIntPictures
  ) => {
    const token = await storage.db
      .collection("auth")
      .doc("access")
      .get()
      .then((access) => access.token);

    if (token) {
      toggleLoadingModal.on();

      dispatch({ type: CARS_LOADING });

      const registerCar = await registerCarRequest(
        token,
        carAddress,
        carData,
        carDocPictures,
        carExtPictures,
        carIntPictures
      );

      if (registerCar.ok) {
        getUserCars();

        return { ok: true };
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Falla en carga de datos, intente nuevamente",
        });

        return { ok: false };
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
        redirect: "/authorization/log_in",
      });

      return { ok: false };
    }
  };

  //  Car Update
  const updateUserCar = async (carData = null, carAddress = null, carId) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      toggleLoadingModal.on();

      dispatch({ type: CARS_LOADING });

      const updateCar = await updateCarRequest(
        token,
        carData,
        carAddress,
        carId
      );

      if (updateCar.ok) {
        getUserCars();

        showAlertModal({
          isAlert: false,
          title: "Exito",
          body: "Vehículo actualizado exitosamente",
          redirect: "/cars/garage",
        });
      } else {
        showAlertModal({
          isAlert: true,
          title: "Error",
          body: "Falla en carga de datos, intente nuevamente",
          redirect: "/cars/garage",
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
        redirect: "/authorization/log_in",
      });
    }
  };

  // Car deletion
  // Requires token and car id
  const deleteUserCar = async (carId) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    if (token) {
      toggleLoadingModal.on();

      dispatch({ type: CARS_LOADING });

      let carDeletion = await deleteUserCarRequest(carId, token);

      if (carDeletion.ok) {
        getUserCars();

        showAlertModal({
          isAlert: false,
          title: "Exito",
          body: "Vehículo borrado exitosamente",
          redirect: "/cars/garage/",
        });
      } else {
        showAlertModal({
          isAlert: true,
          title: "Falla",
          body: "No se pudo procesar su solicitud, pruebe nuevamente en otro momento",
          redirect: "/cars/garage/",
        });
      }
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Usted no es usuario",
        redirect: "/authorization/log_in",
      });
    }
  };

  const publishUserCar = async (
    carData,
    addressData,
    publishType,
    closeModalFunction
  ) => {
    const token = await storage.db
      .collection("auth")
      .doc("token")
      .get()
      .then((document) => document.value);

    const addressIdRequest = await userAddressRequest(token, addressData);

    if (!addressIdRequest) {
      showAlertModal({
        isAlert: true,
        title: "Error de publicación",
        body: "La publicación no pudo ser realizada, pruebe de nuevo mas tarde",
        redirect: "/cars/garage",
      });
    }

    const address = await addressIdRequest.json();

    carData = { ...carData, address: address.id };

    const publishCar = await createCarPostRequest(carData, token, publishType);

    closeModalFunction();

    if (publishCar.ok) {
      getUserCars();

      showAlertModal({
        isAlert: false,
        title: "Publicación agregada",
        body: "Su vehiculo se agregara a la lista de alquileres",
        redirect: "/cars/garage",
      });
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error de publicación",
        body: "La publicación no pudo ser realizada, pruebe de nuevo mas tarde",
        redirect: "/cars/garage",
      });
    }
  };

  const carActions = {
    getUserCars,
    registerUserCar,
    updateUserCar,
    deleteUserCar,
    publishUserCar,
  };

  return (
    <CarsContext.Provider value={{ cars, carActions }}>
      {props.children}
    </CarsContext.Provider>
  );
};

export default CarsContextProvider;
