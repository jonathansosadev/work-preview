import React from "react";

import carAddress from "../../../../assets/images/v1/car_register_address.png";

const CarRegisterFormStepAddress = (props) => {
  const {
    handleInput,
    selectOptions: { citiesOptions },
    formData: { city, zip_code, street_name, street_number, description },
  } = props;

  return (
    <div className="row justify-content-center _form_step">
      <div className="col-12">
        <div className="row justify-content-center pt-3">
          <figure className="col-10">
            <img className="img-fluid" src={carAddress} alt="car address" />
            <figcaption className="text-center">
              <h4>Dirección</h4>
            </figcaption>
          </figure>
        </div>

        <div className="row justify-content-center">
          <div className="col-11">
            <div className="form-row justify-content-center">
              {/* As city field carries country and province, those fields are not needed */}
              {/* Kept as reference and posible changes */}
              {/* <div className="col-12 col-md-5">
                <div className="form-group">
                  <label htmlFor="country" className="form-label sr-only">
                    Country
                  </label>
                  <select
                    name="country"
                    id="country"
                    defaultValue={country ? country : ""}
                    onChange={handleCountryChange}
                    className="custom-select text-muted py-0"
                  >
                    {countriesOptions()}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-5">
                <div className="form-group">
                  <label htmlFor="province" className="form-label sr-only">
                    Province
                  </label>
                  <select
                    name="province"
                    id="province"
                    defaultValue={province ? province : "null"}
                    onChange={handleInput}
                    className="custom-select text-muted py-0"
                  >
                    {provincesOptions()}
                  </select>
                </div>
              </div> */}

              <div className="col-12 col-md-9">
                <div className="form-group">
                  <label htmlFor="city" className="form-label sr-only">
                    City
                  </label>
                  <select
                    name="city"
                    id="city"
                    defaultValue={city ? city : "null"}
                    onChange={handleInput}
                    className="custom-select text-muted py-0"
                  >
                    {citiesOptions()}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="form-group">
                  <label htmlFor="zip_code" className="form-label sr-only">
                    Zip Code
                  </label>
                  <input
                    type="number"
                    name="zip_code"
                    id="zip_code"
                    onChange={handleInput}
                    className="form-control text-muted py-0"
                    placeholder={zip_code ? zip_code : "C.P."}
                  />
                </div>
              </div>
            </div>

            <div className="form-row justify-content-center">
              <div className="col-12 col-md-9">
                <div className="form-group">
                  <label htmlFor="street_name" className="form-label sr-only">
                    Street Name
                  </label>
                  <input
                    type="text"
                    name="street_name"
                    id="street_name"
                    onChange={handleInput}
                    className="form-control text-muted py-0"
                    placeholder={street_name ? street_name : "Calle"}
                  />
                </div>
              </div>

              <div className="col-12 col-md-3">
                <div className="form-group">
                  <label htmlFor="street_number" className="form-label sr-only">
                    Street Number
                  </label>
                  <input
                    name="street_number"
                    id="street_number"
                    onChange={handleInput}
                    className="form-control text-muted py-0"
                    placeholder={street_number ? street_number : "Altura"}
                  />
                </div>
              </div>

              <div className="col-12">
                <div className="form-group">
                  <label htmlFor="description" className="form-label sr-only">
                    Aditional info
                  </label>
                  <input
                    name="description"
                    id="description"
                    onChange={handleInput}
                    className="form-control text-muted py-0"
                    placeholder={description ? description : "Info Adicional"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarRegisterFormStepAddress;
