/* eslint-disable jsx-a11y/anchor-is-valid */
// App Header/Nav

import React, { useContext } from "react";

import { Link } from "react-router-dom";

import { UserContext } from "../../context/UserContext";

import { useTranslation } from "react-i18next";

import logoAtua from "../../assets/images/v1/ATUA_logo_v1.svg";

const Header = (props) => {
  const { user, authActions } = useContext(UserContext);

  const { logged } = user;

  const [t, i18n] = useTranslation("shared");

  const langChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <header className="container-fluid p-0">
      <nav className="navbar navbar-expand-sm navbar-dark p-0 _bg_black">
        {/* <!-- Brand --> */}
        <Link to="/" className="navbar-brand ml-3 ml-md-5">
          <img src={logoAtua} height="40px" alt="ATUA Logo" />
        </Link>
        {/* <!-- Toggler --> */}
        <button
          className="navbar-toggler mr-3"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavBar"
          aria-controls="collapsibleNavBar"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          {/* <!-- Menu collapsible icon --> */}
          <span className="navbar-toggler-icon"></span>
        </button>

        <div
          className="collapse navbar-collapse text-right"
          id="collapsibleNavBar"
        >
          <ul className="navbar-nav ml-auto">
            {/* <!-- Log In - Conditional --> */}
            {!logged && (
              <>
                <li className="nav-item px-3">
                  <Link to="/authorization/log_in" className="nav-link">
                    {t("header.auth.log_in")}
                  </Link>
                </li>

                {/* <!-- Sign Up - Conditional --> */}
                <li className="nav-item px-3">
                  <Link to="/authorization/register" className="nav-link">
                    {t("header.auth.register")}
                  </Link>
                </li>
              </>
            )}

            {/* Information */}
            {/* <li className="nav-item px-3">
              <Link to="/information" className="nav-link">
                {t("header.info_menu.information")}
              </Link>
            </li> */}

            {/* <!-- INFO DROPDOWN --> */}
            {/* Temporarily not needed, restore upon FAQ and/or Contact completion */}
            <li className="nav-item px-3 dropdown mr-md-5">
              <a
                href="#"
                className="nav-link dropdown-toggle"
                id="navbarDropdown1"
                role="button"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                {t("header.info_menu.info")}
              </a>
              <div
                className="dropdown-menu dropdown-menu-info _bg_black"
                aria-labelledby="navbarDropdown1"
              >
                <Link to="/information" className="dropdown-item text-white">
                  {t("header.info_menu.information")}
                </Link>

                <Link to="/faq" className="dropdown-item text-white">
                  {t("header.info_menu.faq")}
                </Link>
              </div>
            </li>

            <li className="nav-item px-3 _bg_secondary">
              <Link to="/garage/register" className="nav-link text-muted">
                <i className="fas fa-car mr-2"></i>{" "}
                {t("header.user_menu.publish_button")}
              </Link>
            </li>

            {/* <!-- Profile - Conditional --> */}
            {logged && (
              <li className="nav-item px-3 dropdown">
                <a
                  href="#"
                  className="nav-link dropdown-toggle"
                  id="navbarDropdown2"
                  role="button"
                  data-toggle="dropdown"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  <i className="fas fa-user"></i>
                </a>
                <div
                  className="dropdown-menu dropdown-menu-right _bg_black"
                  aria-labelledby="navbarDropdown2"
                >
                  <Link to="/user/profile" className="dropdown-item text-white">
                    {t("header.user_menu.user_profile")}
                  </Link>

                  <Link to="/garage" className="dropdown-item text-white">
                    {t("header.user_menu.user_garage")}
                  </Link>

                  <div className="dropdown-divider"></div>
                  <button
                    className="dropdown-item text-white m-0"
                    onClick={authActions.logOut}
                  >
                    {t("header.auth.log_out")}
                  </button>
                </div>
              </li>
            )}

            <li className="nav-item px-3 py-2 my-auto dropdown">
              <button
                className="btn btn-sm btn-secondary dropdown-toggle"
                type="button"
                id="langDropdown"
                data-toggle="dropdown"
                aria-haspopup="true"
                aria-expanded="false"
              >
                <i className="fas fa-language _text_tertiary"></i>
              </button>
              <div
                className="dropdown-menu lang-dropdown _bg_tertiary"
                aria-labelledby="langDropdown"
              >
                <p
                  className="dropdown-item text-center p-0 m-0 _hover_cursor"
                  onClick={() => langChange("en")}
                >
                  English
                </p>
                <p
                  className="dropdown-item text-center p-0 m-0 _hover_cursor"
                  onClick={() => langChange("es")}
                >
                  Español
                </p>
              </div>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Header;
