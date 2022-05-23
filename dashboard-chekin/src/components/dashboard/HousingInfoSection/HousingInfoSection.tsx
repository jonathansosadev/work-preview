import React from 'react';
import {useTranslation} from 'react-i18next';
import {Controller, useFormContext} from 'react-hook-form';
import {useQuery} from 'react-query';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {getRequiredOrOptionalFieldLabel} from '../../../utils/common';
import {
  COUNTRY_CODES,
  QUERY_CACHE_KEYS,
  SUBSCRIPTION_TYPES,
} from '../../../utils/constants';
import {useUser} from '../../../context/user';
import {useErrorToast, useIsFormTouched} from '../../../utils/hooks';
import {getCountryCode, getProvinceCode} from '../../../utils/housing';
import {SelectOption} from '../../../utils/types';
import Section from '../Section';
import Select from '../Select';
import {InputController} from '../Input';
import {FieldsVerticalGridLayout} from '../../../styled/common';

const PROVINCES_CACHE_TIME_MIN = 60;
const COUNTRIES_CACHE_TIME_MIN = 60;
const COUNTRIES_STALE_TIME_MIN = 30;
const PROVINCES_STALE_TIME_MIN = 30;

const MIN_ROOMS_NUMBER = 10;

const COUNTRIES_WITH_PROVINCES = [
  COUNTRY_CODES.italy,
  COUNTRY_CODES.portugal,
  COUNTRY_CODES.spain,
  COUNTRY_CODES.romania,
  COUNTRY_CODES.uae,
];
const DIVISION_LVL_1_PROVINCE_COUNTRIES = [
  COUNTRY_CODES.uae,
  COUNTRY_CODES.romania,
  COUNTRY_CODES.portugal,
];

function getShouldFetchProvinces(country = '') {
  return COUNTRIES_WITH_PROVINCES.includes(country);
}

function getCountriesAsOptions(countries: any) {
  if (!countries?.results) {
    return [];
  }

  return countries?.results?.map((c: any) => {
    return {
      label: c?.country?.name,
      value: c?.country?.code,
    };
  });
}

function fetchProvinces(country = '') {
  return queryFetcher(api.locations.ENDPOINTS.all(`country=${country}&ordering=name`));
}

function getProvincesAsOptions(provinces: any, country = '') {
  if (!provinces?.results) {
    return [];
  }

  if (DIVISION_LVL_1_PROVINCE_COUNTRIES.includes(country)) {
    return provinces?.results?.map((c: any) => {
      return {
        label: c?.division_level_1?.name,
        value: c?.division_level_1?.code,
      };
    });
  }

  return provinces?.results?.map((c: any) => {
    return {
      label: c?.division_level_2?.name,
      value: c?.division_level_2?.code,
    };
  });
}

type FieldsData = {
  isContractsSectionActive: boolean;
  subscriptionType?: string;
};

export enum FORM_NAMES {
  name = 'name',
  country = 'country',
  province = 'province',
  address = 'address',
  city = 'city',
  vatin = 'vatin',
  tourism_registration_number = 'tourism_registration_number',
  rooms_quantity = 'rooms_quantity',
}

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.name]: i18n.t('required'),
  [FORM_NAMES.country]: i18n.t('required'),
  [FORM_NAMES.city]: i18n.t('required'),
  [FORM_NAMES.address]: i18n.t('required'),
  [FORM_NAMES.province]: i18n.t('required'),
  [FORM_NAMES.vatin]: i18n.t('required'),
  [FORM_NAMES.tourism_registration_number]: i18n.t('required'),
  [FORM_NAMES.rooms_quantity]: i18n.t('required'),
};

function getRequiredFields(country: string, {isContractsSectionActive}: FieldsData) {
  switch (country) {
    case COUNTRY_CODES.italy: {
      if (isContractsSectionActive) {
        return INIT_REQUIRED_FIELDS;
      }

      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.vatin]: false,
      };
    }
    case COUNTRY_CODES.belgium:
    case COUNTRY_CODES.netherlands: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.vatin]: false,
      };
    }
    case COUNTRY_CODES.austria: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.tourism_registration_number]: false,
      };
    }
    case COUNTRY_CODES.slovenia: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.city]: false,
      };
    }
    default: {
      return INIT_REQUIRED_FIELDS;
    }
  }
}

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.name]: true,
  [FORM_NAMES.country]: true,
  [FORM_NAMES.city]: false,
  [FORM_NAMES.address]: false,
  [FORM_NAMES.province]: false,
  [FORM_NAMES.vatin]: false,
  [FORM_NAMES.tourism_registration_number]: false,
  [FORM_NAMES.rooms_quantity]: false,
};

