import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";

import logInGirl from "../../../../assets/images/v1/log_in_girl.png";

const LogInFields = (props) => {
  const { handleSubmit, handleInput, validField } = props;

  const [seePwd, setSeePwd] = useState(false);

  const [t] = useTranslation("authorization");

  const pwdInputType = () => {
    return seePwd ? "text" : "password";
  };

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
            onSubmit={handleSubmit}
            className="col-12 p-3 p-md-5 _bg_tertiary _border_bottom"
          >
            <div className="form-row justify-content-start py-1 py-md-2">
              <h5 className="font-weight-bold">{t("log_in.form.title")}</h5>
            </div>

            <div className="form-row py-1 py-md-2">
              <div className="input-group">
                <label htmlFor="username" className="sr-only">
                  {t("log_in.form.username")}
                </label>
                <input
                  type="email"
                  name="username"
                  id="username"
                  onChange={handleInput}
                  className={`form-control text-center ${validField("email")}`}
                  placeholder={t("log_in.form.username")}
                />{" "}
                <div className="input-group-append">
                  <span className="btn btn-outline-secondary font-weight-bold">
                    <i className="fas fa-at"> </i>
                  </span>
                </div>
              </div>
            </div>

            <div className="form-row py-1 py-md-2">
              <div className="input-group">
                <label htmlFor="password" className="sr-only">
                  {t("log_in.form.password")}
                </label>
                <input
                  type={pwdInputType()}
                  name="password"
                  id="password"
                  maxLength="4"
                  onChange={handleInput}
                  className="form-control text-center"
                  placeholder={t("log_in.form.password")}
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

            <div className="form-row justify-content-center align-items-center py-1 py-md-2">
              {/* Currently Unavailable */}
              <div className="col-12 text-center">
                <Link to="/authorization/password_reset">
                  <small className="text-muted">
                    {t("log_in.form.redirect_forgot_password")}
                  </small>
                </Link>
              </div>
              <div className="col-12 text-center">
                <Link to="/authorization/register">
                  <small className="text-muted">
                    {t("log_in.form.redirect_register")}
                  </small>
                </Link>
              </div>
            </div>

            <div className="form-row py-2 py-md-3">
              <div className="col-3 ml-auto mr-3 mr-md-0 p-0">
                <div className="input-group p-0">
                  <button
                    type="submit"
                    className="btn btn-large ml-auto _log_in_button"
                  >
                    {t("log_in.form.button_submit")}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
};

export default LogInFields;
