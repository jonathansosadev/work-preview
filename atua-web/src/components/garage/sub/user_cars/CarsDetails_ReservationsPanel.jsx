import React from "react";

import { Link } from "react-router-dom";

const CarsDetailsReservationsPanel = (props) => {
  const { reservations, publication } = props;

  return (
    <div className="row justify-content-center m-2 m-md-3 _bg_tertiary _element_shadow">
      <div className="col-12 text-center">
        <h6>El vehículo se encuentra publicado</h6>
      </div>
      <div className="col-6 text-center">
        <p>Reservas: [{reservations}]</p>
      </div>
      <div className="col-6 text-center">
        <Link
          to={`/rental/user/publication/${publication.id}/`}
          className="btn btn-sm btn-primary"
        >
          Publicacion
        </Link>
      </div>
    </div>
  );
};

export default CarsDetailsReservationsPanel;
