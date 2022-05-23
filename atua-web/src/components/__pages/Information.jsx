import React from "react";
import { useTranslation } from "react-i18next";

// import { Link } from "react-router-dom";

import EarningsCalculator from "../landing_page/EarningsCalculator";

import rentYourCar from "../../assets/images/v1/index_rent.png";
import carDashboard from "../../assets/images/v1/picture_dashboard.jpeg";
import carHorizon from "../../assets/images/v1/car_horizon.jpeg";
import insuranceIcon from "../../assets/images/v1/shield_ico.png";
import logoSURA from "../../assets/images/v1/logo_sura-banner.jpg";
import step1p from "../../assets/images/v1/step_1_p.png";
import step2p from "../../assets/images/v1/step_2_p.png";
import step3p from "../../assets/images/v1/step_3_p.png";
import step4p from "../../assets/images/v1/step_4_p.png";

const Information = () => {
  const [t] = useTranslation(["landing", "information"]);

  return (
    <>
      {/* Calculate */}
      <section className="row justify-content-center align-items-center py-3 mb-2 px-0 mx-0 w-100 _bg_tertiary">
        <article className="col-12 col-md-9 p-0 px-md-5 mx-md-0">
          <figure className="card bg-transparent border-0 p-1 p-md-5">
            <div className="row p-5">
              <figcaption className="col-12 col-md-6">
                <div className="row justify-content-start h-100">
                  <div className="col-12 align-items-start">
                    <h2 className="card-title font-weight-bold">
                      {t("landing:rent_your_car_section.title")}
                    </h2>
                    <p className="card-text text-muted">
                      <small>{t("landing:rent_your_car_section.body")}</small>
                    </p>
                  </div>

                  <div className="col-12 col-md-6 align-self-end mt-3">
                    <a
                      href="#earningsCalculator"
                      className="btn text-white text-center_bg_secondary_shade1 _quicksearch_button"
                    >
                      {t("information:rent_your_car_section.button")}
                    </a>
                  </div>
                </div>
              </figcaption>
              <div className="col-12 col-md-6 p-3 text-center">
                <img src={rentYourCar} alt="Rent Your Car" width="100%" />
              </div>
            </div>
          </figure>
        </article>
      </section>

      {/* How does it work */}
      <section className="row justify-content-center align-items-center py-3 mb-2 px-0 mx-0">
        <article className="col-12 col-md-10 p-0 px-md-5 mx-md-5">
          <figure className="card bg-transparent border-0 p-1 p-md-5">
            <div className="row p-1 p-md-5">
              <figcaption className="col-12 col-md-6">
                <div className="row justify-content-start h-100">
                  <div className="col-12 align-items-start px-5 mb-3">
                    <h2 className="card-title font-weight-bold mb-0">
                      {t("information:how_to.title")}
                    </h2>
                    <p className="card-text text-muted">
                      <small>{t("information:how_to.body")}</small>
                    </p>
                  </div>

                  <div className="col-12 align-items-center px-5">
                    <div className="row my-2">
                      <div className="col-3 text-right">
                        <img src={step1p} alt="Step 1" width="25%" />
                      </div>
                      <div className="col-9">
                        <p className="font-weight-bold text-left">
                          {t("information:how_to.step1")}
                        </p>
                      </div>
                    </div>
                    <div className="row my-2">
                      <div className="col-3 text-right">
                        <img src={step2p} alt="Step 2" width="25%" />
                      </div>
                      <div className="col-9">
                        <p className="font-weight-bold">
                          {t("information:how_to.step2")}
                        </p>
                      </div>
                    </div>
                    <div className="row my-2">
                      <div className="col-3 text-right">
                        <img src={step3p} alt="Step 3" width="25%" />
                      </div>
                      <div className="col-9">
                        <p className="font-weight-bold">
                          {t("information:how_to.step3")}
                        </p>
                      </div>
                    </div>
                    <div className="row my-2">
                      <div className="col-3 text-right">
                        <img src={step4p} alt="Step 4" width="25%" />
                      </div>
                      <div className="col-9">
                        <p className="font-weight-bold">
                          {t("information:how_to.step4")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </figcaption>
              <div className="col-12 col-md-6 p-3 text-center">
                <img src={carDashboard} alt="Rent Your Car" width="80%" />
              </div>
            </div>
          </figure>
        </article>
      </section>

      {/* Big boxes big letters */}
      <section className="row justify-content-center align-items-center px-0 mx-0">
        <div className="col-12 px-0 mx-0">
          <div className="row justify-content-center align-items-center _bg_primary _big_words_big_panels">
            <h2 className="font-weight-bold text-center text-light">
              {t("information:big_letters.first")}
            </h2>
          </div>
          <div className="row justify-content-center align-items-center _bg_tertiary _big_words_big_panels">
            <h2 className="font-weight-bold text-center">
              {t("information:big_letters.second")}
            </h2>
          </div>
          <div className="row justify-content-center align-items-center _bg_secondary _big_words_big_panels">
            <h2 className="font-weight-bold text-center text-light">
              {t("information:big_letters.third")}
            </h2>
          </div>
        </div>
      </section>

      {/* Insurance */}
      <section className="row justify-content-center align-items-center py-3 mb-2 px-0 mx-0">
        <article className="col-12 col-md-10 p-0 px-md-5 mx-md-5">
          <figure className="card bg-transparent border-0 p-1 p-md-5">
            <div className="row p-1 p-md-5">
              <div className="col-12 col-md-6 p-3 text-center">
                <img src={carHorizon} alt="Car Horizon" width="75%" />
              </div>
              <figcaption className="col-12 col-md-6">
                <div className="row justify-content-start h-100">
                  <div className="col-12 align-items-start px-5 pt-5 mb-3">
                    <img src={insuranceIcon} alt="Insurance Icon" width="15%" />
                    <h2 className="card-title font-weight-bold h1 mb-0">
                      {t("information:insurance.title")}
                    </h2>
                    <p className="card-text text-muted">
                      <small>{t("information:insurance.body")}</small>
                    </p>
                  </div>

                  <div className="col-12 align-items-center px-5">
                    <div className="row">
                      <div className="col-12 my-2">
                        <h5 className="font-weight-bold mb-0">
                          {t("information:insurance.first.title")}
                        </h5>
                        <p className="text-muted">
                          <small>{t("information:insurance.first.body")}</small>
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 my-2">
                        <h5 className="font-weight-bold mb-0">
                          {t("information:insurance.second.title")}
                        </h5>
                        <p className="text-muted">
                          <small>
                            {t("information:insurance.second.body")}
                          </small>
                        </p>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-12 my-2">
                        <h5 className="font-weight-bold mb-0">
                          {t("information:insurance.third.title")}
                        </h5>
                        <p className="text-muted">
                          <small>{t("information:insurance.third.body")}</small>
                        </p>
                      </div>
                    </div>
                    <div className="row justify-content-center mt-2 mt-md-5">
                      <div className="col-12 my-2 text-center">
                        <img src={logoSURA} alt="Logo SURA" width="50%" />
                      </div>
                    </div>
                  </div>
                </div>
              </figcaption>
            </div>
          </figure>
        </article>
      </section>

      <EarningsCalculator />
    </>
  );
};

export default Information;
