import React from "react";
import { Route, useRouteMatch } from "react-router-dom";

import Available from "../rental/AvailableCars";
import Publication from "../rental/PublicationDetails";
import ReserveCar from "../rental/ReserveCar";

const Rental = (props) => {
  const { path } = useRouteMatch();

  return (
    <>
      <Route path={`${path}/available/`}>
        <Available />
      </Route>

      <Route path={`${path}/publication/:id/`}>
        <Publication />
      </Route>

      <Route exact path={`${path}/reservation/`}>
        <ReserveCar />
      </Route>
    </>
  );
};

export default Rental;
