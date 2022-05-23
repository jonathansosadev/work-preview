import React from "react";

import CarsDetailsMainPanel from "./CarsDetails_MainPanel";
import CarsDetailsCharacteristicsPanel from "./CarsDetails_CharacteristicsPanel";
// import CarsDetailsPublishPanel from "./CarsDetails_PublishPanel";
import CarsDetailsControlsPanel from "./CarsDetails_ControlsPanel";
import CarsDetailsNotificationPanel from "./CarsDetails_NotificationPanel";
import CarsDetailsCarDescriptionPanel from "./CarsDetails_CarDescriptionPanel";

const CarsDetailsTabCharacteristics = (props) => {
  const {
    selectedCarInfo,
    //  togglePublishModal
  } = props;

  const editFunction = () => {
    alert("Cannot edit yet!!");
  };

  const deleteFunction = () => {
    alert("Cannot delete yet!!");
  };

  return (
    <>
      {/* <CarsDetailsPublishPanel
        selectedCarInfo={selectedCarInfo}
        togglePublishModal={togglePublishModal}
      /> */}

      {selectedCarInfo.status !== 0 && (
        <CarsDetailsNotificationPanel selectedCarInfo={selectedCarInfo} />
      )}

      <CarsDetailsMainPanel selectedCarInfo={selectedCarInfo} />

      <CarsDetailsCharacteristicsPanel selectedCarInfo={selectedCarInfo} />

      <CarsDetailsCarDescriptionPanel />

      <CarsDetailsControlsPanel
        editFunction={editFunction}
        toggleDeleteCarModal={deleteFunction}
      />
    </>
  );
};

export default CarsDetailsTabCharacteristics;
