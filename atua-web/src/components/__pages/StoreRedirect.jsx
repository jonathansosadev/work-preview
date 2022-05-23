import React from "react";
import { useTranslation } from "react-i18next";

import playStore from "../../assets/images/v1/Playstore@4x.png";

const StoreRedirect = () => {
  const [t] = useTranslation("shared");

  return (
    <section className="row justify-content-center p-1 p-md-5 _bg_topographic">
      <div className="col-6 _bg_white rounded">
        <div className="row justify-content-center">
          <div className="col-8 p-1 p-md-3">
            <h2 className="text-center">{t("store_redirect.title")}</h2>
            <p>{t("store_redirect.body")}</p>
          </div>
          <div className="row justify-content-around">
            <figure className="figure col-6 text-center">
              {/* <a href="http://play.google.com?id=*"> */}
              <img
                src={playStore}
                alt="Play store"
                width="75%"
                className="figure-img img-fluid"
              />
              {/* </a> */}
            </figure>

            {/* <figure className="figure col-6 text-center">
              <img
                src={require("../../assets/images/v1/Appstore@4x.png")}
                alt="App store"
                width="75%"
                className="figure-img img-fluid"
              />
            </figure> */}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StoreRedirect;
