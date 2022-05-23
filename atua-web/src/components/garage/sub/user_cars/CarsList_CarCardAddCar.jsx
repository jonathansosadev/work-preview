import React from "react";
import { useHistory } from "react-router-dom";

import addCar from "../../../../assets/images/v1/car_placeholder_universal.png";

const CarsList_CarCardAddCar = (props) => {
  const history = useHistory();

  return (
    <div className="col-10 col-md-6 p-1 p-md-3 my-2 my-md-0">
      <figure
        onClick={() => history.push("/garage/register/")}
        className="card p-0 m-0 _element_shadow _car_register_card"
      >
        <img
          className="card-img-top d-none d-md-block"
          alt="Add Car"
          src={addCar}
        />
        <figcaption className="card-body p-1">
          <h5 className="card-title text-center text-muted m-3 p-0">
            Registrar vehículo
          </h5>
        </figcaption>
      </figure>
    </div>
  );
};

export default CarsList_CarCardAddCar;
