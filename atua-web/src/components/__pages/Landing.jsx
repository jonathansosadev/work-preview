// Landing page component
// Holds Quick search and earnings calculator and service information

import React from "react";
import { Link } from "react-router-dom";

import { useTranslation } from "react-i18next";

// Comented components/areas are not implemented yet
import QuickSearch from "../landing_page/QuickSearch";
// import CarsSlider from "../landing_page/CarsSlider";
import PromotionSlider from "../landing_page/PromotionSlider";
import EarningsCalculator from "../landing_page/EarningsCalculator";

import logoSURA from "../../assets/images/v1/logo_sura-banner.jpg";
import insuranceIcon from "../../assets/images/v1/shield_ico.png";
import customerSupportIcon from "../../assets/images/v1/operator_ico.png";
import carsIcon from "../../assets/images/v1/cars_ico.png";
import premiumService from "../../assets/images/v1/index_airport.png";
import peerToPeer from "../../assets/images/v1/index_p2p.png";
import step1 from "../../assets/images/v1/step_1.png";
import step2 from "../../assets/images/v1/step_2.png";
import step3 from "../../assets/images/v1/step_3.png";
import rentYourCar from "../../assets/images/v1/index_rent.png";

const LandingPage = () => {
  const [t] = useTranslation("landing");

  return (
    <>
      {/* <!-- BANNER + QUICK SEARCH --> */}
      <section className="row justify-content-center py-3 mb-2 _banner_landing">
        <div className="col-12">
          <div className="row justify-items-start align-items-center">
            {process.env.NODE_ENV === "development" ||
            process.env.NODE_ENV === "production" ? (
              <QuickSearch />
            ) : null}
            <div className="col-12 col-md-auto py-2 my-2 px-md-2 mx-md-2 text-left align-self-start text-white">
              <h2 className="m-0 ml-2 pl-2 _banner_title">
                {t("banner.title.p1")}
                <br />
                {t("banner.title.p2")}
                <br />
                {t("banner.title.p3")}
              </h2>
            </div>
          </div>
        </div>

        {/* <!-- LOGO SURA --> */}
        <div className="row w-100 justify-content-center mb-n5 _sura_logo_container">
          <figure className="col-6 col-md-2 p-0 m-0 text-center">
            <img
              src={logoSURA}
              className="_sura_logo_img"
              alt="SURA Logo"
              width="100%"
            />
          </figure>
        </div>
      </section>

      {/* <!-- SLIDER RECOMENDADOS --> */}
      <section className="row justify-content-center py-3 mb-2 px-0 px-md-5 mx-md-5">
        <article className="col-auto">
          <div className="row justify-content-center py-2 my-2">
            <h3 className="text-center _text_primary">
              {t("car_slider_section.title")}
            </h3>
          </div>

          {/* <!-- SLIDER --> */}
          {/* <CarsSlider /> */}

          {/* <!-- LOGOS METODOS DE PAGO --> */}
          {/* <div className="row justify-content-center align-items-center py-2 my-2 px-0 px-md-2 mx-md-2">
            <figure className="col-6 col-md-2 text-right p-1">
              <img
                src={require("../../assets/images/v1/logo_MLP.jpg")}
                alt="Mercado Pago Argentina"
                className="_sura_logo_img"
                width="100%"
              />
            </figure>
            <figure className="col-6 col-md-2 text-left p-1">
              <img
                src={require("../../assets/images/v1/logo_transfer.jpg")}
                alt="Bank Transfer"
                className="_sura_logo_img"
                width="100%"
              />
            </figure>
          </div> */}
        </article>
      </section>

      {/* <!-- 3 FEATURES --> */}
      <section className="row justify-content-center py-3 mb-2 px-0 px-md-5 mx-md-5">
        <article className="col-12 align-self-center">
          <div className="row justify-content-center align-items-start">
            <div className="col-12 mb-3 mb-md-5 text-center">
              <h3 className="font-weight-bold">
                {t("features_section.title.p1")}
                <br />
                {t("features_section.title.p2")}
              </h3>
            </div>
            <figure className="col-12 col-md-4 mt-3 mt-md-5 px-5">
              <img src={insuranceIcon} alt="Insurance Icon" height="100%" />
              <figcaption>
                <h5 className="_text_primary_shade1">
                  {t("features_section.features.first.title")}
                </h5>
                <p className="mt-2 text-justify">
                  <small>{t("features_section.features.first.body")}</small>
                </p>
              </figcaption>
            </figure>

            <figure className="col-12 col-md-4 mt-3 mt-md-5 px-5">
              <img
                src={customerSupportIcon}
                alt="Customer Support Icon"
                height="100%"
              />

              <figcaption>
                <h5 className="_text_primary_shade1">
                  {t("features_section.features.second.title")}
                </h5>
                <p className="mt-2 text-justify">
                  <small>{t("features_section.features.second.body")}</small>
                </p>
              </figcaption>
            </figure>

            <figure className="col-12 col-md-4 mt-3 mt-md-5 px-5">
              <img src={carsIcon} alt="Cars Icon" height="100%" />
              <figcaption>
                <h5 className="_text_primary_shade1">
                  {" "}
                  {t("features_section.features.third.title")}
                </h5>
                <p className="mt-2 text-justify">
                  <small>{t("features_section.features.third.body")}</small>
                </p>
              </figcaption>
            </figure>
          </div>
        </article>
      </section>

      {/* <!-- SLIDER promos --> */}
      <PromotionSlider />

      {/* <!-- DEEP EXPLANATION --> */}
      <section className="row py-3 mb-2 px-0 mx-0 px-md-5 mx-md-5">
        <div className="col-12">
          <div className="row">
            <div className="card-deck justify-content-center">
              {/* <!-- Posibility Cards --> */}
              <div className="col-auto col-md-5 p-0 mx-0 my-2 mt-md-0 mb-md-5 mx-md-2">
                <article className="card h-100 _bg_tertiary _element_shadow">
                  <figure className="row justify-content-center align-items-center">
                    <div className="col-12 col-md-5">
                      <img
                        src={premiumService}
                        alt="Premium Service"
                        width="100%"
                      />
                    </div>
                    <figcaption className="col-12 col-md-7">
                      <div className="card-body">
                        <p className="m-0 mb-n2 _text_primary">
                          <small className="text-monospace">
                            {t(
                              "deep_explanation_section.posibilities.first.small"
                            )}
                          </small>
                        </p>
                        <h4 className="h5 card-title font-weight-bold _text_primary">
                          {t(
                            "deep_explanation_section.posibilities.first.title"
                          )}
                        </h4>
                        <p className="card-text text-muted m-0">
                          {t(
                            "deep_explanation_section.posibilities.first.body"
                          )}
                        </p>
                        <div className="row justify-content-end">
                          <Link to="/faq" href="#" className="text-muted">
                            <small>
                              {t("deep_explanation_section.redirect")}
                            </small>
                          </Link>
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                </article>
              </div>

              <div className="col-auto col-md-5 p-0 mx-0 my-2 mt-md-0 mb-md-5 mx-md-2 _not_implemented">
                <article className="card h-100 _bg_tertiary _element_shadow">
                  <figure className="row justify-content-center align-items-center">
                    <div className="col-12 col-md-5">
                      <img src={peerToPeer} alt="Peer to Peer" width="100%" />
                    </div>
                    <figcaption className="col-12 col-md-7">
                      <div className="card-body">
                        <p className="m-0 mb-n2 _text_primary">
                          <small className="text-monospace">
                            {t(
                              "deep_explanation_section.posibilities.second.small"
                            )}
                          </small>
                        </p>
                        <h4 className="card-title font-weight-bold _text_primary">
                          {t(
                            "deep_explanation_section.posibilities.second.title"
                          )}
                        </h4>
                        <p className="card-text text-muted m-0">
                          {t(
                            "deep_explanation_section.posibilities.second.body"
                          )}
                        </p>
                        <div className="row justify-content-end">
                          <Link to="/faq" href="#" className="text-muted">
                            <small>
                              {t("deep_explanation_section.redirect")}
                            </small>
                          </Link>
                        </div>
                      </div>
                    </figcaption>
                  </figure>
                </article>
              </div>
            </div>
          </div>

          {/* <!-- Service Steps --> */}
          <div className="row justify-content-around my-2 d-none d-md-flex">
            <div className="col-auto _explanation_step_number_container">
              <img
                src={step1}
                alt="Step 1"
                className="m-0 text-center _explanation_step_number"
              />
            </div>
            <div className="col-auto _explanation_step_number_container">
              <img
                src={step2}
                alt="Step 2"
                className="m-0 text-center _explanation_step_number"
              />
            </div>
            <div className="col-auto _explanation_step_number_container">
              <img
                src={step3}
                alt="Step 3"
                className="m-0 text-center _explanation_step_number"
              />
            </div>
          </div>

          <div className="row justify-content-around align-items-start my-2">
            <div className="col-10 col-md-3 text-center p-2 my-2 p-md-3">
              <h5 className="font-weight-bold">
                {t("service_steps_section.steps.first.title")}
              </h5>
              <p className="text-muted">
                <small>{t("service_steps_section.steps.first.body")}</small>
              </p>
            </div>
            <div className="col-10 col-md-3 text-center p-2 my-2 p-md-3">
              <h5 className="font-weight-bold">
                {t("service_steps_section.steps.second.title")}
              </h5>
              <p className="text-muted">
                <small>{t("service_steps_section.steps.second.body")}</small>
              </p>
            </div>
            <div className="col-10 col-md-3 text-center p-2 my-2 p-md-3">
              <h5 className="font-weight-bold">
                {t("service_steps_section.steps.third.title")}
              </h5>
              <p className="text-muted">
                <small>{t("service_steps_section.steps.third.body")}</small>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* <!-- <section>
        <article>
          SLIDER LOCATIONS
        </article>
      </section> --> */}

      {/* <!-- RENT YOUR CAR THING --> */}
      <section className="row justify-content-center align-items-center py-3 mb-2 px-0 mx-0 px-md-5 mx-md-5">
        <div className="col-12 col-md-10 p-0">
          <figure className="card border-0">
            <div className="row p-5">
              <div className="col-12 col-md-6 p-3">
                <img src={rentYourCar} alt="Rent Your Car" width="80%" />
              </div>
              <figcaption className="col-12 col-md-6">
                <div className="row justify-content-start h-100">
                  <div className="col-12 align-items-start">
                    <h2 className="card-title">
                      {t("rent_your_car_section.title")}
                    </h2>
                    <p className="card-text text-muted">
                      <small>{t("rent_your_car_section.body")}</small>
                    </p>
                  </div>

                  <div className="col-12 col-md-6 align-self-end mt-3">
                    <Link
                      to="/information"
                      href="#"
                      className="btn text-white text-center_bg_secondary_shade1 _quicksearch_button"
                    >
                      {t("rent_your_car_section.button")}
                    </Link>
                  </div>
                </div>
              </figcaption>
            </div>
          </figure>
        </div>
      </section>

      {/* <--- MIGHTY CALCULATOR --> */}
      <EarningsCalculator />
    </>
  );
};

export default LandingPage;
