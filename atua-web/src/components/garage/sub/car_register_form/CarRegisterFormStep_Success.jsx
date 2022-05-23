import React from "react";

import { Link } from "react-router-dom";

import registerSuccess from "../../../../assets/images/v1/car_register_success.png";

const CarRegisterFormStepSuccess = () => {
  return (
    <div className="row justify-content-center _form_step">
      <div className="col-12">
        <div className="row justify-content-center p-3 mt-2">
          <figure className="col-8">
            <img
              className="img-fluid"
              src={registerSuccess}
              alt="register success"
            />
            <figcaption className="text-center">
              <h3 className="_text_primary">Carga procesada</h3>
              <p className="text-muted">
                El registro de tu vehículo será procesado por nuestro staff.
                Deberás esperar al menos 24hs hasta poder ver el vehículo en tu
                lista y utilizarlo en la plataforma.
              </p>
            </figcaption>
          </figure>
        </div>

        <div className="row justify-content-center m-5">
          <div className="col text-center">
            <Link to="/garage" className="btn _bg_primary_shade1 text-white">
              Mis Vehículos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRegisterFormStepSuccess;
