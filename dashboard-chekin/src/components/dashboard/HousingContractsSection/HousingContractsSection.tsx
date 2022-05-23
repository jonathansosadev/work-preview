import React from 'react';
import {useTranslation} from 'react-i18next';
import {useFormContext, Controller} from 'react-hook-form';
import {format, isValid} from 'date-fns';
import api from '../../../api';
import i18n from '../../../i18n';
import {getRequiredOrOptionalFieldLabel, toastResponseError} from '../../../utils/common';
import {buildHousingPayload} from '../../../utils/housing';
import {useIsFormTouched, useIsMounted, useModalControls} from '../../../utils/hooks';
import {useContractsExport} from '../../../context/contractsExport';
import {
  CONTRACT_GENERATION_STATUSES,
  useGenerationContract,
} from '../../../hooks/useGenerationContract';
import {COUNTRY_CODES} from '../../../utils/constants';
import plusIcon from '../../../assets/plus-blue.svg';
import writingIcon from '../../../assets/writing.svg';
import documentIcon from '../../../assets/document.svg';
import removeIcon from '../../../assets/remove.svg';
import clauseIcon from '../../../assets/clause.svg';
import ReactSignatureCanvas from 'react-signature-canvas';
import Switch, {useSwitchSectionActive} from '../Switch';
import Section from '../Section';
import Input, {InputController} from '../Input';
import PhoneInput from '../PhoneInput';
import Button from '../Button';
import ModalButton from '../ModalButton';
import Modal from '../Modal';
import SignatureCanvas from '../SignatureCanvas';
import Datepicker from '../Datepicker';
import ExportContractsSettingsModal from '../ExportContractsSettingsModal';
import GenerateContractButton from '../GenerateContractButton';
import {FieldWrapper} from '../../../styled/common';
import {
  AddBtnImg,
  AddBtnText,
  AddButton,
  BtnIcon,
  Content,
  Divider,
  ExtraClauseButtonsWrapper,
  ExtraClauseInputWrapper,
  ExtraClauseItem,
  ExtraClauseItemDocumentImg,
  ExtraClauseItemText,
  ExtraClauseModalWrapper,
  ExtraClausesList,
  ExtraInfoSection,
  ExtraInfoWrapper,
  FormWrapper,
  Layout,
  ModalBtnLabel,
  RemoveExtraClauseButton,
  SignatureButtonsWrapper,
  SignatureImg,
  SignatureModalContent,
  ExportSettingsButtonWrapper,
  ExtraClauseDetails,
  ClauseTitleLabel,
  ContractsTypeSelectors,
  Subsection,
  CustomContractsListStyled,
} from './styled';

const EXTRA_FIELD_CONTRACT_TYPE = 'extra_field_contract_type';
enum CONTRACT_TYPES {
  standard = 'standard',
  custom = 'custom',
}
const ContractTypesSettingsOptions = {
  [CONTRACT_TYPES.standard]: EXTRA_FIELD_CONTRACT_TYPE,
  [CONTRACT_TYPES.custom]: EXTRA_FIELD_CONTRACT_TYPE,
};

const contractTypesOptions = {
  standard: CONTRACT_TYPES.standard,
  custom: CONTRACT_TYPES.custom,
};

export type ExtraClauseType = {
  title: string;
  content: string;
};

export enum FORM_NAMES {
  contract_title = 'contract_title',
  contract_law = 'contract_law',
  address = 'address',
  tourism_registration_number = 'tourism_registration_number',
  vatin = 'vatin',
  manager_name = 'manager_name',
  manager_phone = 'manager_phone',
  manager_birth_date = 'manager_birth_date',
  manager_birth_place = 'manager_birth_place',
  manager_residence_address = 'manager_residence_address',
}

