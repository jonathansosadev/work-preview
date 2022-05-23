const transformBooleanToString = (value: boolean) => {
  return value ? '1' : '0';
};

const transformStringToBoolean = (value: string) => {
  return value === '1';
};

export {transformBooleanToString, transformStringToBoolean};
