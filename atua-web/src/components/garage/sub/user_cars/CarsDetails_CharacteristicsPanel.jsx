import React from "react";

const CarsDetailsCaracteristics = (props) => {
  const { year, kilometers, doors, transmission, fuel_type } =
    props.selectedCarInfo;

  const fuelType = () => {
    if (fuel_type) {
      //REMOVE UPON FIELD CHANGE
      return fuel_type;

      // switch (fuel_type) {
      //   case 1:
      //     return "Nafta";
      //   case 2:
      //     return "Diesel";
      //   case 3:
      //     return "Híbrido";
      //   case 4:
      //     return "Eléctrico";
      //   case 5:
      //     return "Otro";
      //   default:
      //     return "";
      // }
    } else return "";
  };

  const transmissionType = () => {
    if (transmission) {
      //REMOVE UPON FIELD CHANGE
      return transmission;

      // switch (transmission) {
      //   case 1:
      //     return "Otra";
      //   case 2:
      //     return "Manual";
      //   case 3:
      //     return "Automática";
      //   default:
      //     return "";
      // }
    } else return "";
  };

  return (
    <div className="row justify-content-center m-2 m-md-3 p-2 p-md-3 position-relative _bg_tertiary _element_shadow">
      <div className="col-12">
        <h5 className="text-left font-weight-bold">Características</h5>
      </div>
      <div className="col-6">
        <p>{`Año: ${year || ""}`}</p>
      </div>
      <div className="col-6">
        <p>{`Kilómetros: ${kilometers || ""}`}</p>
      </div>
      <div className="col-6">
        <p>{`Puertas: ${doors || ""}`}</p>
      </div>
      <div className="col-6">
        <p>{`Transmisión: ${transmissionType() || ""}`}</p>
      </div>
      <div className="col-12">
        <p>{`Combustible: ${fuelType()}`}</p>
      </div>
    </div>
  );
};

export default CarsDetailsCaracteristics;
