import React from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Controller, useFieldArray, useForm, useWatch} from 'react-hook-form';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {getRequiredOrOptionalFieldLabel, toastResponseError} from '../../../utils/common';
import {LANGUAGE_OPTIONS, PATTERNS} from '../../../utils/constants';
import {CustomField, LanguageOption} from 'utils/types';
import {buildCustomFieldOption, LocationState} from '../CustomForm/CustomForm';
import {
  useErrorModal,
  useIsMounted,
  useModalControls,
  useSuccessModal,
} from '../../../utils/hooks';
import {FIELD_TYPES} from '../../../utils/guestFields';
import i18n from '../../../i18n';
import api from '../../../api';
import plusIcon from '../../../assets/plus-icon.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import ModalButton from '../ModalButton';
import Modal, {baseContentStyle} from '../Modal';
import Select from '../Select';
import Button from '../Button';
import Section from '../Section';
import {InputController} from '../Input';
import {Header, SaveButton} from '../CustomForm/styled';
import {
  AnotherLanguageButtonWrapper,
  ModalTwoButtonsWrapperStyled,
  FieldsContainer,
  FieldsGroup,
  FieldWrapper,
  Main,
} from './styled';

const LANGUAGE_FIELDS_NUMBER = 2;
const MIN_FIELDS_NUMBER = 1;
const FIELD_TYPES_OPTIONS = [
  {
    value: FIELD_TYPES.text,
    label: i18n.t('text'),
  },
  {
    value: FIELD_TYPES.date,
    label: i18n.t('date'),
  },
  {
    value: FIELD_TYPES.time,
    label: i18n.t('time'),
  },
  {
    value: FIELD_TYPES.file,
    label: i18n.t('file_uploader'),
  },
];

export const FIELD_TYPES_WITHOUT_PLACEHOLDERS = [FIELD_TYPES.date];

enum FORM_NAMES {
  type = 'field_type',
  name = 'name',
  language = 'language',
  names = 'names',
  placeholder = 'placeholder',
}

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.name]: true,
  [FORM_NAMES.type]: true,
  [FORM_NAMES.language]: true,
  [FORM_NAMES.placeholder]: false,
};

function getDisplayFields(fieldType?: FIELD_TYPES) {
  if (!fieldType) {
    return INIT_DISPLAY_FIELDS;
  }

  if (FIELD_TYPES_WITHOUT_PLACEHOLDERS.includes(fieldType)) {
    return {
      ...INIT_DISPLAY_FIELDS,
      [FORM_NAMES.placeholder]: false,
    };
  }

  return {...INIT_DISPLAY_FIELDS, [FORM_NAMES.placeholder]: true};
}

type FormTypes = {
  [FORM_NAMES.type]: {
    value: FIELD_TYPES;
    label: string;
  };
  [FORM_NAMES.name]: string;
  [FORM_NAMES.names]: {
    [FORM_NAMES.name]: string;
    [FORM_NAMES.placeholder]: string;
    [FORM_NAMES.language]: LanguageOption | null;
  }[];
};

