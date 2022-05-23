import React from "react";

import CarsDetailsControlsPanel from "./CarsDetails_ControlsPanel";
import CarsDetailsPublicationTime from "./CarsDetails_PublicationTimePanel";
import CarsDetailsPublicationControlPanel from "./CarsDetails_PublicationControlPanel";
import CarsDetailsPublicationPricePanel from "./CarsDetails_PublicationPricePanel";

const CarsDetailsTabPublication = (props) => {
  const { selectedCar, publicationInfo } = props;

  const editFunction = () => {
    alert("Cannot edit yet!!");
  };

  const deleteFunction = () => {
    alert("Cannot delete yet!!");
  };

  return (
    <>
      <CarsDetailsPublicationControlPanel selectedCar={selectedCar} />

      <CarsDetailsPublicationPricePanel publicationInfo={publicationInfo} />

      <CarsDetailsPublicationTime publicationInfo={publicationInfo} />

      <CarsDetailsControlsPanel
        editFunction={editFunction}
        deleteFunction={deleteFunction}
      />
    </>
  );
};

export default CarsDetailsTabPublication;
