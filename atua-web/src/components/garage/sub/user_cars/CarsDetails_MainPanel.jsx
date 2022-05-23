import React from "react";

// import {
//   apiURI,
//   getProvincesEP,
// } from "../../../../assets/scripts/requests/dbUri";

const CarsDetailsMainPanel = (props) => {
  const {
    selectedCarInfo: { address, car_model, plate, status },
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

  const fullAddres = () => {
    if (Object.entries(address > 0)) {
      return (
        <>
          <p className="m-0">
            {`${address ? address.street_name : ""} ${
              address ? address.street_number : ""
            }`}
            {address ? (
              <span className="text-muted">{`, ${address.description}`}</span>
            ) : null}
          </p>
          <p>{`${address ? address.city.province.name : ""}, ${
            address ? address.city.province.country.name : ""
          }`}</p>
        </>
      );
    } else {
      return null;
    }
  };

  return (
    <div className="row justify-content-between m-2 m-md-3 position-relative _bg_tertiary _element_shadow">
      <div className={`_car_detail_status_line ${carStatus().color}`}></div>
      <div className="col text-left">
        <h4 className="pt-2">
          {`${car_model.brand.name}`} <br className="d-md-none" />{" "}
          {`${car_model.description} `}
        </h4>
        <p className="text-muted text-right h6 pl-2">{plate}</p>
        {fullAddres()}
      </div>
    </div>
  );
};

export default CarsDetailsMainPanel;
