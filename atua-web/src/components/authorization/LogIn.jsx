// Log In component
// Component that makes log in

// TODO: Form fields style on requeriments fulfilled (email format, password lenght/chars)

import React, { useContext, useState } from "react";

import { UserContext } from "../../context/UserContext";
import { ModalContext } from "../../context/ModalContext";

import { useTranslation } from "react-i18next";

import {
  // validFormField,
  validFormFieldClass,
} from "../../assets/scripts/validations";

import LogInFields from "./sub/log_in/LogInForm";

const LogIn = (props) => {
  const { authActions } = useContext(UserContext);
  const { showAlertModal } = useContext(ModalContext);

  const [formData, setFormData] = useState({});

  const [t] = useTranslation("shared");

  // Input change sets state
  // Uses element ID to set field in formData object
  const handleInput = (evt) => {
    let target = evt.target;
    let { id, value } = target;

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

    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Form submit funcion
  // Basic validation (besides html)
  const handleSubmit = (evt) => {
    evt.preventDefault();

    let completeFields = Object.entries(formData).length === 2;

    if (completeFields) {
      authActions.logIn(formData);
    } else if (!completeFields) {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.access_failure_title"),
        body: t("alert_modal.alerts.fail.field_missing"),
      });
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.access_failure_title"),
        body: t("alert_modal.alerts.fail.unexpected_error"),
      });
    }
  };

  const validField = (fieldId) => {
    return validFormFieldClass(formData, fieldId);
  };

  return (
    <LogInFields
      handleInput={handleInput}
      handleSubmit={handleSubmit}
      validField={validField}
    />
  );
};

export default LogIn;