const CONTRACT_FIELDS_MAX_LENGTH = {
  [FORM_NAMES.contract_title]: 128,
  [FORM_NAMES.contract_law]: 255,
  [FORM_NAMES.address]: 255,
  [FORM_NAMES.tourism_registration_number]: 250,
  [FORM_NAMES.manager_name]: 128,
  [FORM_NAMES.manager_birth_place]: 128,
  [FORM_NAMES.vatin]: 255,
  [FORM_NAMES.manager_residence_address]: 255,
};

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.contract_title]: i18n.t('required'),
  [FORM_NAMES.contract_law]: false,
  [FORM_NAMES.address]: false,
  [FORM_NAMES.tourism_registration_number]: false,
  [FORM_NAMES.vatin]: false,
  [FORM_NAMES.manager_name]: false,
  [FORM_NAMES.manager_phone]: false,
  [FORM_NAMES.manager_birth_date]: false,
  [FORM_NAMES.manager_birth_place]: false,
  [FORM_NAMES.manager_residence_address]: false,
};

function getRequiredFields(country: string) {
  switch (country) {
    case COUNTRY_CODES.spain: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.tourism_registration_number]: i18n.t('required'),
      };
    }
    case COUNTRY_CODES.uae: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.manager_phone]: false,
      };
    }
    case COUNTRY_CODES.italy: {
      return {
        ...INIT_REQUIRED_FIELDS,
        [FORM_NAMES.vatin]: i18n.t('required'),
        [FORM_NAMES.manager_birth_date]: i18n.t('required'),
        [FORM_NAMES.manager_birth_place]: i18n.t('required'),
        [FORM_NAMES.manager_birth_place]: i18n.t('required'),
      };
    }
    default: {
      return INIT_REQUIRED_FIELDS;
    }
  }
}

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.contract_title]: true,
  [FORM_NAMES.contract_law]: true,
  [FORM_NAMES.address]: true,
  [FORM_NAMES.tourism_registration_number]: false,
  [FORM_NAMES.vatin]: false,
  [FORM_NAMES.manager_name]: true,
  [FORM_NAMES.manager_phone]: false,
  [FORM_NAMES.manager_birth_date]: false,
  [FORM_NAMES.manager_birth_place]: false,
  [FORM_NAMES.manager_residence_address]: false,
};

function getDisplayFields(country: string) {
  switch (country) {
    case COUNTRY_CODES.spain: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.tourism_registration_number]: true,
        [FORM_NAMES.manager_phone]: true,
      };
    }
    case COUNTRY_CODES.uae: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.manager_residence_address]: true,
        [FORM_NAMES.manager_phone]: true,
      };
    }
    case COUNTRY_CODES.italy: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.vatin]: false,
        [FORM_NAMES.manager_birth_date]: true,
        [FORM_NAMES.manager_birth_place]: true,
        [FORM_NAMES.manager_residence_address]: true,
        [FORM_NAMES.tourism_registration_number]: true,
        [FORM_NAMES.manager_phone]: true,
      };
    }
    default: {
      return INIT_DISPLAY_FIELDS;
    }
  }
}

function getFields(country = '') {
  const display = getDisplayFields(country);
  const required = getRequiredFields(country);

  return {
    display,
    required,
  };
}

const defaultValues = {
  [FORM_NAMES.contract_title]: '',
  [FORM_NAMES.contract_law]: '',
  [FORM_NAMES.address]: '',
  [FORM_NAMES.tourism_registration_number]: '',
  [FORM_NAMES.vatin]: '',
  [FORM_NAMES.manager_name]: '',
  [FORM_NAMES.manager_phone]: '',
  [FORM_NAMES.manager_birth_date]: '',
  [FORM_NAMES.manager_birth_place]: '',
  [FORM_NAMES.manager_residence_address]: '',
};

export type HousingContractsSectionProps = {
  setIsContractsSectionActive: React.Dispatch<React.SetStateAction<boolean>>;
  disabled: boolean;
  country?: string;
  housing?: any;
  generateContractSample?: () => Promise<void>;
  setIsSectionTouched: (isTouched: boolean) => void;
};

const defaultProps: Partial<HousingContractsSectionProps> = {
  generateContractSample: async () => {},
  country: '',
  disabled: false,
  setIsContractsSectionActive: () => {},
  housing: null,
};

