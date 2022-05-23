import React from "react";

import userCar from "../../../../assets/images/v1/car_placeholder_universal.png";

const CarsList_CarCard = (props) => {
  const {
    carInfo: { car_model, plate, id, status },
    carSelect,
  } = props;

  const carStatus = () => {
    let statusObj = { color: "_car_pending", legend: "Pendiente" };

    switch (status) {
      case 0:
        statusObj.color = "_car_pending";
        statusObj.legend = "Pendiente";
        break;

      case 1:
        statusObj.color = "_car_accepted";
        statusObj.legend = "Disponible";
        break;

      case 2:
        statusObj.color = "_car_rejected";
        statusObj.legend = "Rechazado";
        break;

      case 3:
        statusObj.color = "_car_pending";
        statusObj.legend = "Pendiente";
        break;

      default:
        break;
    }

    return statusObj;
  };

  return (
    <div className="col-10 col-md-6 p-1 p-md-3 mt-2 mt-md-0">
      <figure
        onClick={() => carSelect(id)}
        className="card p-0 m-0 _element_shadow"
      >
        <div className="row justify-content-end mb-n5">
          <div className={`_car_card_status_line ${carStatus().color}`}></div>
          <div className="col-auto mr-3">
            <p
              className={`text-right text-white font-weight-bold rounded-bottom p-1 ${
                carStatus().color
              }`}
            >
              {carStatus().legend}
            </p>
          </div>
        </div>
        <img
          className="card-img-top d-none d-md-block"
          alt="User Car"
          src={userCar}
        />
        <figcaption className="card-body p-1 py-3">
          <h5 className="card-title m-0 p-0">{`${car_model.brand.name} ${car_model.description}`}</h5>
          <h6 className="card-subtitle text-muted m-0 p-0">{plate}</h6>
        </figcaption>
      </figure>
    </div>
  );
};

export default CarsList_CarCard;
