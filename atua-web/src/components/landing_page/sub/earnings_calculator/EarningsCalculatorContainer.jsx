// Earnings calculator for landing page
// Selects Car, model and year and calculate en aproximate of the earnings

import React, { useState } from "react";

import EarningsCalculatorLayout from "./EarningsCalculatorLayout";

const EarningsCalculatorContainer = (props) => {
  const { handleSelect, selectOptions } = props;

  const [result, setResult] = useState(null);

  // const [formData, setFormData] = useState({});

  const handleBrandChange = (evt) => {
    setResult(null);

    handleSelect.handleBrandChange(evt);
  };

  const handleModelChange = (evt) => {
    setResult(null);

    handleSelect.handleModelChange(evt);
  };

  const handleYearChange = (evt) => {
    let { target } = evt;
    let { value } = target;

    setResult(value);

    // const price = prices.find((price) => price.year === parseInt(value));

    // setFormData({ ...formData, [id]: price.price });
  };

  // Calculation of aproximate earnings
  const calculateEarnings = (evt) => {
    evt.preventDefault();

    alert("Currently unavailable");

    // if (
    //   formData.price !== null &&
    //   formData.price !== undefined &&
    //   formData.price !== "null"
    // ) {
    //   // prices are in cents, thus "/1000"
    //   // the user comision at the moment is 0.003
    //   // 30 are the days in a month (most of the time), until further notice
    //   const calculatedEarnings = ((formData.price / 1000) * 0.003 * 30).toFixed(
    //     0
    //   );

    //   setResult(calculatedEarnings);
    // }
  };

  const handlers = {
    handleBrandChange,
    handleModelChange,
    handleYearChange,
    calculateEarnings,
  };

  return (
    <EarningsCalculatorLayout
      handlers={handlers}
      selectOptions={selectOptions}
      result={result}
    />
  );
};

export default EarningsCalculatorContainer;