const HousingContractsSection = React.forwardRef(
  (
    {
      country,
      setIsContractsSectionActive,
      disabled,
      housing,
      generateContractSample,
      setIsSectionTouched,
    }: HousingContractsSectionProps,
    ref,
  ) => {
    const housingId = housing?.id;
    const {t} = useTranslation();
    const {isExporting} = useContractsExport();
    const isMounted = useIsMounted();
    const {
      register,
      formState,
      trigger,
      setValue,
      handleSubmit,
      getValues,
      control,
      watch,
    } = useFormContext();

    const {errors} = formState;

    const [fields, setFields] = React.useState(() => {
      return getFields(country);
    });
    const signatureRef = React.useRef<ReactSignatureCanvas>(null);
    const [signature, setSignature] = React.useState<string | undefined>(undefined);
    const [showAddClauseModal, setShowAddClauseModal] = React.useState(false);
    const [showSignatureModal, setShowSignatureModal] = React.useState(false);
    const [extraClauses, setExtraClauses] = React.useState<ExtraClauseType[]>([]);
    const [extraClauseTitle, setExtraClauseTitle] = React.useState('');
    const [extraClauseContent, setExtraClauseContent] = React.useState<string>('');
    const [managerSignature, setManagerSignature] = React.useState<string | undefined>(
      undefined,
    );
    const [isSignatureEnabled, setIsSignatureEnabled] = React.useState(false);
    const [, setContractId] = React.useState('');
    const [areFieldsPreloaded, setAreFieldsPreloaded] = React.useState(false);
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      watch,
      defaultValues,
      displayFields: fields.display,
    });
    const selectedContractType = watch(EXTRA_FIELD_CONTRACT_TYPE);

    const {
      isOpen: isExportModalOpen,
      closeModal: closeExportModal,
      openModal: openExportModal,
    } = useModalControls();

    const {
      setShouldDownloadContract,
      status: generationContractStatus,
      setStatus: setGenerationContractStatus,
    } = useGenerationContract();

    React.useImperativeHandle(ref, () => {
      return {
        active: isSectionActive,
        extraClauses: extraClauses,
        signature: managerSignature,
      };
    });

    const preloadedSectionActive = !!housing?.is_contract_enabled;
    const {
      isSectionActive,
      toggleIsSectionActive,
      setIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(preloadedSectionActive);

    React.useEffect(() => {
      setIsSectionTouched(isFormTouched || isSectionActiveTouched);
    }, [isFormTouched, setIsSectionTouched, isSectionActiveTouched]);

    React.useEffect(
      function preloadActive() {
        if (housing?.is_contract_enabled) {
          setIsSectionActive(true);
        }
      },
      [housing, setIsSectionActive],
    );

    React.useEffect(
      function preloadData() {
        const formData = [
          {name: FORM_NAMES.contract_title, value: housing?.contract_title},
          {name: FORM_NAMES.contract_law, value: housing?.contract_law},
          {name: FORM_NAMES.address, value: housing?.location?.address},
          {
            name: FORM_NAMES.tourism_registration_number,
            value: housing?.tourism_registration_number,
          },
          {name: FORM_NAMES.vatin, value: housing?.vatin},
          {name: FORM_NAMES.manager_name, value: housing?.manager_name},
          {name: FORM_NAMES.manager_phone, value: housing?.manager_phone},
          {
            name: FORM_NAMES.manager_birth_date,
            value: housing?.manager_birth_date
              ? new Date(housing.manager_birth_date)
              : undefined,
          },
          {name: FORM_NAMES.manager_birth_place, value: housing?.manager_birth_place},
          {
            name: FORM_NAMES.manager_residence_address,
            value: housing?.manager_residence_address,
          },
        ];

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

        if (housing && housing?.contract_title && isSectionActive) {
          setManagerSignature(housing.manager_signature);
          setExtraClauses(housing.extra_clauses);
          formData.forEach(({name, value}) => {
            return setValue(name, value);
          });
        }
      },
      [isSectionActive, housing, setValue, areFieldsPreloaded, setUntouchedValues],
    );

    React.useEffect(() => {
      setIsContractsSectionActive(isSectionActive);
    }, [isSectionActive, setIsContractsSectionActive]);

    React.useEffect(() => {
      if (formState.isSubmitted) {
        trigger();
      }
    }, [fields, formState.isSubmitted, trigger]);

    React.useEffect(
      function updateFieldsOnCountryChange() {
        const nextFields = getFields(country);
        setFields(nextFields);

        if (country) {
          setAreFieldsPreloaded(true);
        }
      },
      [country],
    );

    const setSectionTouched = React.useCallback(() => {
      setIsSectionTouched(true);
    }, [setIsSectionTouched]);

    const openAddClauseModal = React.useCallback(() => {
      setShowAddClauseModal(true);
    }, []);

    const closeAddClauseModal = React.useCallback(() => {
      setExtraClauseContent('');
      setExtraClauseTitle('');
      setShowAddClauseModal(false);
    }, []);

    const openSignatureModal = React.useCallback(() => {
      setShowSignatureModal(true);
    }, []);

    const clearSignature = React.useCallback(() => {
      signatureRef.current?.clear();
      setSignature('');
      setSectionTouched();
    }, [setSectionTouched]);

    const closeSignatureModal = React.useCallback(() => {
      clearSignature();
      setShowSignatureModal(false);
      setIsSignatureEnabled(false);
    }, [clearSignature]);

    const onChangeClauseTitle = React.useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        const {target} = event;
        setExtraClauseTitle(target.value);
      },
      [],
    );

    const onChangeClauseContent = (value: string) => {
      setExtraClauseContent(value);
    };

    const addSignature = React.useCallback(() => {
      setManagerSignature(signature);
      setShowSignatureModal(false);
      setIsSignatureEnabled(false);
    }, [signature]);

    const saveSignature = React.useCallback(() => {
      const signature = signatureRef.current?.getCanvas()?.toDataURL();
      setSignature(signature);
      setSectionTouched();
    }, [setSectionTouched]);

    const handleSignatureEnable = React.useCallback(() => {
      setIsSignatureEnabled(true);
    }, []);

    const removeExtraClause = React.useCallback(
      (removableIndex: number) => {
        const nextExtraClauses = extraClauses.filter(
          (extraClause, index) => index !== removableIndex,
        );
        setExtraClauses(nextExtraClauses);
        setSectionTouched();
      },
      [extraClauses, setSectionTouched],
    );

    const addClause = React.useCallback(() => {
      const newExtraClause = {
        title: extraClauseTitle,
        content: extraClauseContent,
      };

      let newExtraClauses = [...extraClauses];
      newExtraClauses.push(newExtraClause);
      setExtraClauses(newExtraClauses);
      closeAddClauseModal();
      setSectionTouched();
    }, [
      closeAddClauseModal,
      extraClauseContent,
      extraClauseTitle,
      extraClauses,
      setSectionTouched,
    ]);

    const startContractSampleGeneration = async () => {
      setGenerationContractStatus(CONTRACT_GENERATION_STATUSES.request);
      const payload = getContractSamplePayload(getValues());
      await setShouldDownloadContract(true);
      const {error, data} = await api.housings.createContractSample(payload);

      if (!isMounted.current) {
        return;
      }

      if (data?.id) {
        setContractId(data.id);
      }
      if (error) {
        toastResponseError(error);
        setGenerationContractStatus(CONTRACT_GENERATION_STATUSES.failed);
      }
    };

    const submitAndGenerateContractSample = async () => {
      setGenerationContractStatus(CONTRACT_GENERATION_STATUSES.started);
      await handleSubmit(
        async () => {
          await startContractSampleGeneration();
        },
        () => {
          setGenerationContractStatus(CONTRACT_GENERATION_STATUSES.failed);
        },
      )();
    };

    const getContractSamplePayload = (data: any) => {
      return {
        ...getHousingPayload(data),
        ...getContractsPayload(data),
      };
    };

    const getHousingPayload = (data: any) => {
      return buildHousingPayload(data, country || '');
    };

    const getContractsPayload = (data: any) => {
      return {
        is_contract_enabled: true,
        manager_signature:
          managerSignature && !managerSignature?.startsWith('https')
            ? managerSignature
            : undefined,
        manager_signature_link: managerSignature?.startsWith('https')
          ? managerSignature
          : undefined,
        extra_clauses: extraClauses,
        [FORM_NAMES.manager_birth_date]: isValid(data[FORM_NAMES.manager_birth_date])
          ? format(data[FORM_NAMES.manager_birth_date], 'yyyy-MM-dd')
          : undefined,
        [FORM_NAMES.manager_name]: data[FORM_NAMES.manager_name] ?? undefined,
      };
    };

    const submitAndOpenExportModal = async () => {
      await handleSubmit(() => {
        openExportModal();
      })();
    };

    const renderContractTypesSections = (contractType: CONTRACT_TYPES) => {
      return (
        <>
          <CustomContractsListStyled
            housingId={housingId}
            hidden={contractType !== CONTRACT_TYPES.custom}
          />
          <Layout hidden={contractType !== CONTRACT_TYPES.standard}>
            <FormWrapper>
              {fields.display[FORM_NAMES.contract_title] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.contract_title, {
                      required: fields.required[FORM_NAMES.contract_title],
                      maxLength: {
                        value: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.contract_title],
                        message: t('max_length', {
                          length: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.contract_title],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('contract_title'),
                      fields.required[FORM_NAMES.contract_title],
                    )}
                    error={errors[FORM_NAMES.contract_title]?.message}
                    disabled={disabled}
                    placeholder={t('enter_text')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.contract_law] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.contract_law, {
                      required: fields.required[FORM_NAMES.contract_law],
                      maxLength: {
                        value: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.contract_law],
                        message: t('max_length', {
                          length: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.contract_law],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('contract_law'),
                      fields.required[FORM_NAMES.contract_law],
                    )}
                    error={errors[FORM_NAMES.contract_law]?.message}
                    disabled={disabled}
                    placeholder={t('enter_text')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.address] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.address, {
                      required: fields.required[FORM_NAMES.address],
                      maxLength: {
                        value: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.address],
                        message: t('max_length', {
                          length: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.address],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('address'),
                      fields.required[FORM_NAMES.address],
                    )}
                    error={errors[FORM_NAMES.address]?.message}
                    disabled={disabled}
                    placeholder={t('enter_address')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.tourism_registration_number] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.tourism_registration_number, {
                      required: fields.required[FORM_NAMES.tourism_registration_number],
                      maxLength: {
                        value:
                          CONTRACT_FIELDS_MAX_LENGTH[
                            FORM_NAMES.tourism_registration_number
                          ],
                        message: t('max_length', {
                          length:
                            CONTRACT_FIELDS_MAX_LENGTH[
                              FORM_NAMES.tourism_registration_number
                            ],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('tourism_registration_number'),
                      fields.required[FORM_NAMES.tourism_registration_number],
                    )}
                    error={errors[FORM_NAMES.tourism_registration_number]?.message}
                    disabled={disabled}
                    placeholder={t('enter_number')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.vatin] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.vatin, {
                      required: fields.required[FORM_NAMES.vatin],
                      maxLength: {
                        value: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.vatin],
                        message: t('max_length', {
                          length: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.vatin],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('vatin'),
                      fields.required[FORM_NAMES.vatin],
                    )}
                    error={errors[FORM_NAMES.vatin]?.message}
                    disabled={disabled}
                    placeholder={t('enter_text')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.manager_name] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.manager_name, {
                      required: fields.required[FORM_NAMES.manager_name],
                      maxLength: {
                        value: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.manager_name],
                        message: t('max_length', {
                          length: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.manager_name],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('owner_name'),
                      fields.required[FORM_NAMES.manager_name],
                    )}
                    error={errors[FORM_NAMES.manager_name]?.message}
                    disabled={disabled}
                    placeholder={t('enter_text')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.manager_birth_date] && (
                <FieldWrapper>
                  <Controller
                    control={control}
                    name={FORM_NAMES.manager_birth_date}
                    rules={{required: fields.required[FORM_NAMES.manager_birth_date]}}
                    render={({field, fieldState: {error}}) => {
                      return (
                        <Datepicker
                          label={getRequiredOrOptionalFieldLabel(
                            t('birth_date'),
                            fields.required[FORM_NAMES.manager_birth_date],
                          )}
                          error={error?.message}
                          disabled={disabled}
                          {...field}
                        />
                      );
                    }}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.manager_birth_place] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.manager_birth_place, {
                      required: fields.required[FORM_NAMES.manager_birth_place],
                      maxLength: {
                        value: CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.manager_birth_place],
                        message: t('max_length', {
                          length:
                            CONTRACT_FIELDS_MAX_LENGTH[FORM_NAMES.manager_birth_place],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('birth_place'),
                      fields.required[FORM_NAMES.manager_birth_place],
                    )}
                    error={errors[FORM_NAMES.manager_birth_place]?.message}
                    disabled={disabled}
                    placeholder={t('enter_text')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.manager_residence_address] && (
                <FieldWrapper>
                  <InputController
                    {...register(FORM_NAMES.manager_residence_address, {
                      required: fields.required[FORM_NAMES.manager_residence_address],
                      maxLength: {
                        value:
                          CONTRACT_FIELDS_MAX_LENGTH[
                            FORM_NAMES.manager_residence_address
                          ],
                        message: t('max_length', {
                          length:
                            CONTRACT_FIELDS_MAX_LENGTH[
                              FORM_NAMES.manager_residence_address
                            ],
                        }),
                      },
                    })}
                    control={control}
                    label={getRequiredOrOptionalFieldLabel(
                      t('owner_address'),
                      fields.required[FORM_NAMES.manager_residence_address],
                    )}
                    error={errors[FORM_NAMES.manager_residence_address]?.message}
                    disabled={disabled}
                    placeholder={t('enter_text')}
                  />
                </FieldWrapper>
              )}
              {fields.display[FORM_NAMES.manager_phone] && (
                <FieldWrapper>
                  <Controller
                    control={control}
                    name={FORM_NAMES.manager_phone}
                    rules={{
                      required: fields.required[FORM_NAMES.manager_phone],
                    }}
                    render={({field, fieldState: {error}}) => {
                      return (
                        <PhoneInput
                          label={getRequiredOrOptionalFieldLabel(
                            t('contact_phone'),
                            fields.required[FORM_NAMES.manager_phone],
                          )}
                          disabled={disabled}
                          defaultCode={housing?.manager_phone_code}
                          defaultInputValue={housing?.manager_phone_value}
                          placeholder={t('enter_phone')}
                          error={error?.message}
                          {...field}
                        />
                      );
                    }}
                  />
                </FieldWrapper>
              )}
            </FormWrapper>
            <Divider />
            <ExtraInfoWrapper>
              <ExtraInfoSection>
                <AddButton onClick={openAddClauseModal} disabled={disabled} type="button">
                  <AddBtnImg src={plusIcon} alt="Plus" />
                  <AddBtnText>{t('add_extra_clause')}</AddBtnText>
                </AddButton>
                {Boolean(extraClauses.length) && (
                  <ExtraClausesList>
                    {extraClauses.map((extraClause, index) => {
                      return (
                        <ExtraClauseItem key={index}>
                          <ExtraClauseItemDocumentImg src={documentIcon} alt="document" />
                          <ExtraClauseItemText>{extraClause.title}</ExtraClauseItemText>
                          <RemoveExtraClauseButton
                            onClick={() => removeExtraClause(index)}
                            disabled={disabled}
                          >
                            <img src={removeIcon} alt="Cross" />
                          </RemoveExtraClauseButton>
                        </ExtraClauseItem>
                      );
                    })}
                  </ExtraClausesList>
                )}
              </ExtraInfoSection>
              <ExtraInfoSection>
                <AddButton onClick={openSignatureModal} disabled={disabled} type="button">
                  <AddBtnImg src={plusIcon} alt="Plus" />
                  <AddBtnText>{t('add_signature')}</AddBtnText>
                </AddButton>
                {managerSignature && (
                  <SignatureImg src={managerSignature} alt="Signature" />
                )}
              </ExtraInfoSection>
              <GenerateContractButton
                status={generationContractStatus}
                onClick={submitAndGenerateContractSample}
                disabled={disabled}
                icon={<BtnIcon src={writingIcon} alt="Notes" />}
                secondary
              />
              <ExportSettingsButtonWrapper>
                <Button
                  secondary
                  disabled={isExporting}
                  label={t('export_settings_to_other_properties')}
                  onClick={submitAndOpenExportModal}
                />
              </ExportSettingsButtonWrapper>
            </ExtraInfoWrapper>
          </Layout>
        </>
      );
    };

    return (
      <Section title={t('contracts_title')} subtitle={t('contracts_subtitle')}>
        <Content>
          {isExportModalOpen && (
            <ExportContractsSettingsModal
              open
              onClose={closeExportModal}
              housing={housing}
              getContractsPayload={() => getContractsPayload(getValues())}
            />
          )}
          <Switch
            checked={isSectionActive}
            onChange={toggleIsSectionActive}
            label={t('activate_contracts')}
            disabled={disabled}
          />
          {isSectionActive && (
            <Subsection
              title={t('type_of_contract_subsection')}
              subtitle={t('select_contracts_type_description')}
            >
              <ContractsTypeSelectors
                isTabType={true}
                selectorsFormNames={ContractTypesSettingsOptions}
                preloadedSelectorsData={contractTypesOptions.standard}
                disabled={disabled}
                // setIsSelectorsTouched={setIsSelectorsTouched}
                radioValues={contractTypesOptions}
              />
              {renderContractTypesSections(selectedContractType)}
            </Subsection>
          )}
        </Content>
        {showAddClauseModal && (
          <Modal
            open
            iconSrc={clauseIcon}
            iconAlt="Clause"
            onClose={closeAddClauseModal}
            title={t('extra_clause')}
          >
            <ExtraClauseModalWrapper>
              <ExtraClauseInputWrapper>
                <Input
                  value={extraClauseTitle}
                  onChange={onChangeClauseTitle}
                  label={t('title')}
                  placeholder={t('enter_title')}
                />
              </ExtraClauseInputWrapper>
              <ClauseTitleLabel>{t('clause')}</ClauseTitleLabel>
              <ExtraClauseDetails
                placeholder={t('enter_clause')}
                onChange={ (event) => {
                  onChangeClauseContent(event.target.value);
                }}
             />
              <ExtraClauseButtonsWrapper>
                <ModalButton
                  label={<ModalBtnLabel>{t('add_clause')}</ModalBtnLabel>}
                  onClick={addClause}
                  disabled={!extraClauseTitle}
                />
                <ModalButton
                  secondary
                  onClick={closeAddClauseModal}
                  label={t('cancel')}
                />
              </ExtraClauseButtonsWrapper>
            </ExtraClauseModalWrapper>
          </Modal>
        )}
        {showSignatureModal && (
          <Modal open onClose={closeSignatureModal}>
            <SignatureModalContent>
              <SignatureCanvas
                ref={signatureRef}
                onClear={clearSignature}
                onEnable={handleSignatureEnable}
                enabled={isSignatureEnabled}
                hasSignature={Boolean(signature)}
                onEnd={saveSignature}
              />
              <SignatureButtonsWrapper>
                <ModalButton onClick={addSignature} label={t('done')} />
                <ModalButton
                  secondary
                  onClick={closeSignatureModal}
                  label={t('cancel')}
                />
              </SignatureButtonsWrapper>
            </SignatureModalContent>
          </Modal>
        )}
      </Section>
    );
  },
);

HousingContractsSection.defaultProps = defaultProps;
const MemoizedHousingContractsSection = React.memo(HousingContractsSection);
export {MemoizedHousingContractsSection};
