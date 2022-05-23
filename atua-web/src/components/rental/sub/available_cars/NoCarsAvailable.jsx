import React from "react";

const NoCarsAvailable = () => {
  return (
    <div className="col-12 col-md-9 px-5 pt-3 pt-md-5 mb-5 align-items-center">
      <h4 className="text-center">No se tenemos vehículos disponibles.</h4>
      <h4 className="text-center">
        Consulte en otro momento o seleccione nuevos filtros.
      </h4>
    </div>
  );
};

export default NoCarsAvailable;
