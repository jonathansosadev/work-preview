import React from "react";

import { useHistory } from "react-router-dom";

const DetailsColumn = (props) => {
  const history = useHistory();

  const { publicationInfo } = props;

  const fuelType = () => {
    if (publicationInfo.car) {
      switch (publicationInfo.car.fuel_type) {
        case 1:
          return "Nafta";
        case 2:
          return "Diesel";
        case 3:
          return "Híbrido";
        case 4:
          return "Eléctrico";
        case 5:
          return "Otro";
        default:
          return "";
      }
    } else return "";
  };

  const transmissionType = () => {
    if (publicationInfo.car) {
      switch (publicationInfo.car.transmission) {
        case 1:
          return "Otra";
        case 2:
          return "Manual";
        case 3:
          return "Automática";
        default:
          return "";
      }
    } else return "";
  };

  return (
    <div className="col-5 p-5">
      <div className="row justify-content-center mb-3">
        <div className="col py-3 text-center">
          <h2>{`${publicationInfo.price / 1000}$/día`}</h2>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col py-3">
          <h5>Description:</h5>
          <p className="m-0">
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat."
          </p>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col py-3">
          <div className="row row-cols-2">
            <div className="col p-2 mt-2">
              <p className="m-0">
                Año: {publicationInfo.car ? publicationInfo.car.year : ""}
              </p>
            </div>
            <div className="col p-2 mt-2">
              <p className="m-0">
                Puertas: {publicationInfo.car ? publicationInfo.car.doors : ""}
              </p>
            </div>
            <div className="col p-2 mt-2">
              <p className="m-0">Transmisión: {transmissionType()}</p>
            </div>
            <div className="col p-2 mt-2">
              <p className="m-0">Combustible: {fuelType()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col py-3">
          <h5>Disponibilidad:</h5>
          <div className="row justify-content-around">
            <p className="font-weight-bold m-0">
              {new Date(publicationInfo.available_since).toDateString()}
            </p>
            <p className="font-weight-bold m-0">
              {new Date(publicationInfo.available_until).toDateString()}
            </p>
          </div>
        </div>
      </div>
      <div className="row mb-3">
        <div className="col py-3">
          <p className="m-0">El usuario dice:</p>
          <p className="m-0">{`${
            publicationInfo.description || publicationInfo.message
          }`}</p>
        </div>
      </div>
      <div className="row justify-content-center">
        <button
          onClick={() => history.push(`/rental/reservation/`)}
          className="btn btn-lg btn-danger text-center"
        >
          Reservar
        </button>
      </div>
    </div>
  );
};

export default DetailsColumn;
