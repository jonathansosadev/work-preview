import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import api from '../../../api';
import i18n from '../../../i18n';
import {SelectOption} from '../../../utils/types';
import {
  ErrorType,
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import {getCountryCode, getExternalHousingsAsOptions} from '../../../utils/housing';
import {
  useIsFormTouched,
  useIsMounted,
  useModalControls,
  usePrevious,
} from '../../../utils/hooks';
import {
  COUNTRY_CODES,
  POLICE_CODES,
  POLICE_TYPES,
  POLICE_TYPES_OF_DOCUMENT,
  VALIDATION_STATUSES,
} from '../../../utils/constants';
import Input from '../Input';
import Select from '../Select';
import Section from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import ValidationButton from '../ValidationButton';
import FormValueController from '../FormValueController';
import {FieldWrapper} from '../../../styled/common';
import {TitleLink, StyledTooltip} from './styled';
import {PoliceCustomFormWarningModal} from './PoliceCustomFormWarningModal/PoliceCustomFormWarningModal';
import Tooltip from '../Tooltip';

const statusDisplayTimeoutSec = 3;
const validationRequestsGapSec = 4;
const policeAccountInfoLink = 'https://chekin.io/en/blog/host-registration/';

export enum FORM_NAMES {
  type = 'type',
  username = 'peaceful_paper',
  password = 'tomb_raider',
  external_housing = 'external_housing',
  external_id = 'external_id',
  type_of_document = 'username_type',
  certificate_password = 'certificate_password',
  establishment_number = 'establishment_number',
  service_key = 'service_key',
}

type FormTypes = {
  [FORM_NAMES.type]: SelectOption | null;
  [FORM_NAMES.username]: string;
  [FORM_NAMES.password]: string;
  [FORM_NAMES.certificate_password]: string;
  [FORM_NAMES.establishment_number]: string;
  [FORM_NAMES.type_of_document]: SelectOption;
  [FORM_NAMES.external_housing]?: SelectOption | null;
  [FORM_NAMES.external_id]: string;
  [FORM_NAMES.service_key]: string;
};

const initDisplayFields = {
  [FORM_NAMES.type]: true,
  [FORM_NAMES.username]: true,
  [FORM_NAMES.password]: true,
  [FORM_NAMES.external_housing]: false,
  [FORM_NAMES.certificate_password]: false,
  [FORM_NAMES.establishment_number]: false,
  [FORM_NAMES.type_of_document]: false,
  [FORM_NAMES.external_id]: false,
  [FORM_NAMES.service_key]: false,
};

const defaultFormValues = {
  [FORM_NAMES.external_housing]: '',
};

function getDisplayFields(country: string, policeType: string) {
  switch (country) {
    case COUNTRY_CODES.colombia: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.external_housing]: true,
        [FORM_NAMES.type_of_document]: true,
      };
    }
    case COUNTRY_CODES.italy: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.external_housing]: true,
        [FORM_NAMES.service_key]: true,
      };
    }
    case COUNTRY_CODES.portugal: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.establishment_number]: true,
      };
    }
    case COUNTRY_CODES.uae: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.external_housing]: true,
      };
    }
    case COUNTRY_CODES.spain: {
      if (policeType === POLICE_CODES.nationalPolice) {
        return {
          ...initDisplayFields,
          [FORM_NAMES.external_housing]: true,
        };
      }
      return initDisplayFields;
    }
    case COUNTRY_CODES.czech: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.external_housing]: true,
      };
    }
    case COUNTRY_CODES.austria: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.password]: false,
        [FORM_NAMES.external_id]: true,
      };
    }
    case COUNTRY_CODES.croatia:
    case COUNTRY_CODES.slovenia: {
      return {
        ...initDisplayFields,
        [FORM_NAMES.external_id]: true,
      };
    }
    case COUNTRY_CODES.switzerland: {
      return {
        ...initDisplayFields,
      };
    }
    default: {
      return initDisplayFields;
    }
  }
}

