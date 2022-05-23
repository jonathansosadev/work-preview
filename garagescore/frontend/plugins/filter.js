import Vue from "vue";

// -------------
// Filters -----
// -------------

export default ({ $moment }) => {
  Vue.filter("formatDate", (value, format) => {
    if (value) {
      return $moment(new Date(value)).format(format || "DD/MM/YYYY - HH:mm");
    }
  });

  Vue.filter("decimal", (value, amount = 1) => {
    return isNaN(value) || value === null
      ? "-"
      : Number.parseFloat(value).toFixed(amount);
  });

  Vue.filter("tilePrc", value => {
    return isNaN(value) || value === null
      ? "-"
      : value >= 10
      ? Math.round(value)
      : value;
  });

  Vue.filter("percentage", value => {
    return Number.isFinite(value) ? `${Math.round(value)} %` : "--";
  });

  Vue.filter("oneDecimal", value => {
    if (isNaN(value) || value === null) return "--";
    if (!value) return 0;
    if (value >= 10 || value <= -10) return Math.floor(value);
    return Number.parseFloat(Number.parseFloat(value).toFixed(1));
  });

  Vue.filter("oneDecimalReputyScore", value => {
    if (isNaN(value) || value === null) return "--";
    if (!value) return 0;
    if (value >= 10 || value <= -10) return Math.round(value);
    return Number.parseFloat(Number.parseFloat(value).toFixed(1));
  });

  // This filter is not widly used, renderNumber already do the job no ?
  Vue.filter("frenchFloating", value => {
    if (value === "-") return value;
    if (value.toString().length === 1 && value.toString() !== "10")
      return `${value},0`;
    return value.toString().replace(/\./, ",");
  });

  Vue.filter("renderNumber", value => {
    return (!value && value !== 0) || isNaN(value)
      ? "-"
      : value.toString().length > 3
      ? value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")
      : value;
  });
};
