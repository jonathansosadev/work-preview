import React, { useState } from "react";
import { useTranslation } from "react-i18next";

import { Link } from "react-router-dom";

import compactedCar from "../../../../assets/images/v1/compacted_car.png";

const DeleteUserForm = (props) => {
  const [seePwd, setSeePwd] = useState(false);

  const [t] = useTranslation("user");

  const pwdInputType = () => {
    return seePwd ? "text" : "password";
  };

  return (
    <div className="row justify-content-center _bg_topographic">
      <section id="logInSection" className="col-9 col-md-4 p-0 m-3 m-md-5">
        <article className="row justify-content-center">
          <div className="col-3 p-0 text-center _bg_primary _border_top_left">
            <img
              src={compactedCar}
              alt="Compacted User"
              className="my-auto _compacted_car_image"
            />
          </div>
          <div className="col-9 p-3 p-md-5 _bg_primary _border_top_right">
            <h4 className="text-white font-weight-bold pl-3">
              {t("delete_user.slogan")}
            </h4>
          </div>
          <form
            onSubmit={props.handleSubmit}
            className="col-12 p-3 p-md-5 _bg_tertiary _border_bottom_right _border_bottom_left"
          >
            <div className="form-row justify-content-start py-1 py-md-2">
              <div className="col">
                <h5 className="font-weight-bold">{t("delete_user.title")}</h5>
                <p>{t("delete_user.body")}</p>
              </div>
            </div>

            <div className="form-row py-1 py-md-2">
              <div className="input-group">
                <label htmlFor="current_password" className="sr-only">
                  {t("delete_user.form.current_password.label")}
                </label>
                <input
                  type={pwdInputType()}
                  name="current_password"
                  id="current_password"
                  onChange={props.handleInput}
                  className="form-control text-center"
                  placeholder={t("delete_user.form.current_password.label")}
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
              <div className="col">
                <button type="submit" className="btn btn-large _delete_button">
                  {t("delete_user.form.button.delete")}
                </button>
              </div>

              <div className="col">
                <Link to="/user/profile">
                  <button className="btn btn-large _back_button">
                    {t("delete_user.form.button.back")}
                  </button>
                </Link>
              </div>
            </div>
          </form>
        </article>
      </section>
    </div>
  );
};

export default DeleteUserForm;
