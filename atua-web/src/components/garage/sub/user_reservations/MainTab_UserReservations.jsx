import React from "react";

import NoReservationsCard from "./NoReservationsCard";
import ReservationCard from "./ReservationCard";

const MainTab_UserReservations = (props) => {
  const { userReservations, reservationSelect } = props;

  return (
    <div className="row justify-content-center _user_cars_min_height">
      <div className="col-12 p-3">
        {userReservations.length === 0 ? (
          <NoReservationsCard />
        ) : (
          userReservations.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              reservationSelect={reservationSelect}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default MainTab_UserReservations;
