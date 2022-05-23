import React from "react";
import CarsSliderCard from "./CarsSliderCard";

const CarsSliderLayout = (props) => {
  return (
    <div className="row align-items-center p-2 m-2">
      <div className="col">
        <button
          className="bg-transparent border-0"
          onClick={props.controls.prev}
        >
          <img
            src={require("../../../../assets/images/v1/slider_arrow_left.png")}
            alt="Slider arrow left"
            width="40%"
          />
        </button>
      </div>

      <div className="col-8 col-md-10">
        <div className="card-deck justify-content-center">
          {props.cars.map((car) => (
            <CarsSliderCard key={car.id} car={car} />
          ))}
        </div>
      </div>

      <div className="col">
        <button
          className="bg-transparent border-0"
          onClick={props.controls.next}
        >
          <img
            src={require("../../../../assets/images/v1/slider_arrow_right.png")}
            alt="Slider arrow right"
            width="40%"
          />
        </button>
      </div>
    </div>
  );
};

export default CarsSliderLayout;
