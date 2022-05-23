import React, { useEffect, useContext } from "react";

import { useParams } from "react-router-dom";

import { RentalContext } from "../../context/RentalContext";

import PublicationDetailsLayout from "./sub/publicationd_details/PublicationDetailsLayout";

const PublicationDetails = () => {
  const { id } = useParams();

  const {
    rentalActions: { getPublicationInfo },
    publicationInfo,
  } = useContext(RentalContext);

  useEffect(() => {
    // Get Publication full Info
    getPublicationInfo(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <PublicationDetailsLayout publicationInfo={publicationInfo} />;
};

export default PublicationDetails;
