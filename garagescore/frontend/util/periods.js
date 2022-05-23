
// Bind me to your current VueJS instance first!
export function periodIdToString(periodId, translateF, i18nPrefix="") {
  if (typeof periodId !== "string") {
    return periodId;
  }
  if (periodId.match(/^[0-9]+$/)) {
    return periodId;
  }
  const month = periodId.match(/([0-9]+)-(month[0-9]+)/);
  if (month) {
    return `${translateF(`${i18nPrefix}${month[2]}`)} ${month[1]}`;
  }
  const quarter = periodId.match(/([0-9]+)-(quarter[0-9]+)/);
  if (quarter) {
    return `${translateF(`${i18nPrefix}${quarter[2]}`)} ${quarter[1]}`;
  }
  return translateF(`${i18nPrefix}${periodId}`);
}
