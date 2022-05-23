// This component will control de pause/unpause feature
// "ispublished" shold be changed to "isActive" and the rest of the naming should be changed in kind

import React, { useState, useEffect } from "react";

const CarsDetailsPublicationControlPanel = (props) => {
  const { selectedCar } = props;

  const [toggler, setToggler] = useState(false);

  const isPublished = () =>
    Object.entries([...selectedCar.posts.premium, ...selectedCar.posts.p2p])
      .length > 0;

  const setTogglerValue = () => setToggler(!toggler);

  useEffect(() => {
    isPublished() ? setToggler(true) : setToggler(false);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar]);

  const switchBehaviour = async (evt) => {
    toggler ? alert("Paused") : alert("Unpaused");

    setTogglerValue();
  };

  return (
    <div className="row justify-content-around p-3 m-2 m-md-3 _bg_tertiary _element_shadow">
      <div className="col-auto">
        <p className="m-0">
          {toggler
            ? "Tu vehículo es visible por otros usuarios"
            : "Tu vehículo no es visible en la lista de publicaciones"}
        </p>
      </div>

      <div className="col-auto text-center">
        <div className="custom-control custom-switch">
          <input
            type="checkbox"
            className="custom-control-input"
            id="publicationToggle"
            checked={toggler ? "checked" : toggler}
            onChange={switchBehaviour}
          />
          <label
            className="custom-control-label"
            htmlFor="publicationToggle"
          ></label>
        </div>
      </div>
    </div>
  );
};

export default CarsDetailsPublicationControlPanel;
