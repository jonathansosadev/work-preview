import React from "react";

import { useHistory } from "react-router-dom";

const UserGarage_BackButton = () => {
  const history = useHistory();

  return (
    <section className="col-12 p-1 p-md-2 mt-3">
      <div className="row justify-content-center">
        <div className="col-auto">
          <button className="btn _back_button" onClick={() => history.goBack()}>
            Volver
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserGarage_BackButton;
