import React from 'react';
import Section from '../Section';
import {useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import {useQuery} from 'react-query';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {
  COUNTRIES_WITH_STAT,
  COUNTRY_CODES,
  DISABLED_STAT_TYPES,
  STAT_TYPES,
  VALIDATION_STATUSES,
} from '../../../utils/constants';
import {SelectOption} from '../../../utils/types';
import {
  ErrorType,
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import {getCountryCode, getExternalHousingsAsOptions} from '../../../utils/housing';
import {
  useErrorToast,
  useIsFormTouched,
  useIsMounted,
  usePrevious,
} from '../../../utils/hooks';
import ValidationButton from '../ValidationButton';
import Switch, {useSwitchSectionActive} from '../Switch';
import Select from '../Select';
import {InputController} from '../Input';
import {FieldWrapper} from '../../../styled/common';

const STAT_DATA_CACHE_TIME_MIN = 60;
const STAT_DATA_STALE_TIME_MIN = 30;
const STATUS_DISPLAY_TIMEOUT_SEC = 3;
const VALIDATION_REQUESTS_GAP_SEC = 2;
const MIN_BEDS_NUMBER = 0;
const MIN_ROOMS_NUMBER = 0;

type StatType = {
  id: string;
  name: string;
};

function filterStatTypes(statTypes: StatType[]) {
  return statTypes?.filter(
    (type) => !Object.values(DISABLED_STAT_TYPES).includes(type.id),
  );
}

async function fetchAndFilterStatTypes(params = '') {
  const statTypes = await queryFetcher<StatType[]>(
    api.statAccount.ENDPOINTS.types(params),
  );

  return filterStatTypes(statTypes);
}

function fetchStatLocations(params = '') {
  return queryFetcher(api.statAccount.ENDPOINTS.locations(params));
}

type StatData = {
  id: string;
  name: string;
}[];

function getStatDataAsOptions(data?: StatData) {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data?.map((d) => {
    return {
      value: d?.id,
      label: d?.name,
    };
  });
}

export enum FORM_NAMES {
  room_quantity = 'rooms_quantity',
  type = 'type',
  location = 'external_location_id',
  username = 'imminent_threat',
  password = 'burning_crusade',
  beds_quantity = 'beds_quantity',
  external_housing = 'external_housing_id',
  external_housing_manual = 'external_housing_id_manual',
  available_rooms = 'available_rooms',
}

type FormTypes = {
  [FORM_NAMES.username]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.type]: SelectOption | null;
  [FORM_NAMES.location]: SelectOption | null;
  [FORM_NAMES.room_quantity]: string;
  [FORM_NAMES.beds_quantity]: string;
  [FORM_NAMES.external_housing]: SelectOption;
  [FORM_NAMES.external_housing_manual]: string;
  [FORM_NAMES.available_rooms]: string;
};

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.type]: true,
  [FORM_NAMES.username]: true,
  [FORM_NAMES.password]: true,
  [FORM_NAMES.location]: true,
  [FORM_NAMES.room_quantity]: true,
  [FORM_NAMES.beds_quantity]: false,
  [FORM_NAMES.external_housing]: false,
  [FORM_NAMES.external_housing_manual]: false,
  [FORM_NAMES.available_rooms]: false,
};

function getDisplayFields(country: string, statType: string) {

  switch (country) {
    case COUNTRY_CODES.italy: {
      if (statType === STAT_TYPES.abruzzo) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.emiliaRomania) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.lombardia) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.calabria) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.toscanaTuristat) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.lazioRadar) {
        return {
          ...INIT_DISPLAY_FIELDS,
        };
      }
      if (statType === STAT_TYPES.marche) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.piemonte) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.liguria) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.venetto) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.beds_quantity]: true,
        };
      }
      if (statType === STAT_TYPES.campania) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.room_quantity]: false,
        };
      }
      if (statType === DISABLED_STAT_TYPES.siciliaOCR) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.room_quantity]: false,
        };
      }
      if (statType === STAT_TYPES.toscanaRicestat) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.room_quantity]: false,
        };
      }
      if (statType === STAT_TYPES.valtellinaAbit) {
        return {
          ...INIT_DISPLAY_FIELDS,
          [FORM_NAMES.external_housing_manual]: true,
          [FORM_NAMES.room_quantity]: false,
        };
      }
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.external_housing]: true,
      };
    }
    case COUNTRY_CODES.germany: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.room_quantity]: true,
        [FORM_NAMES.beds_quantity]: true,
        [FORM_NAMES.external_housing]: true,
      };
    }
    default: {
      return INIT_DISPLAY_FIELDS;
    }
  }
}

