import React from "react";

import { Route, useRouteMatch } from "react-router-dom";

import CarRegister from "../garage/CarRegister";

import UserGarage from "../garage/UserGarage";

const Cars = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <Route exact path={`/garage`}>
        <UserGarage />
      </Route>

      <Route path={`${path}/register`}>
        <CarRegister />
      </Route>
    </>
  );
};

export default Cars;
