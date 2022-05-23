import i18next from 'i18next';

const RadioOptions = [
  {label: i18next.t('yes'), value: 1},
  {label: i18next.t('no'), value: 0},
];

const transformStringValueToOption = (value: string) => {
  const option = RadioOptions.find((opt) => opt.value === Number(value));
  if (option) return option;
  return undefined;
};

export {RadioOptions, transformStringValueToOption};
