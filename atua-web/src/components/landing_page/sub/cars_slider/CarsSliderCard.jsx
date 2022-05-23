import React from "react";

const CarsSliderCard = (props) => {
  const { model, price, extras } = props.car;

  return (
    <div className="col-12 col-md-3 mx-2">
      <figure className="card h-100 _element_shadow">
        <img
          src={require("../../../../assets/images/v1/car_placeholder_universal.png")}
          alt="Car Placeholder"
          className="card-img-top p-1"
          width="100%"
        />
        <figcaption className="card-body p-1">
          <h6 className="card-title m-0">{model}</h6>
          <p className="card-text text-muted m-0">{`${price}$ por día`}</p>
          <div className="mt-1">
            <p className="m-0">
              {extras.map((extra, i) => (
                <span
                  key={i}
                  className="_car_slider-card_tag"
                >{`${extra} `}</span>
              ))}
            </p>
          </div>
        </figcaption>
      </figure>
    </div>
  );
};

export default CarsSliderCard;
