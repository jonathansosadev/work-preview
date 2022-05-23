export const props = (...keys) => object =>
  keys.reduce((soFar, key) => ({...soFar, [key]: object[key]}), {});
