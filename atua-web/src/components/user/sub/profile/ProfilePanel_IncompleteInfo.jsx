import React from "react";
import { useTranslation } from "react-i18next";

const ProfilePanelIncompleteInfo = (props) => {
  const { infoComplete } = props;

  const [t] = useTranslation("user");

  return (
    <div className="form-row justify-content-center align-items-center">
      <div className="col text-center">
        {infoComplete ? (
          <p className="text-success">
            {t("profile.incomplete_info.complete")}
          </p>
        ) : (
          <>
            <p className="m-0 p-0 text-danger">
              {t("profile.incomplete_info.incomplete")}
            </p>
            <small className="m-0 p-0 ">
              {t("profile.incomplete_info.incomplete_tip")}
            </small>
          </>
        )}
      </div>
      <div className="col-auto text-center">
        {infoComplete ? (
          <i className="far fa-check-circle h2 text-success"></i>
        ) : (
          <i className="far fa-times-circle h2 text-danger"></i>
        )}
      </div>
    </div>
  );
};

export default ProfilePanelIncompleteInfo;
