import React from "react";

const ReservationCard = (props) => {
  const {
    reservation: { id, client, paid_complete },
    reservationSelect,
  } = props;

  return (
    <div
      className="row justify-content-between p-2 mx-1 mt-2 _bg_tertiary _element_shadow"
      onClick={() => reservationSelect(id)}
    >
      <div className="col">
        <p className="m-0 text-center">{id}</p>
      </div>
      <div className="col">
        <p className="m-0 text-center">{client}</p>
      </div>
      <div className="col">
        <p className="m-0 text-center">{paid_complete ? "Paid" : "Unpaid"}</p>
      </div>
    </div>
  );
};

export default ReservationCard;
