// Quicksearch for landing page
// As a user wanting to rent, i can search available cars on each branch

import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import QuickSearchLayout from "./sub/quicksearch/QuickSearchLayout";

const QuickSearch = () => {
  // const [branchOffices, setBranchOffices] = useState([]);

  const [quickSearch, setQuickSearch] = useState({});

  const history = useHistory();

  useEffect(() => {
    const now = new Date();

    // Adds 0 to every number below 10 for 2 digits lenght
    const lessThan10Thing = (n) => {
      return n < 10 ? "0" + n : n;
    };

    const available_since = `${now.getFullYear()}-${lessThan10Thing(
      now.getMonth() + 1
    )}-${lessThan10Thing(now.getDate())}`;

    // No need to specify end, let the user do it
    // const available_until = `${now.getFullYear()}-${lessThan10Thing(
    //   now.getMonth() + 1
    // )}-${lessThan10Thing(now.getDate() + 3)}`;

    setQuickSearch({
      available_since,
      // available_until,
    });
  }, []);

  // Input change sets state
  // Uses element ID to set field in quickSearch object
  const handleInput = (evt) => {
    let target = evt.target;
    let { id, value } = target;

    setQuickSearch({ ...quickSearch, [id]: value });
  };

  // Form submit function
  // At the time being, redirecting to a dummy page
  const handleSubmit = (evt) => {
    evt.preventDefault();

    history.push("/rental/available", quickSearch);
  };

  return (
    <QuickSearchLayout
      quickSearch={quickSearch}
      handleInput={handleInput}
      handleSubmit={handleSubmit}
    />
  );
};

export default QuickSearch;
