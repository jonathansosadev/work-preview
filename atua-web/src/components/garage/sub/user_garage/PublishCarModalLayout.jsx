import React from "react";

const PublishCarModal = (props) => {
  const {
    handleInput,
    selectedCar,
    formComplete,
    publishCar,
    handleCountryChange,
    selectOptions: { countriesOptions, provincesOptions },
    publishData: {
      price,
      country,
      province,
      zip_code,
      street_name,
      street_number,
      description,
      available_since_date,
      available_since_time,
      available_until_date,
      available_until_time,
    },
    togglePublishModal,
    dateValidClass,
  } = props;

  const carName = () => {
    return selectedCar.model
      ? `${selectedCar.model.brand} ${selectedCar.model.name} (${selectedCar.plate})`
      : "";
  };

  let carPrice = {
    min: selectedCar.min_rental_price,
    max: selectedCar.max_rental_price,
  };

  return (
    <div className="row justify-content-center _modal_container">
      <section className="col-11 col-md-6 my-auto">
        <div className="row justify-content-end rounded-top _bg_tertiary">
          <div
            onClick={() => togglePublishModal(true)}
            className="col-auto _hover_cursor"
          >
            <span className="h3">&times;</span>
          </div>
        </div>
        {/* Modify style from here */}
        <form
          id="publishForm"
          className="row justify-content-center _bg_tertiary p-2 px-md-5"
        >
          <div className="col-12">
            <div className="form-row">
              <h2 className="text-center">{carName()}</h2>
            </div>

            <fieldset className="form-row mb-2">
              <legend>Disponibilidad</legend>

              <fieldset className="col-12">
                <legend>Inicio</legend>
                <div className="form-row">
                  <div className="form-group col-12 col-md-6">
                    <label htmlFor="available_since_date" className="sr-only">
                      Dia de inicio
                    </label>
                    <input
                      type="date"
                      id="available_since_date"
                      name="available_since_date"
                      defaultValue={available_since_date}
                      className={`form-control ${dateValidClass(
                        "available_since_date"
                      )}`}
                      onBlur={handleInput}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="form-group col-12 col-md-6">
                    <label htmlFor="available_since_time" className="sr-only">
                      Hora de inicio
                    </label>
                    <input
                      type="time"
                      id="available_since_time"
                      name="available_since_time"
                      defaultValue={available_since_time}
                      className={`form-control ${dateValidClass(
                        "available_since_date"
                      )}`}
                      onBlur={handleInput}
                    />
                  </div>
                </div>
              </fieldset>

              <fieldset className="col-12">
                <legend>Fin (3 días minimo)</legend>
                <div className="form-row">
                  <div className="form-group col-12 col-md-6">
                    <label htmlFor="available_until_date" className="sr-only">
                      Dia de finalización
                    </label>
                    <input
                      type="date"
                      id="available_until_date"
                      name="available_until_date"
                      defaultValue={available_until_date}
                      className={`form-control ${dateValidClass(
                        "available_until_date"
                      )}`}
                      onBlur={handleInput}
                    />
                  </div>

                  <div className="form-group col-12 col-md-6">
                    <label htmlFor="available_until_time" className="sr-only">
                      Hora de finalización
                    </label>
                    <input
                      type="time"
                      id="available_until_time"
                      name="available_until_time"
                      defaultValue={available_until_time}
                      className={`form-control ${dateValidClass(
                        "available_until_date"
                      )}`}
                      onBlur={handleInput}
                    />
                  </div>
                </div>
              </fieldset>
            </fieldset>

            <fieldset className="form-row mb-2">
              <legend>Precio de alquiler</legend>
              <div className="col-12">
                <div className="form-group row">
                  <label
                    className="col-12 col-md-6 col-form-label text-center h5"
                    htmlFor="price"
                  >
                    Precio por día:
                    {` ${
                      price
                        ? (price * 0.001).toFixed()
                        : (carPrice.min * 0.001).toFixed()
                    }$`}
                  </label>
                  <div className="col-12 col-md-6">
                    <input
                      type="range"
                      id="price"
                      name="price"
                      min={carPrice.min}
                      max={carPrice.max}
                      className="form-control"
                      placeholder={carPrice.min}
                      onChange={handleInput}
                    />
                  </div>
                </div>
              </div>
            </fieldset>

            <fieldset className="form-row mb-2">
              <legend>Dirección</legend>
              <div className="col-12">
                <div className="form-row justify-content-center">
                  <div className="col-12 col-md-5">
                    <div className="form-group">
                      <label htmlFor="country" className="form-label sr-only">
                        Country
                      </label>
                      <select
                        name="country"
                        id="country"
                        defaultValue={country ? country : "null"}
                        onChange={handleCountryChange}
                        className="custom-select text-muted py-0"
                      >
                        <option value="null">País</option>
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
                        <option value="null">Provincia</option>
                        {provincesOptions()}
                      </select>
                    </div>
                  </div>

                  <div className="col-12 col-md-2">
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
                  <div className="col-12 col-md-8">
                    <div className="form-group">
                      <label
                        htmlFor="street_name"
                        className="form-label sr-only"
                      >
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

                  <div className="col-12 col-md-4">
                    <div className="form-group">
                      <label
                        htmlFor="street_number"
                        className="form-label sr-only"
                      >
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
                      <label
                        htmlFor="description"
                        className="form-label sr-only"
                      >
                        Aditional info
                      </label>
                      <input
                        name="description"
                        id="description"
                        onChange={handleInput}
                        className="form-control text-muted py-0"
                        placeholder={
                          description ? description : "Info Adicional"
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            </fieldset>
          </div>
        </form>

        <div className="row justify-content-center rounded-bottom _bg_tertiary">
          <div className="col">
            <button
              form="publishForm"
              type="submit"
              onClick={publishCar}
              className="btn _publish_button"
              disabled={!formComplete()}
            >
              Publicar
            </button>
          </div>
        </div>
        {/* modify style until here */}
      </section>
    </div>
  );
};

export default PublishCarModal;
