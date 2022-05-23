// Component is REALLY rendered if it's not published

import React from "react";

const CarsDetailsPublishPanel = (props) => {
  const { selectedCar, togglePublishModal } = props;

  const isPublished = () =>
    Object.entries([...selectedCar.posts.premium, ...selectedCar.posts.p2p])
      .length > 0;

  const openModal = () => {
    togglePublishModal();
  };

  return !isPublished() ? (
    <div className="row justify-content-around p-3 m-2 m-md-3 _bg_tertiary _element_shadow">
      <div className="col-auto">
        <p className="m-0">Tu vehículo no se encuentra publicado</p>
      </div>

      <div className="col-auto text-center">
        <button className="btn btn-sm _car_not_published" onClick={openModal}>
          Publicar
        </button>
      </div>
    </div>
  ) : null;
};

export default CarsDetailsPublishPanel;
