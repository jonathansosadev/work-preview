import React from "react";

const CarsDetailsControlsPanel = (props) => {
  const { toggleDeleteCarModal, editFunction } = props;

  return (
    <div className="row justify-content-around m-2 m-md-3 _car_control_container">
      <div className="col-6 pl-0 align-items-center">
        <button className="_car_control_button" onClick={editFunction}>
          <span className="font-weight-bold">Editar</span>
        </button>
      </div>
      <div className="col-6 pr-0 align-items-center">
        <button
          className="_car_control_button _car_control_delete_button"
          onClick={toggleDeleteCarModal}
        >
          <span className="font-weight-bold">Eliminar</span>
        </button>
      </div>
    </div>
  );
};

export default CarsDetailsControlsPanel;
