// RESET PASSWORD
// User is directed here from an email URL and sets a new password

import React, { useState } from "react";

import history from "../../history";

import { apiURI, resetPassEP } from "../../assets/scripts/requests/dbUri";
import ResetPasswordForm from "./sub/reset_password/ResetPasswordForm";

const ResetPassword = (props) => {
  const [formData, setFormData] = useState({});
  const [changeConfirmed, setChangeConfirmed] = useState(false);

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

  // Form submit, extracts uid and token from path, adds new password and sends request
  // Changes boolean in state for conditional rendering
  const handleSubmit = async (evt) => {
    evt.preventDefault();

    let pathData = {
      uid: window.location.pathname.split("/")[4],
      token: window.location.pathname.split("/")[5],
    };

    let body = JSON.stringify({ ...pathData, ...formData });

    let init = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body,
      redirect: "follow",
    };

    try {
      let requestReset = await fetch(apiURI + resetPassEP, init);

      if (requestReset.status === 204) {
        setChangeConfirmed(true);

        setTimeout(() => history.push("/authorize/log_in"), 3000);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Renders form or success message based on boolean in state

  return (
    <ResetPasswordForm
      handleInput={handleInput}
      handleSubmit={handleSubmit}
      changeConfirmed={changeConfirmed}
    />
  );
};

export default ResetPassword;