function getDisplayFields(
  country: string,
  {isContractsSectionActive, subscriptionType}: FieldsData,
) {
  let fields = {
    ...INIT_DISPLAY_FIELDS,
  };

  if (subscriptionType === SUBSCRIPTION_TYPES.hotel) {
    fields = {
      ...fields,
      [FORM_NAMES.rooms_quantity]: true,
    };
  }

  if (!country) {
    return fields;
  }

  switch (country) {
    case COUNTRY_CODES.austria: {
      return {
        ...fields,
        [FORM_NAMES.tourism_registration_number]: true,
      };
    }
    case COUNTRY_CODES.belgium: {
      return {
        ...fields,
        [FORM_NAMES.city]: true,
        [FORM_NAMES.vatin]: true,
      };
    }
    case COUNTRY_CODES.france: {
      return {
        ...fields,
        [FORM_NAMES.city]: true,
        [FORM_NAMES.address]: !isContractsSectionActive,
      };
    }
    case COUNTRY_CODES.italy: {
      return {
        ...fields,
        [FORM_NAMES.province]: true,
        [FORM_NAMES.city]: true,
        [FORM_NAMES.vatin]: true,
      };
    }
    case COUNTRY_CODES.netherlands: {
      return {
        ...fields,
        [FORM_NAMES.city]: true,
        [FORM_NAMES.vatin]: true,
      };
    }
    case COUNTRY_CODES.portugal: {
      return {
        ...fields,
        [FORM_NAMES.address]: true,
        [FORM_NAMES.province]: true,
        [FORM_NAMES.city]: true,
        [FORM_NAMES.vatin]: true,
      };
    }
    case COUNTRY_CODES.romania: {
      return {
        ...fields,
        [FORM_NAMES.province]: true,
      };
    }
    case COUNTRY_CODES.spain: {
      return {
        ...fields,
        [FORM_NAMES.province]: true,
        [FORM_NAMES.city]: true,
        [FORM_NAMES.vatin]: true,
      };
    }
    case COUNTRY_CODES.uae: {
      return {
        ...fields,
        [FORM_NAMES.province]: true,
        [FORM_NAMES.city]: true,
      };
    }
    case COUNTRY_CODES.croatia: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.city]: false,
      };
    }
    case COUNTRY_CODES.colombia:
    case COUNTRY_CODES.germany:
    case COUNTRY_CODES.czech: {
      return {
        ...fields,
        [FORM_NAMES.city]: true,
      };
    }
    case COUNTRY_CODES.thailand:
    case COUNTRY_CODES.uk: {
      return fields;
    }
    default: {
      return {
        ...fields,
        [FORM_NAMES.city]: true,
      };
    }
  }
}

function getFields(
  country = '',
  {isContractsSectionActive, subscriptionType}: FieldsData,
) {
  const display = getDisplayFields(country, {isContractsSectionActive, subscriptionType});
  const required = getRequiredFields(country, {isContractsSectionActive});

  return {
    display,
    required,
  };
}

type HousingInfoSectionProps = {
  isContractsSectionActive: boolean;
  disabled: boolean;
  setIsSectionTouched?: (isTouched: boolean) => void;
  housing?: any;
  spacesCount: number;
};

const defaultProps: Partial<HousingInfoSectionProps> = {
  isContractsSectionActive: false,
  disabled: false,
  housing: null,
  spacesCount: 0,
};