const initRequiredFields = {
  [FORM_NAMES.type]: i18n.t('required'),
  [FORM_NAMES.username]: i18n.t('required'),
  [FORM_NAMES.password]: i18n.t('required'),
  [FORM_NAMES.external_housing]: i18n.t('required'),
  [FORM_NAMES.certificate_password]: i18n.t('required'),
  [FORM_NAMES.establishment_number]: i18n.t('required'),
  [FORM_NAMES.type_of_document]: i18n.t('required'),
  [FORM_NAMES.external_id]: i18n.t('required'),
  [FORM_NAMES.service_key]: i18n.t('required'),
};

function getRequiredFields(country: string, policeType: string) {
  switch (country) {
    default: {
      return initRequiredFields;
    }
  }
}

function getFields(country = '', policeType = '') {
  const display = getDisplayFields(country, policeType);
  const required = getRequiredFields(country, policeType);

  return {display, required};
}

type HousingPoliceConnectionSectionProps = {
  country: string;
  disabled: boolean;
  housing?: any;
  hasCustomForm?: boolean;
  openIncompleteModal: () => void;
  setIsSectionTouched: (isTouched: boolean) => void;
  setIsPoliceSectionActive: (isActive: boolean) => void;
};

const defaultProps: Partial<HousingPoliceConnectionSectionProps> = {
  country: '',
  disabled: false,
  housing: null,
};

const HousingPoliceConnectionSection = React.forwardRef<
  unknown,
  HousingPoliceConnectionSectionProps
