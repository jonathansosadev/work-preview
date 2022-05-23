import React from "react";

import AvailabilityAlmanacPanel from "./ReserveCar_AvailabilityAlmanacPanel";
import PublicationDetailsPanel from "./ReserveCar_PublicationDetailsPanel";
import ReservationForm from "./ReserveCar_ReservationForm";

const ReserveCarLayout = (props) => {
  return (
    <section className="row justify-content-around p-5 _publication_details_container _bg_topographic">
      <div className="col-5 p-3 m-0 _bg_white _element_shadow">
        <PublicationDetailsPanel />
      </div>

      <div className="col-5 p-3 m-0 _bg_white _element_shadow">
        <AvailabilityAlmanacPanel />

        <ReservationForm />
      </div>
    </section>
  );
};

export default ReserveCarLayout;
