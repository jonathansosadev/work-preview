import React from "react";

import { useTranslation } from "react-i18next";

import ProfilePanelIncompleteInfo from "./ProfilePanel_IncompleteInfo";

const ProfilePanel_Address = (props) => {
  const {
    user: { address },
    handlers: { handleInput, handleSubmit, handleCancel },
    selectOptions: { citiesOptions },
    editMode,
    toggleEditMode,
    editModeInputClass,
  } = props;

  const [t] = useTranslation("user");

  return (
    <div className="col-12">
      <div className="card _profile_panel">
        <form
          onSubmit={(evt) => handleSubmit(evt)}
          onReset={(evt) => {
            handleCancel(evt);
            toggleEditMode();
          }}
          id="addressInfo"
          className="card-body"
        >
          <div className="form-group form-row justify-content-end align-items-center">
            <div className="col-auto mx-auto">
              <h4 className="card-title text-center m-0">
                {t("profile.address.title")}
              </h4>
            </div>

            {/* UNTIL EDITION IS ENABLED; EDIT MODE IS DISABLED UPON FIRST ADDRESS REGISTRATION */}
            {!address && (
              <div className="col-auto position-absolute">
                <button
                  type="button"
                  onClick={toggleEditMode}
                  className={`${editMode ? "d-none" : "d-block"} _edit_button`}
                >
                  <i className="fas fa-edit text-dark"></i>
                </button>
              </div>
            )}
          </div>

          <div className="form-group form-row">
            <label htmlFor="street_name" className="form-label sr-only">
              {t("profile.address.form.street_name")}
            </label>
            <small className="form-text">
              {t("profile.address.form.street_name")}
            </small>
            <input
              type="text"
              name="street_name"
              id="street_name"
              onChange={handleInput}
              className={`${editModeInputClass()} py-0`}
              readOnly={!editMode}
              placeholder={
                address
                  ? address.street_name
                  : t("profile.address.form.street_name")
              }
            />
          </div>

          <div className="form-row">
            <div className="col-6 px-0">
              <div className="form-group">
                <label htmlFor="street_number" className="form-label sr-only">
                  {t("profile.address.form.street_number")}
                </label>
                <small className="form-text">
                  {t("profile.address.form.street_number")}
                </small>
                <input
                  type="number"
                  name="street_number"
                  id="street_number"
                  onChange={handleInput}
                  className={`${editModeInputClass()} py-0`}
                  readOnly={!editMode}
                  placeholder={
                    address
                      ? address.street_number
                      : t("profile.address.form.street_number")
                  }
                />
              </div>
            </div>

            <div className="col-6 px-0">
              <div className="form-group">
                <label htmlFor="zip_code" className="form-label sr-only">
                  {t("profile.address.form.zip_code.long")}
                </label>
                <small className="form-text">
                  {t("profile.address.form.zip_code.long")}
                </small>
                <input
                  type="number"
                  name="zip_code"
                  id="zip_code"
                  onChange={handleInput}
                  className={`${editModeInputClass()} py-0`}
                  readOnly={!editMode}
                  placeholder={
                    address
                      ? address.zip_code
                      : t("profile.address.form.zip_code.short")
                  }
                />
              </div>
            </div>
          </div>

          <div className="form-row">
            {/* Crrently City is displayed in a single dropdown  */}
            {/* <div className="col-6 px-0">
              <div className="form-group">
                <label htmlFor="country" className="form-label sr-only">
                  {t("profile.address.form.country")}
                </label>
                <small className="form-text">
                  {t("profile.address.form.country")}
                </small>

                <select
                  name="country"
                  id="country"
                  onChange={handleCountryChange}
                  className={`custom-select text-muted py-0`}
                  disabled={!editMode}
                  defaultValue={
                    address ? address.city.province.country.name : ""
                  }
                >
                  {editMode ? null : (
                    <option
                      value={address ? address.city.province.country.name : ""}
                    >
                      {address
                        ? address.city.province.country.name
                        : t("profile.address.form.country")}
                    </option>
                  )}
                  {countriesOptions()}
                </select>
              </div>
            </div>

            <div className="col-6 px-0">
              <div className="form-group">
                <label htmlFor="province" className="form-label sr-only">
                  {t("profile.address.form.province")}
                </label>
                <small className="form-text">
                  {t("profile.address.form.province")}
                </small>

                <select
                  name="province"
                  id="province"
                  onChange={handleInput}
                  className={`custom-select text-muted py-0`}
                  disabled={!editMode}
                  defaultValue={address ? address.city.province.name : ""}
                >
                  {editMode ? null : (
                    <option value={address ? address.city.province.name : ""}>
                      {address
                        ? address.city.province.name
                        : t("profile.address.form.province")}
                    </option>
                  )}
                  {provincesOptions()}
                </select>
              </div>
            </div> */}

            <div className="col-12 px-0">
              <div className="form-group">
                <label htmlFor="city" className="form-label sr-only">
                  {t("profile.address.form.city")}
                </label>
                <small className="form-text">
                  {t("profile.address.form.city")}
                </small>

                <select
                  name="city"
                  id="city"
                  onChange={handleInput}
                  className={`custom-select text-muted py-0`}
                  disabled={!editMode}
                  defaultValue={address ? address.city.name : ""}
                >
                  {editMode ? null : (
                    <option value={address ? address.city.name : ""}>
                      {address
                        ? address.city.name
                        : t("profile.address.form.province")}
                    </option>
                  )}
                  {citiesOptions()}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group form-row">
            <label htmlFor="description" className="form-label sr-only">
              {t("profile.address.form.description")}
            </label>
            <small className="form-text">
              {t("profile.address.form.description")}
            </small>
            <input
              type="text"
              name="description"
              id="description"
              onChange={handleInput}
              className={`${editModeInputClass()} py-0`}
              readOnly={!editMode}
              placeholder={
                address
                  ? address.description
                  : t("profile.address.form.description")
              }
            />
          </div>

          {!address && !editMode && (
            <ProfilePanelIncompleteInfo infoComplete={address} />
          )}

          {editMode && (
            <div className="form-group form-row justify-content-end mt-2">
              <div className="col-auto">
                <button type="reset" className="btn _reset_button">
                  <i className="far fa-times-circle text-danger"></i>
                </button>
              </div>
              <div className="col-auto">
                <button type="submit" className="btn _change_button">
                  <i className="far fa-check-circle text-success"></i>
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePanel_Address;
