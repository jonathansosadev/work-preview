import React from "react";

import NoCarsAvailable from "./NoCarsAvailable";
import Car from "./AvailableCars_PublicationCard";

const AvailableCarsBoard = (props) => {
  const { availableCars } = props;
  return (
    <div className="col-12 col-md-9 px-5 pt-3 pt-md-5">
      <div className="row justify-content-center p-3">
        <h4 className="font-weight-bold text-center">
          Tu ATUA ideal te esta esperando
        </h4>
      </div>
      <div className="card-deck justify-content-center">
        {availableCars.length === 0 ? (
          <NoCarsAvailable />
        ) : (
          availableCars.map((publication) => (
            <Car key={publication.id} publication={publication} />
          ))
        )}
      </div>
    </div>
  );
};

export default AvailableCarsBoard;
