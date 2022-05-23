import React from "react";

import loader from "../../assets/images/v1/atua_loader.gif";

const LoadingModalLayout = () => {
  return (
    <div className="row justify-content-center _modal_container">
      <section className="col-auto my-auto">
        <figure>
          <img src={loader} alt="ATUA Loader" className="rounded" />
        </figure>
      </section>
    </div>
  );
};

export default LoadingModalLayout;
