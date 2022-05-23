import React from "react";

import { useTranslation } from "react-i18next";

import ProfilePanelIncompleteInfo from "./ProfilePanel_IncompleteInfo";

import uploadImg from "../../../../assets/images/v1/img_upload_camera.svg";

const ProfilePanel_License = (props) => {
  const { editMode, toggleEditMode, editControls, editModeInputClass } = props;

  const { handleInput, handleSubmit } = props.handlers;

  const { licence_driver: license_driver } = props.user;

  const { license_front_image, license_back_image } = props.images;

  const [t] = useTranslation("user");

  const infoComplete = () => (license_driver ? license_driver : false);

  const imagePreview = (image) => {
    if (image) {
      return (
        <img
          src={URL.createObjectURL(image)}
          alt="upload preview"
          width="100%"
        />
      );
    } else {
      return null;
    }
  };

  const completeImage = (fieldId, image) => {
    return props.completeImages(fieldId) ? (
      imagePreview(image)
    ) : (
      <img src={uploadImg} alt="upload" />
    );
  };

  return (
    <div className="col-12 mt-4">
      <div className="card _profile_panel">
        <form
          onSubmit={(evt) => handleSubmit(evt)}
          onReset={(evt) => {
            evt.target.reset();
            toggleEditMode();
          }}
          id="licenseInfo"
          className="card-body"
        >
          <div className="form-group form-row justify-content-end align-items-center">
            <div className="col-auto mx-auto">
              <h4 className="card-title text-center m-0">
                {t("profile.drivers_license.title")}
              </h4>
            </div>
            {!infoComplete() && (
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

          <div className="form-group form-row align-items-center justify-content-center">
            <label
              htmlFor="license_expiration"
              className="col-6 form-label text-center m-0"
            >
              {t("profile.drivers_license.form.license_expiration.label")}
            </label>
            <input
              type="date"
              name="license_expiration"
              id="license_expiration"
              onChange={handleInput}
              className={`col-6 ${editModeInputClass()} py-0`}
              readOnly={!editMode}
              defaultValue={
                infoComplete() ? infoComplete().document_expiration : ""
              }
              required
            />
          </div>

          {!infoComplete() && !editMode && (
            <ProfilePanelIncompleteInfo infoComplete={infoComplete()} />
          )}

          {editMode ? (
            <div className="form-row justify-content-center mt-3">
              <div className="col-12 mb-2">
                <h6 className="card-subtitle">
                  {t("profile.drivers_license.form.images.title")}
                </h6>
              </div>

              <div className="col-5 text-center px-0 m-1">
                <input
                  type="file"
                  name="driver_license_front"
                  id="driver_license_front"
                  onChange={handleInput}
                  className={`${editModeInputClass()} py-0 _input_file _element_shadow`}
                  accept="image/*"
                  capture="enviroment"
                  required
                />
                <label
                  htmlFor="driver_license_front"
                  className="form-label p-2"
                >
                  {completeImage("driver_license_front", license_front_image)}{" "}
                  {t(
                    "profile.drivers_license.form.images.driver_license_front"
                  )}
                </label>
              </div>

              <div className="col-5 text-center px-0 m-1">
                <input
                  type="file"
                  name="driver_license_back"
                  id="driver_license_back"
                  onChange={handleInput}
                  className={`${editModeInputClass()} py-0 _input_file _element_shadow`}
                  accept="image/*"
                  capture="enviroment"
                  required
                />
                <label htmlFor="driver_license_back" className="form-label p-2">
                  {completeImage("driver_license_back", license_back_image)}{" "}
                  {t("profile.drivers_license.form.images.driver_license_back")}
                </label>
              </div>
            </div>
          ) : null}

          {editControls()}
        </form>
      </div>
    </div>
  );
};

export default ProfilePanel_License;