function CustomFieldForm() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const queryClient = useQueryClient();
  const {reservationId, id} = useParams<{reservationId: string; id: string}>();
  const {ErrorModal, displayError} = useErrorModal();
  const {SuccessModal, displaySuccess} = useSuccessModal();
  const [languageOptions, setLanguageOptions] = React.useState(LANGUAGE_OPTIONS);
  const [displayFields, setDisplayFields] = React.useState(() => {
    return getDisplayFields();
  });
  const [createdField, setCreatedField] = React.useState<CustomField | null>(null);
  const {
    control,
    register,
    reset,
    handleSubmit,
    getValues,
    watch,
    trigger,
    formState,
  } = useForm<FormTypes>({
    defaultValues: {
      [FORM_NAMES.names]: [
        {
          [FORM_NAMES.name]: '',
          [FORM_NAMES.placeholder]: '',
          [FORM_NAMES.language]: null,
        },
      ],
    },
    shouldUnregister: true,
  });

  const {isSubmitted, errors} = formState;
  const {fields, append} = useFieldArray({control, name: FORM_NAMES.names});
  const watchField = useWatch({
    control,
    name: FORM_NAMES.names,
  });
  const isAddLanguageButtonDisabled = LANGUAGE_OPTIONS.length === fields.length;
  const fieldType = watch(FORM_NAMES.type)?.value;
  const controlledFields = fields.map((field, index) => {
    return {
      ...field,
      ...watchField[index],
    };
  });

  const {
    isOpen: isWarningModalOpen,
    openModal: openWarningModal,
    closeModal: closeWarningModal,
  } = useModalControls();

  const {data: customField, isLoading: isLoadingCustomField} = useQuery<
    CustomField,
    Error
  >(api.guestCustomForm.ENDPOINTS.oneField(id), {
    enabled: !!id,
    refetchOnWindowFocus: false,
    onError: (error) => {
      if (error && isMounted.current) {
        toastResponseError(error);
      }
    },
  });
  const isUpdateField = Boolean(customField?.id && id);

  const {mutate: customFieldMutation, isLoading: isLoadingMutation} = useMutation<
    CustomField,
    Error,
    Partial<CustomField>
  >((payload) => api.guestCustomForm.customFieldMutation(payload, customField?.id), {
    onError: (error) => {
      if (error && isMounted.current) {
        displayError(error);
      }
    },
    onSuccess: (data) => {
      const successMessage = isUpdateField
        ? t('custom_field_has_been_updated')
        : t('custom_field_has_been_added');
      displaySuccess(successMessage);
      setCreatedField(data);
      if (isUpdateField) return;
      queryClient.setQueryData<CustomField[]>('customFields', (prevData) => {
        if (!prevData) {
          return [data];
        }
        return [...prevData, data];
      });
    },
  });

  const isLoading = isLoadingCustomField || isLoadingMutation;

  React.useEffect(() => {
    if (isUpdateField) {
      const type = FIELD_TYPES_OPTIONS.find(
        (option) => option.value === customField?.field_type,
      );
      const placeholders = customField?.placeholders.reduce((acc, placeholder) => {
        const [language, description] = Object.entries(placeholder).flat();
        acc[language] = description;
        return acc;
      }, {});

      const fields = customField?.names?.map((nameObj) => {
        const [language, name] = Object.entries(nameObj).flat();
        const languageOption = LANGUAGE_OPTIONS.find(
          (option) => option.iso2 === language,
        );

        return {
          [FORM_NAMES.name]: name,
          [FORM_NAMES.language]: languageOption,
          [FORM_NAMES.placeholder]: placeholders?.[language],
        };
      });

      const languageCodes = fields?.map((singleField) => singleField.language?.value);

      reset({
        [FORM_NAMES.type]: type,
        [FORM_NAMES.names]: fields,
      });

      setLanguageOptions((prevState) => {
        const newState = prevState
          .filter((language) => {
            return !languageCodes?.includes(language.value);
          })
          .sort((a, b) => {
            return a.value.localeCompare(b.value);
          });

        return newState;
      });
    }
  }, [customField, isUpdateField, reset]);

  const isFieldsAddingDisabled = React.useMemo(() => {
    if (!controlledFields) return true;

    const filledFields = Object.values(controlledFields)
      .filter((field) => {
        return field[FORM_NAMES.name] && field[FORM_NAMES.language];
      })
      .map((field) => {
        return [field[FORM_NAMES.name], field[FORM_NAMES.language]];
      })
      .flat();

    const isNoEmptyAddedFields =
      fields.length !== MIN_FIELDS_NUMBER &&
      Math.floor(filledFields.length) / LANGUAGE_FIELDS_NUMBER !== fields.length;

    return isNoEmptyAddedFields;
  }, [fields, controlledFields]);

  React.useEffect(() => {
    const nextDisplayFields = getDisplayFields(fieldType);
    setDisplayFields(nextDisplayFields);
  }, [fieldType]);

  React.useEffect(() => {
    if (isSubmitted && fieldType) {
      trigger();
    }
  }, [isSubmitted, fieldType, trigger, displayFields]);

  const injectCreatedFieldToFields = () => {
    const {fields, targetCustomFieldIndex} = location.state;
    const nextFields = [...fields];

    if (fields.length && targetCustomFieldIndex !== undefined && createdField) {
      const nextCustomField = buildCustomFieldOption(createdField);

      const [targetField] = nextFields.splice(targetCustomFieldIndex, 1);
      nextFields.splice(targetCustomFieldIndex, 0, {
        ...targetField,
        label: nextCustomField.label,
        placeholder: nextCustomField.data.placeholder,
        type: createdField?.field_type,
        id: createdField?.id,
        value: createdField?.id,
      });
    }

    return nextFields;
  };

  const goBackWithTheUpdatedFields = () => {
    const nextFields = injectCreatedFieldToFields();
    const state: LocationState = {
      ...location.state,
      fields: nextFields,
    };

    history.push(`/account/online-checkin/custom-forms/${reservationId}`, state);
  };

  const appendFieldGroup = () => {
    append({
      [FORM_NAMES.name]: '',
      [FORM_NAMES.placeholder]: undefined,
      [FORM_NAMES.language]: null,
    });
  };

  const handleLanguageChange = (option: LanguageOption, name: any) => {
    setLanguageOptions((prevState) => {
      const languageApplied = getValues(name);
      const newOptions = prevState.filter((language) => {
        return language.value !== option.value;
      });
      const result = languageApplied ? [languageApplied, ...newOptions] : newOptions;

      return result.sort((a, b) => {
        return a.value.localeCompare(b.value);
      });
    });
  };

  const getPayload = (formData: FormTypes) => {
    const nonEmptyNames = formData[FORM_NAMES.names].filter((item) => {
      return item?.[FORM_NAMES.name] && item?.[FORM_NAMES.language];
    });
    const names = nonEmptyNames.map((field) => {
      const language = field[FORM_NAMES.language]!.iso2;
      return {
        [language]: field[FORM_NAMES.name],
      };
    });
    const placeholders = nonEmptyNames
      .filter((field) => {
        return Boolean(field[FORM_NAMES.placeholder]);
      })
      .map((field) => {
        const language = field[FORM_NAMES.language]!.iso2;
        return {
          [language]: field[FORM_NAMES.placeholder],
        };
      });

    const defaultName = Object.values(names[0])[0];
    const name = defaultName.toLowerCase().replaceAll(/\s|'|"/g, '_');

    return {
      ...formData,
      name,
      names,
      placeholders,
      is_required: false,
      [FORM_NAMES.type]: formData[FORM_NAMES.type]?.value,
    };
  };

  const createOrUpdateField = (payload: Partial<CustomField>) => {
    customFieldMutation(payload);
  };

  const handleSubmitForm = (formData: FormTypes) => {
    const payload = getPayload(formData);

    const namesCount = payload.names?.length;
    const isLanguagesMissing = namesCount < languageOptions.length;

    if (isLanguagesMissing) {
      openWarningModal();
      return;
    }
    createOrUpdateField(payload);
  };

  const handleSubmitModal = (formData: FormTypes) => {
    const payload = getPayload(formData);
    createOrUpdateField(payload);
    closeWarningModal();
  };

  return (
    <Section>
      <Header
        linkToBack={{
          pathname: `/account/online-checkin/custom-forms/${reservationId}`,
          state: location.state,
        }}
        title={t('custom_field')}
      />
      <Main>
        {displayFields[FORM_NAMES.type] && (
          <Controller
            control={control}
            name={FORM_NAMES.type}
            rules={{
              required: t('required') as string,
            }}
            render={({field, fieldState: {error}}) => {
              return (
                <Select
                  label={t('type_of_field')}
                  options={FIELD_TYPES_OPTIONS}
                  error={error?.message}
                  placeholder={t('select_type')}
                  disabled={isLoading}
                  {...field}
                />
              );
            }}
          />
        )}
        <FieldsContainer>
          {fields.map((item, index) => {
            const fieldItem = `${FORM_NAMES.names}.${index}` as const;
            const fieldName = `${fieldItem}.${FORM_NAMES.name}` as const;
            const fieldPlaceholder = `${fieldItem}.${FORM_NAMES.placeholder}` as const;
            const fieldLanguage = `${fieldItem}.${FORM_NAMES.language}` as const;
            return (
              <FieldsGroup key={item.id}>
                {displayFields[FORM_NAMES.name] && (
                  <FieldWrapper>
                    <InputController
                      {...register(fieldName, {
                        required: index === 0 && (t('required') as string),
                        pattern: {
                          message: t('special_char_not_allowed') as string,
                          value: PATTERNS.customField,
                        },
                      })}
                      control={control}
                      label={t('name_of_the_field')}
                      placeholder={t('enter_name')}
                      name={fieldName}
                      error={
                        errors?.[FORM_NAMES.names]?.[index]?.[FORM_NAMES.name]?.message
                      }
                      defaultValue={item[FORM_NAMES.name]}
                      disabled={isLoading}
                    />
                  </FieldWrapper>
                )}
                {displayFields[FORM_NAMES.language] && (
                  <FieldWrapper>
                    <Controller
                      control={control}
                      name={fieldLanguage}
                      defaultValue={item[FORM_NAMES.language] as any}
                      rules={{
                        required: index === 0 && (t('required') as string),
                      }}
                      render={({field: {onChange, ...field}, fieldState: {error}}) => {
                        return (
                          <Select
                            onChange={(option: any) => {
                              handleLanguageChange(option, fieldLanguage);
                              onChange(option);
                            }}
                            empty={!controlledFields?.[index]?.[FORM_NAMES.language]}
                            label={t('language')}
                            placeholder={t('select_type')}
                            options={languageOptions}
                            error={error?.message}
                            disabled={isLoading}
                            {...field}
                          />
                        );
                      }}
                    />
                  </FieldWrapper>
                )}
                {displayFields[FORM_NAMES.placeholder] && (
                  <FieldWrapper>
                    <InputController
                      {...register(fieldPlaceholder, {
                        pattern: {
                          message: t('special_char_not_allowed') as string,
                          value: PATTERNS.customField,
                        },
                      })}
                      control={control}
                      label={getRequiredOrOptionalFieldLabel(
                        t('field_placeholder'),
                        false,
                      )}
                      placeholder={t('enter_placeholder')}
                      name={fieldPlaceholder}
                      error={
                        errors?.[FORM_NAMES.names]?.[index]?.[FORM_NAMES.placeholder]
                          ?.message
                      }
                      defaultValue={item[FORM_NAMES.placeholder]}
                      disabled={isLoading}
                    />
                  </FieldWrapper>
                )}
              </FieldsGroup>
            );
          })}
        </FieldsContainer>
        <AnotherLanguageButtonWrapper>
          <Button
            secondary
            onClick={appendFieldGroup}
            disabled={isFieldsAddingDisabled || isAddLanguageButtonDisabled || isLoading}
            label={
              <>
                <img src={plusIcon} alt="Plus" height={14} width={14} />
                {t('add_another_language')}
              </>
            }
          />
        </AnotherLanguageButtonWrapper>
        <SaveButton
          disabled={isLoading}
          onClick={handleSubmit(handleSubmitForm)}
          label={isUpdateField ? t('update_custom_field') : t('save_custom_field')}
        />
      </Main>
      <ErrorModal />
      <SuccessModal onClose={goBackWithTheUpdatedFields} />
      <Modal
        iconSrc={warningIcon}
        iconAlt="Warning icon"
        iconProps={{height: 84, width: 84}}
        title={t('continue_without_translations')}
        open={isWarningModalOpen}
        contentStyle={{
          ...baseContentStyle,
          minHeight: 517,
          width: 306,
          boxSizing: 'border-box',
          marginTop: 128,
        }}
        text={t('continue_without_translations_description')}
      >
        <div>{t('do_you_want_to_continue')}</div>
        <ModalTwoButtonsWrapperStyled>
          <ModalButton
            onClick={handleSubmit(handleSubmitModal)}
            label={t('continue')}
            disabled={isLoading}
          />
          <ModalButton secondary onClick={closeWarningModal} label={t('go_back')} />
        </ModalTwoButtonsWrapperStyled>
      </Modal>
    </Section>
  );
}

export {CustomFieldForm};
