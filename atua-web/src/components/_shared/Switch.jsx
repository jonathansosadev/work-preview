// Switch component
// Holds every component for routing
// Gets user info on mount

import React, { useContext, useEffect } from "react";

import { Redirect, Switch, Route } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

import CarsContextProvider from "../../context/CarsContext";
import RentalContextProvider from "../../context/RentalContext";

import { storage } from "../../assets/scripts/idbAccess";

import Authorization from "../__pages/Authorization";
import User from "../__pages/User";
import Garage from "../__pages/Garage";
import Rental from "../__pages/Rental";

import LandingPage from "../__pages/Landing";
import Faq from "../__pages/FAQ";
import Information from "../__pages/Information";

import StoreRedirect from "../__pages/StoreRedirect";

const MainSwitch = () => {
  const { user, userActions } = useContext(UserContext);

  const { logged } = user;

  // On mount get user info
  useEffect(() => {
    const userData = async () => {
      let token = await storage.db
        .collection("auth")
        .doc("access")
        .get()
        .then((access) => access.token)
        .catch((e) => null);

      if (token) {
        userActions.getInfo(token);
      }
    };

    userData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logged]);

  return (
    <main className="container-fluid">
      <Switch>
        <Route path="/store_redirect">
          <StoreRedirect />
        </Route>

        <Route path="/information">
          <Information />
        </Route>

        <Route path="/faq">
          <Faq />
        </Route>

        {/* Authorization/Authentication page, contains log in, sign up, activation, pwd reset, pwd forgot */}
        <Route path="/authorization">
          <Authorization />
        </Route>

        <Route exact path="/">
          <LandingPage />
        </Route>

        <Route path="/user">
          {logged ? <User /> : <Redirect to="/authorization/log_in" />}
        </Route>

        <CarsContextProvider>
          <RentalContextProvider>
            <Route path="/garage">
              {logged ? <Garage /> : <Redirect to="/authorization/log_in" />}
            </Route>

            <Route path="/rental">
              {process.env.NODE_ENV === "development" ||
              process.env.NODE_ENV === "production" ? (
                <Rental logged={logged} />
              ) : (
                <Redirect to="/store_redirect" />
              )}
            </Route>
          </RentalContextProvider>
        </CarsContextProvider>
      </Switch>
    </main>
  );
};

export default MainSwitch;
