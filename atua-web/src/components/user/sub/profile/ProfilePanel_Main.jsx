import React from "react";

import { useTranslation } from "react-i18next";

import profileCar from "../../../../assets/images/v1/car_placeholder_universal.png";

const ProfilePanelMain = (props) => {
  const { user, phone, date_of_birth } = props.user.basic_info;

  const { editMode, toggleEditMode, editControls, editModeInputClass } = props;

  const { handleInput, handleSubmit } = props.handlers;

  const [t] = useTranslation("user");

  return (
    <div className="col-12">
      <div className="card _profile_panel">
        <img src={profileCar} alt="car-placeholder" className="card-img-top" />
        <form
          onSubmit={(evt) => handleSubmit(evt)}
          onReset={(evt) => {
            evt.target.reset();
            toggleEditMode();
          }}
          id="mainInfo"
          className="card-body"
        >
          <div className="form-group form-row justify-content-end align-items-center">
            <div className="col-auto mx-auto">
              <h4 className="card-title text-center m-0">
                {t("profile.main.greeting", { user: user.first_name })}
              </h4>
            </div>
            {/* CURRENTLY, EDITION IS UNAVAILABE */}
            {/* <div className="col-auto position-absolute">
              <button
                type="button"
                onClick={toggleEditMode}
                className={`${editMode ? "d-none" : "d-block"} _edit_button`}
              >
                <i className="fas fa-edit text-dark"></i>
              </button>
            </div> */}
          </div>

          <div className="form-group form-row">
            <label htmlFor="first_name" className="form-label sr-only">
              {t("profile.main.form.first_name.label")}
            </label>
            <small className="form-text">
              {t("profile.main.form.first_name.tip")}
            </small>
            <input
              type="text"
              name="first_name"
              id="first_name"
              onChange={handleInput}
              className={`${editModeInputClass()} py-0`}
              readOnly={!editMode}
              placeholder={user.first_name}
            />
          </div>

          <div className="form-group form-row">
            <label htmlFor="last_name" className="form-label sr-only">
              {t("profile.main.form.last_name.label")}
            </label>
            <small className="form-text">
              {t("profile.main.form.last_name.tip")}
            </small>
            <input
              type="text"
              name="last_name"
              id="last_name"
              onChange={handleInput}
              className={`${editModeInputClass()} py-0`}
              readOnly={!editMode}
              placeholder={user.last_name}
            />
          </div>

          <div className="form-group form-row">
            <div className="col-9 p-0">
              <label htmlFor="phone" className="form-label sr-only">
                {t("profile.main.form.phone_number.label")}
              </label>
              <small className="form-text">
                {t("profile.main.form.phone_number.tip")}
              </small>
              <input
                type="phone"
                name="phone"
                id="phone"
                onChange={handleInput}
                className={`${editModeInputClass()} py-0`}
                readOnly={!editMode}
                placeholder={phone}
              />
            </div>
          </div>

          <div className="form-group form-row">
            <label htmlFor="date_of_birth" className="form-label sr-only">
              {t("profile.main.form.date_of_birth.label")}
            </label>
            <small className="form-text">
              {t("profile.main.form.date_of_birth.tip")}
            </small>
            <input
              type="date"
              name="date_of_birth"
              id="date_of_birth"
              onChange={handleInput}
              className={`${editModeInputClass()} text-muted py-0`}
              readOnly={!editMode}
              defaultValue={date_of_birth}
            />
          </div>

          {editControls()}
        </form>
      </div>
    </div>
  );
};

export default ProfilePanelMain;
