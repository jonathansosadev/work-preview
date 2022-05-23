// IMPORT AND USE DATE FUNCIONS FROM ASSETS SCRIPT

import React, { useState, useEffect, useContext } from "react";

import PublishCarModalLayout from "./PublishCarModalLayout";
import CountryProvinceLogicutus from "../../../_shared/CountryProvinceLogicutus";

import {
  completeForm,
  daysWithinRange,
} from "../../../../assets/scripts/validations";

import { CarsContext } from "../../../../context/CarsContext";

import { ModalContext } from "../../../../context/ModalContext";

const PublishCarModal = (props) => {
  const { carActions } = useContext(CarsContext);
  const { showAlertModal } = useContext(ModalContext);

  const { selectedCar, togglePublishModal } = props;

  const [timeStamp, setTimeStamp] = useState(new Date());

  const [publishData, setPublishData] = useState({});

  useEffect(() => {
    let newTimeStamp = new Date();

    newTimeStamp.setMinutes(newTimeStamp.getMinutes() - 10);

    setTimeStamp(newTimeStamp);

    let endDate = new Date();

    endDate = new Date(endDate.setDate(endDate.getDate() + 3));

    // const timeZone = timeStamp.toString().split("GMT")[1].slice(0, 5);

    setPublishData({
      available_since_date: dateSpliter(timeStamp).date,
      available_since_time: dateSpliter(timeStamp).time,
      available_until_date: dateSpliter(endDate).date,
      available_until_time: dateSpliter(endDate).time,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInput = (evt) => {
    const {
      target: { id, value },
    } = evt;

    setPublishData({ ...publishData, [id]: value });

    document.getElementById(id).value = value;

    if (id === "available_since_date" || id === "available_since_time") {
      minPublicationDuration(
        publishData.available_since_date,
        publishData.available_since_time
      );
    }
  };

  const dateSpliter = (date) => {
    const lessThan10Thing = (n) => {
      return n < 10 ? "0" + n : n;
    };

    const year = date.getFullYear();
    const month = lessThan10Thing(date.getMonth() + 1);
    const day = lessThan10Thing(date.getDate());
    const hours = lessThan10Thing(date.getHours());
    const min = lessThan10Thing(date.getMinutes());

    return {
      date: `${year}-${month}-${day}`,
      time: `${hours}:${min}:${"00.000"}`,
    };
  };

  const dateObjetizer = (dateString, timeString) => {
    return new Date(
      ...[
        ...dateString
          .split("-")
          .map((el, i) => (i === 1 ? parseInt(el) - 1 : parseInt(el))),
      ],
      ...timeString.split(":")
    );
  };

  const minPublicationDuration = (startDateString, startTimeString) => {
    const dateNumerical = startDateString
      .split("-")
      .map((el, i) => (i === 1 ? parseInt(el) - 1 : parseInt(el)));

    const timeNumerical = startTimeString.split(":");

    const newEnd = new Date(...[...dateNumerical, ...timeNumerical]);

    newEnd.setDate(newEnd.getDate() + 3);

    setPublishData({
      ...publishData,
      available_until_date: dateSpliter(newEnd).date,
      available_until_time: dateSpliter(newEnd).time,
    });
  };

  const dateValidClass = (id) => {
    if (id === "available_until_date") {
      return daysWithinRange(
        publishData.available_since_date,
        publishData[id],
        3
      )
        ? "is-valid"
        : "is-invalid";
    }

    if (publishData.available_since_date && publishData.available_since_time) {
      return dateObjetizer(
        publishData.available_since_date,
        publishData.available_since_time
      ) >= timeStamp
        ? "is-valid"
        : "is-invalid";
    }

    return "";
  };

  const formComplete = () => {
    const fieldsIdArray = [
      "province",
      "street_name",
      "street_number",
      "zip_code",
      "available_since_date",
      "available_since_time",
      "available_until_date",
      "available_until_time",
      "price",
    ];

    return completeForm(publishData, fieldsIdArray);
  };

  const publishCar = (evt) => {
    evt.preventDefault();

    if (!formComplete()) {
      showAlertModal({
        isAlert: true,
        title: "Error de formulario",
        body: "Por favor, complete todos los campos",
        redirect: "/cars/garage",
      });

      return;
    }

    const addressFields = {
      province: publishData.province,
      street_name: publishData.street_name,
      street_number: publishData.street_number,
      description: publishData.description,
      zip_code: publishData.zip_code,
    };

    const publishFields = {
      available_since: dateObjetizer(
        publishData.available_since_date,
        publishData.available_since_time
      ).toISOString(),
      available_until: dateObjetizer(
        publishData.available_until_date,
        publishData.available_until_time
      ).toISOString(),
      car: selectedCar.id,
      price: publishData.price
        ? publishData.price
        : selectedCar.min_rental_price,
    };

    carActions.publishUserCar(
      publishFields,
      addressFields,
      "p2p",
      togglePublishModal
    );
  };

  return (
    <CountryProvinceLogicutus>
      <PublishCarModalLayout
        selectedCar={selectedCar}
        publishData={publishData}
        togglePublishModal={togglePublishModal}
        handleInput={handleInput}
        formComplete={formComplete}
        publishCar={publishCar}
        dateValidClass={dateValidClass}
      />
    </CountryProvinceLogicutus>
  );
};

export default PublishCarModal;
