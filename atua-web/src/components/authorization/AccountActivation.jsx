// Account Activation
// After user signs up succesfully an email will be sent to the registered email address
// The link sent will redirect here, on component mount it will proceed to activate the
// account
// If activation is successful, will redirect to log in component

//TODO: Improve styling
//TODO: Resend activation component/functionality

import React, { useEffect, useState } from "react";

import { apiURI, activationEP } from "../../assets/scripts/requests/dbUri";

import AccountActivationLayout from "./sub/account_activation/AccountActivationLayout";

import history from "../../history";

// Funcional component, uses hoooks
const AccountActivation = () => {
  const [activated, setActivated] = useState(false);

  // Activation request
  const activateAccount = async () => {
    const queries = new URLSearchParams(window.location.search);

    try {
      const body = { uid: queries.get("id"), token: queries.get("token") };

      const activationInit = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        redirect: "follow",
      };

      const activation = await fetch(apiURI + activationEP, activationInit);

      if (activation.status === 204) {
        setActivated(true);
        history.push("/authorization/log_in");
      }
    } catch (error) {
      alert("Oops, something happened!");
    }
  };

  // Request on component mounting
  useEffect(() => {
    activateAccount();
  }, []);

  // Render changes on success, changes seen IF redirect (history.push) fails
  return <AccountActivationLayout activated={activated} />;
};

export default AccountActivation;
