import React from "react";

import { useHistory } from "react-router-dom";

import publicationCardImg from "../../../../assets/images/v1/car_placeholder_universal.png";

const AvailableCarsPublicationCard = (props) => {
  const { publication } = props;

  const history = useHistory();

  return (
    <div className="col-12 col-md-4 mt-2 p-1">
      <div className="card _element_shadow">
        <img
          src={publicationCardImg}
          alt="publication card"
          className="card-img-top"
        />
        <figcaption className="card-body">
          <div className="row px-3 flex-column">
            <h5 className="card-title">{`${publication.car.brand} ${publication.car.model} ${publication.car.year}`}</h5>
            <p className="card-subtitle">{`${publication.price}$/día`}</p>
          </div>

          <div className="row justify-content-end">
            <div className="col-auto">
              <button
                type="button"
                className="_reserve_button"
                onClick={() =>
                  history.push("/rental/publication/" + publication.id)
                }
              >
                Reservar
              </button>
            </div>
          </div>
        </figcaption>
      </div>
    </div>
  );
};

export default AvailableCarsPublicationCard;
