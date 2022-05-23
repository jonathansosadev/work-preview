// Profile component
// Displays user information and buttons for updating or completing information and delete user

// ********** ATTENTION *************
// WE ARE TRANSITIONING BACK END, THEREFORE THINGS ARE NOT WORKING PROPERLY
// CURRENTLY ONLY PASSWORD CHANGE IMPLEMENTED
// CHECK FOR CHANGE IN FINAL SWITCH STRUCTURE TO AVOID REPETING MODAL CALLING IN SBMIT FUNCTIONS
// CHECK IF BUTTONS IN PANEL CONTAINER HAS BEEN ADDED TO CHILD COMPONENT (SUBMIT/RESET)
// STAY UP TO DATE IN VARIABLE NAMES

import React, { useContext, useState } from "react";
import { validFormField, completeForm } from "../../assets/scripts/validations";

import { UserContext } from "../../context/UserContext";
import { ModalContext } from "../../context/ModalContext";

import ProfileLayout from "./sub/profile/ProfileLayout";
import { useTranslation } from "react-i18next";

const Profile = (props) => {
  const {
    user: { user },
    userActions,
  } = useContext(UserContext);

  const { showAlertModal } = useContext(ModalContext);

  const [t] = useTranslation("shared");

  const [formData, setFormData] = useState({});

  // Input change sets state
  // Uses element ID to set field in formData object
  const handleInput = (evt) => {
    const target = evt.target;
    const { id, value } = target;

    // If emptied removes the entry from the object
    // Object.entries gives an array of arrays, entry[0] is the pair's name
    if (value === "") {
      setFormData(
        Object.fromEntries(
          Object.entries(formData).filter((entry) => entry[0] !== id)
        )
      );

      return;
    }

    // If field is file
    if (target.type === "file") {
      // Stores previous file in case upload is canceled
      const tempFile = formData[id] ? formData[id] : null;

      // If file is selected not cancelled
      if (target.files[0]) {
        const blob = new Blob([target.files[0]], {
          type: target.files[0].type,
        });

        setFormData({
          ...formData,
          [id]: blob,
        });
        // In case it's cancelled, uses stored file
      } else {
        setFormData({ ...formData, [id]: tempFile });
      }
    } else {
      // For every other input
      setFormData({
        ...formData,
        [id]: value,
      });
    }
  };

  const completeImages = (fieldId) => {
    return validFormField(formData, fieldId);
  };

  const handlePinSubmit = async (evt, fields) => {
    const pinData = Object.fromEntries(
      fields.map((field) => [field, formData[field]])
    );

    userActions.pinChange(pinData);

    evt.target.reset();
  };

  //As documentation registering (id, license) is done in the same endpoint,
  //it might be possile to use the same function diferentiating by using the
  const handleDocumentationSubmit = (evt, fields) => {
    const documentationData = Object.fromEntries(
      fields.map((field) => [field, formData[field]])
    );

    if (evt.target.id === "idInfo") {
      userActions.documentationRegister(documentationData);
    }

    if (evt.target.id === "licenseInfo") {
      const formatedData = {
        document_type: 2,
        document_expiration: formData.license_expiration,
        document_picture_front: formData.driver_license_front,
        document_picture_back: formData.driver_license_back,
      };

      userActions.documentationRegister(formatedData);
    }

    evt.target.reset();
  };

  const handleAddressSubmit = async (evt, fields) => {
    let addressData = Object.fromEntries(
      fields.map((field) => [field, formData[field]])
    );

    if (formData.description) addressData.description = formData.description;

    userActions.addressRegister(addressData);

    evt.target.reset();
  };

  //Calls the modal for incomplete formData
  const callTheIncompleteFieldsModal = () => {
    showAlertModal({
      isAlert: true,
      title: t("alert_modal.alerts.fail.generic_error_title"),
      body: t("alert_modal.alerts.fail.incomplete_fields"),
    });

    return;
  };

  // VALIDATES IF FORMDATA IS COMPLETE AND VALID (input, not back end)
  //(for back end response, go to context)
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    let fields = [];

    switch (evt.target.id) {
      case "mainInfo":
        alert("you cannot!");

        evt.target.reset();
        // handleMainInfoSubmit();
        break;

      case "addressInfo":
        fields = ["city", "street_name", "street_number", "zip_code"];

        if (completeForm(formData, fields)) {
          handleAddressSubmit(evt, fields);
        } else callTheIncompleteFieldsModal();
        break;

      case "licenseInfo":
        await setFormData({ ...formData, document_type: 2 });

        fields = [
          "license_expiration",
          "driver_license_front",
          "driver_license_back",
        ];
        if (completeForm(formData, fields)) {
          handleDocumentationSubmit(evt, fields);
        } else callTheIncompleteFieldsModal();
        break;

      case "idInfo":
        fields = [
          "document_type",
          "document_number",
          "document_expiration",
          "document_picture_front",
          "document_picture_back",
        ];
        if (completeForm(formData, fields)) {
          handleDocumentationSubmit(evt, fields);
        } else callTheIncompleteFieldsModal();
        break;

      case "pinForm":
        fields = ["pin_old", "pin_new"];

        if (completeForm(formData, fields)) {
          handlePinSubmit(evt, fields);
        } else callTheIncompleteFieldsModal();
        break;

      default:
        showAlertModal({
          isAlert: true,
          title: t("alert_modal.alerts.fail.generic_error_title"),
          body: t("alert_modal.alerts.fail.incomplete_fields"),
        });
        break;
    }
  };

  // RESETS FORM USING TARGET PROPERTY
  const handleCancel = (evt) => {
    evt.target.reset();
  };

  // OLD - LEFT FOR REFERENCE
  // const handleMainInfoSubmit = async () => {
  //   if (
  //     completeForm(
  //       formData,
  //       ["first_name", "last_name", "phone_area_code", "phone_number"],
  //       false
  //     ) ||
  //     user.date_of_birth !== formData.date_of_birth
  //   ) {
  //     const mainInfo = {
  //       first_name: formData.first_name,
  //       last_name: formData.last_name,
  //       date_of_birth: formData.date_of_birth,
  //       phone_area_code: formData.phone_area_code,
  //       phone_number: formData.phone_number,
  //     };

  //     userActions.mainInfoUpdate(mainInfo);
  //   }
  // };

  const handlers = { handleInput, handleSubmit, handleCancel };

  return (
    <ProfileLayout
      user={user}
      handlers={handlers}
      completeImages={completeImages}
      formData={formData}
    />
  );
};

export default Profile;
