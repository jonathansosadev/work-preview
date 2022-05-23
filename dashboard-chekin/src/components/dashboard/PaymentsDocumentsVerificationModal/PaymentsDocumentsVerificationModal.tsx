import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {Controller, useForm} from 'react-hook-form';
import {useQueryClient, MutationStatus, useMutation} from 'react-query';
import i18n from '../../../i18n';
import {
  CREDITOR_TYPES,
  CREDITOR_TYPES_OPTIONS,
  PAYMENT_PROVIDERS,
} from '../../../utils/constants';
import {
  getBase64,
  getFileSizeMB,
  getRequiredOrOptionalFieldLabel,
  toastResponseError,
} from '../../../utils/common';
import {useIsMounted} from '../../../utils/hooks';
import {
  CoreError,
  PAYMENTS_SETTINGS_STATUSES,
  PaymentsSettings,
} from '../../../utils/types';
import {USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY} from '../UserPaymentsProviderIncompleteModal';
import api from '../../../api';
import xIcon from '../../../assets/x_blue.svg';
import transferIcon from '../../../assets/bank-transfer-icon.png';
import transferIcon2x from '../../../assets/bank-transfer-icon@2x.png';
import checkIcon from '../../../assets/check-filled.svg';
import documentsIcon from '../../../assets/documents-icon.svg';
import Select from '../Select';
import Modal from '../Modal';
import Loader from '../../common/Loader';
import Button from '../ModalButton';
import FileInput from '../FileInput';
import {InputController} from '../Input';
import {FieldWrapper} from '../../../styled/common';
import {
  AccountDetailsContent,
  CloseButton,
  Content,
  DocumentsInfoContent,
  DocumentsInfoNextButtonWrapper,
  DocumentsInfoText,
  DocumentsInfoTitle,
  DocumentsUploadContent,
  DocumentsVerificationNextButtonWrapper,
  DocumentsVerificationSubtitle,
  DocumentsVerificationTitle,
  FileInputWrapper,
  NextButton,
  SuccessText,
  SuccessTitle,
  TaxesIcon,
  TransferIcon,
  TwoButtonsWrapper,
  SwiftInput,
} from './styled';
import FormValueController from '../FormValueController';

const ACCEPTABLE_DOCUMENTS = 'image/*, application/pdf';
const MAX_FILE_SIZE_MB = 8;

enum FORM_NAMES {
  companyName = 'company_name',
  creditorType = 'creditor_type',
  iban = 'iban',
  swift = 'swift',
  dniFrontSide = 'DNI_frontside',
  dniBackSide = 'DNI_backside',
  certificateOfAccountOwnership = 'PC_CAO',
  taxIdentificationNumber = 'PC_CIF',
  articlesOfIncorporations = 'PC_AIO',
  freelancerReceiptForm = 'PC_FRF',
}

type FormTypes = {
  [FORM_NAMES.creditorType]: {
    value: CREDITOR_TYPES;
    label: string;
  };
  [FORM_NAMES.companyName]: string;
  [FORM_NAMES.iban]: string;
  [FORM_NAMES.swift]: string;
  [FORM_NAMES.certificateOfAccountOwnership]: File;
  [FORM_NAMES.dniFrontSide]: File;
  [FORM_NAMES.dniBackSide]: File;
  [FORM_NAMES.articlesOfIncorporations]: File;
  [FORM_NAMES.taxIdentificationNumber]: File;
  [FORM_NAMES.freelancerReceiptForm]: File;
};

const INIT_DISPLAY_FIELDS = {
  [FORM_NAMES.companyName]: true,
  [FORM_NAMES.creditorType]: true,
  [FORM_NAMES.iban]: true,
  [FORM_NAMES.swift]: true,
  [FORM_NAMES.certificateOfAccountOwnership]: false,
  [FORM_NAMES.dniFrontSide]: false,
  [FORM_NAMES.dniBackSide]: false,
  [FORM_NAMES.articlesOfIncorporations]: false,
  [FORM_NAMES.taxIdentificationNumber]: false,
  [FORM_NAMES.freelancerReceiptForm]: false,
};

