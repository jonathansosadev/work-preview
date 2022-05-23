import React from "react";

import { Route, useRouteMatch } from "react-router-dom";

import Profile from "../user/Profile";
import DeleteUser from "../user/DeleteUser";

const User = () => {
  const { path } = useRouteMatch();

  return (
    <>
      <Route path={`${path}/profile`}>
        <Profile />
      </Route>

      <Route path={`${path}/delete`}>
        <DeleteUser />
      </Route>
    </>
  );
};

export default User;
