import React, { useState } from "react";

import { Link } from "react-router-dom";

import ToSModal from "./ToSModal";

import { useTranslation } from "react-i18next";

import registerGirl from "../../../../assets/images/v1/register_girl.png";

const SignUpForm = (props) => {
  const {
    selectOptions: { countriesOptions },
    handleInput,
    handleSubmit,
    validField,
  } = props;

  const [seePwd, setSeePwd] = useState(false);

  const [tosModal, setToSModal] = useState(false);

  const [t] = useTranslation("authorization");

  const pwdInputType = () => {
    return seePwd ? "text" : "password";
  };

  const toggleToSModal = async () => {
    await setToSModal(!tosModal);
  };

  const body = document.getElementsByTagName("body")[0];

  tosModal
    ? body.classList.add("_no_scroll")
    : body.classList.remove("_no_scroll");

  return (
    <>
      <div className="row justify-content-center m-0 _bg_topographic">
        <section id="registerSection" className="col-9 col-md-4 p-0 m-3 m-md-5">
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
                {t("sign_up.slogan")}
              </h4>
            </div>
            <form
              onSubmit={handleSubmit}
              className="col-12 p-3 p-md-5 _bg_tertiary _border_bottom"
            >
              <div className="form-row justify-content-start py-1 py-md-2">
                <h5 className="font-weight-bold">{t("sign_up.form.title")}</h5>
              </div>

              <div className="form-row py-1 py-md-2">
                <div className="input-group">
                  <label htmlFor="email" className="sr-only">
                    {t("sign_up.form.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    id="email"
                    onChange={handleInput}
                    className={`form-control text-center ${validField(
                      "email"
                    )}`}
                    placeholder={t("sign_up.form.email")}
                  />
                </div>
              </div>

              <div className="form-row py-1 py-md-2">
                <div className="input-group">
                  <label htmlFor="re_email" className="sr-only">
                    {t("sign_up.form.email")}
                  </label>
                  <input
                    type="email"
                    name="re_email"
                    id="re_email"
                    onChange={handleInput}
                    className={`form-control text-center ${validField(
                      "re_email"
                    )}`}
                    placeholder={t("sign_up.form.re_email")}
                  />
                </div>
              </div>

              <div className="form-row py-1 py-md-2">
                <div className="col-12 p-0 input-group">
                  <label htmlFor="phone" className="sr-only">
                    Country
                  </label>
                  <select
                    name="country"
                    id="country"
                    onChange={handleInput}
                    className={`form-control text-center `}
                    defaultValue=""
                  >
                    {countriesOptions()}
                  </select>
                </div>
              </div>

              <div className="form-row py-1 py-md-2">
                <div className="col-12 m-0 p-0 pb-1 input-group">
                  <label htmlFor="pin" className="sr-only">
                    {t("sign_up.form.pin")}
                  </label>
                  <input
                    type={pwdInputType()}
                    name="pin"
                    id="pin"
                    onChange={handleInput}
                    className={`form-control text-center`}
                    placeholder={t("sign_up.form.pin")}
                    aria-describedby="pinTip"
                    maxLength="4"
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
                  <div className="w-100 _just_a_separator"></div>
                  <small
                    id="pinTip"
                    className="text-muted text-center m-0 p-0 w-100"
                  >
                    {t("sign_up.form.pin_tip")}
                  </small>
                </div>
              </div>

              <div className="form-row py-1 py-md-2">
                <div className="col-3 p-0 pr-1 text-right">
                  <input
                    type="checkbox"
                    name="is_terms_accepted"
                    id="is_terms_accepted"
                    onChange={handleInput}
                  />
                </div>

                <div className="col-9 p-0 pl-1">
                  <label
                    htmlFor="is_terms_accepted"
                    onClick={toggleToSModal}
                    className="col-10 m-0 p-0 text-center _hover_cursor"
                  >
                    <>{t("sign_up.form.tos")}</>
                  </label>
                </div>
              </div>

              <div className="form-row justify-content-center align-items-center py-1 py-md-2">
                <div className="col-12 text-center">
                  <Link to="/authorization/log_in">
                    <small className="text-muted">
                      {t("sign_up.form.redirect_log_in")}
                    </small>
                  </Link>
                </div>
                {/* Currently Unavailable */}
                <div className="col-12 text-center">
                  <Link to="/authorization/password_reset">
                    <small className="text-muted">
                      {t("sign_up.form.redirect_forgot_password")}
                    </small>
                  </Link>
                </div>
              </div>

              <div className="form-row justify-content-center py-2 py-md-3">
                <div className="col-3 mr-3 mr-md-0 p-0">
                  <div className="input-group p-0">
                    <button
                      type="submit"
                      className="btn btn-large _log_in_button"
                    >
                      {t("sign_up.form.button_submit")}
                    </button>
                  </div>
                </div>
              </div>
            </form>
          </article>
        </section>
      </div>

      {tosModal && <ToSModal toggleToSModal={toggleToSModal} />}
    </>
  );
};

export default SignUpForm;