function getDisplayFields(creditorType?: CREDITOR_TYPES) {
  switch (creditorType) {
    case CREDITOR_TYPES.company: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.certificateOfAccountOwnership]: true,
        [FORM_NAMES.dniFrontSide]: true,
        [FORM_NAMES.dniBackSide]: true,
        [FORM_NAMES.articlesOfIncorporations]: true,
        [FORM_NAMES.taxIdentificationNumber]: true,
      };
    }
    case CREDITOR_TYPES.freelance: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.certificateOfAccountOwnership]: true,
        [FORM_NAMES.dniFrontSide]: true,
        [FORM_NAMES.dniBackSide]: true,
        [FORM_NAMES.freelancerReceiptForm]: true,
      };
    }
    case CREDITOR_TYPES.individual: {
      return {
        ...INIT_DISPLAY_FIELDS,
        [FORM_NAMES.certificateOfAccountOwnership]: true,
        [FORM_NAMES.dniFrontSide]: true,
        [FORM_NAMES.dniBackSide]: true,
      };
    }
    default: {
      return INIT_DISPLAY_FIELDS;
    }
  }
}

const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.companyName]: i18n.t('required'),
  [FORM_NAMES.creditorType]: i18n.t('required'),
  [FORM_NAMES.iban]: i18n.t('required'),
  [FORM_NAMES.certificateOfAccountOwnership]: i18n.t('required'),
  [FORM_NAMES.dniFrontSide]: i18n.t('required'),
  [FORM_NAMES.dniBackSide]: i18n.t('required'),
  [FORM_NAMES.articlesOfIncorporations]: i18n.t('required'),
  [FORM_NAMES.taxIdentificationNumber]: i18n.t('required'),
  [FORM_NAMES.freelancerReceiptForm]: i18n.t('required'),
  [FORM_NAMES.swift]: false,
};

function getRequiredFields(creditorType?: CREDITOR_TYPES) {
  switch (creditorType) {
    default: {
      return INIT_REQUIRED_FIELDS;
    }
  }
}

function getFields(creditorType?: CREDITOR_TYPES) {
  const display = getDisplayFields(creditorType);
  const required = getRequiredFields(creditorType);

  return {
    display,
    required,
  };
}

type PaymentsDocumentsVerificationModalProps = {
  onClose: () => void;
  open: boolean;
  paymentsSettingsStatus: MutationStatus;
  paymentsSettings: PaymentsSettings;
};

const defaultProps: Partial<PaymentsDocumentsVerificationModalProps> = {
  open: false,
};

function PaymentsDocumentsVerificationModal({
  onClose,
  open,
  paymentsSettings,
  paymentsSettingsStatus,
}: PaymentsDocumentsVerificationModalProps) {
  const [step, setStep] = React.useState(1);
  const [data, setData] = React.useState<Partial<FormTypes>>({});

  React.useEffect(
    function preloadData() {
      if (!paymentsSettings) {
        return;
      }

      const creditorType = Object.values(CREDITOR_TYPES_OPTIONS).find((type) => {
        return type.value === paymentsSettings.creditor_type;
      });

      const nextData = {
        ...paymentsSettings,
        documents: undefined,
        [FORM_NAMES.creditorType]: creditorType,
      };
      setData(nextData);
    },
    [paymentsSettings],
  );

  const clearPaymentSettingsIncompleteModalStorageKey = () => {
    localStorage.removeItem(USER_PAYMENTS_PROVIDER_INCOMPLETE_MODAL_DENIED_STORAGE_KEY);
  };

  const goNext = () => {
    setStep((prevState) => {
      return prevState + 1;
    });
  };

  const goBack = () => {
    setStep((prevState) => {
      return prevState - 1;
    });
  };

  return (
    <Modal open={open}>
      <Content>
        <CloseButton type="button" onClick={onClose}>
          <img src={xIcon} alt="Cross" />
        </CloseButton>
        {step === 1 && <DocumentsInfoStep goNext={goNext} />}
        {step === 2 && (
          <AccountDetailsStep goNext={goNext} saveData={setData} data={data} />
        )}
        {step === 3 && (
          <DocumentsUploadStep
            goBack={goBack}
            goNext={goNext}
            data={data}
            saveData={setData}
            paymentsSettings={paymentsSettings}
            paymentsSettingsStatus={paymentsSettingsStatus}
          />
        )}
        {step === 4 && (
          <SuccessStep
            onOk={() => {
              onClose();
              clearPaymentSettingsIncompleteModalStorageKey();
            }}
          />
        )}
      </Content>
    </Modal>
  );
}

