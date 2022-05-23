import React from "react";

import pointerCompacted from "../../../../assets/images/v1/compacted_car.png";
import pointerDashboard from "../../../../assets/images/v1/register_dashboard.png";
import pointerFrontSeats from "../../../../assets/images/v1/register_front_seats.png";
import pointerBackSeats from "../../../../assets/images/v1/register_back_seats.png";
import pointerTrunk from "../../../../assets/images/v1/register_trunk.png";
import pointerFrontRight from "../../../../assets/images/v1/register_front_right.png";
import pointerFrontLeft from "../../../../assets/images/v1/register_front_left.png";
import pointerBackRight from "../../../../assets/images/v1/compacted_car.png";
import pointerBackLeft from "../../../../assets/images/v1/compacted_car.png";
import pointerInsurance from "../../../../assets/images/v1/compacted_car.png";
import pointerMechanicalCheck from "../../../../assets/images/v1/compacted_car.png";
import pointerDriverCard from "../../../../assets/images/v1/compacted_car.png";

const CarRegisterForm_ImageSelectionModal = (props) => {
  const {
    ism: { closeISM, imageName },
    handleInput,
  } = props;

  const closeModal = (evt) => {
    evt.stopPropagation();

    closeISM();
  };

  const contentSwitch = () => {
    switch (imageName) {
      case "picture_insurance":
        return {
          imageName: "Seguro",
          body: "Foto de la oblea del seguro",
          pointer: pointerInsurance,
        };

      case "picture_mechanical_check":
        return {
          imageName: "V.T.V",
          body: "Foto de la V.T.V.",
          pointer: pointerMechanicalCheck,
        };

      case "picture_driver_card":
        return {
          imageName: "Cédula",
          body: "Cédula del dueño del vehículo",
          pointer: pointerDriverCard,
        };

      case "picture_front":
        return {
          imageName: "Frontal",
          body: "Foto frontal del vehículo.",
          pointer: pointerFrontRight,
        };

      case "picture_left":
        return {
          imageName: "Lat. Izquierda",
          body: "Foto del lateral izquierdo del vehículo.",
          pointer: pointerFrontLeft,
        };

      case "picture_right":
        return {
          imageName: "Lat. Derecha",
          body: "Foto lateral derecha del vehículo.",
          pointer: pointerBackRight,
        };

      case "picture_back":
        return {
          imageName: "Trasera",
          body: "Foto trasera del vehículo.",
          pointer: pointerBackLeft,
        };

      case "picture_dashboard":
        return {
          imageName: "Tablero",
          body: "Foto del tablero con el auto en marcha, mostrando el kilometraje.",
          pointer: pointerDashboard,
        };
      case "picture_interior_front":
        return {
          imageName: "Butacas",
          body: "Foto de las butacas del vehículo.",
          pointer: pointerFrontSeats,
        };
      case "picture_interior_back":
        return {
          imageName: "Asientos",
          body: "Foto de las butacas del vehículo.",
          pointer: pointerBackSeats,
        };
      case "picture_trunk":
        return {
          imageName: "Baúl",
          body: "Foto del baúl abierto mostrando equipo de seguridad y rueda de auxilio.",
          pointer: pointerTrunk,
        };

      default:
        return {
          imageName: "Upload",
          body: "Select an image to upload",
          pointer: pointerCompacted,
        };
    }
  };

  return (
    <div className="row justify-content-center _modal_container">
      <section className="col-9 col-md-4 my-auto">
        <div className="row justify-content-end rounded-top _bg_tertiary">
          <div onClick={closeModal} className="col-auto _hover_cursor">
            <span className="">&times;</span>
          </div>
        </div>

        <div className="row justify-content-around align-items-center p-2 _bg_tertiary">
          <div className="col-5 text-center px-0 m-1">
            <figure className="figure">
              <img
                src={contentSwitch().pointer}
                alt="upload pointer"
                className="figure-img img-fluid"
                width="100%"
              />
            </figure>
          </div>
        </div>

        <div className="row justify-content-center p-2 _bg_tertiary _modal_body">
          <div className="col-auto p-1 p-md-2">
            <p className="text-muted">{contentSwitch().body}</p>
          </div>
        </div>

        <div className="row justify-content-around align-items-center p-2 _bg_tertiary">
          <div className="col-5 text-center px-0 m-1">
            <input
              type="file"
              name={imageName}
              id={imageName}
              accept="image/*"
              capture="enviroment"
              onChange={(evt) => {
                handleInput(evt);
                closeISM(evt);
              }}
              className="form-control _input_file _element_shadow"
              required
            />
            <label
              htmlFor={imageName}
              className="form-label _ims_image_input_label _bg_primary _hover_shadow _hover_cursor"
            >
              Seleccionar
            </label>
          </div>
        </div>
      </section>
    </div>
  );
};

export default CarRegisterForm_ImageSelectionModal;