function getExternalFieldName(statType: string) {
  return statType === STAT_TYPES.toscanaRicestat ? 'room' : 'property';
}

function getExternalFieldPlaceholder(statType: string) {
  return statType === STAT_TYPES.toscanaRicestat
    ? 'select_your_room'
    : 'select_your_property';
}

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.type]: i18n.t('required'),
  [FORM_NAMES.location]: i18n.t('required'),
  [FORM_NAMES.username]: i18n.t('required'),
  [FORM_NAMES.password]: i18n.t('required'),
  [FORM_NAMES.room_quantity]: i18n.t('required'),
  [FORM_NAMES.beds_quantity]: i18n.t('required'),
  [FORM_NAMES.external_housing]: i18n.t('required'),
  [FORM_NAMES.external_housing_manual]: i18n.t('required'),
};

function getRequiredFields(country: string, statType: string) {
  switch (country) {
    default: {
      return INIT_REQUIRED_FIELDS;
    }
  }
}

function getFields(country = '', statType = '') {
  const display = getDisplayFields(country, statType);
  const required = getRequiredFields(country, statType);

  return {display, required};
}

type HousingStatConnectionSectionProps = {
  disabled: boolean;
  country: string;
  openIncompleteModal: () => void;
  setIsSectionTouched: (isTouched: boolean) => void;
  housing?: any;
};

const defaultProps: Partial<HousingStatConnectionSectionProps> = {
  country: '',
  disabled: false,
  housing: null,
};