type DocumentsInfoStepProps = {
  goNext: () => void;
};

function DocumentsInfoStep({goNext}: DocumentsInfoStepProps) {
  const {t} = useTranslation();
  return (
    <div>
      <TransferIcon
        src={transferIcon2x}
        srcSet={`${transferIcon} 1x, ${transferIcon2x} 2x`}
      />
      <DocumentsInfoContent>
        <DocumentsInfoTitle>{t('documents_info_step_title')}</DocumentsInfoTitle>
        <DocumentsInfoText>
          <Trans i18nKey="documents_info_text">
            <p>
              Enable bank transfer to receive the balance from the payments made in the
              Single Euro Payments Area (SEPA) directly to your account.
            </p>
            <p>
              To set-up the SEPA Bank Transfer, you'll need to provide your bank account
              details such as bank <strong>name</strong> and <strong>IBAN</strong> format
              along with some <strong>documentation</strong> to verify the account.
            </p>
            <p>
              The verification process takes between <strong>1-3 days</strong> to be
              completed.
            </p>
          </Trans>
        </DocumentsInfoText>
      </DocumentsInfoContent>
      <DocumentsInfoNextButtonWrapper>
        <NextButton label={t('start').toUpperCase()} type="button" onClick={goNext} />
      </DocumentsInfoNextButtonWrapper>
    </div>
  );
}

type AccountDetailsStepProps = {
  goNext: () => void;
  saveData: React.Dispatch<React.SetStateAction<Partial<FormTypes>>>;
  data: Partial<FormTypes>;
};

