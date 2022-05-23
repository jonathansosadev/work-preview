import React from "react";
import { useHistory } from "react-router-dom";

import MercadoPagoForm from "./MercadoPagoForm";
import ATUAForm from "./ATUAForm";

const ReserveCarLayout = (props) => {
  const { handlers, actions, availability } = props;

  const history = useHistory();

  return (
    <div className="row justify-content-center p-3 p-md-4 _bg_topographic">
      <div className="col-10">
        <ATUAForm
          handlers={handlers}
          actions={actions}
          availability={availability}
        />
        <MercadoPagoForm />
      </div>
      <div className="col-10 p-5">
        <button onClick={() => history.goBack()}>Volver</button>
      </div>
    </div>
  );
};

export default ReserveCarLayout;
