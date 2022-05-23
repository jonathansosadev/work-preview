import React, { useState, useContext } from "react";

import { RentalContext } from "../../context/RentalContext";
import { UserContext } from "../../context/UserContext";

import ReserveCarLayout from "./sub/reserve_car/ReserveCarLayout_NEW";

const ReserveCar = () => {
  const {
    user: { user },
  } = useContext(UserContext);

  const { publicationInfo, rentalActions } = useContext(RentalContext);

  const [atuaForm, setAtuaForm] = useState({});

  const [availability, setAvailability] = useState(null);

  const handleInput = (evt) => {
    const { id, value, dataset, type } = evt.target;

    if (dataset.form === "atuaForm") {
      if (type === "date") {
        const isoDate = new Date(value).toISOString();

        setAtuaForm({ ...atuaForm, [id]: isoDate });
      }

      if (id === "paid_amount") {
        setAtuaForm({ ...atuaForm, [id]: value });
      }
      // not needed yet
      // setAtuaForm({ ...atuaForm, [id]: value });
    }
  };

  const handleReset = (evt) => {
    const { target } = evt;

    if (target.id === "atuaForm") {
      setAtuaForm({});
      target.reset();
    }
    if (target.id === "form-checkout") {
      target.reset();
    }
  };

  const handleSubmit = async (evt) => {
    evt.preventDefault();

    const { id } = evt.target;

    if (id === "atuaForm") {
      const formData = {
        ...atuaForm,
        post: publicationInfo.id,
        client: user.id,
      };

      const reservationInfo = await rentalActions.createReservation(formData);

      console.log(reservationInfo);
    }
  };

  const checkPublicationAvailability = async () => {
    if (atuaForm.start_date && atuaForm.end_date) {
      const availabilityRequest =
        await rentalActions.checkPublicationAvailability(
          atuaForm.start_date,
          atuaForm.end_date
        );

      return await setAvailability(availabilityRequest[0]);
    } else {
      alert("Gimme data!!!");
    }
  };

  const handlers = { handleInput, handleReset, handleSubmit };

  const actions = {
    checkPublicationAvailability,
    //Provisory
    getUserReservations: rentalActions.getUserReservations,
    deleteReservation: rentalActions.deleteReservation,
    getUserPayments: rentalActions.readUserPayments,
  };

  return (
    <ReserveCarLayout
      publicationInfo={publicationInfo}
      handlers={handlers}
      actions={actions}
      availability={availability}
    />
  );
};

export default ReserveCar;