>(
  (
    {
      country,
      disabled,
      housing,
      hasCustomForm,
      openIncompleteModal,
      setIsSectionTouched,
      setIsPoliceSectionActive,
    },
    ref,
  ) => {
    const {t} = useTranslation();
    const {
      handleSubmit,
      register,
      getValues,
      control,
      formState,
      reset,
      trigger,
      setValue,
      watch,
    } = useForm<FormTypes>({
      shouldFocusError: false,
      shouldUnregister: true,
    });

    const {errors} = formState;

    const {isSubmitted, isValid, isSubmitSuccessful} = formState;
    const prevIsValid = usePrevious<boolean>(isValid);
    const isMounted = useIsMounted();
    const statusTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
    const validationTimeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
    const sectionRef = React.useRef(false);
    const [fields, setFields] = React.useState(() => {
      return getFields(country);
    });
    const [isPreloaded, setIsPreloaded] = React.useState(false);
    const [validationStatus, setValidationStatus] = React.useState('');
    const [isCountryPreloaded, setIsCountryPreloaded] = React.useState(false);
    const [isValidateButtonVisible, setIsValidateButtonVisible] = React.useState(true);
    const [isValidationErrorVisible, setIsValidationErrorVisible] = React.useState(false);
    const [isExternalHousingPreloaded, setIsExternalHousingPreloaded] = React.useState(
      false,
    );
    const [externalHousingsOptions, setExternalHousingsOptions] = React.useState<
      SelectOption[]
    >([]);
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      defaultValues: defaultFormValues,
      displayFields: fields.display,
      watch,
    });
    const isValidating = validationStatus === VALIDATION_STATUSES.inProgress;
    const policeType = watch(FORM_NAMES.type)?.value;
    const policeUsername = watch(FORM_NAMES.username);
    const policePassword = watch(FORM_NAMES.password);
    const policeExternalId = watch(FORM_NAMES.external_id);
    const policeExternalHousing = watch(FORM_NAMES.external_housing)?.value;
    const policeTypeOfDocument = watch(FORM_NAMES.type_of_document)?.value;
    const policeCertificatePassword = watch(FORM_NAMES.certificate_password);
    const policeEstablishmentNumber = watch(FORM_NAMES.establishment_number);
    const policeServiceKey = watch(FORM_NAMES.service_key);
    const policeTypeOptions = POLICE_TYPES[country];

    const preloadedSectionActive = !!housing?.is_auto_police_registration_enabled;
    const {
      isSectionActive,
      toggleIsSectionActive,
      setIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(preloadedSectionActive);

    const {
      isOpen: isWarningDeleteCustomFormModalOpen,
      closeModal: closeWarningDeleteCustomFormModal,
      openModal: openWarningDeleteCustomFormModal,
    } = useModalControls();

    React.useImperativeHandle(ref, () => {
      return {
        getValues,
        submit: submitAndValidate,
        reset: () => {
          setIsExternalHousingPreloaded(false);
          setIsPreloaded(false);
        },
        active: sectionRef.current,
      };
    });

    React.useEffect(
      function syncLocalStateWithParentState() {
        setIsPoliceSectionActive(isSectionActive);
      },
      [isSectionActive, setIsPoliceSectionActive],
    );

    React.useEffect(() => {
      setIsSectionTouched(isFormTouched || isSectionActiveTouched);
    }, [setIsSectionTouched, isFormTouched, isSectionActiveTouched]);

    React.useEffect(() => {
      if (!isValidationErrorVisible) {
        setValidationStatus('');
      }
    }, [isValidationErrorVisible]);

    React.useEffect(() => {
      if (statusTimeoutRef.current) {
        clearTimeout(statusTimeoutRef.current);
      }

      setIsValidateButtonVisible(true);
      setIsValidationErrorVisible(false);
    }, [
      policeType,
      policeUsername,
      policePassword,
      policeExternalHousing,
      policeTypeOfDocument,
      policeCertificatePassword,
      policeEstablishmentNumber,
      policeExternalId,
    ]);

    React.useLayoutEffect(
      function showIncompleteModalOneTime() {
        const shouldOpenModal =
          isSubmitted && !prevIsValid && !isValid && !isSubmitSuccessful;

        if (shouldOpenModal) {
          openIncompleteModal();
        }
      },
      [isSubmitted, isValid, prevIsValid, openIncompleteModal, isSubmitSuccessful],
    );

    React.useEffect(() => {
      if (formState.isSubmitted) {
        trigger();
      }
    }, [fields, formState.isSubmitted, trigger]);

    React.useEffect(() => {
      if (housing?.is_auto_police_registration_enabled) {
        setIsSectionActive(true);
        sectionRef.current = true;
      }
    }, [housing, setIsSectionActive]);

    React.useEffect(() => {
      if (!isSectionActive) {
        setIsPreloaded(false);
      }
    }, [isSectionActive]);

    const resetValidationStatusAfterTimeout = () => {
      statusTimeoutRef.current = setTimeout(() => {
        setValidationStatus('');
      }, statusDisplayTimeoutSec * 1000);
    };

    const handleValidationError = React.useCallback((error?: ErrorType) => {
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
      }, statusDisplayTimeoutSec * 1000);
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

    const checkPoliceAccountValidation = React.useCallback(
      async (id = ''): Promise<any> => {
        if (!id) {
          handleValidationError();
          return false;
        }
        
        const {error, data} = await api.policeAccount.checkValidationStatus(id);

        if (isMounted.current && sectionRef.current) {
          if (data?.status === VALIDATION_STATUSES.inProgress) {
            return new Promise((resolve) => {
              validationTimeoutRef.current = setTimeout(() => {
                if (sectionRef.current) {
                  resolve(checkPoliceAccountValidation(id));
                }
              }, validationRequestsGapSec * 1000);
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
        type_of_document: undefined,
        [FORM_NAMES.username]: undefined,
        [FORM_NAMES.password]: undefined,
        username: data?.[FORM_NAMES.username],
        password: data?.[FORM_NAMES.password],
        username_type: data[FORM_NAMES.type_of_document]?.value,
        type: data[FORM_NAMES.type]?.value,
      };
    };

    const validatePoliceAccount = React.useCallback(async () => {
      const payload = getValidationPayload(getValues() as FormTypes);
      setValidationStatus(VALIDATION_STATUSES.inProgress);
      const {error, data} = await api.policeAccount.startValidation(payload);

      if (isMounted.current && sectionRef.current) {
        if (data?.status === VALIDATION_STATUSES.complete && data?.is_successful_login) {
          handleValidationSuccess(data);
          return true;
        }

        if (data?.id) {
          return checkPoliceAccountValidation(data.id);
        }

        handleValidationError(error);
      }
      return false;
    }, [
      checkPoliceAccountValidation,
      getValues,
      handleValidationError,
      handleValidationSuccess,
      isMounted,
    ]);

    const getInitPolice = React.useCallback(() => {
      const policeAccount = housing?.police_account;
      const policeType = policeTypeOptions?.find((t) => {
        return t.value === policeAccount?.type;
      });
      const typeOfDocument = POLICE_TYPES_OF_DOCUMENT[country]?.find((t) => {
        return t?.value === policeAccount?.username_type;
      });

      return [
        {
          name: FORM_NAMES.certificate_password,
          value: policeAccount?.certificate_password,
        },
        {name: FORM_NAMES.username, value: policeAccount?.username},
        {name: FORM_NAMES.password, value: policeAccount?.password},
        {
          name: FORM_NAMES.establishment_number,
          value: policeAccount?.establishment_number,
        },
        {name: FORM_NAMES.type, value: policeType},
        {name: FORM_NAMES.type_of_document, value: typeOfDocument},
        {name: FORM_NAMES.external_id, value: policeAccount?.external_id},
        {name: FORM_NAMES.service_key, value: policeAccount?.service_key},
      ];
    }, [country, housing, policeTypeOptions]);

    const loadInitPolice = React.useCallback(() => {
      const hasPoliceAccount = Boolean(housing?.police_account);
      const housingCountry = getCountryCode(housing);
      const isPoliceEnabled = POLICE_TYPES[country];

      if (
        !hasPoliceAccount ||
        !country ||
        housingCountry !== country ||
        !isPoliceEnabled
      ) {
        return;
      }

      const formData = getInitPolice();

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

      const hasExternalHousing = housing?.police_account?.external_id;
      if (hasExternalHousing) {
        validatePoliceAccount();
      }
    }, [
      country,
      getInitPolice,
      housing,
      setUntouchedValues,
      setValue,
      validatePoliceAccount,
    ]);

    const loadExternalHousing = React.useCallback(() => {
      const id = housing?.police_account?.external_id;
      const externalHousing = externalHousingsOptions.find((option) => {
        return option.value === id;
      });
      setValue(FORM_NAMES.external_housing, externalHousing);
      setUntouchedValues((prev) => {
        return {...prev, [FORM_NAMES.external_housing]: externalHousing};
      });
    }, [
      externalHousingsOptions,
      housing?.police_account?.external_id,
      setUntouchedValues,
      setValue,
    ]);

    React.useEffect(
      function preloadData() {
        if (!isPreloaded && isSectionActive && isCountryPreloaded) {
          loadInitPolice();
          setIsPreloaded(true);
        }
      },
      [isCountryPreloaded, isPreloaded, loadInitPolice, isSectionActive],
    );

    React.useEffect(
      function updateFields() {
        const nextFields = getFields(country, policeType?.toString());
        setFields(nextFields);
        setExternalHousingsOptions([]);

        if (country) {
          setIsCountryPreloaded(true);
        }
      },
      [country, setValue, policeType],
    );

    React.useEffect(
      function keepCorrectPoliceTypeSelection() {
        if (!policeType || !policeTypeOptions?.length) {
          return;
        }

        const hasOption = policeTypeOptions.find((option) => {
          return option.value === policeType;
        });
        if (!hasOption) {
          setValue(FORM_NAMES.type, null);
        }
      },
      [policeType, policeTypeOptions, setValue],
    );

    React.useEffect(
      function preloadExternalHousing() {
        const canPreload =
          !isExternalHousingPreloaded &&
          isPreloaded &&
          isSectionActive &&
          isCountryPreloaded &&
          externalHousingsOptions.length;

        if (canPreload) {
          loadExternalHousing();
          setIsExternalHousingPreloaded(true);
        }
      },
      [
        externalHousingsOptions.length,
        isCountryPreloaded,
        isExternalHousingPreloaded,
        isPreloaded,
        isSectionActive,
        loadExternalHousing,
      ],
    );

    React.useEffect(
      function setDefaultExternalHousing() {
        const formValues = getValues() as any;

        if (
          formValues[FORM_NAMES.external_housing]?.value &&
          externalHousingsOptions.length
        ) {
          const value = housing?.police_account?.external_id;
          const label = housing?.police_account?.external_name;

          const initExternalHousing = value && label && {value, label};
          const selectedExternalHousing = formValues[FORM_NAMES.external_housing]?.value;

          const hasOption = externalHousingsOptions.find((option) => {
            if (selectedExternalHousing) {
              return option.value === selectedExternalHousing;
            }

            return option.value === value;
          });

          if (!hasOption) {
            setValue(
              FORM_NAMES.external_housing,
              initExternalHousing || externalHousingsOptions[0],
            );
          }
        }
      },
      [housing, externalHousingsOptions, setValue, getValues],
    );

    React.useEffect(
      function resetOnSectionDisable() {
        if (!isSectionActive) {
          if (statusTimeoutRef.current && validationTimeoutRef.current) {
            clearTimeout(statusTimeoutRef.current);
            clearTimeout(validationTimeoutRef.current);
          }
          reset();
          setExternalHousingsOptions([]);
          setIsExternalHousingPreloaded(false);
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

    const toggleSectionActive = (active: boolean) => {
      if (!active) {
        setValidationStatus('');
      }

      const isNeedShowWarningDeleteCustomFormModal =
        !preloadedSectionActive && hasCustomForm && active;

      if (isNeedShowWarningDeleteCustomFormModal) {
        openWarningDeleteCustomFormModal();
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
        return validatePoliceAccount();
      }
      return false;
    };

    const onSubmit = async () => {
      await validatePoliceAccount();
    };

    if (!POLICE_TYPES[country]) {
      return null;
    }

    const getTooltipForAustria = () => {
      if (country === COUNTRY_CODES.austria) {
        return (
          <>
            <b>{t('important_lower')}:</b>&nbsp;
            <Trans i18nKey="automatically_send_info_tooltip" values={{code: 'VTCH3K1N'}}>
              To connect your Feratel account with Chekin, you have to provide our company
              code "<b>VTCH3K1N</b>" to your local office
            </Trans>
          </>
        );
      }
      return null;
    }; 

    const getServiceKeyTooltip = () => {
      return (
        <Tooltip content= {
            <Trans i18nKey="service_key_description">
              Where I can find this info? Log in to your Alloggiati account and click on the account name at the top right. From here, click on "<b>Chiave Web Service</b>": if you already have the code then copy and paste it here; otherwise click on the \"Genera Nuovo Codice\" option and once the code is generated enter it in this field.
            </Trans>
          }
        />
      )
    }; 

    return (
      <Section
        title={
          <>
            {t('police_connection_title')}
            <TitleLink href={policeAccountInfoLink} target="_blank">
              ({t('dont_have_police_acc_yet')})
            </TitleLink>
          </>
        }
        subtitle={t('police_connection_subtitle')}
        subtitleTooltip={
          <>
            {t('police_tooltip_top_content')}
            <p />
            {t('police_tooltip_bottom_content')}
          </>
        }
      >
        <Switch
          checked={isSectionActive}
          onChange={toggleSectionActive}
          label={t('activate_police_sending')}
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
                          t('automatically_send_info_to'),
                          fields.required[FORM_NAMES.type],
                        )}
                        tooltip={getTooltipForAustria()}
                        error={error?.message}
                        disabled={isValidating || disabled}
                        placeholder={t('select_your_type')}
                        options={POLICE_TYPES[country]}
                        {...field}
                      />
                    );
                  }}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.type_of_document] && (
              <FieldWrapper>
                <Controller
                  control={control}
                  name={FORM_NAMES.type_of_document}
                  rules={{required: fields.required[FORM_NAMES.type_of_document]}}
                  render={({field, fieldState: {error}}) => {
                    return (
                      <Select
                        options={POLICE_TYPES_OF_DOCUMENT[country]}
                        label={getRequiredOrOptionalFieldLabel(
                          t('type_of_document'),
                          fields.required[FORM_NAMES.type_of_document],
                        )}
                        error={error?.message}
                        disabled={isValidating || disabled}
                        placeholder={t('select_your_type')}
                        {...field}
                      />
                    );
                  }}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.username] && (
              <FieldWrapper>
                <Input
                  {...register(FORM_NAMES.username, {
                    required: fields.required[FORM_NAMES.username],
                  })}
                  label={getRequiredOrOptionalFieldLabel(
                    country === COUNTRY_CODES.colombia
                      ? t('document_number')
                      : country === COUNTRY_CODES.austria
                      ? t('community_number')
                      : t('police_username'),
                    fields.required[FORM_NAMES.username],
                  )}
                  empty={!Boolean(policeUsername)}
                  placeholder={
                    country === COUNTRY_CODES.colombia ||
                    country === COUNTRY_CODES.austria
                      ? t('enter_number')
                      : t('enter_username')
                  }
                  tooltip={
                    country === COUNTRY_CODES.austria ? (
                      <StyledTooltip content={'Gemeinde'} />
                    ) : null
                  }
                  disabled={isValidating || disabled}
                  error={errors[FORM_NAMES.username]?.message}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.password] && (
              <FieldWrapper>
                <Input
                  {...register(FORM_NAMES.password, {
                    required: fields.required[FORM_NAMES.password],
                  })}
                  type="password"
                  empty={!Boolean(policePassword)}
                  label={getRequiredOrOptionalFieldLabel(
                    t('police_password'),
                    fields.required[FORM_NAMES.password],
                  )}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_password')}
                  error={errors[FORM_NAMES.password]?.message}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.certificate_password] && (
              <FieldWrapper>
                <FormValueController
                  name={FORM_NAMES.certificate_password}
                  control={control}
                >
                  {(isEmpty) => (
                    <Input
                      empty={isEmpty}
                      {...register(FORM_NAMES.certificate_password, {
                        required: fields.required[FORM_NAMES.certificate_password],
                      })}
                      type="password"
                      // empty={!Boolean(policeCertificatePassword)}
                      label={getRequiredOrOptionalFieldLabel(
                        t('certificate_password'),
                        fields.required[FORM_NAMES.certificate_password],
                      )}
                      disabled={isValidating || disabled}
                      placeholder={t('enter_certificate_password')}
                      error={errors[FORM_NAMES.certificate_password]?.message}
                    />
                  )}
                </FormValueController>
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.establishment_number] && (
              <FieldWrapper>
                <Input
                  {...register(FORM_NAMES.establishment_number, {
                    required: fields.required[FORM_NAMES.establishment_number],
                  })}
                  type="text"
                  label={getRequiredOrOptionalFieldLabel(
                    t('establishment_number'),
                    fields.required[FORM_NAMES.establishment_number],
                  )}
                  empty={!Boolean(policeEstablishmentNumber)}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_establishment_number')}
                  error={errors[FORM_NAMES.establishment_number]?.message}
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
                            t('property'),
                            fields.required[FORM_NAMES.external_housing],
                          )}
                          error={error?.message}
                          disabled={isValidating || disabled}
                          placeholder={t('select_your_property')}
                          {...field}
                        />
                      );
                    }}
                  />
                </FieldWrapper>
              )}
            {fields.display[FORM_NAMES.external_id] && (
              <FieldWrapper>
                <Input
                  {...register(FORM_NAMES.external_id, {
                    required: fields.required[FORM_NAMES.external_id],
                  })}
                  label={getRequiredOrOptionalFieldLabel(
                    country === COUNTRY_CODES.austria
                      ? t('mapping_code')
                      : t('external_id'),
                    fields.required[FORM_NAMES.external_id],
                  )}
                  empty={!Boolean(policeExternalId)}
                  placeholder={
                    country === COUNTRY_CODES.austria
                      ? t('enter_code')
                      : t('enter_external_id')
                  }
                  tooltip={
                    country === COUNTRY_CODES.austria ? (
                      <StyledTooltip content={'Objektcode'} />
                    ) : null
                  }
                  error={errors[FORM_NAMES.external_id]?.message}
                  disabled={isValidating || disabled}
                />
              </FieldWrapper>
            )}
            {fields.display[FORM_NAMES.service_key] && (
              <FieldWrapper>
                <Input
                  {...register(FORM_NAMES.service_key, {
                    required: fields.required[FORM_NAMES.service_key],
                  })}
                  label={t('service_key')}
                  empty={!Boolean(policeServiceKey)}
                  disabled={isValidating || disabled}
                  placeholder={t('enter_service_key')}
                  error={errors[FORM_NAMES.service_key]?.message}
                  tooltip={getServiceKeyTooltip()}
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
        <PoliceCustomFormWarningModal
          open={isWarningDeleteCustomFormModalOpen}
          onClose={closeWarningDeleteCustomFormModal}
          onComplete={toggleIsSectionActive}
        />
      </Section>
    );
  },
);

HousingPoliceConnectionSection.defaultProps = defaultProps;
export {HousingPoliceConnectionSection};
