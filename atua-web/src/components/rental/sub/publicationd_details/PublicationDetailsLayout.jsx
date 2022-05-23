import React from "react";
import DetailsColumn from "./PublicationDetails_DetailsColumn";
import ImagesSlider from "./PublicationDetails_ImagesSlider";
import MapRow from "./PublicationDetails_MapRow";
import { useHistory } from "react-router-dom";

import CarImg1 from "../../../../assets/images/v1/car_placeholder_universal.png";
import CarImg2 from "../../../../assets/images/v1/car_register_success.png";
import CarImg3 from "../../../../assets/images/v1/car_register_address.png";
import CarImg4 from "../../../../assets/images/v1/car_register_insurance.png";
import CarImg5 from "../../../../assets/images/v1/car_register_images_ext.png";

const PublicationDetailsLayout = (props) => {
  const history = useHistory();
  const { publicationInfo } = props;

  const images = [CarImg1, CarImg2, CarImg3, CarImg4, CarImg5];

  return (
    <section className="row justify-content-center p-5 _publication_details_container _bg_topographic">
      <div className="col-10 p-3 m-0 _bg_white _element_shadow">
        <div className="row justify-content-around">
          <ImagesSlider images={images} publicationInfo={publicationInfo} />
          <DetailsColumn publicationInfo={publicationInfo} />
          <MapRow />
        </div>
      </div>
      <div className="col-12 mt-3">
        <div className="row justify-content-center">
          <div className="col-2">
            <button className="_back_button" onClick={() => history.goBack()}>
              Volver
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PublicationDetailsLayout;
