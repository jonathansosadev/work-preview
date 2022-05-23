import React from 'react';
import {useHistory} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import {Controller, useForm, useWatch} from 'react-hook-form';
import {UseMutateFunction, useMutation, useQuery} from 'react-query';
import dracula from 'prism-react-renderer/themes/dracula';
import TextareaAutosize from 'react-textarea-autosize';
import {LiveProvider} from 'react-live';
import api from '../../../api';
import {FormTypes} from './types';
import {CUSTOM_DOCUMENTS_TYPES} from '../../../utils/constants';
import {
  CONTRACT_GENERATION_STATUSES,
  useGenerationContract,
} from '../../../hooks/useGenerationContract';
import {
  CONTRACTS_VARIABLES_OPTIONS,
  ErrorDuplicateUsingHousing,
  FORM_NAMES,
  INIT_REQUIRED_FIELDS,
} from './constants';
import {useUser} from '../../../context/user';
import {
  useErrorToast,
  useIsFormTouched,
  useIsMounted,
  useModalControls,
} from '../../../utils/hooks';
import {getDisplayFields, toastResponseError} from 'utils/common';
import {CustomDocument, Housing} from '../../../utils/types';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {getDisplayVariables} from './utils';
import {fetchHousings} from '../../../api/housings';
import {ACCOUNT_LINKS} from '../AccountSections';
import FloppyIconFilling from '../FloppyIconFilling';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';
import {useCountriesOptions} from '../../../hooks/useCountriesOptions';
import {IconSize} from '../FloppyIconFilling/styled';
import warningIcon from '../../../assets/warning-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import Section from '../Section';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import SelectPropsModal from '../SelectPropsModal';
import Select from '../Select';
import {Name} from '../Input/styled';
import {
  BottomSaveButton,
  ButtonSample,
  ContractDetailsInput,
  ContractDetailsSection,
  ContractDetailsTextarea,
  ContractInputsContainer,
  CustomContractHeader,
  EditorContainer,
  ErrorMessageInput,
  LiveEditorStyled,
  ModalTwoButtonsWrapperStyled,
  SaveButton,
  SectionsContainer,
  SectionWithoutExplicitStyles,
  SelectedPropItem,
  SelectedPropsContainer,
  SelectedPropText,
  SelectPropertyButton,
  SwitchButton,
  SwitchContainer,
  TextareaContainer,
  TinyDeleteBtn,
  TooltipStyled,
  TopSectionWrapper,
  VariablesDescription,
  VariablesItem,
  VariablesList,
  VariablesSection,
  VariablesTitle,
  VariablesTitleText,
  VariablesTooltip,
  VariableTooltip,
} from './styled';

type SelectedHousing = {
  label: string;
  value: string;
  data: Housing;
};

type FieldWithVariables = FORM_NAMES.text_format | FORM_NAMES.html_format | null;

type CurrentFocusField = {
  field: FieldWithVariables;
  ref: any;
};

enum SWITCH_BUTTONS {
  text,
  html,
}

const displayFormFields = getDisplayFields(FORM_NAMES);
const displayFields = {
  ...displayFormFields,
};

type CustomContractProps = {
  title: string;
  submitAction: UseMutateFunction<CustomDocument, any, Partial<CustomDocument>>;
  isLoading: boolean;
  checkboxesSource?: string[];
  defaultFormValues?: any;
};

function fetchShortHousings() {
  const fieldsQuery = ['id', 'name'].toString();

  return fetchHousings(
    `ordering=name&field_set=${fieldsQuery}&is_deactivated=false&is_contract_enabled=True`,
  );
}

