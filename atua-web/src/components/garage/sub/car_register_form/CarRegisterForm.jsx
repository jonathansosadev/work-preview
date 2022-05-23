// Component for storing and processing form data

import React, { useContext, useState } from "react";

import { ModalContext } from "../../../../context/ModalContext";

import { completeForm } from "../../../../assets/scripts/validations";

import CarRegisterFormContainer from "./CarRegisterFormContainer";

const CarRegisterForm = (props) => {
  const { showAlertModal } = useContext(ModalContext);

  const [formData, setFormData] = useState({});

  const handleInput = (evt) => {
    const target = evt.target;
    const { id, value } = target;

    // If the field is a file
    if (target.type === "file") {
      // Stores file if one's been selected already
      const tempFile = formData[id] ? formData[id] : null;

      // If it's not cancelled, creates blob and stores it
      if (target.files[0]) {
        const blob = new Blob([target.files[0]], {
          type: target.files[0].type,
        });

        setFormData({
          ...formData,
          [id]: blob,
        });
        // If it's cancelled, uses the previous file
      } else {
        setFormData({ ...formData, [id]: tempFile });
      }
    } else {
      // For any other input
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const handleSubmit = (evt, successScreen) => {
    evt.preventDefault();

    if (
      completeForm(formData, [
        "model",
        "year",
        "doors",
        "fuel_type",
        "transmission",
        "plate",
        "kilometers",
        "city",
        "street_name",
        "street_number",
        "zip_code",
        "picture_driver_card",
        "picture_insurance",
        "picture_mechanical_check",
        "picture_front",
        "picture_left",
        "picture_right",
        "picture_back",
        "picture_dashboard",
        "picture_interior_front",
        "picture_interior_back",
        "picture_trunk",
      ])
    ) {
      props.handleSubmit(formData, successScreen);
    } else {
      showAlertModal({
        isAlert: true,
        title: "Error",
        body: "Uno o mas campos estan incompletos",
      });
    }
  };

  const handlers = {
    handleInput,
    handleSubmit,
  };

  return (
    <CarRegisterFormContainer
      handlers={handlers}
      formData={formData}
      completeForm={completeForm}
    />
  );
};

export default CarRegisterForm;
