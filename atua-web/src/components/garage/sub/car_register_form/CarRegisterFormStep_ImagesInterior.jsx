import React from "react";
import interiorImages from "../../../../assets/images/v1/car_register_trunk.png";

const CarRegisterFormStepImagesInterior = (props) => {
  const { openISM, imagePreview } = props.ism;

  return (
    <div className="row justify-content-center _form_step">
      <div className="col-12">
        <div className="row justify-content-center pt-3">
          <figure className="col-10">
            <img className="img-fluid" src={interiorImages} alt="Interior" />
            <figcaption className="text-center">
              <h4>Imágenes Interior</h4>
            </figcaption>
          </figure>
        </div>

        <div className="row justify-content-center">
          <div className="col-11">
            <div className="form-row justify-content-center">
              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_dashboard")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_dashboard")}
                  Tablero
                </div>
              </div>

              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_interior_front")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_interior_front")}
                  Butacas
                </div>
              </div>

              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_interior_back")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_interior_back")}
                  Asientos
                </div>
              </div>

              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_trunk")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_trunk")}
                  Baúl
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRegisterFormStepImagesInterior;
