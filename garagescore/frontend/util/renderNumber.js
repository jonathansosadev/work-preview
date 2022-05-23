const renderNumber = value => {
  return (!value && value !== 0) || isNaN(value)
    ? "-"
    : value.toString().length > 3
    ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
    : value;
};

export default renderNumber;
