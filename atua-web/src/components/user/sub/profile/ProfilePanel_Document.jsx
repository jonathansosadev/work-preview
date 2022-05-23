import React from "react";

import { useTranslation } from "react-i18next";

import ProfilePanelIncompleteInfo from "./ProfilePanel_IncompleteInfo";

import uploadImg from "../../../../assets/images/v1/img_upload_camera.svg";

const ProfilePanel_Document = (props) => {
  const {
    editMode,
    toggleEditMode,
    editControls,
    editModeInputClass,
    idOptions,
  } = props;

  const { handleInput, handleSubmit } = props.handlers;

  const { documents } = props.user;

  const { document_picture_front, document_picture_back } = props.images;

  const [t] = useTranslation("user");

  const infoComplete = () => (documents.length > 0 ? documents[0] : false);

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
          id="idInfo"
          className="card-body"
        >
          <div className="form-group form-row justify-content-end align-items-center">
            <div className="col-auto mx-auto">
              <h4 className="card-title text-center mb-0">
                {t("profile.id.title")}
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

          <div className="form-row">
            <div className="col-6 p-1">
              <label htmlFor="document_type" className="form-label sr-only">
                {t("profile.id.form.document_type.label")}
              </label>
              <small className="form-text">
                {t("profile.id.form.document_type.label")}
              </small>
              <select
                name="document_type"
                id="document_type"
                onChange={handleInput}
                className={`custom-select text-muted py-0`}
                disabled={!editMode}
                defaultValue={
                  editMode
                    ? ""
                    : infoComplete()
                    ? infoComplete().document_type
                    : ""
                }
                required
              >
                {editMode ? null : (
                  <option
                    value={infoComplete() ? infoComplete().document_type : ""}
                  >
                    {infoComplete().document_type
                      ? t("profile.id.form.document_type.dni")
                      : ""}
                  </option>
                )}

                {editMode && idOptions()}
              </select>
            </div>

            <div className="col-6 p-1">
              <label htmlFor="document_number" className="form-label sr-only">
                {t("profile.id.form.document_number.label")}
              </label>
              <small className="form-text">
                {t("profile.id.form.document_number.label")}
              </small>
              <input
                type="number"
                name="document_number"
                id="document_number"
                onChange={handleInput}
                className={`${editModeInputClass()} py-0`}
                readOnly={!editMode}
                placeholder={
                  editMode
                    ? ""
                    : infoComplete()
                    ? infoComplete().document_number
                    : ""
                }
                required
              />
            </div>
          </div>

          <div className="form-group form-row align-items-center justify-content-center">
            <label
              htmlFor="document_expiration"
              className="col-6 form-label text-center m-0"
            >
              {t("profile.id.form.document_expiration.label")}
            </label>

            <div className="col-6 px-1">
              <input
                type="date"
                name="document_expiration"
                id="document_expiration"
                onChange={handleInput}
                className={`${editModeInputClass()} py-0`}
                readOnly={!editMode}
                defaultValue={
                  infoComplete() ? infoComplete().document_expiration : ""
                }
                required
              />
            </div>
          </div>

          {!infoComplete() && !editMode && (
            <ProfilePanelIncompleteInfo infoComplete={infoComplete()} />
          )}

          {editMode ? (
            <div className="form-row justify-content-center mt-3">
              <div className="col-12 mb-2">
                <h6 className="card-subtitle">
                  {t("profile.id.form.images.title")}
                </h6>
              </div>

              <div className="col-5 text-center px-0 m-1">
                <input
                  type="file"
                  name="document_picture_front"
                  id="document_picture_front"
                  onChange={handleInput}
                  className={`${editModeInputClass()} py-0 _input_file _element_shadow`}
                  accept="image/*"
                  capture="enviroment"
                  required
                />
                <label
                  htmlFor="document_picture_front"
                  className="form-label p-2"
                >
                  {completeImage(
                    "document_picture_front",
                    document_picture_front
                  )}{" "}
                  {t("profile.id.form.images.document_picture_front")}
                </label>
              </div>

              <div className="col-5 text-center px-0 m-1">
                <input
                  type="file"
                  name="document_picture_back"
                  id="document_picture_back"
                  onChange={handleInput}
                  className={`${editModeInputClass()} py-0 _input_file _element_shadow`}
                  accept="image/*"
                  capture="enviroment"
                  required
                />
                <label
                  htmlFor="document_picture_back"
                  className="form-label p-2"
                >
                  {completeImage(
                    "document_picture_back",
                    document_picture_back
                  )}{" "}
                  {t("profile.id.form.images.document_picture_back")}
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

export default ProfilePanel_Document;
