import React from "react";

import { Route, useRouteMatch } from "react-router-dom";

import SignUp from "../authorization/SignUp";
import LogIn from "../authorization/LogIn";
import Activation from "../authorization/AccountActivation";
import ForgotPassword from "../authorization/ForgotPassword";
import PasswordReset from "../authorization/ResetPassword";

const Authorization = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <Route path={`${path}/log_in`}>
        <LogIn />
      </Route>

      <Route path={`${path}/register`}>
        <SignUp />
      </Route>

      <Route path={`${path}/activate`}>
        <Activation />
      </Route>

      <Route path={`${path}/password_reset`}>
        <ForgotPassword />
      </Route>

      <Route path={`${path}/password/reset/confirm`}>
        <PasswordReset />
      </Route>
    </>
  );
};

export default Authorization;
