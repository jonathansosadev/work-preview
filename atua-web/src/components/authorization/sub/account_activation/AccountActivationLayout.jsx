import React from "react";

import { useTranslation } from "react-i18next";

import { useHistory } from "react-router-dom";

import logInGirl from "../../../../assets/images/v1/log_in_girl.png";

const AccountActivationLayout = (props) => {
  const { activated } = props.activated;

  const history = useHistory();

  const [t] = useTranslation("authorization");

  return (
    <div className="row justify-content-center _bg_topographic">
      <section id="logInSection" className="col-9 col-md-4 p-0 m-3 m-md-5">
        <article className="row justify-content-center _form_element_shadow  _border_bottom">
          <div className="col-3 p-0 _bg_primary _border_top_left">
            <img
              src={logInGirl}
              alt="Smiling Jenna"
              className="_access_image"
            />
          </div>
          <div className="col-9 p-3 p-md-5 _bg_primary _border_top_right">
            <h4 className="text-white font-weight-bold pl-3">
              {t("log_in.slogan")}
            </h4>
          </div>
          <form
            onSubmit={props.handleSubmit}
            className="col-12 p-3 p-md-5 _bg_tertiary _border_bottom"
          >
            {activated ? (
              <>
                <div className="form-row justify-content-center align-items-center py-1 py-md-2 ">
                  <h2>{t("account_activation.title")}</h2>
                  <p>{t("account_activation.body")}</p>
                </div>

                <div className="form-row justify-content-center align-items-center py-1 py-md-2">
                  <button
                    className="btn btn-large ml-auto _log_in_button"
                    onClick={() => history.push("/authorization/log_in")}
                  >
                    {t("account_activation.button_log_in")}
                  </button>
                </div>
              </>
            ) : (
              <div className="form-row justify-content-center align-items-center py-1 py-md-2">
                <div className="col-10 align-items-center">
                  <h2 className="text-center">
                    {t("account_activation.progress")}
                  </h2>
                </div>
              </div>
            )}
          </form>
        </article>
      </section>
    </div>
  );
};

export default AccountActivationLayout;
