// Sign up component

// TODO: Form fields style on requeriments fulfilled

import React, { useState, useContext } from "react";

import { UserContext } from "../../context/UserContext";
import { ModalContext } from "../../context/ModalContext";

import {
  validFormField,
  validFormFieldClass,
} from "../../assets/scripts/validations";

import SignUpForm from "./sub/sign_up/SignUpForm";
import CountryProvinceLogicutus from "../_shared/CountryProvinceLogicutus";

import { useTranslation } from "react-i18next";

const SignUp = (props) => {
  const { authActions } = useContext(UserContext);
  const { showAlertModal } = useContext(ModalContext);

  const [t] = useTranslation("shared");

  const [formData, setFormData] = useState({ is_terms_accepted: false });

  // Input change sets state
  // Uses element ID to set field in formData object
  const handleInput = (evt) => {
    let target = evt.target;
    let { id, value } = target;

    if (id === "is_terms_accepted") {
      setFormData({
        ...formData,
        [id]: !formData[id],
      });
    } else {
      setFormData({
        ...formData,
        [id]: value,
      });
    }

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
  };

  //Form submit function
  // Basic field validation (besides html)
  const handleSubmit = (evt) => {
    evt.preventDefault();

    console.log(formData);

    //Uses validation script, checks if all fields are complete and if data is valid
    //Validation script holds the rules
    let completeFields =
      Object.entries(formData).length === 5 &&
      Object.entries(formData)
        .map((field) => validFormField(formData, field[0]))
        .every((field) => field === true);

    if (!formData.is_terms_accepted) {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.register_failure_title"),

        body: t("alert_modal.alerts.fail.tos_warning"),
      });
      return;
    }

    if (
      !validFormField(formData, "email") ||
      formData.email !== formData.re_email
    ) {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.register_failure_title"),

        body: t("alert_modal.alerts.fail.invalid_email"),
      });
      return;
    }

    if (!validFormField(formData, "pin")) {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.register_failure_title"),

        body: t("alert_modal.alerts.fail.invalid_pin"),
      });
      return;
    }

    console.log(completeFields);

    if (completeFields) {
      authActions.signUp(formData);
    } else {
      showAlertModal({
        isAlert: true,
        title: t("alert_modal.alerts.fail.register_failure_title"),
        body: t("alert_modal.alerts.fail.field_missing"),
      });
    }
  };

  const validField = (fieldId) => {
    return validFormFieldClass(formData, fieldId);
  };

  return (
    <>
      <CountryProvinceLogicutus>
        <SignUpForm
          handleInput={handleInput}
          handleSubmit={handleSubmit}
          validField={validField}
        />
      </CountryProvinceLogicutus>
    </>
  );
};

export default SignUp;
