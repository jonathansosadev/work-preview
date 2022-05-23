//Slider for promotions, if back end served promotions are enabled in the near future, it would make sense

import React from "react";

// import { Link } from "react-router-dom";

import promo1 from "../../assets/images/v1/promo_slider_1.jpg";
import promo2 from "../../assets/images/v1/promo_slider_2.jpg";
import promo3 from "../../assets/images/v1/promo_slider_3.jpg";

const PromotionSlider = () => {
  return (
    <section className="row justify-content-center py-3 mb-3 px-0 mx-0 px-md-5 mx-md-5">
      <article className="col-12">
        <div className="card-deck justify-content-center align-items-center p-2 m-2">
          <div className="col-12 col-md-4 px-1 px-md-3 m-0">
            <figure className="card">
              <img src={promo1} alt="Promo 1" width="100%" />
            </figure>
          </div>
          <div className="col-12 col-md-4 p-0 m-0">
            <figure className="card">
              <img src={promo2} alt="Promo 2" width="100%" />
            </figure>
          </div>
          <div className="col-12 col-md-4 px-1 px-md-3 m-0">
            <figure className="card">
              <img src={promo3} alt="Promo 3" width="100%" />
            </figure>
          </div>
        </div>
      </article>
      {/* Not Currently Implemented */}
      {/* <div className="col-4">
        <div className="row justify-content-end">
          <Link
            to="/promotions"
            className="h3 text-right m-0 _text_primary_shade1"
          >
            Leer más...
          </Link>
        </div>
      </div> */}
    </section>
  );
};

export default PromotionSlider;
