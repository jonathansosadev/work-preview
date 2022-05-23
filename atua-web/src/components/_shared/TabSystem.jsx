// A components that holds tabbing logic
// Posibility to expand to also do validation, by adding validation functions as props

import React, { useState, cloneElement } from "react";

const TabSystem = (props) => {
  const { totalTabs } = props;

  const [tab, setTab] = useState(0);

  const next = () => {
    tab + 1 > totalTabs + 1 ? setTab(0) : setTab(tab + 1);
  };

  const prev = () => {
    tab - 1 < 0 ? setTab(totalTabs) : setTab(tab - 1);
  };

  const goTo = (tabNumber) => {
    setTab(tabNumber);
  };

  const tabControls = { next, prev, goTo };

  return (
    <>
      {cloneElement(props.children, {
        ...props,
        tab,
        tabControls,
      })}
    </>
  );
};

export default TabSystem;
