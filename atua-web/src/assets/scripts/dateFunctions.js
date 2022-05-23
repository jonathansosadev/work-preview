export const dateSpliter = (date) => {
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

export const dateObjetizer = (dateString, timeString) => {
  return new Date(
    ...[
      ...dateString
        .split("-")
        .map((el, i) => (i === 1 ? parseInt(el) - 1 : parseInt(el))),
    ],
    ...timeString.split(":")
  );
};

export const minPublicationDuration = (
  startDateString,
  startTimeString,
  minimunLength
) => {
  const dateNumerical = startDateString
    .split("-")
    .map((el, i) => (i === 1 ? parseInt(el) - 1 : parseInt(el)));

  const timeNumerical = startTimeString.split(":");

  const newEnd = new Date(...[...dateNumerical, ...timeNumerical]);

  newEnd.setDate(newEnd.getDate() + minimunLength);

  return {
    available_until_date: dateSpliter(newEnd).date,
    available_until_time: dateSpliter(newEnd).time,
  };
};
