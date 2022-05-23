import React from "react";

import exteriorImages from "../../../../assets/images/v1/car_register_images_ext.png";

const CarRegisterFormStepImagesExterior = (props) => {
  const { openISM, imagePreview } = props.ism;

  return (
    <div className="row justify-content-center _form_step">
      <div className="col-12">
        <div className="row justify-content-center pt-3">
          <figure className="col-10">
            <img
              className="img-fluid"
              src={exteriorImages}
              alt="car register"
            />
            <figcaption className="text-center">
              <h4>Imágenes exterior</h4>
            </figcaption>
          </figure>
        </div>

        <div className="row justify-content-center">
          <div className="col-11">
            <div className="form-row justify-content-center">
              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_front")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_front")}
                  Frontal
                </div>
              </div>

              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_left")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_left")}
                  Lat. Izquierda
                </div>
              </div>

              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_right")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_right")}
                  Lat. Derecha
                </div>
              </div>

              <div className="col-5 col-md text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_back")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_back")}
                  Trasera
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRegisterFormStepImagesExterior;
