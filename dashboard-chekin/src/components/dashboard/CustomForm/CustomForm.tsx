import React from 'react';
import {useHistory, useLocation, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import {useQuery, useQueryClient} from 'react-query';
import {DragDropContext, Draggable, Droppable, DropResult} from 'react-beautiful-dnd';
import i18n from 'i18next';
import plusIcon from '../../../assets/plus-icon.svg';
import api, {queryFetcher, ResolverTypes} from '../../../api';
import floppyDiskIcon from '../../../assets/floppy-disk.svg';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useScrollToTop,
  useStatus,
} from '../../../utils/hooks';
import {
  Country,
  SelectOption,
  ShortHousing,
  CustomField as CustomFieldType,
  CustomForm as CustomFormType,
} from '../../../utils/types';
import {getShortHousingsAsOptions} from '../../../utils/housing';
import {getCurrentLocale, toastResponseError} from '../../../utils/common';
import {
  DISPLAY_FIELD_TYPES,
  FIELD_TYPES,
  FORM_FIELDS_LABELS,
  FORM_FIELDS_PLACEHOLDERS,
  FORM_FIELDS_TYPES,
  FORM_NAMES as GUEST_FORM_NAMES,
  getFields,
} from '../../../utils/guestFields';
import {ORIGINS, QUERY_CACHE_KEYS} from '../../../utils/constants';
import {useUser} from '../../../context/user';
import checkIcon from '../../../assets/check-green.svg';
import Select from '../Select';
import CustomField from '../CustomField';
import Loader from '../../common/Loader';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import CustomFormPreview from '../CustomFormPreview';
import {ACCOUNT_LINKS} from '../AccountSections';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';
import SelectPropsModal from '../SelectPropsModal';
import Section from '../Section';
import {InputController} from '../Input';
import {
  AddCustomFieldButton,
  FieldWrapper,
  LoaderWrapper,
  NotFoundImage,
  PlusButton,
  RetryButton,
  SaveButton,
  SaveButtonWrapper,
  Subsection,
  SectionDescription,
  SectionTitle,
  Header,
  SelectPropertyButton,
  SelectedPropsContainer,
  SelectedPropItem,
  SelectedPropText,
  TinyDeleteBtn,
} from './styled';

const NEW_FORM_ID = 'new';
export const CUSTOM_FIELD_OPTION = {
  value: 'CUSTOM',
  label: i18n.t('custom_field'),
};
const FIELDS_LIMIT = 30;

export type Field = {
  required: boolean;
  mandatory: boolean;
  custom: boolean;
  display: boolean;
  type: string;
  placeholder: string;
  isLeaderField: boolean;
  id?: string;
  label?: string;
  value?: string;
  name?: GUEST_FORM_NAMES;
  cannotEdit?: boolean;
  cannotDelete?: boolean;
};

const INIT_CUSTOM_FIELD: Field = {
  label: '',
  custom: true,
  display: true,
  mandatory: false,
  required: false,
  isLeaderField: false,
  placeholder: '',
  type: FIELD_TYPES.text,
};

function hasHousingPoliceActivated(housing?: ShortHousing) {
  return housing?.is_auto_police_registration_enabled;
}

function getLocationsAsOptions(locations: {results: {country: Country}[]}) {
  if (!locations?.results) {
    return [];
  }

  return locations?.results?.map((c: any) => {
    return {
      label: c?.country?.name,
      value: c?.country?.code,
    };
  });
}

function buildCustomFieldOption(field: CustomFieldType) {
  const language = getCurrentLocale().toUpperCase();

  const defaultName = Object.values(field.names[0])[0];
  const localeName = field.names.find((name) => {
    return name[language];
  });

  const defaultPlaceholder = field.placeholders?.length
    ? Object.values(field.placeholders?.[0])?.[0]
    : '';
  const localePlaceholder = field?.placeholders?.length
    ? field?.placeholders?.find((placeholder) => {
        return placeholder[language];
      })?.[language]
    : '';

  const placeholder = localePlaceholder || defaultPlaceholder;

  return {
    label: localeName?.[language] || defaultName,
    value: field.id,
    data: {...field, placeholder},
  };
}

function getCustomFieldsAsOptions(
  fields?: CustomFieldType[],
): SelectOption<CustomFieldType>[] {
  if (!fields?.length) {
    return [];
  }

  return fields.map((field) => buildCustomFieldOption(field));
}

function buildRemovedFieldOption(field: Field) {
  return {
    label: field.label,
    value: field.id,
    data: {...field},
  };
}

