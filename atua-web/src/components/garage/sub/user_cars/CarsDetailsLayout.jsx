// Tab Control and information spliting between tabs in car details section

import React, { useState, useEffect } from "react";

import CarsDetailsTabCharacteristics from "./CarsDetails_TabCharacteristics";
// import CarsDetailsTabPublication from "./CarsDetails_TabPublication";

const CarsDetailsLayout = (props) => {
  const {
    selectedCarInfo,
    // publicationInfo,
    // togglePublishModal,
    // toggleDeleteCarModal,
    // deleteCar,
  } = props;

  const [tab, setTab] = useState(0);

  const isTabActive = (tabNumber) => tabNumber === tab;

  const changeTab = (arrayIndex) => setTab(arrayIndex);

  useEffect(() => {
    changeTab(0);
  }, []);

  const tabs = [
    <CarsDetailsTabCharacteristics
      selectedCarInfo={selectedCarInfo}
      // togglePublishModal={togglePublishModal}
      // toggleDeleteCarModal={toggleDeleteCarModal}
      // deleteCar={deleteCar}
    />,
    // <CarsDetailsTabPublication
    //   selectedCarInfo={selectedCarInfo}
    //   publicationInfo={publicationInfo}
    // />,
  ];

  return (
    <>
      <div className="row justify-content-start pl-2">
        <div
          className={`col-auto mr-2 _tab_selector ${
            isTabActive(0) ? "_tab_selected" : ""
          }`}
        >
          <button className="btn btn-sm" onClick={() => changeTab(0)}>
            Características
          </button>
        </div>
        {/* <div
          className={`col-auto _tab_selector ${
            isTabActive(1) ? "_tab_selected" : ""
          }`}
        >
          <button
            className="btn btn-sm"
            onClick={() => changeTab(1)}
            disabled={Object.entries(publicationInfo).length === 0}
          >
            Publicación
          </button>
        </div> */}
      </div>
      <div className="row justify-content-around _bg_white _tab_body">
        <div className="col-12 p-0 m-0">{tabs[tab]}</div>
      </div>
    </>
  );
};

export default CarsDetailsLayout;
