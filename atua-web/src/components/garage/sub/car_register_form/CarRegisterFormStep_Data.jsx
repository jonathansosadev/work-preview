import React from "react";

import carData from "../../../../assets/images/v1/car_register_data.png";

const CarRegisterFormStep_Data = (props) => {
  const {
    handleInput,
    handleSelect: { handleBrandChange, handleModelChange },
    selectOptions: { brandsOptions, modelsOptions, yearOptions },
    formData: {
      brand,
      model,
      year,
      doors,
      fuel_type,
      transmission,
      plate,
      kilometers,
    },
  } = props;

  return (
    <div className="row justify-content-center _form_step">
      <div className="col-12">
        <div className="row justify-content-center pt-3">
          <figure className="col-10">
            <img className="img-fluid" src={carData} alt="Car Data" />
            <figcaption className="text-center">
              <h4>Vehiculo</h4>
            </figcaption>
          </figure>
        </div>

        <div className="row justify-content-center">
          <div className="col-11">
            <div className="form-row justify-content-center">
              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="brand" className="form-label sr-only">
                    Brand
                  </label>
                  <select
                    name="brand"
                    id="brand"
                    defaultValue={brand ? brand : "null"}
                    onChange={handleBrandChange}
                    className="custom-select text-muted py-0"
                  >
                    {brandsOptions()}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="model" className="form-label sr-only">
                    Modelo
                  </label>
                  <select
                    name="model"
                    id="model"
                    defaultValue={model ? model : "null"}
                    onChange={(evt) => {
                      handleModelChange(evt);
                      handleInput(evt);
                    }}
                    className="custom-select text-muted py-0"
                  >
                    {modelsOptions()}
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="year" className="form-label sr-only">
                    Year
                  </label>
                  <select
                    name="year"
                    id="year"
                    defaultValue={year ? year : "null"}
                    onChange={handleInput}
                    className="custom-select text-muted py-0"
                  >
                    {yearOptions().length === 0 ? (
                      <option value="null">Año</option>
                    ) : (
                      yearOptions()
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row justify-content-center">
              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="doors" className="form-label sr-only">
                    Doors
                  </label>
                  <select
                    name="doors"
                    id="doors"
                    defaultValue={doors ? doors : "null"}
                    onChange={handleInput}
                    className="custom-select text-muted py-0"
                  >
                    <option value="null" disabled>
                      Puertas
                    </option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="fuel_type" className="form-label sr-only">
                    Fuel type
                  </label>
                  <select
                    name="fuel_type"
                    id="fuel_type"
                    defaultValue={fuel_type ? fuel_type : "null"}
                    onChange={handleInput}
                    className="custom-select text-muted py-0"
                  >
                    <option value="null" disabled>
                      Combustible
                    </option>
                    <option value="1">Nafta</option>
                    <option value="2">Diesel</option>
                    <option value="3">Híbrido</option>
                    <option value="4">Eléctrico</option>
                    <option value="5">Otro</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="transmission" className="form-label sr-only">
                    Transmission
                  </label>
                  <select
                    name="transmission"
                    id="transmission"
                    defaultValue={transmission ? transmission : "null"}
                    onChange={handleInput}
                    className="custom-select text-muted py-0"
                  >
                    <option value="null" disabled>
                      Transmisión
                    </option>
                    <option value="1">Otra</option>
                    <option value="2">Manual</option>
                    <option value="3">Automática</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="_form_spacer"></div>

            <div className="form-row justify-content-center">
              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="plate" className="form-label sr-only">
                    Plate
                  </label>
                  <input
                    type="text"
                    name="plate"
                    id="plate"
                    onChange={handleInput}
                    className="form-control"
                    placeholder={plate ? plate : "Patente"}
                  />
                </div>
              </div>

              <div className="col-12 col-md-4">
                <div className="form-group">
                  <label htmlFor="kilometers" className="form-label sr-only">
                    Kilometers
                  </label>
                  <input
                    type="number"
                    name="kilometers"
                    id="kilometers"
                    onChange={handleInput}
                    className="form-control"
                    placeholder={kilometers ? kilometers : "Kilómetros"}
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

export default CarRegisterFormStep_Data;
