// REQUEST RESET PASSWORD
// Form for submiting a password change request
// User sends the account email

import React, { useState } from "react";

import { apiURI, forgotPassEP } from "../../assets/scripts/requests/dbUri";
import ForgotPasswordForm from "./sub/forgot_password/ForgotPasswordForm";

const ForgotPassword = () => {
  const [formData, setFormData] = useState({});
  const [requestAccepted, setRequestAccepted] = useState(false);

  // Input change sets state
  // Uses element ID to set field in formData object
  const handleInput = (evt) => {
    let target = evt.target;
    let { id, value } = target;

    setFormData({
      ...formData,
      [id]: value,
    });
  };

  // Form submit, if accepted changes boolean on state that affects element rendered
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    let body = JSON.stringify(formData);

    let init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      redirect: "follow",
    };

    try {
      let requestReset = await fetch(apiURI + forgotPassEP, init);

      if (requestReset.status === 204) {
        setRequestAccepted(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // According on boolean on state, renders form or next step

  return (
    <ForgotPasswordForm
      handleInput={handleInput}
      handleSubmit={handleSubmit}
      requestAccepted={requestAccepted}
    />
  );
};

export default ForgotPassword;
