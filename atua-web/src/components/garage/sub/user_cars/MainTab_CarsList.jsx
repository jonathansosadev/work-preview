import React from "react";

import CarCard from "./CarsList_CarCard";
import AddCar from "./CarsList_CarCardAddCar";

const UserGarageCarsList = (props) => {
  const { userCars, carSelect } = props;

  return (
    <div className="row row-cols-1 row-cols-md-2 justify-content-center justify-content-md-start _user_cars_min_height">
      {userCars.map((car) => (
        <CarCard key={car.id} carInfo={car} carSelect={carSelect} />
      ))}

      <AddCar />
    </div>
  );
};

export default UserGarageCarsList;
