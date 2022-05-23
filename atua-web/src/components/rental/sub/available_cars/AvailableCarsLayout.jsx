import React from "react";

import Filters from "./AvailableCars_Filters";
import Board from "./AvailableCars_Board";
import { useHistory } from "react-router-dom";

const AvailableCarsLayout = (props) => {
  const history = useHistory();

  const { handlers, searchParams, availableCars, filterOptions } = props;

  return (
    <section className="row justify-content-between h-100">
      <Filters
        handlers={handlers}
        searchParams={searchParams}
        filterOptions={filterOptions}
      />
      <Board availableCars={availableCars} />
      <div className="col-12 my-3">
        <div className="row justify-content-center">
          <div className="col-2">
            <button className="_back_button" onClick={() => history.goBack()}>
              Volver
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AvailableCarsLayout;