function getRemovedFieldsAsOptions(fields: Field[], currentFieldsIds: string[]): any {
  if (!fields?.length) {
    return [];
  }

  return fields
    .filter((singleField) => !currentFieldsIds.includes(singleField?.id || ''))
    .map((field: Field) => buildRemovedFieldOption(field));
}

const getRequiredFieldsByOrigin = (origin: string) => {
  switch (origin) {
    case ORIGINS.eviivo:
      return [GUEST_FORM_NAMES.surname, GUEST_FORM_NAMES.email];
    default:
      return [GUEST_FORM_NAMES.name];
  }
};

function getMandatoryFieldsDict(fields?: CustomFieldType[]) {
  const result: {[key: string]: CustomFieldType} = {};

  if (!fields?.length) {
    return undefined;
  }

  fields.forEach((field) => {
    result[field.name] = field;
  });

  return result as Record<GUEST_FORM_NAMES, CustomFieldType>;
}

type GetNextFormFields = {
  hasAnyHousingActivatedPolice: boolean;
  customForm?: CustomFormType;
  mandatoryCustomFields?: Record<GUEST_FORM_NAMES, CustomFieldType>;
  country?: string;
};

function getNextFormFields({
  mandatoryCustomFields,
  country,
  hasAnyHousingActivatedPolice,
}: GetNextFormFields): Field[] {
  if (!country || !mandatoryCustomFields) {
    return [];
  }

  const nextFields = getFields({housingCountry: country});
  const nextLeaderFields = getFields({housingCountry: country, isGuestLeader: true});
  const leaderOnlyFields = Object.keys(nextLeaderFields.display).filter((key) => {
    return (
      nextLeaderFields.display[key as GUEST_FORM_NAMES] &&
      !nextFields.display[key as GUEST_FORM_NAMES]
    );
  });

  return Object.keys(GUEST_FORM_NAMES)
    .map((key) => {
      const formName = GUEST_FORM_NAMES[key as keyof typeof GUEST_FORM_NAMES];
      const label = FORM_FIELDS_LABELS[formName as keyof typeof FORM_FIELDS_LABELS];
      const required = Boolean(nextFields.required[formName]);
      const displayType =
        nextFields.display[formName] || nextLeaderFields.display[formName];
      const display = Boolean(displayType);
      const id = mandatoryCustomFields[formName]?.id;
      const type = FORM_FIELDS_TYPES[formName as keyof typeof FORM_FIELDS_TYPES];
      const placeholder =
        FORM_FIELDS_PLACEHOLDERS[formName as keyof typeof FORM_FIELDS_TYPES];
      const isLeaderField = leaderOnlyFields.includes(formName);

      const cannotEdit = Boolean(hasAnyHousingActivatedPolice && required);
      const cannotDelete = Boolean(
        cannotEdit ||
          (hasAnyHousingActivatedPolice && displayType === DISPLAY_FIELD_TYPES.optional),
      );

      return {
        id,
        label,
        required,
        display,
        type,
        placeholder,
        isLeaderField,
        cannotEdit,
        cannotDelete,
        name: formName,
        mandatory: required,
        custom: false,
      };
    })
    .filter(({label, display}) => {
      return display && label;
    });
}

function getNextCustomFormFields({
  customForm,
  mandatoryCustomFields,
  hasAnyHousingActivatedPolice,
}: GetNextFormFields) {
  if (!customForm || !mandatoryCustomFields) {
    return [];
  }

  const fieldsSettings = getFields({housingCountry: customForm.country});

  const nextFields: Field[] = customForm.fields_set.map((formField) => {
    const field = formField.field;
    const formName = field.name as GUEST_FORM_NAMES;
    const placeholder =
      FORM_FIELDS_PLACEHOLDERS[formName as keyof typeof FORM_FIELDS_TYPES];
    const label = FORM_FIELDS_LABELS[formName as keyof typeof FORM_FIELDS_LABELS];
    const required = Boolean(fieldsSettings.required[formName]);
    const displayType = fieldsSettings.display[formName];
    const cannotEdit = Boolean(hasAnyHousingActivatedPolice && required);
    const cannotDelete = Boolean(
      cannotEdit ||
        (hasAnyHousingActivatedPolice && displayType === DISPLAY_FIELD_TYPES.optional),
    );
    return {
      label,
      cannotEdit,
      placeholder,
      cannotDelete,
      id: field.id,
      display: true,
      name: formName,
      value: field.id,
      custom: field.is_custom,
      type: field.field_type,
      isLeaderField: formField.is_leaders_field,
      required: formField.is_required,
      mandatory: Boolean(fieldsSettings.required[formName]),
    };
  });

  return nextFields;
}

