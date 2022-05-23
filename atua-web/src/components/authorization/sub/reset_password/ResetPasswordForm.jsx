// RESET PASSWORD FORM
// User is directed here from an email URL and sets a new password
// These are the the form fields

import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import registerGirl from "../../../../assets/images/v1/register_girl.png";

const ResetPasswordForm = (props) => {
  const { changeConfirmed } = props;

  const [seePwd, setSeePwd] = useState(false);

  const [t] = useTranslation("authorization");

  const pwdInputType = () => {
    return seePwd ? "text" : "password";
  };

  return (
    <div className="row justify-content-center m-0">
      <section
        id="resetPasswordSection"
        className="col-9 col-md-4 p-0 m-3 m-md-5"
      >
        <article className="row justify-content-center _form_element_shadow _border_bottom">
          <div className="col-3 p-0 _bg_primary _border_top_left">
            <img
              src={registerGirl}
              alt="Bouncing Betty"
              className="_access_image"
            />
          </div>
          <div className="col-9 p-3 p-md-5 _bg_primary _border_top_right">
            <h4 className="text-white font-weight-bold pl-3">
              {t("reset_password.slogan")}
            </h4>
          </div>

          <form className="col-12 p-3 p-md-5 _bg_tertiary _border_bottom">
            <div className="form-row justify-content-start py-1 py-md-2">
              <div className="col-12">
                <h5 className="font-weight-bold">
                  {" "}
                  {t("reset_password.form.title")}
                </h5>
                {changeConfirmed ? (
                  <p>{t("reset_password.form.request_accepted")}</p>
                ) : (
                  <p> {t("reset_password.form.request_form")}</p>
                )}
              </div>
            </div>
            {!changeConfirmed && (
              <>
                <div className="form-row py-1 py-md-2">
                  <div className="col-12 p-0 pb-1 pb-md-2 input-group">
                    <label htmlFor="password" className="sr-only">
                      {t("reset_password.form.password")}
                    </label>
                    <input
                      type={pwdInputType()}
                      name="password"
                      id="password"
                      onChange={props.handleInput}
                      className="form-control text-center"
                      placeholder={t("reset_password.form.password")}
                    />
                    <div className="input-group-append">
                      <span
                        className="btn btn-outline-secondary"
                        onClick={() => setSeePwd(!seePwd)}
                      >
                        {seePwd ? (
                          <i className="fas fa-eye"></i>
                        ) : (
                          <i className="fas fa-eye-slash"></i>
                        )}
                      </span>
                    </div>
                  </div>

                  <div className="col-12 p-0 pt-1 pt-md-2 input-group">
                    <label htmlFor="re_password" className="sr-only">
                      {t("reset_password.form.re_password")}
                    </label>
                    <input
                      type={pwdInputType()}
                      name="re_password"
                      id="re_password"
                      onChange={props.handleInput}
                      className="form-control text-center"
                      placeholder={t("reset_password.form.re_password")}
                    />
                    <div className="input-group-append">
                      <span
                        className="btn btn-outline-secondary"
                        onClick={() => setSeePwd(!seePwd)}
                      >
                        {seePwd ? (
                          <i className="fas fa-eye"></i>
                        ) : (
                          <i className="fas fa-eye-slash"></i>
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="form-row py-2 py-md-3">
                  <div className="col-3 ml-auto mr-3 mr-md-0 p-0">
                    <div className="input-group p-0">
                      <button
                        type="submit"
                        className="btn btn-large ml-auto _log_in_button"
                      >
                        {t("reset_password.form.button_submit")}
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

export default ResetPasswordForm;
