import React from "react";

import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";

const ProfilePanel_Controls = (props) => {
  const [t] = useTranslation("user");

  return (
    <div className="row justify-content-center">
      <div className="col-12 mt-0 mb-auto">
        <p className="h2 text-muted font-weight-bold text-center _profile_warning">
          {t("profile.controls.warning")}
        </p>
      </div>
      {/* <div className="col-12 mb-0 mt-auto">
        <Link to="/user/delete" className="btn _delete_button">
          {t("profile.controls.button.delete")}
        </Link>
      </div> */}
      <div className="col-12 mb-0 mt-auto">
        <Link to="/" className="btn _back_button">
          {t("profile.controls.button.back")}
        </Link>
      </div>
    </div>
  );
};

export default ProfilePanel_Controls;