function getNextCustomFormSelectedHousings(
  customForm: CustomFormType,
  shortHousingsOptions: SelectOption[],
) {
  if (!customForm) {
    return [];
  }

  return customForm.housings
    .map((housingId) => {
      return shortHousingsOptions.find((housing) => housing.value === housingId) || null;
    })
    .filter((housing) => {
      return housing !== null;
    }) as SelectOption[];
}

function fetchLocations(params = 'ordering=name') {
  return queryFetcher(api.locations.ENDPOINTS.all(params));
}

function fetchShortHousings(country?: string | number) {
  return queryFetcher(
    api.housings.ENDPOINTS.all(
      `ordering=name&fields=id,name&${country ? `location__country=${country}` : ''}`,
    ),
  );
}

function fetchCustomFields(userId = '') {
  return queryFetcher(
    api.guestCustomForm.ENDPOINTS.fields(
      `fields=field_type,id,is_custom,is_required,names&is_custom=true&user_id=${userId}`,
    ),
  );
}

function fetchCustomForm(id: string, userId = '') {
  return queryFetcher(
    api.guestCustomForm.ENDPOINTS.customFormById(id, `user_id=${userId}`),
  );
}

function fetchMandatoryFields(userId = '') {
  return queryFetcher(
    api.guestCustomForm.ENDPOINTS.fields(
      `fields=field_type,id,is_custom,is_required,names&is_custom=false&user_id=${userId}`,
    ),
  );
}

type DraggableFieldListProps = {
  disabled: boolean;
  fields: Field[];
  customFieldsOptions: SelectOption[];
  onChange: (option: SelectOption, index: number) => void;
  onFieldRequiredChange: (required: boolean, index: number) => void;
  onFieldRemove: (index: number) => void;
  onFieldEdit: (field: Field, index: number) => void;
  onGoToCustomField: (index: number) => void;
};

const DraggableFieldList = React.memo(
  ({
    fields,
    customFieldsOptions,
    onFieldRequiredChange,
    onFieldRemove,
    onFieldEdit,
    onGoToCustomField,
    onChange,
    disabled,
  }: DraggableFieldListProps) => {
    return (
      <div>
        {fields.map((field, index) => {
          return (
            <Draggable key={index} index={index} draggableId={`drag-${index}`}>
              {(provided) => {
                return (
                  <CustomField
                    key={index}
                    ref={provided.innerRef}
                    provided={provided}
                    field={field}
                    disabled={disabled}
                    fieldsOptions={customFieldsOptions}
                    onGoToCustomField={() => onGoToCustomField(index)}
                    onRemove={() => onFieldRemove(index)}
                    onEdit={() => onFieldEdit(field, index)}
                    onChange={(option) => onChange(option, index)}
                    onRequiredChange={(required) =>
                      onFieldRequiredChange(required, index)
                    }
                  />
                );
              }}
            </Draggable>
          );
        })}
      </div>
    );
  },
);

export type LocationState = {
  fields: Field[];
  formData: FormTypes;
  selectedHousings: SelectOption[];
  targetCustomFieldIndex?: number;
  createdCustomField?: CustomFieldType;
};

enum FORM_NAMES {
  name = 'name',
  country = 'country',
}

type FormTypes = {
  [FORM_NAMES.name]: string;
  [FORM_NAMES.country]: SelectOption;
};