function CustomContract({
  title,
  submitAction,
  checkboxesSource,
  defaultFormValues,
  isLoading,
}: CustomContractProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const history = useHistory();
  const user = useUser();
  const formMethods = useForm<FormTypes>({
    defaultValues: defaultFormValues,
    shouldUnregister: true,
  });
  const {
    watch,
    control,
    register,
    setValue,
    getValues,
    unregister,
    handleSubmit,
    formState: {errors},
  } = formMethods;
  const {isFormTouched} = useIsFormTouched({
    displayFields,
    watch,
    defaultValues: defaultFormValues,
  });
  const {countriesOptions} = useCountriesOptions({});
  const textCaretPositionRef = React.useRef(0);
  const [invalidTextVariables, setInvalidTextVariables] = React.useState<string | null>(
    null,
  );
  const [savedText, setSavedText] = React.useState('');
  const [savedHtml, setSavedHtml] = React.useState('');
  const [selectedHousings, setSelectedHousings] = React.useState<SelectedHousing[]>([]);
  const [isInitialSelectedHousingsSet, setIsInitialSelectedHousingsSet] = React.useState(
    false,
  );
  const [isLogoVariableDisabled, setIsLogoVariableDisabled] = React.useState(false);
  const [activeButton, setActiveButton] = React.useState<SWITCH_BUTTONS>(
    SWITCH_BUTTONS.text,
  );
  const selectedCountry = watch(FORM_NAMES.country)?.value;
  const textFormatField = useWatch({name: FORM_NAMES.text_format, control});
  const variables = React.useMemo(() => getDisplayVariables(selectedCountry), [
    selectedCountry,
  ]);

  const textAreaRef = React.useRef<TextareaAutosize>();
  const currentFocusFieldRef = React.useRef<CurrentFocusField>({
    ref: null,
    field: null,
  });
  const isActiveTextBtn = activeButton === SWITCH_BUTTONS.text;
  const isActiveHtmlBtn = activeButton === SWITCH_BUTTONS.html;
  const messageValue = isActiveTextBtn
    ? watch(FORM_NAMES.text_format)
    : watch(FORM_NAMES.html_format);

  const {
    isOpen: isSelectPropsModalOpen,
    openModal: openSelectPropsModal,
    closeModal: closeSelectPropsModal,
  } = useModalControls();

  const {
    isOpen: isWarningSaveModal,
    openModal: openWarningSaveModal,
    closeModal: closeWarningSaveModal,
  } = useModalControls();

  const {
    setShouldDownloadContract,
    status: generationContractStatus,
    setStatus: setGenerationContractStatus,
  } = useGenerationContract();

  const {
    data: shortHousings,
    status: shortHousingsStatus,
    error: shortHousingsError,
  } = useQuery('shortHousings', fetchShortHousings);
  useErrorToast(shortHousingsError, {
    notFoundMessage: 'Requested housing\\s could not be found. Please contact support.',
  });

  const housingsOptions = React.useMemo(() => {
    if (!shortHousings || !Array.isArray(shortHousings)) {
      return [];
    }

    return shortHousings.map((housing) => {
      return {
        label: housing.name,
        value: housing.id,
        country: housing?.location?.country?.code || '',
        data: housing,
      };
    });
  }, [shortHousings]);

  const {
    isAllChecked,
    toggleSelectAll,
    checkboxes,
    toggleIsChecked,
    isAnyCheckboxTouched,
    getSelectedHousingsCheckboxes,
  } = useHousingsSelectCheckboxes(housingsOptions, checkboxesSource);

  const isAnySectionTouched = isFormTouched || isAnyCheckboxTouched;

  const {
    linkToGo,
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
  } = useConfirmLeaveModal(isAnySectionTouched);

  const {mutate: generateSampleCustomContract} = useMutation<
    CustomDocument,
    Error,
    Partial<CustomDocument>
  >((payload) => api.documents.createCustomDocument(payload, true), {
    onError: (error) => {
      if (!isMounted.current) return;
      toastResponseError(error);
      setGenerationContractStatus(CONTRACT_GENERATION_STATUSES.failed);
    },
  });

  const keyUpCaretHandler = (e: any) => {
    if (
      e.code === 'ArrowRight' ||
      e.code === 'ArrowLeft' ||
      e.code === 'ArrowUp' ||
      e.code === 'ArrowDown'
    ) {
      handleTextCaretPos(e);
    }
  };

  const handleFocus = (fieldName: FieldWithVariables) => (e: any) => {
    currentFocusFieldRef.current.field = fieldName;
    currentFocusFieldRef.current.ref = e?.target || e;
  };

  React.useEffect(
    function handleEditorRef() {
      if (isActiveHtmlBtn) {
        const editorTextArea = document.querySelector(
          '.npm__react-simple-code-editor__textarea',
        );
        currentFocusFieldRef.current.field = FORM_NAMES.html_format;
        currentFocusFieldRef.current.ref = editorTextArea;
        const {onChange} = register(FORM_NAMES.html_format, {
          required: `${t('required')}`,
        });
        editorTextArea?.addEventListener('input', (e: any) => {
          setValue(FORM_NAMES.html_format, e.target.value);

          handleTextCaretPos(e);
        });
        editorTextArea?.addEventListener('change', onChange);
        editorTextArea?.addEventListener('click', (e: any) => {
          handleTextCaretPos(e);
        });
        editorTextArea?.addEventListener('keyup', keyUpCaretHandler);
      } else {
        handleFocus(FORM_NAMES.text_format)(textAreaRef.current);
        unregister(FORM_NAMES.html_format);
      }
    },
    // eslint-disable-next-line
    [activeButton],
  );

  React.useEffect(
    function handleSavedText() {
      if (isActiveTextBtn && savedText) {
        setValue(FORM_NAMES.text_format, savedText);
      } else if (savedHtml) {
        setValue(FORM_NAMES.html_format, savedHtml);
      }
    },
    // eslint-disable-next-line
    [activeButton],
  );

  const getArrayOfVariables = (text: string): Array<string> => {
    const reBrackets = /{(.*?)}/g;
    return text?.match(reBrackets) || [];
  };

  const checkValidArrayOfVariables = React.useCallback(
    (arrayOfVariables: Array<string>) => {
      const availableVars = variables.map((v) => v.value);
      const isInvalidAnyVariable = !arrayOfVariables.every((r) =>
        availableVars.includes(r),
      );
      const logoVariablesCount = arrayOfVariables.filter(
        (variable) => variable === CONTRACTS_VARIABLES_OPTIONS.housing_logo.value,
      ).length;

      logoVariablesCount > 0
        ? setIsLogoVariableDisabled(true)
        : setIsLogoVariableDisabled(false);

      if (isInvalidAnyVariable) {
        return t('invalid_variables');
      } else if (logoVariablesCount > 1) {
        return t('logo_housing_variable_has_duplicate_invalid');
      } else {
        return null;
      }
    },
    [t, variables],
  );

  React.useEffect(() => {
    const arrayOfVariable = getArrayOfVariables(textFormatField);
    setInvalidTextVariables(checkValidArrayOfVariables(arrayOfVariable));
  }, [checkValidArrayOfVariables, textFormatField]);

  const addVariable = (variable: string) => {
    const focusField = currentFocusFieldRef.current;
    if (!focusField.field || !focusField.ref) return;

    let value = watch(focusField.field);
    if (!value) {
      value = '';
    }
    const caretPosition = textCaretPositionRef.current;

    const textArr = value.split('');
    textArr.splice(caretPosition, 0, variable);
    const textPlusVariable = textArr.join('');

    setValue(focusField.field, textPlusVariable);

    const currentRef = focusField.ref;

    if (currentRef) {
      const newCaretPosition = caretPosition + variable.length;
      currentRef.focus();
      currentRef.setSelectionRange(newCaretPosition, newCaretPosition);
      handleTextCaretPos(null, newCaretPosition);
    }
  };

  const handleTextCaretPos = (event: any, startNumber?: number) => {
    textCaretPositionRef.current = startNumber || event?.target?.selectionStart;
  };

  React.useEffect(
    function handleInitialSelectedHousings() {
      if (!Object.keys(checkboxes).length || isInitialSelectedHousingsSet) return;

      const chosenHousings = getSelectedHousingsCheckboxes(housingsOptions, checkboxes);

      setSelectedHousings(chosenHousings as SelectedHousing[]);
      setIsInitialSelectedHousingsSet(true);
    },
    [
      checkboxes,
      isInitialSelectedHousingsSet,
      housingsOptions,
      getSelectedHousingsCheckboxes,
    ],
  );

  const getSelectedHousings = () => {
    const chosenHousings = getSelectedHousingsCheckboxes(housingsOptions, checkboxes);
    setSelectedHousings(chosenHousings as SelectedHousing[]);
    closeSelectPropsModal();
  };

  const deleteSelectedHousing = (id: string) => {
    setSelectedHousings((prevState) => {
      return prevState.filter(({value}) => value !== id);
    });
    toggleIsChecked(id);
  };

  const getCustomContractPayload = (data: FormTypes) => {
    const housings = selectedHousings.map(({value}) => value);

    return {
      type: CUSTOM_DOCUMENTS_TYPES.contract,
      ...data,
      country: data[FORM_NAMES.country]?.value,
      housings,
    };
  };

  const getCustomSampleContractPayload = (data: FormTypes) => {
    const payload = getCustomContractPayload(data);
    const inactiveFormatFieldName = isActiveTextBtn
      ? FORM_NAMES.html_format
      : FORM_NAMES.text_format;

    return {
      ...payload,
      [inactiveFormatFieldName]: undefined,
      [FORM_NAMES.extra_fields]: {
        housing_logo: user?.picture?.src,
      },
    };
  };

  const startContractSampleGeneration = async () => {
    setGenerationContractStatus(CONTRACT_GENERATION_STATUSES.request);
    const payload = getCustomSampleContractPayload(getValues());
    await setShouldDownloadContract(true);
    generateSampleCustomContract(payload);
  };

  const onSubmit = async (data: FormTypes) => {
    const payload = getCustomContractPayload(data);

    submitAction(payload, {
      onSuccess: () => {
        if (linkToGo) {
          history.push(linkToGo);
        } else {
          history.push(ACCOUNT_LINKS.customContracts);
        }
      },
      onError: (errors) => {
        const error = errors?.[0] as string;
        if (error.startsWith(ErrorDuplicateUsingHousing)) {
          return openWarningSaveModal();
        }
      },
    });
  };

  const toggleButtons = (clickButton: SWITCH_BUTTONS) => {
    if (clickButton === activeButton) return;

    if (isActiveTextBtn) {
      setSavedText(messageValue);
    } else {
      setSavedHtml(messageValue);
    }

    setActiveButton((prevState) => {
      if (prevState === SWITCH_BUTTONS.text) {
        return SWITCH_BUTTONS.html;
      }

      return SWITCH_BUTTONS.text;
    });
  };

  const handleForceSubmit = () => {
    handleSubmit((data) => onSubmit({...data, force_save: true}))();
  };

  const isSaveDisabled = isLoading || !isAnySectionTouched || !!invalidTextVariables;

  const isGenerateSampleDisabled =
    isLoading || !!invalidTextVariables || !messageValue?.trim();

  let textAreaRegister: any;

  if (isActiveTextBtn) {
    textAreaRegister = register(FORM_NAMES.text_format, {
      required: INIT_REQUIRED_FIELDS[FORM_NAMES.text_format],
    });
  }

  return (
    <Section>
      <CustomContractHeader
        title={title}
        clickToBack={() => goThroughConfirm(ACCOUNT_LINKS.customContracts)}
        action={
          <SaveButton
            onClick={handleSubmit(onSubmit)}
            label={
              <FloppyIconFilling
                label={isLoading ? `${t('saving')}...` : t('save_template')}
              />
            }
            disabled={isSaveDisabled}
          />
        }
      />
      <SectionsContainer>
        <TopSectionWrapper>
          <ContractDetailsSection title={`1. ${t('enter_contract_details')}`}>
            <ContractInputsContainer>
              <ContractDetailsInput
                {...register(FORM_NAMES.name, {
                  required: INIT_REQUIRED_FIELDS[FORM_NAMES.name],
                })}
                control={control}
                label={t('template_name')}
                placeholder={t('enter_name')}
                error={errors[FORM_NAMES.name]?.message}
              />
              <ContractDetailsInput
                {...register(FORM_NAMES.title, {
                  required: INIT_REQUIRED_FIELDS[FORM_NAMES.title],
                })}
                control={control}
                label={t('contract_title')}
                placeholder={t('enter_title')}
                error={errors[FORM_NAMES.title]?.message}
              />

              <Controller
                control={control}
                name={FORM_NAMES.country}
                rules={{required: INIT_REQUIRED_FIELDS[FORM_NAMES.country]}}
                render={({field, fieldState: {error}}) => {
                  return (
                    <Select
                      label={t('country')}
                      options={countriesOptions}
                      error={error?.message}
                      placeholder={t('select_your_country')}
                      {...field}
                    />
                  );
                }}
              />
            </ContractInputsContainer>
            <TextareaContainer>
              <SwitchContainer>
                <SwitchButton
                  active={activeButton === SWITCH_BUTTONS.text}
                  onClick={() => toggleButtons(SWITCH_BUTTONS.text)}
                >
                  Text
                </SwitchButton>
                <SwitchButton
                  active={activeButton === SWITCH_BUTTONS.html}
                  onClick={() => toggleButtons(SWITCH_BUTTONS.html)}
                >
                  <span>HTML</span>
                  <TooltipStyled content={t('message_variables_textarea_tooltip')} />
                </SwitchButton>
              </SwitchContainer>
              {activeButton === SWITCH_BUTTONS.text ? (
                <ContractDetailsTextarea
                  {...textAreaRegister}
                  ref={(e: any) => {
                    textAreaRegister?.ref(e);
                    textAreaRef.current = e;
                  }}
                  onFocus={handleFocus(FORM_NAMES.text_format)}
                  control={control}
                  label={t('body_of_the_contract')}
                  placeholder={t('enter_text_and_clauses')}
                  error={errors[FORM_NAMES.text_format]?.message}
                  onChange={(e) => {
                    handleTextCaretPos(e);
                    textAreaRegister?.onChange(e);
                  }}
                  onClick={handleTextCaretPos}
                  onKeyUp={keyUpCaretHandler}
                />
              ) : (
                <>
                  <Name>Code</Name>
                  <EditorContainer>
                    <LiveProvider
                      code={messageValue}
                      onFocus={handleFocus(FORM_NAMES.html_format)}
                      language="markup"
                      theme={dracula}
                    >
                      <LiveEditorStyled placeholder={t('enter_or_paste_html_code')} />
                    </LiveProvider>
                  </EditorContainer>
                </>
              )}
              {invalidTextVariables && (
                <ErrorMessageInput>{invalidTextVariables}</ErrorMessageInput>
              )}
            </TextareaContainer>
            <ButtonSample
              status={generationContractStatus}
              onClick={startContractSampleGeneration}
              secondary={!!generationContractStatus}
              disabled={isGenerateSampleDisabled}
            />
          </ContractDetailsSection>
          <VariablesSection>
            <VariablesTitle>
              <VariablesTitleText>
                {t('variables_include_your_contract')}
              </VariablesTitleText>
              <VariablesTooltip content={t('template_variables_contract_tooltip_text')} />
            </VariablesTitle>
            <VariablesDescription>
              {t('variables_contract_description')}
            </VariablesDescription>
            {selectedCountry && (
              <VariablesList>
                {variables.map(({label, value, optional}, i) => {
                  const isDisabled = Boolean(
                    value === CONTRACTS_VARIABLES_OPTIONS.housing_logo.value &&
                      isLogoVariableDisabled,
                  );
                  const handleClick = () => !isDisabled && addVariable(value);

                  return (
                    <VariablesItem disabled={isDisabled} key={i}>
                      <span onClick={handleClick}>{`${label} - ${value}`}</span>
                      {optional && (
                        <VariableTooltip
                          trigger="(!)"
                          content={t('custom_contract_variable_tooltip')}
                        />
                      )}
                    </VariablesItem>
                  );
                })}
              </VariablesList>
            )}
          </VariablesSection>
        </TopSectionWrapper>
        <SectionWithoutExplicitStyles
          title={`4. ${t('select_properties')}`}
          subtitle={t('select_the_property_or_properties')}
          subtitleTooltip={t('custom_contracts_select_housings_tooltip')}
        >
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
            housingsOptions={housingsOptions}
            toggleIsChecked={toggleIsChecked}
            toggleSelectAll={toggleSelectAll}
            checkboxes={checkboxes}
            isAllChecked={isAllChecked}
            isLoading={shortHousingsStatus === 'loading'}
            onExport={getSelectedHousings}
            confirmBtnLabel={t('select')}
          />
        </SectionWithoutExplicitStyles>
      </SectionsContainer>
      <BottomSaveButton
        onClick={handleSubmit(onSubmit)}
        label={
          <FloppyIconFilling
            iconSize={IconSize.Big}
            label={isLoading ? `${t('saving')}...` : t('save_template')}
          />
        }
        disabled={isSaveDisabled}
      />
      {isDoYouWantToSaveModalOpen && (
        <YouHaveMadeChangesModal
          handleModalSave={() => handleModalSave(handleSubmit(onSubmit))}
          handleModalDontSave={handleModalDontSave}
          handleModalCancel={handleModalCancel}
        />
      )}

      <Modal
        closeOnDocumentClick
        closeOnEscape
        open={isWarningSaveModal}
        iconSrc={warningIcon}
        iconProps={{width: 84, height: 84}}
        iconAlt=""
        title={t('warning')}
        text={
          <Trans i18nKey="warning_message_create_custom_contract_with_duplicate_housing">
            One or more properties are already associated with another contract template.
            The properties can only be added to one template at a time.
            <br />
            <br />
            Would you like to remove the association from other templates and add them to
            this template?
          </Trans>
        }
      >
        <ModalTwoButtonsWrapperStyled>
          <ModalButton
            label={isLoading ? `${t('saving')}...` : t('remove_and_save')}
            onClick={handleForceSubmit}
            disabled={isLoading}
          />
          <ModalButton
            disabled={isLoading}
            label={t('cancel')}
            onClick={closeWarningSaveModal}
          />
        </ModalTwoButtonsWrapperStyled>
      </Modal>
    </Section>
  );
}

export {CustomContract};
