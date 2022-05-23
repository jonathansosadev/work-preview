import React from 'react';
import {useHistory} from 'react-router-dom';
import {LiveProvider} from 'react-live';
import dracula from 'prism-react-renderer/themes/dracula';
import i18n from '../../../i18n';
import {ResolverTypes} from '../../../api';
import {useTranslation} from 'react-i18next';
import {useForm, FormProvider, Controller, useWatch} from 'react-hook-form';
import {useQuery} from 'react-query';
import {
  useModalControls,
  useErrorToast,
  useAsyncOperation,
  useIsFormTouched,
} from '../../../utils/hooks';
import {getDisplayFields} from 'utils/common';
import {Housing} from '../../../utils/types';
import {useConfirmLeaveModal} from '../../../context/openModals';
import {checkIsPaymentsActive} from '../../../utils/housing';
import {
  buildCustomEmailsReminderOptions,
  CUSTOM_FORMS_REMINDER_OPTIONS,
} from '../../../utils/emailReminders';
import {fetchHousings} from '../../../api/housings';
import {ACCOUNT_LINKS} from '../AccountSections';
import FloppyIconFilling from '../FloppyIconFilling';
import Select from '../Select';
import Section from '../Section';
import Selectors from '../Selectors';
import {Name} from '../Input/styled';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';
import {LANGUAGE_OPTIONS} from '../../../utils/constants';
import {IconSize} from '../FloppyIconFilling/styled';
import YouHaveMadeChangesModal from '../YouHaveMadeChangesModal';
import SelectPropsModal from '../SelectPropsModal';
import {
  CustomEmailHeader,
  SaveButton,
  SectionsContainer,
  SectionWithoutExplicitStyles,
  TopSectionWrapper,
  EmailDetailsSection,
  EmailInputsContainer,
  EmailDetailsInput,
  EmailDetailsTextarea,
  VariablesSection,
  VariablesTitle,
  VariablesTitleText,
  VariablesTooltip,
  VariablesList,
  VariablesItem,
  SelectPropertyButton,
  BottomSaveButton,
  SelectedPropsContainer,
  SelectedPropItem,
  SelectedPropText,
  TinyDeleteBtn,
  TextareaContainer,
  SwitchContainer,
  SwitchButton,
  EditorContainer,
  VariablesDescription,
  TooltipStyled,
  LiveEditorStyled,
  ErrorMessageInput,
} from './styled';
import TextareaAutosize from 'react-textarea-autosize';

export const LANGUAGES_WITH_ALL_LANGUAGES = [
  {
    value: '',
    label: i18n.t('all_languages'),
  },
  ...LANGUAGE_OPTIONS,
];

const defaultTimingOptions = {
  ...Object.values(CUSTOM_FORMS_REMINDER_OPTIONS.default).reduce(
    (acc, curr) => ({...acc, [curr]: false}),
    {},
  ),
  [CUSTOM_FORMS_REMINDER_OPTIONS.default
    .is_sending_after_reservation_created_enabled]: true,
};

export enum FORM_NAMES {
  name = 'name',
  subject = 'subject',
  text_format = 'text_format',
  html_format = 'html_format',
  email_language = 'language',
}

export const INIT_REQUIRED_FIELDS = {
  [FORM_NAMES.name]: i18n.t('required'),
  [FORM_NAMES.subject]: i18n.t('required'),
  [FORM_NAMES.text_format]: i18n.t('required'),
  [FORM_NAMES.email_language]: i18n.t('required'),
};

const VARIABLES_LIST = [
  {label: i18n.t('guest_full_name'), value: '{guest_full_name}'},
  {label: i18n.t('property_name'), value: '{property_name}'},
  {label: i18n.t('online_check_in_link'), value: '{checkin_online_link}'},
  {label: i18n.t('check_in_date'), value: '{check_in_date}'},
  {label: i18n.t('check_out_date'), value: '{check_out_date}'},
  {label: i18n.t('key_link_code'), value: '{keys}'},
  {label: i18n.t('upselling_link'), value: '{upselling_link}'},
];

export type CustomEmailSendingSettings = {
  is_sending_enabled: boolean;
  is_sending_after_all_guests_registered_enabled: boolean;
  is_sending_after_all_payments_complete_enabled: boolean;
  is_sending_after_lead_guest_verified_and_payments_completed_enabled: boolean;
  is_sending_after_lead_guest_passed_biomatch_enabled: boolean;
  is_sending_after_reservation_created_enabled: boolean;
  is_sending_one_week_before_check_in_enabled: boolean;
  is_sending_72_hours_before_check_in_enabled: boolean;
  is_sending_48_hours_before_check_in_enabled: boolean;
  is_sending_24_hours_before_check_in_enabled: boolean;
  is_sending_on_check_in_enabled: boolean;
  is_sending_on_check_out_enabled: boolean;
};

export type CustomEmailsPayload = {
  housings: string[];
  language: string;
  name: string;
  subject: string;
  text_format: string;
  html_format: string;
  sending_settings: CustomEmailSendingSettings;
};

type SelectedHousing = {
  label: string;
  value: string;
  arePaymentsActive: boolean;
  data: Housing;
};

type FieldWithVariables =
  | FORM_NAMES.text_format
  | FORM_NAMES.html_format
  | FORM_NAMES.subject
  | null;

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

type CustomEmailProps = {
  title: string;
  submitAction: (payload: CustomEmailsPayload) => Promise<ResolverTypes>;
  timingOptionSource?: {[key: string]: boolean};
  checkboxesSource?: string[];
  defaultFormValues?: any;
};

function fetchShortHousings() {
  const fieldsQuery = [
    'id',
    'name',
    'is_biometric_match_for_all_enabled',
    'is_self_online_check_in_enabled',
    'security_deposit_status',
    'reservation_payments_status',
    'upselling_payments_status',
    'seasons',
  ].toString();

  return fetchHousings(`ordering=name&field_set=${fieldsQuery}&is_deactivated=false&`);
}

