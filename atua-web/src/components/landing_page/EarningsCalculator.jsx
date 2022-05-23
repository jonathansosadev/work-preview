import React from "react";

import BrandModelLogicutus from "../_shared/BrandModelLogicutus";
import EarningsCalculatorContainer from "./sub/earnings_calculator/EarningsCalculatorContainer";

const EarningsCalculator = () => {
  return (
    <BrandModelLogicutus>
      <EarningsCalculatorContainer />
    </BrandModelLogicutus>
  );
};

export default EarningsCalculator;