const HousingStatConnectionSection = React.forwardRef(
  (
    {
      country,
      disabled,
      housing,
      openIncompleteModal,
      setIsSectionTouched,
    }: HousingStatConnectionSectionProps,
    ref,
  ) => {
    const {t} = useTranslation();
    const {
      handleSubmit,
      register,
      control,
      watch,
      formState,
      trigger,
      setValue,
      getValues,
      reset,
    } = useForm<FormTypes>({
      shouldFocusError: false,
      shouldUnregister: true,
    });

    const {errors} = formState;

    const prevFormState = usePrevious<typeof formState>(formState);
    const isMounted = useIsMounted();
    const sectionRef = React.useRef(false);
    const statusTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
    const validationTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
    const statType = watch(FORM_NAMES.type)?.value || '';
    const statLocation = watch(FORM_NAMES.location)?.value || '';
    const statUsername = watch(FORM_NAMES.username);
    const statPassword = watch(FORM_NAMES.password);
    const statRoomQuantity = watch(FORM_NAMES.room_quantity);
    const statBedsQuantity = watch(FORM_NAMES.beds_quantity);
    const statAvailableRooms = watch(FORM_NAMES.available_rooms);
    const statExternalHousing = watch(FORM_NAMES.external_housing);
    const statExternalHousingManual = watch(FORM_NAMES.external_housing_manual);

    const {data: statTypes, error: statTypesError} = useQuery(
      ['statTypes', `country=${country}`],
      ({queryKey}) => fetchAndFilterStatTypes(queryKey[1]),
      {
        enabled: Boolean(country),
        cacheTime: STAT_DATA_CACHE_TIME_MIN * 1000 * 60,
        staleTime: STAT_DATA_STALE_TIME_MIN * 1000 * 60,
        refetchOnWindowFocus: false,
      },
    );
    useErrorToast(statTypesError, {
      notFoundMessage: t('errors.requested_stat_types_not_found'),
    });
    const {data: statLocations, error: statLocationsError} = useQuery(
      ['statLocations', `stat_type=${statType}`],
      ({queryKey}) => fetchStatLocations(queryKey[1]),
      {
        enabled: Boolean(statType),
        cacheTime: STAT_DATA_CACHE_TIME_MIN * 1000 * 60,
        staleTime: STAT_DATA_STALE_TIME_MIN * 1000 * 60,
        refetchOnWindowFocus: false,
      },
    );
    useErrorToast(statLocationsError, {
      notFoundMessage: t('errors.requested_stat_locations_not_found'),
    });
    const [validationStatus, setValidationStatus] = React.useState('');
    const [isCountryPreloaded, setIsCountryPreloaded] = React.useState(false);
    const [fields, setFields] = React.useState(() => {
      return getFields(country);
    });
    const [isPreloadedStatType, setIsPreloadedStatType] = React.useState(false);
    const [isPreloadedStatLocation, setIsPreloadedStatLocation] = React.useState(false);
    const [isValidateButtonVisible, setIsValidateButtonVisible] = React.useState(true);
    const [isValidationErrorVisible, setIsValidationErrorVisible] = React.useState(false);
    const [externalHousingsOptions, setExternalHousingsOptions] = React.useState<
      SelectOption[]
    >([]);
    const [statSectionLabel, setStatSectionLabel] = React.useState('');
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      watch,
      displayFields: fields.display,
      debug: true,
    });
    const isValidating = validationStatus === VALIDATION_STATUSES.inProgress;

    const preloadedSectionActive = !!housing?.is_stat_registration_enabled;
    const {
      isSectionActive,
      toggleIsSectionActive,
      setIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(preloadedSectionActive);

    React.useEffect(() => {
      setIsSectionTouched(isFormTouched || isSectionActiveTouched);
    }, [isFormTouched, setIsSectionTouched, isSectionActiveTouched]);

    React.useEffect(() => {
      if (!isValidationErrorVisible) {
        setValidationStatus('');
      }
    }, [isValidationErrorVisible]);

    React.useEffect(() => {
      setIsValidateButtonVisible(true);
      setIsValidationErrorVisible(false);
    }, [
      statType,
      statLocation,
      statUsername,
      statPassword,
      statRoomQuantity,
      statBedsQuantity,
      statAvailableRooms,
      statExternalHousing,
      statExternalHousingManual,
    ]);

    React.useImperativeHandle(ref, () => {
      return {
        getValues,
        submit: submitAndValidate,
        active: sectionRef.current,
      };
    });

    React.useLayoutEffect(
      function showIncompleteModalOneTime() {
        const shouldOpenModal =
          formState.isSubmitted && !prevFormState?.isValid && !formState.isValid;

        if (shouldOpenModal) {
          openIncompleteModal();
        }
      },
      [formState.isSubmitted, formState.isValid, prevFormState, openIncompleteModal],
    );

    React.useEffect(() => {
      if (formState.isSubmitted) {
        trigger();
      }
    }, [fields, formState.isSubmitted, trigger]);

    React.useEffect(() => {
      if (housing?.is_stat_registration_enabled) {
        setIsSectionActive(true);
        sectionRef.current = true;
      }
    }, [housing, setIsSectionActive]);

    React.useEffect(
      function updateFields() {
        const nextFields = getFields(country, statType as string);
        setFields(nextFields);
        setExternalHousingsOptions([]);

        if (country) {
          setIsCountryPreloaded(true);
        }
      },
      [country, statType, setValue],
    );

    React.useEffect(
      function resetOnSectionDisable() {
        if (!isSectionActive) {
          reset();
          if (statusTimeoutRef.current && validationTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            clearTimeout(validationTimeoutRef.current);
          }
          setExternalHousingsOptions([]);
          setIsPreloadedStatType(false);
          setIsPreloadedStatLocation(false);
          setIsCountryPreloaded(false);
        }

        return () => {
          if (statusTimeoutRef.current && validationTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            clearTimeout(validationTimeoutRef.current);
          }
        };
      },
      [isSectionActive, reset],
    );

    React.useEffect(
      function resetStatTypeOnCountryChange() {
        setValue(FORM_NAMES.type, null);
      },
      [country, setValue],
    );

    React.useEffect(
      function resetStatLocationOnNewLocations() {
        if (statLocations && statLocation) {
          const includes = getStatDataAsOptions(statLocations).find((o) => {
            return o?.value === statLocation;
          });

          if (!includes) {
            setValue(FORM_NAMES.location, null);
          }
        }
      },
      [setValue, statLocation, statLocations],
    );

    React.useEffect(
      function setDefaultExternalHousing() {
        const formValues = getValues() as any;
        if (
          !formValues[FORM_NAMES.external_housing]?.value &&
          externalHousingsOptions.length
        ) {
          const initExternalHousingId = housing?.stat_account?.external_housing_id;
          const initExternalHousing = externalHousingsOptions.find((o) => {
            return o?.value === initExternalHousingId;
          });

          setValue(
            FORM_NAMES.external_housing,
            initExternalHousing || externalHousingsOptions[0],
          );
        }
      },
      [externalHousingsOptions, setValue, getValues, housing],
    );

    const resetValidationStatusAfterTimeout = () => {
      statusTimeoutRef.current = setTimeout(() => {
        setValidationStatus('');
      }, STATUS_DISPLAY_TIMEOUT_SEC * 1000);
    };

    const handleValidationError = React.useCallback((error: ErrorType | null = null) => {
      if (error) {
        toastResponseError(error);
      }

      setValidationStatus(VALIDATION_STATUSES.error);
      setIsValidationErrorVisible(true);

      setExternalHousingsOptions([]);
    }, []);

    const hideValidateButtonAfterTimeout = () => {
      statusTimeoutRef.current = setTimeout(() => {
        setIsValidateButtonVisible(false);
      }, STATUS_DISPLAY_TIMEOUT_SEC * 1000);
    };

    const handleValidationSuccess = React.useCallback((data: any) => {
      if (data?.external_housings_data?.length) {
        const options = getExternalHousingsAsOptions(data.external_housings_data);
        setExternalHousingsOptions(options);
      } else {
        setExternalHousingsOptions([]);
      }
      setValidationStatus(VALIDATION_STATUSES.complete);
      resetValidationStatusAfterTimeout();
      hideValidateButtonAfterTimeout();
    }, []);

    const checkStatAccountValidation = React.useCallback(
      async (id = ''): Promise<any> => {
        if (!id) {
          handleValidationError();
          return false;
        }

        const {error, data} = await api.statAccount.checkValidationStatus(id);

        if (isMounted.current && sectionRef.current) {
          if (data?.status === VALIDATION_STATUSES.inProgress) {
            return new Promise((resolve) => {
              validationTimeoutRef.current = setTimeout(() => {
                if (sectionRef.current) {
                  resolve(checkStatAccountValidation(id));
                }
              }, VALIDATION_REQUESTS_GAP_SEC * 1000);
            });
          }

          if (
            data?.status === VALIDATION_STATUSES.complete &&
            data?.is_successful_login
          ) {
            handleValidationSuccess(data);
            return true;
          }

          handleValidationError(error);
        }
        return false;
      },
      [handleValidationError, handleValidationSuccess, isMounted],
    );

    const getValidationPayload = (data: FormTypes) => {
      let always_valid;
      if (data?.[FORM_NAMES.username]?.toLowerCase() === 'test valid') {
        always_valid = true;
      }

      return {
        ...data,
        always_valid,
        [FORM_NAMES.beds_quantity]: undefined,
        [FORM_NAMES.room_quantity]: undefined,
        [FORM_NAMES.external_housing]: undefined,
        [FORM_NAMES.username]: undefined,
        [FORM_NAMES.password]: undefined,
        [FORM_NAMES.location]: data[FORM_NAMES.location]?.value,
        [FORM_NAMES.type]: data[FORM_NAMES.type]?.value,
        username: data?.[FORM_NAMES.username],
        password: data?.[FORM_NAMES.password],
        [FORM_NAMES.available_rooms]: data?.[FORM_NAMES.available_rooms],
        [FORM_NAMES.external_housing]: Object.values(STAT_TYPES).includes(
          data[FORM_NAMES.type]!.value,
        )
          ? data?.[FORM_NAMES.external_housing_manual]
          : data?.[FORM_NAMES.external_housing],
      };
    };

    const validateStatAccount = React.useCallback(async () => {
      const payload = getValidationPayload(getValues() as FormTypes);

      setValidationStatus(VALIDATION_STATUSES.inProgress);
      const {error, data} = await api.statAccount.startValidation(payload);

      if (isMounted.current && sectionRef.current) {
        if (data?.status === VALIDATION_STATUSES.complete && data?.is_successful_login) {
          handleValidationSuccess(data);
          return true;
        }

        if (data?.id) {
          return checkStatAccountValidation(data.id);
        }

        handleValidationError(error);
      }
      return false;
    }, [
      checkStatAccountValidation,
      getValues,
      handleValidationError,
      handleValidationSuccess,
      isMounted,
    ]);

    const getInitStat = React.useCallback(() => {
      const statAccount = housing?.stat_account;
      return [
        {name: FORM_NAMES.username, value: statAccount?.username},
        {name: FORM_NAMES.password, value: statAccount?.password},
        {name: FORM_NAMES.room_quantity, value: String(housing?.rooms_quantity)},
        {name: FORM_NAMES.beds_quantity, value: String(housing?.beds_quantity)},
        {name: FORM_NAMES.available_rooms, value: String(statAccount?.available_rooms)},
        {
          name: FORM_NAMES.external_housing_manual,
          value:
            statAccount?.external_housing_id !== undefined
              ? String(statAccount?.external_housing_id)
              : '',
        },
        {
          name: FORM_NAMES.external_housing,
          value:
            statAccount?.external_housing_id !== undefined
              ? String(statAccount?.external_housing_id)
              : '',
        },
      ];
    }, [housing]);

    const loadInitStat = React.useCallback(() => {
      const isStatActive = housing?.is_stat_registration_enabled;
      const housingCountry = getCountryCode(housing);
      const isStatEnabled = COUNTRIES_WITH_STAT.includes(country);

      if (!isStatActive || !country || housingCountry !== country || !isStatEnabled) {
        return;
      }

      const formData = getInitStat();
      setUntouchedValues((prevState) => {
        let result: {[key: string]: string} = {};

        formData.forEach(({name, value}) => {
          result[name] = value;
        });

        return {
          ...prevState,
          ...result,
        };
      });

      formData.forEach(({name, value}) => {
        setValue(name, value);
      });
    }, [country, getInitStat, housing, setUntouchedValues, setValue]);

    React.useEffect(
      function preload() {
        if (isCountryPreloaded && housing && isSectionActive) {
          loadInitStat();
        }
      },
      [housing, isCountryPreloaded, isSectionActive, loadInitStat],
    );

    React.useEffect(
      function preloadStatType() {
        const canPreload =
          !isPreloadedStatType && statTypes && isSectionActive && isCountryPreloaded;

        if (canPreload) {
          const initStatTypeValue = housing?.stat_account?.type;
          const initStatType = getStatDataAsOptions(statTypes).find((t) => {
            return t?.value === initStatTypeValue;
          });

          if (initStatType) {
            setValue(FORM_NAMES.type, initStatType);
          }
          setIsPreloadedStatType(true);

          const hasExternalHousing = housing?.stat_account?.external_housing_id;
          const hasExternalLocation = housing?.stat_account?.external_location_id;
          if (hasExternalHousing && !hasExternalLocation) {
            validateStatAccount();
          }
        }
      },
      [
        isCountryPreloaded,
        housing,
        isPreloadedStatType,
        setValue,
        statTypes,
        isSectionActive,
        validateStatAccount,
      ],
    );

    React.useEffect(
      function preloadStatLocation() {
        const canPreload =
          !isPreloadedStatLocation &&
          statLocations?.length &&
          isSectionActive &&
          isPreloadedStatType;

        if (canPreload) {
          const initStatLocationValue = housing?.stat_account?.external_location_id;
          const initStatLocation = getStatDataAsOptions(statLocations).find((t) => {
            return t?.value === initStatLocationValue;
          });

          if (initStatLocation) {
            setValue(FORM_NAMES.location, initStatLocation);
          }
          setIsPreloadedStatLocation(true);

          const hasExternalHousing = housing?.stat_account?.external_housing_id;
          if (hasExternalHousing) {
            validateStatAccount();
          }
        }
      },
      [
        validateStatAccount,
        isPreloadedStatType,
        housing,
        setValue,
        isSectionActive,
        isPreloadedStatLocation,
        statLocations,
      ],
    );

    React.useEffect(
      function setLabel() {
        const countryCode = country || housing?.location?.country;
        const label =
          countryCode === COUNTRY_CODES.germany
            ? t('activate_idev_sending')
            : t('activate_stat_sending');
        setStatSectionLabel(label);
      },
      [housing, t, country],
    );

    const toggleSectionActive = () => {
      if (!isSectionActive) {
        setValidationStatus('');
      }

      sectionRef.current = !isSectionActive;

      toggleIsSectionActive();
    };

    const submitAndValidate = async () => {
      let isFormValid = false;

      await handleSubmit(() => {
        isFormValid = true;
      })();

      if (isFormValid) {
        return validateStatAccount();
      }
      return false;
    };

    const onSubmit = async () => {
      await validateStatAccount();
    };

    if (!COUNTRIES_WITH_STAT.includes(country)) {
      return null;
    }

    return (
      <Section
        title={t('stats_connection_title')}
        subtitle={t('stats_connection_subtitle')}
        subtitleTooltip={
          <>
            {t('stat_tooltip_top_content')}
            <p />
            {t('stat_tooltip_bottom_content')}
          </>
        }
      >
        <Switch
          checked={isSectionActive}
          onChange={toggleSectionActive}
          label={statSectionLabel}
          disabled={disabled}
        />
        {isSectionActive && (
          <div>
            {fields.display[FORM_NAMES.type] && (
              <FieldWrapper>
                <Controller
                  control={control}
                  name={FORM_NAMES.type}
                  rules={{required: fields.required[FORM_NAMES.type]}}
                  render={({field, fieldState: {error}}) => {
                    return (
                      <Select
                        label={getRequiredOrOptionalFieldLabel(
                          t('region'),
                          fields.required[FORM_NAMES.type],
                        )}
                        options={getStatDataAsOptions(statTypes)}
                        error={error?.message}
                        disabled={isValidating || disabled}
                        placeholder={t('select_your_region')}
                        {...field}
                      />
                    );
                  }}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.location] && Boolean(statLocations?.length) && (
              <FieldWrapper>
                <Controller
                  control={control}
                  name={FORM_NAMES.location}
                  rules={{required: fields.required[FORM_NAMES.location]}}
                  render={({field, fieldState: {error}}) => {
                    return (
                      <Select
                        label={getRequiredOrOptionalFieldLabel(
                          t('location'),
                          fields.required[FORM_NAMES.location],
                        )}
                        options={getStatDataAsOptions(statLocations)}
                        error={error?.message}
                        disabled={isValidating || disabled}
                        placeholder={t('select_your_location')}
                        {...field}
                      />
                    );
                  }}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.username] && (
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.username, {
                    required: fields.required[FORM_NAMES.username],
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    t('username'),
                    fields.required[FORM_NAMES.username],
                  )}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_username')}
                  error={errors[FORM_NAMES.username]?.message}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.password] && (
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.password, {
                    required: fields.required[FORM_NAMES.password],
                  })}
                  control={control}
                  type="password"
                  label={getRequiredOrOptionalFieldLabel(
                    t('password'),
                    fields.required[FORM_NAMES.password],
                  )}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_password')}
                  error={errors[FORM_NAMES.password]?.message}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.room_quantity] && (
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.room_quantity, {
                    required: fields.required[FORM_NAMES.room_quantity],
                    min: {
                      value: MIN_ROOMS_NUMBER,
                      message: t('min_number_is', {number: MIN_ROOMS_NUMBER}),
                    },
                  })}
                  control={control}
                  inputMode="decimal"
                  type="number"
                  label={getRequiredOrOptionalFieldLabel(
                    t('room_quantity'),
                    fields.required[FORM_NAMES.room_quantity],
                  )}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_room_quantity')}
                  error={errors[FORM_NAMES.room_quantity]?.message}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.beds_quantity] && (
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.beds_quantity, {
                    required: fields.required[FORM_NAMES.beds_quantity],
                    min: {
                      value: MIN_ROOMS_NUMBER,
                      message: t('min_number_is', {number: MIN_BEDS_NUMBER}),
                    },
                  })}
                  control={control}
                  type="number"
                  inputMode="decimal"
                  label={getRequiredOrOptionalFieldLabel(
                    t('beds_quantity'),
                    fields.required[FORM_NAMES.beds_quantity],
                  )}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_beds_quantity')}
                  error={errors[FORM_NAMES.beds_quantity]?.message}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.external_housing] &&
              Boolean(externalHousingsOptions.length) && (
                <FieldWrapper>
                  <Controller
                    control={control}
                    name={FORM_NAMES.external_housing}
                    rules={{
                      required: fields.required[FORM_NAMES.external_housing],
                    }}
                    render={({field, fieldState: {error}}) => {
                      return (
                        <Select
                          options={externalHousingsOptions}
                          label={getRequiredOrOptionalFieldLabel(
                            t(getExternalFieldName(statType.toString())),
                            fields.required[FORM_NAMES.external_housing],
                          )}
                          error={error?.message}
                          disabled={isValidating || disabled}
                          placeholder={t(
                            getExternalFieldPlaceholder(statType.toString()),
                          )}
                          {...field}
                        />
                      );
                    }}
                  />
                </FieldWrapper>
              )}
            {fields.display[FORM_NAMES.external_housing_manual] && (
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.external_housing_manual, {
                    required: fields.required[FORM_NAMES.external_housing_manual],
                  })}
                  control={control}
                  label={getRequiredOrOptionalFieldLabel(
                    'Codice Struttura',
                    fields.required[FORM_NAMES.external_housing_manual],
                  )}
                  disabled={isValidating || disabled}
                  placeholder={'Inserisci il codice Struttura'}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.available_rooms] && (
              <FieldWrapper>
                <InputController
                  {...register(FORM_NAMES.available_rooms, {
                    min: {
                      value: MIN_ROOMS_NUMBER,
                      message: t('min_number_is', {number: MIN_BEDS_NUMBER}),
                    },
                  })}
                  control={control}
                  type="number"
                  label={getRequiredOrOptionalFieldLabel('Camere disponibili', false)}
                  disabled={isValidating || disabled}
                  placeholder={
                    'Inserisci il numero di camere disponibili in totale nella struttura'
                  }
                  error={errors[FORM_NAMES.beds_quantity]?.message}
                />
              </FieldWrapper>
            )}
            {isValidateButtonVisible && (
              <ValidationButton
                secondary
                type="button"
                errorMessage={t('connection_validation_error')}
                disabled={Boolean(validationStatus) || disabled}
                status={validationStatus}
                onClick={handleSubmit(onSubmit)}
              />
            )}
          </div>
        )}
      </Section>
    );
  },
);

HousingStatConnectionSection.defaultProps = defaultProps;
export {HousingStatConnectionSection};