function CustomEmail({
  title,
  submitAction,
  timingOptionSource,
  checkboxesSource,
  defaultFormValues,
}: CustomEmailProps) {
  const {t} = useTranslation();
  const history = useHistory();
  const formMethods = useForm({
    defaultValues: {
      ...defaultFormValues,
      [CUSTOM_FORMS_REMINDER_OPTIONS.default
        .is_sending_after_reservation_created_enabled]: true,
    },
    shouldUnregister: true,
  });
  const {
    control,
    register,
    unregister,
    handleSubmit,
    watch,
    setValue,
    formState: {errors},
  } = formMethods;
  const {
    isFormTouched,
    //  setUntouchedValues
  } = useIsFormTouched({
    displayFields,
    watch,
    defaultValues: defaultFormValues,
  });

  const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);
  const textCaretPositionRef = React.useRef(0);

  const [selectedHousings, setSelectedHousings] = React.useState<SelectedHousing[]>([]);
  const [isInitialSelectedHousingsSet, setIsInitialSelectedHousingsSet] = React.useState(
    false,
  );
  const [activeButton, setActiveButton] = React.useState<SWITCH_BUTTONS>(
    SWITCH_BUTTONS.text,
  );
  const [savedText, setSavedText] = React.useState('');
  const [savedHtml, setSavedHtml] = React.useState('');

  const {isLoading, asyncOperation} = useAsyncOperation();
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
    data: shortHousings,
    status: shortHousingsStatus,
    error: shortHousingsError,
  } = useQuery('shortHousings', fetchShortHousings);
  useErrorToast(shortHousingsError, {
    notFoundMessage: 'Requested housing\\s could not be found. Please contact support.',
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

  const textFormatField = useWatch({name: FORM_NAMES.text_format, control});
  const [isValidVariables, setIsValidVariables] = React.useState<boolean>(true);
  // const [isValidHTML, setIsValidHTML] = React.useState<boolean>(true);

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
    // to useEffect only on active button change
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
    // to useEffect only on active button change
    // eslint-disable-next-line
    [activeButton],
  );
  
  const getArrayOfVariables = (text: string): Array<string> => {
    const reBrackets = /{(.*?)}/g;
    const listOfText = text?.match(reBrackets) || [];
    return listOfText;
  };

  const isValidArrayOfVariables = (arrayOfVariables: Array<string>) => {
    const availableVars = VARIABLES_LIST.map((v) => v.value);
    const found = arrayOfVariables.every((r) => availableVars.includes(r));
    return found;
  };
  // const validHTML = function (htmlString: string): boolean {
  //   const doc = document.createElement('div');
  //   const parsedDiv = document.createElement('div');
  //   doc.innerHTML = htmlString;
  //   parsedDiv.innerHTML = htmlString;
  //   return doc.innerHTML === parsedDiv.innerHTML;
  //   // var doc = new DOMParser().parseFromString(htmlString, "text/html");
  //   // return Array.from(doc.body.childNodes).some(node => node.nodeType === 1);
  //   // return /(<([^>]+)>)/i.test(htmlString);

  // };

  React.useEffect(() => {
    const arrayOfVariable = getArrayOfVariables(textFormatField);
    setIsValidVariables(isValidArrayOfVariables(arrayOfVariable));
  }, [textFormatField]);

  
 

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

  const isAnyHousingPaymentsActive = React.useMemo(() => {
    if (selectedHousings && selectedHousings.length) {
      return selectedHousings.some((housing) => checkIsPaymentsActive(housing.data));
    }
    return false;
  }, [selectedHousings]);

  const isAnyHousingIdentityVerifyAllGuestsActive = React.useMemo(() => {
    if (selectedHousings && selectedHousings.length) {
      return selectedHousings.some((housing) =>
        Boolean(housing?.data?.is_biometric_match_for_all_enabled),
      );
    }
    return false;
  }, [selectedHousings]);

  const isAnyHousingIdentityVerifyActive = React.useMemo(() => {
    if (selectedHousings && selectedHousings.length) {
      return selectedHousings.some((housing) =>
        Boolean(housing?.data?.is_self_online_check_in_enabled),
      );
    }
    return false;
  }, [selectedHousings]);

  const {
    isAllChecked,
    toggleSelectAll,
    checkboxes,
    toggleIsChecked,
    isAnyCheckboxTouched,
    getSelectedHousingsCheckboxes,
  } = useHousingsSelectCheckboxes(housingsOptions, checkboxesSource);

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

  const selectTimingOptions = React.useMemo(() => {
    return buildCustomEmailsReminderOptions({
      isIdentityVerificationActive: isAnyHousingIdentityVerifyActive,
      isIdentityVerificationAllGuests: isAnyHousingIdentityVerifyAllGuestsActive,
      isPaymentsActive: isAnyHousingPaymentsActive,
    });
  }, [
    isAnyHousingIdentityVerifyActive,
    isAnyHousingIdentityVerifyAllGuestsActive,
    isAnyHousingPaymentsActive,
  ]);

  const isAnySectionTouched = isFormTouched || isSelectorsTouched || isAnyCheckboxTouched;

  const {
    linkToGo,
    goThroughConfirm,
    handleModalSave,
    handleModalDontSave,
    handleModalCancel,
    isDoYouWantToSaveModalOpen,
  } = useConfirmLeaveModal(isAnySectionTouched);

  const onSubmit = async (data: any) => {
    const {language, sending_settings} = data;
    const housings = selectedHousings.map(({value}) => value);
    const payload = {
      housings,
      ...data,
      language: language.value,
      sending_settings: {
        ...sending_settings,
        is_sending_enabled: timingOptionSource
          ? timingOptionSource?.is_sending_enabled
          : true,
      },
    };

    await asyncOperation(() => submitAction(payload));

    if (linkToGo) {
      history.push(linkToGo);
    } else {
      history.push(ACCOUNT_LINKS.communications);
    }
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

  const isSaveDisabled =
    isLoading ||
    !isAnySectionTouched ||
    !selectedHousings.length ||
    !isValidVariables

  let textAreaRegister: any;

  if (isActiveTextBtn) {
    textAreaRegister = register(FORM_NAMES.text_format, {
      required: INIT_REQUIRED_FIELDS[FORM_NAMES.text_format],
    });
  }

  const handleFocus = (fieldName: FieldWithVariables) => (e: any) => {
    currentFocusFieldRef.current.field = fieldName;
    currentFocusFieldRef.current.ref = e?.target || e;
  };

  return (
    <Section>
      <CustomEmailHeader
        title={title}
        clickToBack={() => goThroughConfirm(ACCOUNT_LINKS.communications)}
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
          <EmailDetailsSection title={`1. ${t('enter_email_details')}`}>
            <EmailInputsContainer>
              <EmailDetailsInput
                {...register(FORM_NAMES.name, {
                  required: INIT_REQUIRED_FIELDS[FORM_NAMES.name],
                })}
                control={control}
                label={t('name_of_the_template')}
                placeholder={t('enter_name')}
                error={errors[FORM_NAMES.name]?.message}
              />
              <EmailDetailsInput
                {...register(FORM_NAMES.subject, {
                  required: INIT_REQUIRED_FIELDS[FORM_NAMES.subject],
                })}
                control={control}
                onFocus={handleFocus(FORM_NAMES.subject)}
                onClick={handleTextCaretPos}
                label={t('subject')}
                placeholder={t('enter_subject')}
                error={errors[FORM_NAMES.subject]?.message}
              />
            </EmailInputsContainer>
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
                <EmailDetailsTextarea
                  {...textAreaRegister}
                  ref={(e: any) => {
                    textAreaRegister?.ref(e);
                    textAreaRef.current = e;
                  }}
                  onFocus={handleFocus(FORM_NAMES.text_format)}
                  control={control}
                  label={t('message')}
                  placeholder={t('enter_message')}
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
              {!isValidVariables && (
                <ErrorMessageInput>{t('invalid_variables')}</ErrorMessageInput>
              )}
              {/* {!isValidHTML && <ErrorMessageInput>{t('invalid_html')}</ErrorMessageInput>} */}
            </TextareaContainer>
          </EmailDetailsSection>
          <VariablesSection>
            <VariablesTitle>
              <VariablesTitleText>{t('variables_to_include')}</VariablesTitleText>
              <VariablesTooltip content={t('template_variables_tooltip_text')} />
            </VariablesTitle>
            <VariablesDescription>{t('variables_description')}</VariablesDescription>
            <VariablesList>
              {VARIABLES_LIST.map(({label, value}, i) => (
                <VariablesItem key={i} onClick={() => addVariable(value)}>
                  {`${label} - ${value}`}
                </VariablesItem>
              ))}
            </VariablesList>
          </VariablesSection>
        </TopSectionWrapper>
        <SectionWithoutExplicitStyles
          title={`2. ${t('select_timing')}`}
          subtitle={t('when_would_you_like_to_send_email')}
        >
          <FormProvider {...formMethods}>
            <Selectors
              selectorsFormNames={selectTimingOptions}
              preloadedSelectorsData={timingOptionSource}
              setIsSelectorsTouched={setIsSelectorsTouched}
              defaultFormValues={defaultTimingOptions}
            />
          </FormProvider>
        </SectionWithoutExplicitStyles>
        <SectionWithoutExplicitStyles
          title={`3. ${t('language')}`}
          subtitle={t('template_for_the_following_language')}
          titleTooltip={t('template_language_tooltip_content')}
        >
          <Controller
            control={control}
            name={FORM_NAMES.email_language}
            rules={{required: t('required') as string}}
            defaultValue={LANGUAGES_WITH_ALL_LANGUAGES[0]}
            render={({field, fieldState: {error}}) => {
              return (
                <Select
                  label={t('select_language')}
                  placeholder={t('select_language')}
                  options={LANGUAGES_WITH_ALL_LANGUAGES}
                  error={error?.message}
                  {...field}
                />
              );
            }}
          />
        </SectionWithoutExplicitStyles>
        <SectionWithoutExplicitStyles
          title={`4. ${t('select_properties')}`}
          subtitle={t('select_the_property_or_properties')}
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
    </Section>
  );
}

export {CustomEmail};
