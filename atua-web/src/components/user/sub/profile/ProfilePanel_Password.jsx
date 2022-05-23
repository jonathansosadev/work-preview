import React from "react";

import { useTranslation } from "react-i18next";

const ProfilePanel_Pin = (props) => {
  const { editMode, toggleEditMode, editControls } = props;

  const { handleInput, handleSubmit } = props.handlers;

  const [t] = useTranslation("user");

  return (
    <div className="col-12 mt-4">
      <div className="card _profile_panel">
        <form
          onSubmit={(evt) => handleSubmit(evt)}
          onReset={(evt) => {
            evt.target.reset();
            toggleEditMode();
          }}
          id="pinForm"
          className="card-body"
        >
          <div className="form-group form-row justify-content-end align-items-center m-0">
            <div className="col-auto mx-auto">
              <h4 className="card-title text-center">
                {t("profile.pin.title")}
              </h4>
            </div>
            <div className="col-auto position-absolute">
              <button
                type="button"
                onClick={toggleEditMode}
                className={`${editMode ? "d-none" : "d-block"} _edit_button`}
              >
                <i className="fas fa-edit text-dark"></i>
              </button>
            </div>
          </div>

          {editMode && (
            <>
              <div className="form-group form-row">
                <div className="col-12 p-0">
                  <label htmlFor="pin_old" className="form-label sr-only">
                    {t("profile.pin.form.pin_old")}
                  </label>
                  <small className="form-text">
                    {t("profile.pin.form.pin_old")}
                  </small>
                  <input
                    type="number"
                    name="pin_old"
                    id="pin_old"
                    onChange={handleInput}
                    className="form-control"
                    maxLength="4"
                    readOnly={!editMode}
                    placeholder={t("profile.pin.form.placeholder")}
                  />
                </div>
              </div>

              <div className="form-group form-row">
                <div className="col-12 p-0">
                  <label htmlFor="pin_new" className="form-label sr-only">
                    {t("profile.pin.form.pin_new")}
                  </label>
                  <small className="form-text">
                    {t("profile.pin.form.pin_new")}
                  </small>
                  <input
                    type="number"
                    name="pin_new"
                    id="pin_new"
                    onChange={handleInput}
                    className="form-control"
                    maxLength="4"
                    readOnly={!editMode}
                    placeholder={t("profile.pin.form.placeholder")}
                  />
                </div>
              </div>
            </>
          )}

          {editControls()}
        </form>
      </div>
    </div>
  );
};

export default ProfilePanel_Pin;
