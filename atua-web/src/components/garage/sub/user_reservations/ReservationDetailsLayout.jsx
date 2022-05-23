import React from "react";

const ReservationDetailsLayout = (props) => {
  const { selectedReservation } = props;

  return (
    <>
      <div className="row justify-content-start pl-2">
        <div className={`col-auto mr-2 _tab_selector _tab_selected`}>
          Detalles
        </div>
      </div>
      <div className="row justify-content-center align-items-center _bg_white _tab_body _user_cars_min_height">
        <div className="col-12 p-5">
          <p>Reservation Id: {selectedReservation.id}</p>
          <p>Post: {selectedReservation.post}</p>
          <p>Start Date: {selectedReservation.start_date}</p>
          <p>End Date: {selectedReservation.end_date}</p>
          <p>Days: {selectedReservation.days}</p>
          <p>Paid Amount: {selectedReservation.paid_amount}</p>
          <p>Total to be paid: {selectedReservation.total_to_be_paid}</p>
        </div>
      </div>
    </>
  );
};

export default ReservationDetailsLayout;
