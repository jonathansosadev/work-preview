import React, { useState, useEffect } from "react";

import AccountActivationModalLayout from "./AccountActivationModalLayout";

const AccountActivationModal = (props) => {
  const { validateAndRegisterUser } = props;

  const [code, setCode] = useState("");

  const handleInput = (evt) => {
    let { value } = evt.target;

    setCode(value);
  };

  useEffect(() => {
    validateAndRegisterUser(code);
  }, [code, validateAndRegisterUser]);

  return <AccountActivationModalLayout handleInput={handleInput} />;
};

export default AccountActivationModal;
