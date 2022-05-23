import React from "react";
import BackButton from "./UserGarage_BackButton";

const UserGarageLayout = (props) => {
  const {
    tabsControls: { tab, setTab },
    mainTabsArr,
    subTabsArr,
  } = props;

  const isTabActive = (tabNumber) => tabNumber === tab;

  return (
    <div className="row justify-content-around p-3 p-md-4 _bg_topographic _user_cars_min_height">
      <div className="col-12 px-4">
        <h3>Mi Garage</h3>
      </div>

      <section className="col-12 col-md-5 p-1 px-md-3 pb-md-3 pt-md-0 mt-2 mt-md-0">
        {/* Tabs selectors */}
        <div className="row justify-content-start pl-2">
          <div
            className={`col-auto mr-2 _tab_selector ${
              isTabActive(0) ? "_tab_selected" : ""
            }`}
          >
            <button className="btn btn-sm" onClick={() => setTab(0)}>
              Mis Autos
            </button>
          </div>
          {/* <div
            className={`col-auto mr-2 _tab_selector ${
              isTabActive(1) ? "_tab_selected" : ""
            }`}
          >
            <button className="btn btn-sm" onClick={() => setTab(1)}>
              Mis Viajes
            </button>
          </div>
          <div
            className={`col-auto mr-2 _tab_selector ${
              isTabActive(2) ? "_tab_selected" : ""
            }`}
          >
            <button className="btn btn-sm" onClick={() => setTab(2)}>
              Mi Cartera
            </button>
          </div> */}
        </div>

        {/* Tabs bodies */}
        <div className="row justify-content-center _tab_body">
          <div className="col-12 px-3">{mainTabsArr[tab]}</div>
        </div>
      </section>

      {/* Subtabs Row, each subtab has it's tabs as they may vary */}
      <section className="col-12 col-md-6 p-1 px-md-3 pb-md-3 pt-md-0 mt-2 mt-md-0 _user_cars_min_height">
        {subTabsArr[tab]}
      </section>

      <BackButton />
    </div>
  );
};

export default UserGarageLayout;