function HousingInfoSection({
  isContractsSectionActive,
  disabled,
  housing,
  spacesCount,
  setIsSectionTouched,
}: HousingInfoSectionProps) {
  const {t} = useTranslation();
  const user = useUser();
  const {register, control, watch, formState, trigger, setValue} = useFormContext();

  const {errors} = formState;

  const [isCountryPreloaded, setIsCountryPreloaded] = React.useState(false);
  const [isProvincePreloaded, setIsProvincePreloaded] = React.useState(false);

  const country = watch(FORM_NAMES.country)?.value;
  const shouldFetchProvinces = getShouldFetchProvinces(country);
  const subscriptionType = user?.subscription_type;

  const [fields, setFields] = React.useState(() => {
    return getFields(country, {isContractsSectionActive, subscriptionType});
  });
  const {isFormTouched, setUntouchedValues} = useIsFormTouched({
    displayFields: fields.display,
    watch,
    defaultValues: {
      [FORM_NAMES.name]: '',
      [FORM_NAMES.country]: '',
      [FORM_NAMES.province]: '',
      [FORM_NAMES.address]: '',
      [FORM_NAMES.city]: '',
      [FORM_NAMES.vatin]: '',
      [FORM_NAMES.tourism_registration_number]: '',
      [FORM_NAMES.rooms_quantity]: '',
    },
  });

  const {data: provinces, error} = useQuery(
    ['provinces', country],
    () => fetchProvinces(country),
    {
      enabled: shouldFetchProvinces,
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * PROVINCES_CACHE_TIME_MIN,
      staleTime: 1000 * 60 * PROVINCES_STALE_TIME_MIN,
    },
  );
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_provinces_not_found'),
  });
  const {data: countries, error: countriesError} = useQuery(
    QUERY_CACHE_KEYS.locations,
    api.locations.fetchCountries,
    {
      refetchOnWindowFocus: false,
      cacheTime: 1000 * 60 * COUNTRIES_CACHE_TIME_MIN,
      staleTime: 1000 * 60 * COUNTRIES_STALE_TIME_MIN,
    },
  );
  useErrorToast(countriesError, {
    notFoundMessage: t('errors.requested_countries_not_found'),
  });

  const countriesOptions = React.useMemo(() => {
    return getCountriesAsOptions(countries);
  }, [countries]);
  const provincesAsOptions = React.useMemo(() => {
    return getProvincesAsOptions(provinces, country);
  }, [provinces, country]);

  React.useEffect(() => {
    if (typeof setIsSectionTouched === 'function') {
      setIsSectionTouched(isFormTouched);
    }
  }, [isFormTouched, setIsSectionTouched]);

  React.useEffect(() => {
    if (formState.isSubmitted) {
      trigger();
    }
  }, [fields, formState.isSubmitted, trigger]);

  React.useLayoutEffect(() => {
    const nextFields = getFields(country, {isContractsSectionActive, subscriptionType});
    setFields(nextFields);

    if (country) {
      setIsCountryPreloaded(true);
    }
  }, [country, isContractsSectionActive, setIsCountryPreloaded, subscriptionType]);

  React.useEffect(
    function preloadCountryAndName() {
      if (housing) {
        const countryCode = getCountryCode(housing);
        const nextCountry = countriesOptions.find((o: SelectOption) => {
          return o.value === countryCode;
        });
        const formData = [
          {name: FORM_NAMES.name, value: housing?.name},
          {
            name: FORM_NAMES.country,
            value: nextCountry,
          },
        ];

        formData.forEach(({name, value}) => {
          setValue(name, value);
        });

        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.name]: housing?.name,
            [FORM_NAMES.country]: nextCountry,
          };
        });
      }
    },
    [countriesOptions, housing, setUntouchedValues, setValue],
  );

  React.useEffect(
    function preloadProvince() {
      const canPreloadProvince =
        !isProvincePreloaded &&
        isCountryPreloaded &&
        provincesAsOptions?.length &&
        housing;

      if (canPreloadProvince) {
        const nextProvince = provincesAsOptions.find((o: SelectOption) => {
          return o.value === getProvinceCode(housing);
        });

        setValue(FORM_NAMES.province, nextProvince);
        setUntouchedValues((prevState) => {
          return {
            ...prevState,
            [FORM_NAMES.province]: nextProvince,
          };
        });
        setIsProvincePreloaded(true);
      }
    },
    [
      housing,
      isCountryPreloaded,
      isProvincePreloaded,
      provincesAsOptions,
      setUntouchedValues,
      setValue,
    ],
  );

  React.useEffect(
    function preloadRestData() {
      if (isCountryPreloaded && housing) {
        const formData = [
          {
            name: FORM_NAMES.tourism_registration_number,
            value: housing.tourism_registration_number,
          },
          {name: FORM_NAMES.city, value: housing.location?.city},
          {name: FORM_NAMES.address, value: housing.location?.address},
          {name: FORM_NAMES.vatin, value: housing.vatin},
          {
            name: FORM_NAMES.rooms_quantity,
            value: housing.rooms_quantity ? String(housing.rooms_quantity) : undefined,
          },
        ];
        formData.forEach(({name, value}) => {
          setValue(name, value);
        });

        setUntouchedValues((prevState) => {
          let result: {[key: string]: any} = {};

          formData.forEach(({name, value}) => {
            result[name] = value;
          });

          return {
            ...prevState,
            ...result,
          };
        });
      }
    },
    [housing, isCountryPreloaded, setValue, setUntouchedValues],
  );

  return (
    <Section title={t('property_info_title')} subtitle={t('property_info_subtitle')}>
      <FieldsVerticalGridLayout>
        {fields.display[FORM_NAMES.name] && (
          <div>
            <InputController
              {...register(FORM_NAMES.name, {
                required: fields.required[FORM_NAMES.name],
              })}
              control={control}
              label={getRequiredOrOptionalFieldLabel(
                t('property_name'),
                fields.required[FORM_NAMES.name],
              )}
              error={errors[FORM_NAMES.name]?.message}
              placeholder={t('enter_name')}
              disabled={disabled}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.country] && (
          <div>
            <Controller
              control={control}
              name={FORM_NAMES.country}
              rules={{required: fields.required[FORM_NAMES.country]}}
              render={({field, fieldState: {error}}) => {
                return (
                  <Select
                    label={getRequiredOrOptionalFieldLabel(
                      t('country'),
                      fields.required[FORM_NAMES.country],
                    )}
                    options={countriesOptions}
                    error={error?.message}
                    disabled={disabled}
                    placeholder={t('select_your_country')}
                    {...field}
                  />
                );
              }}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.address] && (
          <div>
            <InputController
              {...register(FORM_NAMES.address, {
                required: fields.required[FORM_NAMES.address],
              })}
              control={control}
              label={getRequiredOrOptionalFieldLabel(
                t('address'),
                fields.required[FORM_NAMES.address],
              )}
              error={errors[FORM_NAMES.address]?.message}
              placeholder={t('enter_address')}
              disabled={disabled}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.province] && (
          <div>
            <Controller
              control={control}
              name={FORM_NAMES.province}
              rules={{required: fields.required[FORM_NAMES.province]}}
              render={({field, fieldState: {error}}) => {
                return (
                  <Select
                    label={getRequiredOrOptionalFieldLabel(
                      t('province'),
                      fields.required[FORM_NAMES.province],
                    )}
                    options={getProvincesAsOptions(provinces, country)}
                    error={error?.message}
                    disabled={disabled}
                    placeholder={t('select_your_province')}
                    {...field}
                  />
                );
              }}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.city] && (
          <div>
            <InputController
              {...register(FORM_NAMES.city, {
                required: fields.required[FORM_NAMES.city],
              })}
              control={control}
              label={getRequiredOrOptionalFieldLabel(
                t('city'),
                fields.required[FORM_NAMES.city],
              )}
              error={errors[FORM_NAMES.city]?.message}
              placeholder={t('enter_city')}
              disabled={disabled}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.tourism_registration_number] && (
          <div>
            <InputController
              {...register(FORM_NAMES.tourism_registration_number, {
                required: fields.required[FORM_NAMES.tourism_registration_number],
              })}
              control={control}
              label={getRequiredOrOptionalFieldLabel(
                t('tourism_registration_number'),
                fields.required[FORM_NAMES.tourism_registration_number],
              )}
              error={errors[FORM_NAMES.tourism_registration_number]?.message}
              placeholder={t('enter_tourism_registration_number')}
              disabled={disabled}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.vatin] && (
          <div>
            <InputController
              {...register(FORM_NAMES.vatin, {
                required: fields.required[FORM_NAMES.vatin],
              })}
              control={control}
              label={getRequiredOrOptionalFieldLabel(
                `${t('vatin')} ${country === COUNTRY_CODES.netherlands ? '(VAT)' : ''}`,
                fields.required[FORM_NAMES.vatin],
              )}
              error={errors[FORM_NAMES.vatin]?.message}
              placeholder={t('enter_vatin')}
              disabled={disabled}
            />
          </div>
        )}
        {fields.display[FORM_NAMES.rooms_quantity] && (
          <div>
            <InputController
              {...register(FORM_NAMES.rooms_quantity, {
                required: fields.required[FORM_NAMES.rooms_quantity],
                min: {
                  value: MIN_ROOMS_NUMBER,
                  message: t('the_hotel_must_have_at_least_number_rooms', {
                    number: MIN_ROOMS_NUMBER,
                  }),
                },
                validate: {
                  notAnInteger: (value) =>
                    /^\d+$/.test(value) || `${t('decimals_not_allowed')}`,
                },
              })}
              control={control}
              label={getRequiredOrOptionalFieldLabel(
                t('rooms_quantity'),
                fields.required[FORM_NAMES.rooms_quantity],
              )}
              name={FORM_NAMES.rooms_quantity}
              error={errors[FORM_NAMES.rooms_quantity]?.message}
              placeholder={t('enter_number')}
              type="number"
              inputMode="decimal"
              disabled={disabled}
            />
          </div>
        )}
      </FieldsVerticalGridLayout>
    </Section>
  );
}

HousingInfoSection.defaultProps = defaultProps;
export {HousingInfoSection};
