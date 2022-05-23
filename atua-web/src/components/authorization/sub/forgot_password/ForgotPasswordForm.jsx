// REQUEST RESET PASSWORD
// Form for submiting a password change request
// Here be the form field

import React from "react";
import { useTranslation } from "react-i18next";
import logInGirl from "../../../../assets/images/v1/log_in_girl.png";

const ForgotPasswordForm = (props) => {
  const { handleInput, handleSubmit, requestAccepted } = props;

  const [t] = useTranslation("authorization");

  return (
    <div className="row justify-content-center m-0">
      <section
        id="forgotPasswordSection"
        className="col-9 col-md-4 p-0 m-3 m-md-5"
      >
        <article className="row justify-content-center _form_element_shadow _border_bottom">
          <div className="col-3 p-0 _bg_primary _border_top_left">
            <img
              src={logInGirl}
              alt="Smiling Jenna"
              className="_access_image"
            />
          </div>
          <div className="col-9 p-3 p-md-5 _bg_primary _border_top_right">
            <h4 className="text-white font-weight-bold pl-3">
              {t("forgot_password.slogan")}
            </h4>
          </div>

          <form
            onSubmit={handleSubmit}
            className="col-12 p-3 p-md-5 _bg_tertiary _border_bottom"
          >
            <div className="form-row justify-content-start py-1 py-md-2">
              <div className="col-12">
                <h5 className="font-weight-bold">
                  {t("forgot_password.form.title")}
                </h5>

                {requestAccepted ? (
                  <p>{t("forgot_password.form.request_sent")}</p>
                ) : (
                  <p>{t("forgot_password.form.request_form")}</p>
                )}
              </div>
            </div>
            {!requestAccepted && (
              <>
                <div className="form-row py-1 py-md-2">
                  <div className="input-group">
                    <label htmlFor="email" className="sr-only">
                      {t("forgot_password.form.email")}
                    </label>
                    <input
                      type="text"
                      name="email"
                      id="email"
                      onChange={handleInput}
                      className="form-control text-center"
                      placeholder={t("forgot_password.form.email")}
                    />
                  </div>
                </div>

                <div className="form-row py-2 py-md-3">
                  <div className="col-3 ml-auto mr-3 mr-md-0 p-0">
                    <div className="input-group p-0">
                      <button
                        type="submit"
                        className="btn btn-large ml-auto _log_in_button"
                      >
                        {t("forgot_password.form.button_submit")}
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </form>
        </article>
      </section>
    </div>
  );
};

export default ForgotPasswordForm;
