import React from "react";

const CarsDetailsPublicationPricePanel = (props) => {
  const { price } = props.publicationInfo;

  return (
    <div className="row justify-content-center m-2 m-md-3 p-2 p-md-3 position-relative _bg_tertiary _element_shadow">
      <div className="col-12">
        <h4 className="text-center m-0">
          Valor de la publicacion{" "}
          <span className="text-center font-weight-bold m-0">
            {(price / 1000).toFixed()}$
          </span>
        </h4>
      </div>
    </div>
  );
};

export default CarsDetailsPublicationPricePanel;
