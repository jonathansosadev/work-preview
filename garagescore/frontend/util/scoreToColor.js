export const scoreToColor = value => {
  if (value > 8) { return 'success'; }
  if (value > 6) { return 'warning'; }
  return 'danger';
};
