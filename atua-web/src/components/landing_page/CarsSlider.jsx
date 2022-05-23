import React, { useState, useEffect } from "react";

import CarsSliderLayout from "./sub/cars_slider/CarsSliderLayout";

const CarsSlider = () => {
  const [pages, setPages] = useState([]);

  const [pageNumber, setPageNumber] = useState(1);

  const nextPage = () => {
    if (pageNumber + 1 > pages.length - 1) {
      setPageNumber(0);
    } else {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber - 1 < 0) {
      setPageNumber(pages.length - 1);
    } else {
      setPageNumber(pageNumber - 1);
    }
  };

  const cars = [
    {
      id: 1,
      model: "Ford Fiesta",
      price: "1500",
      extras: ["Nafta", "Manual"],
    },
    {
      id: 2,
      model: "Tesla Model S",
      price: "5000",
      extras: ["Elec.", "Automático"],
    },
    {
      id: 3,
      model: "Fiat Palio",
      price: "2500",
      extras: ["Nafta", "Manual"],
    },
    {
      id: 4,
      model: "Audi TT",
      price: "2500",
      extras: ["Nafta", "Automático"],
    },
    {
      id: 5,
      model: "Ford Mondeo",
      price: "2500",
      extras: ["Nafta", "Manual"],
    },
    {
      id: 6,
      model: "Volskwage Gol",
      price: "2500",
      extras: ["Diesel", "Manual"],
    },
    {
      id: 7,
      model: "Hyundai Atos",
      price: "2500",
      extras: ["Diesel", "Manual"],
    },
  ];

  const arrayChunker = (arr, n) =>
    arr.length
      ? arr.length >= n
        ? [arr.slice(0, n), ...arrayChunker(arr.slice(n), n)]
        : //if an uneven number of results per page is non important, replace [] by [arr]
          []
      : [];

  useEffect(() => {
    let cardsByScreen = window.innerWidth <= 425 ? 1 : 3;

    const chunkedCars = arrayChunker(cars, cardsByScreen);

    setPages(chunkedCars);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const controls = {
    next: nextPage,
    prev: prevPage,
  };

  const carsToRender = () => {
    return pages.length > 0 ? pages[pageNumber] : [];
  };

  return <CarsSliderLayout cars={carsToRender()} controls={controls} />;
};

export default CarsSlider;
