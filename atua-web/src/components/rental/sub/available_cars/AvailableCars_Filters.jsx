import React from "react";

const AvailableCarsFilters = (props) => {
  const {
    handlers: { handleChange, handleClear, handleGetAvailableCars },
    searchParams: { available_since, available_until, price_lt },
    filterOptions: { brands, models, doors, transmissions, maxPrice },
  } = props;

  return (
    <div className="col-12 col-md-3 px-5 py-3 py-md-5 _bg_tertiary">
      <form id="filtersForm">
        <div className="form-row justify-content-center align-items-center m-1 p-2">
          <h3>
            <i className="fas fa-sliders-h mr-1"></i> Filtrar
          </h3>
        </div>

        <div className="form-row mb-1">
          <div className="col-12">
            <label
              htmlFor="available_since"
              className="form-label mb-0 text-muted"
            >
              <small> Desde:</small>
            </label>
            <div className="input-group">
              <input
                type="date"
                id="available_since"
                name="available_since"
                data-filtertype="searchParams"
                className="form-control"
                defaultValue={available_since}
                onChange={handleChange}
              />
              <div
                className="input-group-append _hover_cursor"
                onClick={handleClear}
              >
                <span
                  data-parent="available_since"
                  className="input-group-text"
                >
                  &times;
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-row mb-1">
          <div className="col-12">
            <label
              htmlFor="available_until"
              className="form-label mb-0 text-muted"
            >
              <small> Hasta:</small>
            </label>
            <div className="input-group">
              <input
                type="date"
                id="available_until"
                name="available_until"
                data-filtertype="searchParams"
                className="form-control"
                defaultValue={available_until}
                onChange={handleChange}
              />
              <div
                className="input-group-append _hover_cursor"
                onClick={handleClear}
              >
                <span
                  data-parent="available_until"
                  className="input-group-text"
                >
                  &times;
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-row justify-content-center">
          <div className="col-12 px-3">
            <label htmlFor="price_lt" className="form-label mb-0 text-muted">
              {price_lt > 0 ? (
                <small>Precio menor a: {price_lt}$ </small>
              ) : (
                <small>Precio</small>
              )}
            </label>
            <div className="input-group">
              <input
                id="price_lt"
                name="price_lt"
                data-filtertype="searchParams"
                type="range"
                className="w-100"
                max={maxPrice}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        <div className="_filter_spacer"></div>

        <div className="form-row mb-1">
          <div className="col-12">
            <label htmlFor="brand" className="form-label mb-0 text-muted">
              <small> Marca</small>
            </label>
            <div className="input-group">
              <select
                id="brand"
                name="brand"
                data-filtertype="filter"
                className="custom-select text-muted py-0"
                onChange={handleChange}
              >
                <option value=""></option>
                {brands.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row mb-1">
          <div className="col-12">
            <label htmlFor="model" className="form-label mb-0 text-muted">
              <small> Modelo</small>
            </label>
            <div className="input-group">
              <select
                id="model"
                name="model"
                data-filtertype="filter"
                className="custom-select text-muted py-0"
                onChange={handleChange}
              >
                <option value=""></option>
                {models.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row mb-1">
          <div className="col-12">
            <label htmlFor="doors" className="form-label mb-0 text-muted">
              <small> Puertas</small>
            </label>
            <div className="input-group">
              <select
                id="doors"
                name="doors"
                data-filtertype="filter"
                className="custom-select text-muted py-0"
                onChange={handleChange}
              >
                <option value=""></option>
                {doors.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="form-row mb-1">
          <div className="col-12">
            <label
              htmlFor="transmission"
              className="form-label mb-0 text-muted"
            >
              <small> Transmisión</small>
            </label>
            <div className="input-group">
              <select
                id="transmission"
                name="transmission"
                data-filtertype="filter"
                className="custom-select text-muted py-0"
                onChange={handleChange}
              >
                <option value=""></option>
                {transmissions.map((option) => (
                  <option key={option} value={option}>
                    {option === 1
                      ? "Otra"
                      : option === 2
                      ? "Manual"
                      : "Automática"}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="_filter_spacer"></div>

        <div className="form-row justify-content-center mt-2">
          <div className="col-6">
            <button
              type="submit"
              data-parent="filtersForm"
              className="_filters_control"
              onClick={handleGetAvailableCars}
            >
              Filtrar
            </button>
          </div>
          <div className="col-6">
            <button
              type="reset"
              data-parent="filtersForm"
              className="_filters_control"
              onClick={handleClear}
            >
              Limpiar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AvailableCarsFilters;