function AccountDetailsStep({goNext, saveData, data}: AccountDetailsStepProps) {
  const {t} = useTranslation();
  const {
    register,
    control,
    watch,
    handleSubmit,
    formState: {errors},
  } = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const creditorType = watch(FORM_NAMES.creditorType)?.value;
  const [fields, setFields] = React.useState(() => {
    return getFields(creditorType);
  });

  const companyNameLabel =
    creditorType === CREDITOR_TYPES.company
      ? t('company_name')
      : t('creditor_name_surname');

  React.useEffect(() => {
    const nextFields = getFields(creditorType);
    setFields(nextFields);
  }, [creditorType]);

  const onSubmit = (data: Partial<FormTypes>) => {
    saveData((prevState) => {
      return {
        ...prevState,
        ...data,
      };
    });
    goNext();
  };

  return (
    <div>
      <DocumentsVerificationTitle>
        {t('documents_account_details_title')}
      </DocumentsVerificationTitle>
      <DocumentsVerificationSubtitle>
        {t('documents_account_details_subtitle')}
      </DocumentsVerificationSubtitle>
      <AccountDetailsContent>
        {fields.display[FORM_NAMES.creditorType] && (
          <FieldWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.creditorType}
              rules={{required: fields.required[FORM_NAMES.creditorType]}}
              defaultValue={data?.[FORM_NAMES.creditorType]}
              render={({field, fieldState: {error}}) => {
                return (
                  <Select
                    {...field}
                    options={Object.values(CREDITOR_TYPES_OPTIONS)}
                    label={getRequiredOrOptionalFieldLabel(
                      t('creditor_type'),
                      fields.required[FORM_NAMES.creditorType],
                    )}
                    placeholder={t('select_your_type')}
                    error={error?.message}
                  />
                );
              }}
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.iban] && (
          <FieldWrapper>
            <InputController
              {...register(FORM_NAMES.iban, {
                required: fields.required[FORM_NAMES.iban],
              })}
              control={control}
              error={errors[FORM_NAMES.iban]?.message}
              label={getRequiredOrOptionalFieldLabel(
                t('iban'),
                fields.required[FORM_NAMES.iban],
              )}
              placeholder={t('enter_your_iban')}
              defaultValue={data?.[FORM_NAMES.iban]}
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.companyName] && (
          <FieldWrapper>
            <InputController
              {...register(FORM_NAMES.companyName, {
                required: fields.required[FORM_NAMES.companyName],
              })}
              control={control}
              error={errors[FORM_NAMES.companyName]?.message}
              label={getRequiredOrOptionalFieldLabel(
                companyNameLabel,
                fields.required[FORM_NAMES.companyName],
              )}
              placeholder={t('enter_name')}
              defaultValue={data?.[FORM_NAMES.companyName]}
            />
          </FieldWrapper>
        )}
        {fields.display[FORM_NAMES.swift] && (
          <FieldWrapper>
            <FormValueController name={FORM_NAMES.swift} control={control}>
              {(isEmpty) => (
                <SwiftInput
                  empty={isEmpty}
                  {...register(FORM_NAMES.swift, {
                    required: fields.required[FORM_NAMES.swift],
                  })}
                  control={control}error={errors[FORM_NAMES.swift]?.message}
                  label={t('swift')}
                  placeholder={t('enter_your_swift')}
                  defaultValue={data?.[FORM_NAMES.swift]}
                />
              )}
            </FormValueController>
          </FieldWrapper>
        )}
      </AccountDetailsContent>
      <DocumentsVerificationNextButtonWrapper>
        <NextButton
          type="button"
          onClick={handleSubmit(onSubmit)}
          label={t('next').toUpperCase()}
        />
      </DocumentsVerificationNextButtonWrapper>
    </div>
  );
}

type DocumentsUploadStepProps = {
  data: Partial<FormTypes>;
  saveData: React.Dispatch<React.SetStateAction<Partial<FormTypes>>>;
  goNext: () => void;
  goBack: () => void;
  paymentsSettingsStatus: MutationStatus;
  paymentsSettings: PaymentsSettings;
};

