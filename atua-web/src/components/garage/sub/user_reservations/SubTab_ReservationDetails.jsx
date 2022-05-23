import React from "react";
import ReservationDetailsLayout from "./ReservationDetailsLayout";
import SelectReservation from "./ReservationDetails_SelectReservation";

const SubTab_ReservationDetails = (props) => {
  const { selectedReservation } = props;

  return (
    <>
      {Object.entries(selectedReservation).length === 0 ? (
        <SelectReservation />
      ) : (
        <ReservationDetailsLayout selectedReservation={selectedReservation} />
      )}
    </>
  );
};

export default SubTab_ReservationDetails;
