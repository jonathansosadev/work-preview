// Form Component
// Holds logic for form control, image preview and
// image selection modal, form steps and form layout

import React, { useState } from "react";

import BrandModelLogicutus from "../../../_shared/BrandModelLogicutus";
import CountryProvinceLogicutus from "../../../_shared/CountryProvinceLogicutus";

import CarRegisterFormImageSelectionModal from "./CarRegisterForm_ImageSelectionModal";
import CarRegisterFormStepData from "./CarRegisterFormStep_Data";
import CarRegisterFormStepAddress from "./CarRegisterFormStep_Address";
import CarRegisterFormStepDocumentation from "./CarRegisterFormStep_Documentation";
import CarRegisterFormStepImagesExterior from "./CarRegisterFormStep_ImagesExterior";
import CarRegisterFormStepImagesInterior from "./CarRegisterFormStep_ImagesInterior";
import CarRegisterFormStepSuccess from "./CarRegisterFormStep_Success";
import CarRegisterFormLayout from "./CarRegisterFormLayout";

import upload from "../../../../assets/images/v1/img_upload_camera.svg";

const CarRegisterFormContainer = (props) => {
  const {
    handlers: { handleInput, handleSubmit },
    formData,
    completeForm,
  } = props;

  const [step, setStep] = useState(0);

  // REFERENCE: ism = ImageSelectionModal
  const [imageSelectionModal, setImageSelectionModal] = useState({
    show: false,
    imageName: "",
  });

  const nextStep = (lastFormStep) => {
    step + 1 > lastFormStep ? setStep(0) : setStep(step + 1);
  };

  const prevStep = (lastFormStep) => {
    step - 1 < 0 ? setStep(lastFormStep) : setStep(step - 1);
  };

  const successScreen = () => {
    setStep(5);
  };

  const canProceed = (step) => {
    switch (step) {
      case 0:
        return completeForm(formData, [
          "model",
          "year",
          "doors",
          "fuel_type",
          "transmission",
          "plate",
          "kilometers",
        ]);

      case 1:
        return completeForm(formData, [
          "city",
          "street_name",
          "street_number",
          "zip_code",
        ]);

      case 2:
        return completeForm(formData, [
          "picture_insurance",
          "picture_mechanical_check",
          "picture_driver_card",
        ]);

      case 3:
        return completeForm(formData, [
          "picture_front",
          "picture_left",
          "picture_right",
          "picture_back",
        ]);

      case 4:
        return completeForm(formData, [
          "picture_dashboard",
          "picture_interior_front",
          "picture_interior_back",
          "picture_trunk",
        ]);

      default:
        return false;
    }
  };

  const formControls = { step, nextStep, prevStep, successScreen, canProceed };

  const openISM = (imageName) => {
    setImageSelectionModal({ show: true, imageName });

    document.getElementsByTagName("body")[0].classList.add("_no_scroll");
  };
  const closeISM = () => {
    setImageSelectionModal({ show: false, imageName: "" });

    document.getElementsByTagName("body")[0].classList.remove("_no_scroll");
  };

  // Image preview element
  // Receives image as prop renders it if it exists
  const imagePreview = (imageName) => {
    if (formData[imageName] && formData[imageName] !== "") {
      return (
        <img
          src={URL.createObjectURL(formData[imageName])}
          alt="upload preview"
          width="100%"
        />
      );
    } else {
      return <img src={upload} alt="Upload" />;
    }
  };

  const ism = {
    openISM,
    closeISM,
    show: imageSelectionModal.show,
    imageName: imageSelectionModal.imageName,
    imagePreview,
  };

  return (
    <>
      <CarRegisterFormLayout
        formControls={formControls}
        handlers={{ handleInput, handleSubmit }}
      >
        <BrandModelLogicutus>
          <CarRegisterFormStepData
            handleInput={handleInput}
            formData={formData}
          />
        </BrandModelLogicutus>

        <CountryProvinceLogicutus>
          <CarRegisterFormStepAddress
            handleInput={handleInput}
            formData={formData}
          />
        </CountryProvinceLogicutus>

        <CarRegisterFormStepDocumentation handleInput={handleInput} ism={ism} />

        <CarRegisterFormStepImagesExterior
          handleInput={handleInput}
          ism={ism}
        />

        <CarRegisterFormStepImagesInterior
          handleInput={handleInput}
          ism={ism}
        />

        <CarRegisterFormStepSuccess />
      </CarRegisterFormLayout>

      {/* As it's not necessary to be always present, conditionally calls the whole component */}
      {ism.show && (
        <CarRegisterFormImageSelectionModal
          ism={ism}
          handleInput={handleInput}
        />
      )}
    </>
  );
};

export default CarRegisterFormContainer;
