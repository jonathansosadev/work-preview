// Available publication component
// Results of quick search or search for cars

import React, { useEffect, useState, useContext } from "react";

import { useHistory, useLocation } from "react-router-dom";

import { RentalContext } from "../../context/RentalContext";

import AvailableCarsLayout from "./sub/available_cars/AvailableCarsLayout";

const AvailableCars = (props) => {
  const history = useHistory();
  const location = useLocation();

  const {
    rentalActions: { getAvailableCars },
    availableCars,
  } = useContext(RentalContext);

  const [filters, setFilters] = useState({});
  const [searchParams, setSearchParams] = useState({});

  useEffect(() => {
    getAvailableCars(location.state);

    setSearchParams(location.state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (evt) => {
    const { target } = evt;
    const { id, value, dataset } = target;

    // If emptied removes the entry from the object
    if (value === "") {
      setFilters(
        Object.fromEntries(
          Object.entries(filters).filter((entry) => entry[0] !== id)
        )
      );
    } else {
      // For those fields that need to be treated as Int and a String won't do
      let modifiedValue;

      modifiedValue = [
        "doors",
        "transmission",
        "fuel_type",
        "kilometers",
        "year",
        "price_lt",
      ].some((fieldID) => fieldID === id)
        ? parseInt(value)
        : value;

      // Selects in which state to store using dataset attribute
      if (dataset.filtertype === "searchParams") {
        setSearchParams({ ...searchParams, [id]: modifiedValue });
      } else {
        setFilters({ ...filters, [id]: modifiedValue });
      }
    }
  };

  // Clears info either from form or from date fields
  const handleClear = (evt) => {
    const id = evt.target.dataset.parent;

    if (id === "filtersForm") {
      document.getElementById(id).reset();

      setSearchParams({});
      setFilters({});
      history.location.state = {};

      getAvailableCars();
    } else {
      document.getElementById(id).value = "";
      // As the only fields individually cleared are dates, no need to reset filter state
      setSearchParams(
        Object.fromEntries(
          Object.entries(searchParams).filter((entry) => entry[0] !== id)
        )
      );
    }
  };

  const handleGetAvailableCars = async (evt) => {
    evt.preventDefault();

    await getAvailableCars(searchParams);
  };

  const publicationsList = () => {
    if (Object.entries(availableCars).length === 0) {
      return [];
    } else {
      if (Object.entries(filters).length === 0) {
        return availableCars.results;
      } else {
        return availableCars.results.filter((publication) => {
          const { car } = publication;

          return Object.entries(filters)
            .map((field) => {
              return car[field[0]] === field[1];
            })
            .every((result) => result === true);
        });
      }
    }
  };

  const filterOptions = () => {
    let brands = [];
    let models = [];
    let doors = [];
    let transmissions = [];

    if (publicationsList().length > 0) {
      publicationsList().forEach((publication) => {
        if (!brands.includes(publication.car.brand)) {
          brands.push(publication.car.brand);
        }
        if (!models.includes(publication.car.model)) {
          models.push(publication.car.model);
        }
        if (!doors.includes(publication.car.doors)) {
          doors.push(publication.car.doors);
        }
        if (!transmissions.includes(publication.car.transmission)) {
          transmissions.push(publication.car.transmission);
        }
      });
    }

    return {
      brands,
      models,
      doors,
      transmissions,
      maxPrice: 1000000,
    };
  };

  const handlers = { handleChange, handleClear, handleGetAvailableCars };

  return (
    <AvailableCarsLayout
      handlers={handlers}
      searchParams={searchParams}
      availableCars={publicationsList()}
      filterOptions={filterOptions()}
    />
  );
};

export default AvailableCars;
