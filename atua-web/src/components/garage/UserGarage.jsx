import React, { useEffect, useState, useContext } from "react";

import { CarsContext } from "../../context/CarsContext";
// import { RentalContext } from "../../context/RentalContext";

// import {useHistory} from "react-router-dom"

import UserGarageLayout from "./sub/user_garage/UserGarageLayout";

import CarsList from "./sub/user_cars/MainTab_CarsList";
import CarsDetails from "./sub/user_cars/SubTab_CarsDetails";

import UserReservations from "./sub/user_reservations/MainTab_UserReservations";
import ReservationDetails from "./sub/user_reservations/SubTab_ReservationDetails";

import UserWallet from "./sub/user_wallet/MainTab_UserWallet";
import WalletDetails from "./sub/user_wallet/SubTab_WalletDetails";

// import CarsDetailsPublishCarModal from "./sub/user_garage/PublishCarModal";

const UserGarage = (props) => {
  const {
    cars: { userCars },
    carActions,
  } = useContext(CarsContext);

  //RESERVATIONS TBA
  // const {
  // userReservations,
  // rentalActions
  // } = useContext(RentalContext);

  // On mount get user vehicles
  useEffect(() => {
    carActions.getUserCars();

    // rentalActions.getUserReservations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [tab, setTab] = useState(0);

  const [selectedCar, setSelectedCar] = useState({});

  // const [selectedReservation, setSelectedReservation] = useState({});

  // const [publishModal, setPublishModal] = useState(false);

  // const [deleteCarModal, setDeleteCarModal] = useState(false);

  const carSelect = (carId) => {
    if (carId !== selectedCar.id) {
      const car = userCars.find((car) => car.id === carId);

      setSelectedCar(car);
    }
  };

  // const deleteCar = async () => {
  //   await carActions.deleteUserCar(selectedCar.id);

  //   setSelectedCar({});
  // };

  // const reservationSelect = (reservationId) => {
  //   const reservation = userReservations.find(
  //     (reservation) => reservation.id === reservationId
  //   );

  //   setSelectedReservation(reservation);
  // };

  // const togglePublishModal = (reset = false) => {
  //   setPublishModal(!publishModal);
  // };

  // const toggleDeleteCarModal = (reset = false) => {
  //   setDeleteCarModal(!deleteCarModal);
  // };

  const tabsControls = { tab, setTab };

  const mainTabsArr = [
    <CarsList userCars={userCars} carSelect={carSelect} />,
    <UserReservations
    // userReservations={userReservations}
    // reservationSelect={reservationSelect}
    />,
    <UserWallet />,
  ];

  const subTabsArr = [
    <CarsDetails
      userCars={userCars}
      selectedCar={selectedCar}
      // togglePublishModal={togglePublishModal}
      // toggleDeleteCarModal={toggleDeleteCarModal}
      // deleteCar={deleteCar}
    />,
    <ReservationDetails
    // userReservations={userReservations}
    // selectedReservation={selectedReservation}
    />,
    <WalletDetails />,
  ];

  return (
    <>
      <UserGarageLayout
        tabsControls={tabsControls}
        mainTabsArr={mainTabsArr}
        subTabsArr={subTabsArr}
      />

      {/* {publishModal && (
        <CarsDetailsPublishCarModal
          selectedCar={selectedCar}
          togglePublishModal={togglePublishModal}
        />
      )}
      {deleteCarModal && (
        <CarsDetailsPublishCarModal
          selectedCar={selectedCar}
          toggleDeleteCarModal={toggleDeleteCarModal}
        />
      )} */}
    </>
  );
};

export default UserGarage;
