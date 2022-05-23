import React from "react";

import insuranceImage from "../../../../assets/images/v1/car_register_insurance.png";

const CarRegisterFormStepInsurance = (props) => {
  const { openISM, imagePreview } = props.ism;

  return (
    <div className="row justify-content-center _form_step">
      <div className="col-12">
        <div className="row justify-content-center pt-3">
          <figure className="col-10">
            <img
              className="img-fluid"
              src={insuranceImage}
              alt="insuranceImage"
            />
            <figcaption className="text-center">
              <h4>V.T.V y Seguro</h4>
            </figcaption>
          </figure>
        </div>

        <div className="row justify-content-center">
          <div className="col-11">
            <div className="form-row justify-content-around">
              <div className="col-3 text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_driver_card")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_driver_card")}
                  Cédula
                </div>
              </div>

              <div className="col-3 text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_insurance")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_insurance")}
                  Seguro
                </div>
              </div>

              <div className="col-3 text-center px-0 m-1">
                <div
                  onClick={() => openISM("picture_mechanical_check")}
                  className="form-label p-2 _inputless_label _element_shadow"
                >
                  {imagePreview("picture_mechanical_check")}
                  V.T.V
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRegisterFormStepInsurance;
