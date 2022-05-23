import React from "react";
import { useTranslation } from "react-i18next";

const ProfilePanel_Email = (props) => {
  const { user } = props.user.basic_info;

  // NOT YET IMPLEMENTED
  // const { editMode, editModeInputClass } = props.editMode;

  // const { handleInput } = props.handlers

  const [t] = useTranslation("user");

  return (
    <div className="col-12 mt-4">
      <div className="card _profile_panel">
        <form className="card-body">
          {/* <h4 className="card-title text-center">Email</h4> */}

          <div className="form-group form-row justify-content-center align-items-center m-0">
            <label htmlFor="email" className="col-auto h4 form-label m-0">
              {t("profile.email.form.email.label")}
            </label>
            <input
              type="email"
              name="email"
              id="email"
              // onChange={handleInput}
              className={`col form-control-plaintext text-center py-0`}
              readOnly={true}
              placeholder={user.email}
            />
          </div>

          {/* USER IS NOT ABLE TO CHANGE MAIL ADDRESS UNTIL FURTHER NOTICE */}
          {false && (
            <div className="form-group form-row justify-content-end mt-2">
              <div className="col-auto">
                <button type="submit" className="btn _change_button">
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default ProfilePanel_Email;
