import React from "react";

const CarsDetailsNotificationPanel = (props) => {
  const { status } = props.selectedCarInfo;

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
    <div className="row justify-content-center m-3 _bg_tertiary _element_shadow">
      <h4
        className={
          `text-center`
          // ${carStatus().color}`
        }
      >
        {carStatus().legend}
      </h4>
    </div>
  );
};

export default CarsDetailsNotificationPanel;