function DocumentsUploadStep({
  goBack,
  goNext,
  saveData,
  data,
  paymentsSettingsStatus,
  paymentsSettings,
}: DocumentsUploadStepProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const {control, handleSubmit, getValues} = useForm({
    shouldUnregister: true,
  });
  const creditorType = data?.[FORM_NAMES.creditorType]?.value;
  const [fields] = React.useState(() => {
    return getFields(creditorType);
  });

  const dniFrontLabel =
    creditorType === CREDITOR_TYPES.company
      ? t('dni_passport_front_admin')
      : t('dni_passport_front_true_holder');

  const dniBackLabel =
    creditorType === CREDITOR_TYPES.company
      ? t('dni_passport_back_admin')
      : t('dni_passport_back_true_holder');

  const {isLoading: isMutatingPaymentSettings, ...paymentSettingsMutation} = useMutation<
    PaymentsSettings,
    CoreError,
    {payload: any; id?: string}
  >(api.paymentsSettings.mutatePaymentSettings, {
    onError: (error) => {
      toastResponseError(error);
    },
    onSuccess: async (data) => {
      queryClient.setQueryData('paymentsSettings', data);
      queryClient.invalidateQueries('paymentsMovementsPreview');

      if (isMounted.current) {
        goNext();
      }
    },
  });

  const handleGoBack = () => {
    saveData((prevState) => {
      return {
        ...prevState,
        ...getValues(),
      };
    });
    goBack();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement> | null) => {
    const files = event?.target?.files;

    if (files?.length) {
      return files[0];
    }
    return null;
  };

  const validateFormFileSize = (file: File) => {
    if (!file) {
      return true;
    }

    const fileSizeMB = getFileSizeMB(file);

    if (fileSizeMB > MAX_FILE_SIZE_MB) {
      return t('max_file_size_is_number_mb', {
        number: MAX_FILE_SIZE_MB,
      }) as string;
    }

    return true;
  };

  const getDocumentsPayload = async (formData: Partial<FormTypes>) => {
    const creditorType = data[FORM_NAMES.creditorType]?.value;

    if (creditorType === CREDITOR_TYPES.individual) {
      const dniFrontSide = await getBase64(formData[FORM_NAMES.dniFrontSide]!);
      const dniBackSide = await getBase64(formData[FORM_NAMES.dniBackSide]!);
      const certificate = await getBase64(
        formData[FORM_NAMES.certificateOfAccountOwnership]!,
      );

      return [
        {
          type: 'PC_DNI',
          front_side_scan: dniFrontSide,
          back_side_scan: dniBackSide,
        },
        {
          type: 'PC_CAO',
          front_side_scan: certificate,
        },
      ];
    }

    if (creditorType === CREDITOR_TYPES.freelance) {
      const dniFrontSide = await getBase64(formData[FORM_NAMES.dniFrontSide]!);
      const dniBackSide = await getBase64(formData[FORM_NAMES.dniBackSide]!);
      const certificate = await getBase64(
        formData[FORM_NAMES.certificateOfAccountOwnership]!,
      );
      const freelancerReceipt = await getBase64(
        formData[FORM_NAMES.freelancerReceiptForm]!,
      );

      return [
        {
          type: 'PC_DNI',
          front_side_scan: dniFrontSide,
          back_side_scan: dniBackSide,
        },
        {
          type: 'PC_CAO',
          front_side_scan: certificate,
        },
        {
          type: 'PC_FRF',
          front_side_scan: freelancerReceipt,
        },
      ];
    }

    if (creditorType === CREDITOR_TYPES.company) {
      const dniFrontSide = await getBase64(formData[FORM_NAMES.dniFrontSide]!);
      const dniBackSide = await getBase64(formData[FORM_NAMES.dniBackSide]!);
      const certificate = await getBase64(
        formData[FORM_NAMES.certificateOfAccountOwnership]!,
      );
      const articlesOfIncorporation = await getBase64(
        formData[FORM_NAMES.articlesOfIncorporations]!,
      );
      const taxIdentificationNumber = await getBase64(
        formData[FORM_NAMES.taxIdentificationNumber]!,
      );

      return [
        {
          type: 'PC_DNI',
          front_side_scan: dniFrontSide,
          back_side_scan: dniBackSide,
        },
        {
          type: 'PC_AIO',
          front_side_scan: articlesOfIncorporation,
        },
        {
          type: 'PC_CAO',
          front_side_scan: certificate,
        },
        {
          type: 'PC_CIF',
          front_side_scan: taxIdentificationNumber,
        },
      ];
    }

    return [];
  };

  const getFieldValueIfVisible = (name: FORM_NAMES) => {
    return fields.display[name] ? data[name] : undefined;
  };

  const getPayload = async (formData: Partial<FormTypes>) => {
    const documents = await getDocumentsPayload(formData);

    return {
      ...data,
      ...formData,
      documents,
      provider: PAYMENT_PROVIDERS.paycomet,
      status: PAYMENTS_SETTINGS_STATUSES.readyForValidation,
      [FORM_NAMES.iban]: getFieldValueIfVisible(FORM_NAMES.iban),
      [FORM_NAMES.swift]: getFieldValueIfVisible(FORM_NAMES.swift),
      [FORM_NAMES.companyName]: getFieldValueIfVisible(FORM_NAMES.companyName),
      [FORM_NAMES.creditorType]: creditorType,
      [FORM_NAMES.dniFrontSide]: undefined,
      [FORM_NAMES.dniBackSide]: undefined,
      [FORM_NAMES.certificateOfAccountOwnership]: undefined,
      [FORM_NAMES.taxIdentificationNumber]: undefined,
      [FORM_NAMES.articlesOfIncorporations]: undefined,
      [FORM_NAMES.freelancerReceiptForm]: undefined,
    };
  };

  const onSubmit = async (formData: Partial<FormTypes>) => {
    const payload = await getPayload(formData);
    paymentSettingsMutation.mutate({payload, id: paymentsSettings?.id});
  };

  return (
    <div>
      <DocumentsVerificationTitle>
        {t('documents_upload_step_title')}
      </DocumentsVerificationTitle>
      <DocumentsVerificationSubtitle>
        {t('documents_upload_step_subtitle')}
      </DocumentsVerificationSubtitle>
      <DocumentsUploadContent>
        {fields.display[FORM_NAMES.dniFrontSide] && (
          <FileInputWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.dniFrontSide}
              rules={{
                required: fields.required[FORM_NAMES.dniFrontSide],
                validate: validateFormFileSize,
              }}
              defaultValue={data?.[FORM_NAMES.dniFrontSide]}
              render={({field: {onChange, ...field}, fieldState: {error}}) => {
                return (
                  <FileInput
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    label={getRequiredOrOptionalFieldLabel(
                      dniFrontLabel,
                      fields.required[FORM_NAMES.dniFrontSide],
                    )}
                    error={error?.message}
                    accept={ACCEPTABLE_DOCUMENTS}
                    disabled={isMutatingPaymentSettings}
                    {...field}
                  />
                );
              }}
            />
          </FileInputWrapper>
        )}
        {fields.display[FORM_NAMES.certificateOfAccountOwnership] && (
          <FileInputWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.certificateOfAccountOwnership}
              rules={{
                required: fields.required[FORM_NAMES.certificateOfAccountOwnership],
                validate: validateFormFileSize,
              }}
              defaultValue={data?.[FORM_NAMES.certificateOfAccountOwnership]}
              render={({field: {onChange, ...field}, fieldState: {error}}) => {
                return (
                  <FileInput
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    error={error?.message}
                    label={getRequiredOrOptionalFieldLabel(
                      t('account_ownership_cert'),
                      fields.required[FORM_NAMES.certificateOfAccountOwnership],
                    )}
                    accept={ACCEPTABLE_DOCUMENTS}
                    disabled={isMutatingPaymentSettings}
                    {...field}
                  />
                );
              }}
            />
          </FileInputWrapper>
        )}
        {fields.display[FORM_NAMES.dniBackSide] && (
          <FileInputWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.dniBackSide}
              rules={{
                required: fields.required[FORM_NAMES.dniBackSide],
                validate: validateFormFileSize,
              }}
              defaultValue={data?.[FORM_NAMES.dniBackSide]}
              render={({field: {onChange, ...field}, fieldState: {error}}) => {
                return (
                  <FileInput
                    error={error?.message}
                    label={getRequiredOrOptionalFieldLabel(
                      dniBackLabel,
                      fields.required[FORM_NAMES.dniBackSide],
                    )}
                    accept={ACCEPTABLE_DOCUMENTS}
                    disabled={isMutatingPaymentSettings}
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    {...field}
                  />
                );
              }}
            />
          </FileInputWrapper>
        )}
        {fields.display[FORM_NAMES.articlesOfIncorporations] && (
          <FileInputWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.articlesOfIncorporations}
              rules={{
                required: fields.required[FORM_NAMES.articlesOfIncorporations],
                validate: validateFormFileSize,
              }}
              defaultValue={data?.[FORM_NAMES.articlesOfIncorporations]}
              render={({field: {onChange, ...field}, fieldState: {error}}) => {
                return (
                  <FileInput
                    label={getRequiredOrOptionalFieldLabel(
                      t('articles_of_incorporations_and_other'),
                      fields.required[FORM_NAMES.articlesOfIncorporations],
                    )}
                    error={error?.message}
                    accept={ACCEPTABLE_DOCUMENTS}
                    disabled={isMutatingPaymentSettings}
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    {...field}
                  />
                );
              }}
            />
          </FileInputWrapper>
        )}
        {fields.display[FORM_NAMES.taxIdentificationNumber] && (
          <FileInputWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.taxIdentificationNumber}
              rules={{
                required: fields.required[FORM_NAMES.taxIdentificationNumber],
                validate: validateFormFileSize,
              }}
              defaultValue={data?.[FORM_NAMES.taxIdentificationNumber]}
              render={({field: {onChange, ...field}, fieldState: {error}}) => {
                return (
                  <FileInput
                    label={getRequiredOrOptionalFieldLabel(
                      t('cif_tax_id'),
                      fields.required[FORM_NAMES.taxIdentificationNumber],
                    )}
                    error={error?.message}
                    accept={ACCEPTABLE_DOCUMENTS}
                    disabled={isMutatingPaymentSettings}
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    {...field}
                  />
                );
              }}
            />
          </FileInputWrapper>
        )}
        {fields.display[FORM_NAMES.freelancerReceiptForm] && (
          <FileInputWrapper>
            <Controller
              control={control}
              name={FORM_NAMES.freelancerReceiptForm}
              rules={{
                required: fields.required[FORM_NAMES.freelancerReceiptForm],
                validate: validateFormFileSize,
              }}
              defaultValue={data?.[FORM_NAMES.freelancerReceiptForm]}
              render={({field: {onChange, ...field}, fieldState: {error}}) => {
                return (
                  <FileInput
                    label={getRequiredOrOptionalFieldLabel(
                      t('freelancer_receipt_form'),
                      fields.required[FORM_NAMES.freelancerReceiptForm],
                    )}
                    error={error?.message}
                    accept={ACCEPTABLE_DOCUMENTS}
                    disabled={isMutatingPaymentSettings}
                    onChange={(event) => {
                      const file = handleFileChange(event);
                      onChange(file);
                    }}
                    {...field}
                  />
                );
              }}
            />
          </FileInputWrapper>
        )}
      </DocumentsUploadContent>
      {isMutatingPaymentSettings ? (
        <Loader height={40} width={40} label={t('loading')} />
      ) : (
        <TwoButtonsWrapper>
          <div>
            <NextButton
              disabled={paymentsSettingsStatus === 'loading'}
              label={t('next').toUpperCase()}
              onClick={handleSubmit(onSubmit)}
            />
          </div>
          <div>
            <Button secondary label={t('back')} onClick={handleGoBack} />
          </div>
        </TwoButtonsWrapper>
      )}
    </div>
  );
}

type SuccessStepProps = {
  onOk: () => void;
};

function SuccessStep({onOk}: SuccessStepProps) {
  const {t} = useTranslation();

  return (
    <div>
      <TaxesIcon src={documentsIcon} alt="Documents" />
      <SuccessTitle>
        <img src={checkIcon} alt="Check" /> {t('payments_docs_uploaded_title')}
      </SuccessTitle>
      <SuccessText>
        <Trans i18nKey={'payments_docs_uploaded_text'}>
          Please wait until the verification process is completed. The process takes
          between 1-3 days maximum. <b>Once verified and approved</b>, you could start
          requesting payments to your guests and transfer balance to your bank account.
        </Trans>
      </SuccessText>

      <TwoButtonsWrapper>
        <div>
          <NextButton label={t('ok').toUpperCase()} onClick={onOk} />
        </div>
      </TwoButtonsWrapper>
    </div>
  );
}

PaymentsDocumentsVerificationModal.defaultProps = defaultProps;
export {PaymentsDocumentsVerificationModal};
