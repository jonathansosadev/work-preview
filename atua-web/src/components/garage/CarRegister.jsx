// Component to hold submit functions
// Split info accordingly and call context function

import React, { useContext } from "react";

import { CarsContext } from "../../context/CarsContext";

import CarRegisterForm from "./sub/car_register_form/CarRegisterForm";

const CarRegister = () => {
  const { carActions } = useContext(CarsContext);

  const handleSubmit = async (formData, successScreen) => {
    // Separates formData in 2 objects for post:
    // -addressFields (sent first, different collection on DB)
    // -carData (every other field)
    let addressFields = {
      city: formData.city,
      street_name: formData.street_name,
      street_number: formData.street_number,
      description: formData.description,
      zip_code: formData.zip_code,
      default: false,
    };

    let carData = {
      plate: formData.plate,
      year: formData.year,
      transmission: formData.transmission,
      doors: formData.doors,
      kilometers: formData.kilometers,
      fuel_type: formData.fuel_type,
      car_model: formData.model,
    };

    let carDocPictures = new FormData();

    carDocPictures.set(
      "picture_mechanical_check",
      formData.picture_mechanical_check,
      `picture_mechanical_check.${formData.picture_mechanical_check.type.slice(
        6
      )}`
    );
    carDocPictures.set(
      "picture_driver_card",
      formData.picture_driver_card,
      `picture_driver_card.${formData.picture_driver_card.type.slice(6)}`
    );
    carDocPictures.set(
      "picture_insurance",
      formData.picture_insurance,
      `picture_insurance.${formData.picture_insurance.type.slice(6)}`
    );

    let carExtPictures = new FormData();

    carExtPictures.set(
      "picture_front",
      formData.picture_front,
      `picture_front.${formData.picture_front.type.slice(6)}`
    );
    carExtPictures.set(
      "picture_left",
      formData.picture_left,
      `picture_left.${formData.picture_left.type.slice(6)}`
    );
    carExtPictures.set(
      "picture_right",
      formData.picture_right,
      `picture_right.${formData.picture_right.type.slice(6)}`
    );
    carExtPictures.set(
      "picture_back",
      formData.picture_back,
      `picture_back.${formData.picture_back.type.slice(6)}`
    );

    let carIntPictures = new FormData();

    carIntPictures.set(
      "picture_dashboard",
      formData.picture_dashboard,
      `picture_dashboard.${formData.picture_dashboard.type.slice(6)}`
    );
    carIntPictures.set(
      "picture_interior_front",
      formData.picture_interior_front,
      `picture_interior_front.${formData.picture_insurance.type.slice(6)}`
    );
    carIntPictures.set(
      "picture_interior_back",
      formData.picture_interior_back,
      `picture_interior_back.${formData.picture_interior_back.type.slice(6)}`
    );
    carIntPictures.set(
      "picture_trunk",
      formData.picture_trunk,
      `picture_trunk.${formData.picture_trunk.type.slice(6)}`
    );

    // Address fields are sent as JSON
    // Car Data fields in FormData form
    const registerRequest = await carActions.registerUserCar(
      addressFields,
      carData,
      carDocPictures,
      carExtPictures,
      carIntPictures
    );

    if (registerRequest.ok) {
      successScreen();
    }
  };

  return <CarRegisterForm handleSubmit={handleSubmit} />;
};

export default CarRegister;
