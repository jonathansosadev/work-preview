import React, { cloneElement, useState } from "react";

const ProfilePanelContainer = (props) => {
  const [editMode, setEditMode] = useState(false);

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const editModeInputClass = () => {
    return editMode ? "form-control" : "form-control-plaintext";
  };

  const editControls = () =>
    editMode ? (
      <>
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
      </>
    ) : null;

  return (
    <>
      {cloneElement(props.children, {
        editMode,
        toggleEditMode,
        editControls,
        editModeInputClass,
      })}
    </>
  );
};

export default ProfilePanelContainer;
