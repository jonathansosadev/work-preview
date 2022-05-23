// This component gathers information for both characteristics and publication information

import React, { useContext, useEffect, useState } from "react";

// import { RentalContext } from "../../../../context/RentalContext";
import { CarsContext } from "../../../../context/CarsContext";

import CarsDetailsLayout from "./CarsDetailsLayout";
import CarsDetailsMessageAddCar from "./CarsDetails_MessageAddCar";
import CarsDetailsMessageSelectCar from "./CarsDetails_MessageSelectCar";

const UserGarageCarsDetails = (props) => {
  // const {
  //   // publicationInfo,
  //   rentalActions: { getPublicationInfo, clearPublicationInfo },
  // } = useContext(RentalContext);

  const { carActions } = useContext(CarsContext);

  const [selectedCarInfo, setSelectedCarInfo] = useState({});

  const {
    selectedCar,
    userCars,
    //  togglePublishModal, toggleDeleteCarModal
  } = props;

  useEffect(() => {
    const fetchCar = async () => {
      if (selectedCar.id) {
        const carDetails = await carActions.getUserCars(selectedCar.id);

        setSelectedCarInfo(carDetails);
      }
    };

    fetchCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCar]);

  //FOR WHEN PUBLICATIONS COME
  // useEffect(() => {
  //   const isPublished = () => {
  //     return Object.entries(selectedCarInfo).length > 0
  //       ? [...selectedCarInfo.posts.premium, ...selectedCarInfo.posts.p2p].length > 0
  //       : false;
  //   };

  //   if (isPublished()) {
  //     getPublicationInfo(selectedCarInfo.posts.p2p[0].id);
  //   } else {
  //     clearPublicationInfo();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [selectedCar]);

  return (
    <>
      {userCars.length === 0 ? (
        <CarsDetailsMessageAddCar />
      ) : Object.entries(selectedCarInfo).length > 0 ? (
        <CarsDetailsLayout
          selectedCarInfo={selectedCarInfo}
          // publicationInfo={publicationInfo}
          // togglePublishModal={togglePublishModal}
          // toggleDeleteCarModal={toggleDeleteCarModal}
        />
      ) : (
        <CarsDetailsMessageSelectCar />
      )}
    </>
  );
};

export default UserGarageCarsDetails;
