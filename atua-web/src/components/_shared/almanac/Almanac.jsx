import React from "react";
import Month from "./Month";

const Almanac = (props) => {
  const isLeapYear = () => {
    let year = new Date().getFullYear();

    return year % 400 === 0 ? true : year % 100 === 0 ? false : year % 4 === 0;
  };

  const months = [
    { name: "January", days: 31 },
    { name: "February", days: isLeapYear() ? 29 : 28 },
    { name: "March", days: 31 },
    { name: "April", days: 30 },
    { name: "May", days: 31 },
    { name: "June", days: 30 },
    { name: "July", days: 31 },
    { name: "August", days: 31 },
    { name: "September", days: 30 },
    { name: "October", days: 31 },
    { name: "November", days: 30 },
    { name: "December", days: 31 },
  ];

  return (
    <div className="row row-cols-2">
      {months.map((month, index) => (
        <Month key={index} month={month} />
      ))}
    </div>
  );
};

export default Almanac;