function CustomForm() {
  useScrollToTop();
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const queryClient = useQueryClient();
  const {id} = useParams<{id: string}>();
  const {
    register,
    control,
    watch,
    handleSubmit,
    getValues,
    reset,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {
    isLoading: isCreatingMandatoryFields,
    isError: isCreatingMandatoryFieldsError,
    setStatus: setMandatoryFieldsCreationStatus,
  } = useStatus({
    initStatus: 'loading',
  });
  const {
    isOpen: isSuccessModalOpen,
    openModal: openSuccessModal,
    closeModal: closeSuccessModal,
  } = useModalControls();
  const {isLoading: isSubmitting, setStatus: setSubmittingStatus} = useStatus();
  const {ErrorModal, displayError} = useErrorModal();
  const [selectedHousings, setSelectedHousings] = React.useState<SelectOption[]>([]);
  const [fields, setFields] = React.useState<Field[]>([]);
  const [isResetCustomFormFields, setResetCustomFormFields] = React.useState(false);
  const [newCustomFormId, setNewCustomFormId] = React.useState('');
  const [customFieldsOptions, setCustomFieldsOptions] = React.useState<
    SelectOption<CustomFieldType>[]
  >([CUSTOM_FIELD_OPTION]);
  const [
    isLocationStateFormDataLoaded,
    setIsLocationStateFormDataLoaded,
  ] = React.useState(false);
  const [isCustomFormFormDataLoaded, setIsCustomFormFormDataLoaded] = React.useState(
    false,
  );
  const [areCustomFormFieldsLoaded, setAreCustomFormFieldsLoaded] = React.useState(false);
  const {
    isOpen: isSelectPropsModalOpen,
    openModal: openSelectPropsModal,
    closeModal: closeSelectPropsModal,
  } = useModalControls();

  const user = useUser();
  const userOrigin = user?.origin;
  const managerId = user?.manager || '';

  const formName = watch(FORM_NAMES.name);
  const formCountry = watch(FORM_NAMES.country)?.value;

  const isNewForm = id === NEW_FORM_ID;
  const hasReachedFieldsLimit = fields.length === FIELDS_LIMIT;
  const isAddCustomFieldButtonDisabled =
    !formCountry || isSubmitting || hasReachedFieldsLimit;

  const {
    data: shortHousings,
    status: shortHousingsStatus,
    error: shortHousingsError,
  } = useQuery<ShortHousing[]>(['shortHousings', formCountry], () =>
    fetchShortHousings(formCountry),
  );
  useErrorToast(shortHousingsError, {
    notFoundMessage:
      'Requested short housings could not be found. Please contact support.',
  });

  const {
    data: mandatoryCustomFields,
    error: mandatoryCustomFieldsError,
    status: mandatoryCustomFieldsStatus,
  } = useQuery<CustomFieldType[]>(
    'mandatoryCustomFields',
    () => fetchMandatoryFields(managerId),
    {
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(mandatoryCustomFieldsError, {
    notFoundMessage:
      'Requested mandatory fields could not be found. Please contact support.',
  });

  const {data: locations, error: locationsError, status: locationsStatus} = useQuery(
    QUERY_CACHE_KEYS.locations,
    () => fetchLocations(),
    {
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(locationsError, {
    notFoundMessage: 'Requested locations could not be found. Please contact support.',
  });

  const {data: customForm, status: customFormStatus, error: customFormError} = useQuery<
    CustomFormType
  >(['customForm', id], () => fetchCustomForm(id, managerId), {
    refetchOnWindowFocus: false,
    enabled: id !== NEW_FORM_ID,
  });
  useErrorToast(customFormError, {
    notFoundMessage: 'Requested Custom form could not be found. Please contact support.',
  });

  const {data: customFields, error: customFieldsError} = useQuery<CustomFieldType[]>(
    'customFields',
    () => fetchCustomFields(managerId),
    {
      refetchOnWindowFocus: false,
    },
  );
  useErrorToast(customFieldsError, {
    notFoundMessage:
      'Requested custom fields could not be found. Please contact support.',
  });

  const isLoading =
    mandatoryCustomFieldsStatus === 'loading' ||
    isCreatingMandatoryFields ||
    customFormStatus === 'loading';

  const hasAnyHousingActivatedPolice = React.useMemo(() => {
    return selectedHousings.some((housing) => hasHousingPoliceActivated(housing.data));
  }, [selectedHousings]);

  const shortHousingsOptions = React.useMemo(() => {
    return getShortHousingsAsOptions(shortHousings);
  }, [shortHousings]);

  const locationsOptions = React.useMemo(() => {
    return getLocationsAsOptions(locations);
  }, [locations]);

  const mandatoryCustomFieldsDict = React.useMemo(() => {
    return getMandatoryFieldsDict(mandatoryCustomFields);
  }, [mandatoryCustomFields]);

  const allCustomFieldsOptions = React.useMemo(() => {
    const fieldsIds = fields.map((singleField) => singleField.id || '');
    const removedFields = getRemovedFieldsAsOptions(
      getNextFormFields({
        country: formCountry,
        mandatoryCustomFields: mandatoryCustomFieldsDict,
        hasAnyHousingActivatedPolice,
      }),
      fieldsIds,
    );

    return [
      CUSTOM_FIELD_OPTION,
      ...removedFields,
      ...getCustomFieldsAsOptions(customFields),
    ];
  }, [
    customFields,
    fields,
    formCountry,
    hasAnyHousingActivatedPolice,
    mandatoryCustomFieldsDict,
  ]);

  const getFieldsForRender = React.useCallback(
    function disableEditModeFields() {
      const disabledEditMandatoryFields = getRequiredFieldsByOrigin(userOrigin || '');

      return fields.map((field) => {
        if (field.name && disabledEditMandatoryFields.includes(field.name)) {
          field.cannotEdit = true;
          field.cannotDelete = true;
          field.required = true;
          field.mandatory = true;
        }
        return field;
      });
    },
    [fields, userOrigin],
  );

  const populateMandatoryFields = React.useCallback(async () => {
    const payload = Object.keys(FORM_FIELDS_LABELS)
      .map(
        (key): Partial<CustomFieldType> => {
          return {
            name: key,
            is_custom: false,
            field_type: FORM_FIELDS_TYPES[key as keyof typeof FORM_FIELDS_TYPES],
          };
        },
      )
      .filter((field) => {
        return !mandatoryCustomFields?.find(
          (existingField) => existingField.name === field.name,
        );
      });

    if (!payload.length) {
      setMandatoryFieldsCreationStatus('success');
      return;
    }

    setMandatoryFieldsCreationStatus('loading');

    const {data, error} = await api.guestCustomForm.postCustomFields(payload);
    if (!isMounted.current) {
      return;
    }

    if (error) {
      toastResponseError(error);
      setMandatoryFieldsCreationStatus('error');
      return;
    }

    if (data) {
      queryClient.setQueryData('mandatoryCustomFields', data);
    }
    setMandatoryFieldsCreationStatus('success');
  }, [isMounted, mandatoryCustomFields, queryClient, setMandatoryFieldsCreationStatus]);

  React.useEffect(() => {
    setCustomFieldsOptions(allCustomFieldsOptions);
  }, [allCustomFieldsOptions]);

  React.useEffect(() => {
    const areMandatoryFieldsDifferent =
      mandatoryCustomFields?.length !== Object.keys(FORM_FIELDS_LABELS).length;

    if (mandatoryCustomFieldsStatus !== 'success') {
      return;
    }

    if (areMandatoryFieldsDifferent) {
      populateMandatoryFields();
    } else {
      setMandatoryFieldsCreationStatus('success');
    }
  }, [
    populateMandatoryFields,
    mandatoryCustomFields,
    mandatoryCustomFieldsStatus,
    setMandatoryFieldsCreationStatus,
  ]);

  React.useLayoutEffect(
    function loadLocationStateFormData() {
      const {state} = location;

      if (state?.formData) {
        reset(state.formData);
        setIsLocationStateFormDataLoaded(true);
      }
    },
    [location, reset],
  );

  React.useLayoutEffect(
    function loadLocationStateAfterFormData() {
      const {state} = location;

      if (!isLocationStateFormDataLoaded) {
        return;
      }

      if (state?.fields) {
        setFields(state.fields);
      }

      if (state?.selectedHousings) {
        setSelectedHousings(state.selectedHousings);
      }
    },
    [isLocationStateFormDataLoaded, location],
  );

  React.useEffect(
    function disableResetIfHousingWithoutActivePolice() {
      if (!hasAnyHousingActivatedPolice) {
        setResetCustomFormFields(false);
      }
    },
    [hasAnyHousingActivatedPolice],
  );

  React.useEffect(
    function loadCustomFormFormData() {
      if (!customForm || location.state || !locations) {
        return;
      }

      if (customForm.country && customForm.name) {
        const country = locationsOptions.find((location) => {
          return location.value === customForm.country;
        });

        reset({
          [FORM_NAMES.country]: country,
          [FORM_NAMES.name]: customForm.name,
        });
        setIsCustomFormFormDataLoaded(true);
      }
    },
    [customForm, location.state, locations, locationsOptions, reset],
  );

  React.useEffect(
    function loadCustomFormFields() {
      if (
        !customForm ||
        !isCustomFormFormDataLoaded ||
        !mandatoryCustomFieldsDict ||
        isResetCustomFormFields
      ) {
        return;
      }
      const nextFields = getNextCustomFormFields({
        mandatoryCustomFields: mandatoryCustomFieldsDict,
        hasAnyHousingActivatedPolice,
        customForm,
      });

      setFields((prevFields) => {
        const customFieldsInExistsCustomForm = customForm?.fields_set
          .filter((field) => field.field.is_custom)
          .map((field) => field.field.id);

        const prevCustomFields = prevFields.filter(
          (singleField) =>
            singleField.custom &&
            !customFieldsInExistsCustomForm.includes(singleField.id || ''),
        );
        return [...nextFields, ...prevCustomFields];
      });

      setAreCustomFormFieldsLoaded(true);
    },
    [
      customForm,
      hasAnyHousingActivatedPolice,
      isCustomFormFormDataLoaded,
      isResetCustomFormFields,
      mandatoryCustomFieldsDict,
    ],
  );

  React.useEffect(
    function loadCustomFormSelectedHousings() {
      if (
        !customForm?.housings?.length ||
        !shortHousingsOptions?.length ||
        !isCustomFormFormDataLoaded
      ) {
        return;
      }

      const nextSelectedHousings = getNextCustomFormSelectedHousings(
        customForm,
        shortHousingsOptions,
      );

      setSelectedHousings(nextSelectedHousings);
    },
    [customForm, isCustomFormFormDataLoaded, shortHousingsOptions],
  );

  React.useEffect(
    function loadCustomFormCustomFieldsOptions() {
      if (!customForm?.fields_set?.length || !areCustomFormFieldsLoaded) {
        return;
      }

      setFields((prevState) => {
        return prevState
          .map((field, index) => {
            return {
              field,
              index,
            };
          })
          .filter((fieldData) => {
            return fieldData.field.custom;
          })
          .reduce((accumulator, fieldData) => {
            const fieldOption = customFieldsOptions.find(
              (option) => option.value === fieldData.field.id,
            );

            if (fieldOption) {
              return updateFieldItems({
                fields: accumulator,
                index: fieldData.index,
                data: {
                  value: fieldOption.value,
                  label: fieldOption.label,
                  ...fieldOption.data,
                },
              });
            }

            return accumulator;
          }, prevState);
      });
    },
    [customFieldsOptions, customForm, areCustomFormFieldsLoaded],
  );

  React.useEffect(
    function keepUniqueCustomFieldsOptions() {
      const selectedCustomFields = fields.filter((field) => {
        return field.custom && field.label;
      });

      const nextCustomFieldsOptions = allCustomFieldsOptions.filter((option) => {
        return !selectedCustomFields.find((field) => field.id === option.value);
      });
      setCustomFieldsOptions(nextCustomFieldsOptions);
    },
    [allCustomFieldsOptions, fields],
  );

  const goBack = () => {
    history.push(ACCOUNT_LINKS.onlineCheckin);
  };

  const handleGoToCustomField = (index: number) => {
    const state: LocationState = {
      fields,
      selectedHousings,
      formData: getValues() as FormTypes,
      targetCustomFieldIndex: index,
    };

    history.push(`/account/online-checkin/custom-forms/${id}/custom-field`, state);
  };

  const updateFieldItems = ({
    fields,
    index,
    destinationIndex = index,
    data = {},
  }: {
    fields: Field[];
    index: number;
    data?: any;
    destinationIndex?: number;
  }) => {
    const items = [...fields];
    const [reorderedItem] = items.splice(index, 1);
    items.splice(destinationIndex, 0, {
      ...reorderedItem,
      ...data,
    });

    return items;
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    setFields((prevState) => {
      return updateFieldItems({
        fields: prevState,
        index: result.source.index,
        destinationIndex: result.destination!.index,
      });
    });
  };

  const handleRequiredChange = (required: boolean, index: number) => {
    setFields((prevState) => {
      return updateFieldItems({
        index,
        fields: prevState,
        data: {required},
      });
    });
  };

  const handleCustomFieldChange = (
    option: SelectOption<CustomFieldType & {placeholder: string}>,
    index: number,
  ) => {
    setFields((prevState) => {
      return updateFieldItems({
        index,
        fields: prevState,
        data: {
          id: option.value,
          label: option.label,
          value: option.value,
          type: option.data?.field_type,
          placeholder: option.data?.placeholder,
          custom: option.data?.is_custom,
        },
      });
    });
  };

  const handleFormCountryChange = (option: SelectOption) => {
    const formCountry = option?.value as string;

    const nextFormFields = getNextFormFields({
      mandatoryCustomFields: mandatoryCustomFieldsDict,
      country: formCountry,
      hasAnyHousingActivatedPolice,
    });
    setFields(nextFormFields);

    setSelectedHousings([]);
  };

  const removeCustomField = (index: number) => {
    setFields((prevState) => {
      return prevState.filter((_, fieldIndex) => {
        return fieldIndex !== index;
      });
    });
  };

  const editCustomField = (field: Field, index: number) => {
    const state = {
      field,
      fields,
      selectedHousings,
      targetCustomFieldIndex: index,
      formData: getValues() as FormTypes,
    };

    history.push(
      `/account/online-checkin/custom-forms/${id}/custom-field/${field.id}`,
      state,
    );
  };

  const prependCustomField = () => {
    setFields((prevState) => {
      return [INIT_CUSTOM_FIELD, ...prevState];
    });
  };

  const appendCustomField = () => {
    setFields((prevState) => {
      return [...prevState, INIT_CUSTOM_FIELD];
    });
  };

  const getFormPayload = (formData: FormTypes) => {
    const housingsIds = selectedHousings.map((housing) => {
      return housing.value;
    });
    const visibleFields = fields
      .filter((field) => {
        return Boolean(field.id);
      })
      .map((field) => {
        return {
          id: field.id,
          is_required: field.required,
          is_leaders_field: field.isLeaderField,
        };
      });

    return {
      ...formData,
      [FORM_NAMES.country]: formData[FORM_NAMES.country]?.value,
      housings: housingsIds,
      fields: visibleFields,
    };
  };

  const createOrUpdateTheForm = async (payload: any) => {
    let result: ResolverTypes;

    setSubmittingStatus('loading');

    if (isNewForm && !newCustomFormId) {
      result = await api.guestCustomForm.postCustomForm(payload);
    } else {
      const customFormId = newCustomFormId || id;
      result = await api.guestCustomForm.patchCustomForm(
        customFormId,
        payload,
        `user_id=${managerId}`,
      );
    }

    if (!isMounted.current) {
      return;
    }

    setSubmittingStatus('idle');

    if (result.error) {
      displayError(result.error);
      return;
    }

    if (result.data) {
      const customFormId = result.data.id;

      if (isNewForm) {
        setNewCustomFormId(customFormId);
      }

      queryClient.setQueryData<CustomFormType>(['customForm', customFormId], result.data);
    }

    openSuccessModal();
  };

  const onSubmit = async (formData: FormTypes) => {
    const payload = getFormPayload(formData);
    await createOrUpdateTheForm(payload);
  };

  const {
    isAllChecked,
    toggleSelectAll,
    checkboxes,
    toggleIsChecked,
    getSelectedHousingsCheckboxes,
  } = useHousingsSelectCheckboxes(shortHousingsOptions, customForm?.housings);

  const getSelectedHousings = () => {
    const chosenHousings = getSelectedHousingsCheckboxes(
      shortHousingsOptions,
      checkboxes,
    );
    const hasNewSelectedHousingsActivePolice = chosenHousings.some((housing) =>
      hasHousingPoliceActivated(housing.data),
    );
    if (!hasAnyHousingActivatedPolice && hasNewSelectedHousingsActivePolice) {
      const nextFormFields = getNextFormFields({
        mandatoryCustomFields: mandatoryCustomFieldsDict,
        hasAnyHousingActivatedPolice: true,
        country: formCountry,
      });
      const prevCustomFields = fields.filter((singleField) => singleField.custom);

      setFields([...nextFormFields, ...prevCustomFields]);
      setResetCustomFormFields(true);
    }

    setSelectedHousings(chosenHousings);
    closeSelectPropsModal();
  };

  const deleteSelectedHousing = (id: string | number) => {
    setSelectedHousings((prevState) => {
      return prevState.filter(({value}) => value !== id);
    });
    toggleIsChecked(id.toString());
  };

  return (
    <Section>
      <Header
        linkToBack={ACCOUNT_LINKS.onlineCheckin}
        title={isLoading ? '' : formName || t('new_guest_form')}
      />
      {isLoading ? (
        <Subsection>
          <LoaderWrapper>
            <Loader
              label={
                customFormStatus === 'loading'
                  ? t('loading_form')
                  : t('populating_fields')
              }
            />
          </LoaderWrapper>
        </Subsection>
      ) : mandatoryCustomFieldsStatus === 'error' || isCreatingMandatoryFieldsError ? (
        <Subsection>
          <LoaderWrapper>
            <NotFoundImage src={notFoundIcon} alt="" />
            {t('cant_populate_fields_try_again')}
            <div>
              <RetryButton label={t('retry')} onClick={populateMandatoryFields} />
            </div>
          </LoaderWrapper>
        </Subsection>
      ) : (
        <>
          <Subsection>
            <CustomFormPreview fields={getFieldsForRender()} />
            <SectionTitle>1. {t('form_details')}</SectionTitle>
            <FieldWrapper>
              <InputController
                {...register(FORM_NAMES.name, {
                  required: t('required') as string,
                })}
                control={control}
                label={t('name_of_the_form')}
                placeholder={t('enter_name')}
                error={errors[FORM_NAMES.name]?.message}
                disabled={isSubmitting}
              />
            </FieldWrapper>
            <FieldWrapper>
              <Controller
                control={control}
                name={FORM_NAMES.country}
                rules={{
                  required: t('required') as string,
                }}
                render={({field: {onChange, ...field}, fieldState: {error}}) => {
                  return (
                    <Select
                      onChange={(option: SelectOption) => {
                        handleFormCountryChange(option);
                        return onChange(option);
                      }}
                      loading={locationsStatus === 'loading'}
                      options={locationsOptions}
                      error={error?.message}
                      label={t('country')}
                      placeholder={t('select_country')}
                      tooltip={t('depending_on_the_country_there_will_be_default_fields')}
                      disabled={isSubmitting}
                      {...field}
                    />
                  );
                }}
              />
            </FieldWrapper>
          </Subsection>
          <Subsection>
            <SectionTitle>2. {t('add_fields')}</SectionTitle>
            <SectionDescription>
              {t('add_fields_to_include_on_form')}
              <p />
              {t('some_fields_tagged_mandatory')}
              <PlusButton
                disabled={isAddCustomFieldButtonDisabled}
                onClick={prependCustomField}
              >
                <img src={plusIcon} alt="Plus" />
              </PlusButton>
            </SectionDescription>
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="Droppable">
                {(provided) => {
                  return (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      <DraggableFieldList
                        fields={getFieldsForRender()}
                        disabled={isSubmitting}
                        customFieldsOptions={customFieldsOptions}
                        onFieldRequiredChange={handleRequiredChange}
                        onFieldRemove={removeCustomField}
                        onFieldEdit={editCustomField}
                        onGoToCustomField={handleGoToCustomField}
                        onChange={handleCustomFieldChange}
                      />
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>
            </DragDropContext>
            <AddCustomFieldButton
              secondary
              onClick={appendCustomField}
              disabled={isAddCustomFieldButtonDisabled}
              label={
                <>
                  <img src={plusIcon} alt="Plus" />
                  {t('add_custom_field')}
                </>
              }
            />
          </Subsection>
          <Subsection>
            <SectionTitle>3. {t('select_properties')}</SectionTitle>
            <SectionDescription>{t('select_properties_for_template')}</SectionDescription>
            {Boolean(selectedHousings.length) && (
              <SelectedPropsContainer>
                {selectedHousings.map(({label, value}) => (
                  <SelectedPropItem key={value}>
                    <SelectedPropText>{label}</SelectedPropText>
                    <TinyDeleteBtn onClick={() => deleteSelectedHousing(value)} />
                  </SelectedPropItem>
                ))}
              </SelectedPropsContainer>
            )}
            <SelectPropertyButton
              label={t('select_properties')}
              onClick={openSelectPropsModal}
            />
            <SelectPropsModal
              open={isSelectPropsModalOpen}
              onClose={closeSelectPropsModal}
              housingsOptions={shortHousingsOptions}
              toggleIsChecked={toggleIsChecked}
              toggleSelectAll={toggleSelectAll}
              checkboxes={checkboxes}
              isAllChecked={isAllChecked}
              isLoading={shortHousingsStatus === 'loading'}
              onExport={getSelectedHousings}
            />
          </Subsection>
          <SaveButtonWrapper>
            <SaveButton
              disabled={isSubmitting || !selectedHousings.length}
              onClick={handleSubmit(onSubmit)}
              label={
                <>
                  <img src={floppyDiskIcon} alt="Floppy" />
                  {t('save_form')}
                </>
              }
            />
          </SaveButtonWrapper>
        </>
      )}
      <ErrorModal />
      <Modal
        closeOnEscape
        closeOnDocumentClick
        onClose={closeSuccessModal}
        open={isSuccessModalOpen}
        iconSrc={checkIcon}
        iconAlt=""
        iconProps={{height: 84, width: 84}}
        title={t('success_exclamation')}
        text={
          isNewForm
            ? t('custom_form_has_been_created')
            : t('custom_form_has_been_updated')
        }
      >
        <ModalTwoButtonsWrapper>
          <ModalButton label={t('back_to_forms')} onClick={goBack} />
          <ModalButton
            secondary
            label={t('continue_editing')}
            onClick={closeSuccessModal}
          />
        </ModalTwoButtonsWrapper>
      </Modal>
    </Section>
  );
}

export {CustomForm, buildCustomFieldOption};
