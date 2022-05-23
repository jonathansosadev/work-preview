import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQueryClient, useQuery} from 'react-query';
import {useForm, Controller, FormProvider} from 'react-hook-form';
import {useHistory} from 'react-router-dom';
import i18n from '../../../i18n';
import api from '../../../api';
import {Housing} from '../../../utils/types';
import {fetchHousings} from '../../../api/housings';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';
import {
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import {SelectOption} from '../../../utils/types';
import {COLLABORATOR_GROUPS, PATTERNS} from '../../../utils/constants';
import {toastResponseError} from '../../../utils/common';
import addIcon from '../../../assets/plus-icon-white.svg';
import Loader from '../../common/Loader';
import Section from '../Section';
import Select from '../Select';
import ModalButton from '../ModalButton';
import SelectPropsModal from '../SelectPropsModal';
import Selectors from '../Selectors';
import Tooltip from '../Tooltip';
import {InputController} from '../Input';
import {
  Subtitle,
  SendInvitationTwoButtonsWrapper,
  RowInputs,
  RowFieldWrapper,
  SubtitleModal,
  MaginTopSubtitle,
  PropertiesButton,
  IconContainer,
  SendButton,
  HeaderSection,
  SectionContent,
  TooltipContentItem,
} from './styled';
import {
  SelectedPropsContainer,
  SelectedPropItem,
  SelectedPropText,
  TinyDeleteBtn,
} from '../CustomEmail/styled';

type SelectedHousing = {
  label: string;
  value: string;
  arePaymentsActive: boolean;
  data: Housing;
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

const accountTypesOptions = [
  {
    value: COLLABORATOR_GROUPS.manager,
    label: i18n.t('manager'),
  },
  {
    value: COLLABORATOR_GROUPS.collaborator,
    label: i18n.t('collaborator'),
  },
];

enum FormNames {
  email = 'email',
  accountType = 'accountType',
  accessToAll = 'has_access_to_all',
  assignedEntities = 'assigned_entities',
}

type FormTypes = {
  [FormNames.email]: string;
  [FormNames.accountType]: SelectOption;
  [FormNames.accessToAll]?: boolean | string;
  [FormNames.assignedEntities]?: string[];
};

enum IdentityGuestSettingsOptions {
  no_access_to_all = 'has_access_to_all',
  access_to_all = 'has_access_to_all',
}

const identityOptions = {
  no_access_to_all: 'false',
  access_to_all: 'true',
};

function InviteUserTeam() {
  const {t} = useTranslation();
  const history = useHistory();
  const isMounted = useIsMounted();

  const formMethods = useForm<FormTypes>({
    shouldUnregister: true,
  });
  const {
    formState: {errors},
  } = formMethods;

  const {isLoading, setStatus} = useStatus();
  const queryClient = useQueryClient();
  const [firstRoleSelect, setFirstRoleSelect] = React.useState<boolean | null>(true);
  const [userRole, setUserRole] = React.useState<string | null>('');
  const [selectedHousings, setSelectedHousings] = React.useState<SelectedHousing[]>([]);
  const [isInitialSelectedHousingsSet, setIsInitialSelectedHousingsSet] = React.useState(
    false,
  );
  const [, setIsSelectorsTouched] = React.useState(false);

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
    getSelectedHousingsCheckboxes,
  } = useHousingsSelectCheckboxes(housingsOptions);

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

  const createCollaborator = async (payload: any) => {
    setStatus('loading');
    const {error} = await api.auth.createCollaborator(payload);
    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('idle');
      toastResponseError(error);
      return;
    }

    await queryClient.refetchQueries('collaborators');
    if (!isMounted.current) {
      return;
    }

    setStatus('idle');
    history.goBack();
  };

  const hasAccessToAll = (formData: FormTypes) => {
    if (userRole === 'reservations assigned only') {
      if (formData?.has_access_to_all === 'false') {
        return false;
      }
    }
    return true;
  };

  const onSubmit = (formData: FormTypes) => {
    let housingsList: string[] = [];

    selectedHousings.forEach((element) => {
      housingsList.push(element.value);
    });

    const payload = {
      [FormNames.email]: formData.email,
      groups: [formData[FormNames.accountType]?.value],
      property_permission: {
        has_access_to_all: housingsList.length <= 0,
        [FormNames.assignedEntities]: housingsList,
      },
      reservation_permission: {
        has_access_to_all: hasAccessToAll(formData),
      },
    };

    createCollaborator(payload);
  };

  return (
    <>
      <Section
        title={<HeaderSection clickToBack={history.goBack} title={t('invite_user')} />}
      >
        <>
          <SectionContent>
            <MaginTopSubtitle />
            <SubtitleModal>{t('add_user_description')}</SubtitleModal>
            <FormProvider {...formMethods}>
              <form onSubmit={formMethods.handleSubmit(onSubmit)}>
                <RowInputs>
                  <RowFieldWrapper>
                    <InputController
                      label={t('email')}
                      placeholder={t('enter_email')}
                      {...formMethods.register(FormNames.email, {
                        required: t<string>('required'),
                        pattern: {
                          value: PATTERNS.email,
                          message: t('invalid_email'),
                        },
                      })}
                      control={formMethods.control}
                      type="email"
                      error={errors[FormNames.email]?.message}
                    />
                  </RowFieldWrapper>
                  <RowFieldWrapper>
                    <Controller
                      control={formMethods.control}
                      name={FormNames.accountType}
                      rules={{required: t<string>('required')}}
                      render={({field, fieldState: {error}}) => {
                        return (
                          <Select
                            label={t('role')}
                            placeholder={t('select_type_of_account')}
                            options={accountTypesOptions}
                            error={error?.message}
                            onMenuClose={() => {
                              setTimeout(() => {
                                setFirstRoleSelect(false);
                                setUserRole(formMethods.getValues()?.accountType?.value);
                              }, 100);
                            }}
                            {...field}
                          />
                        );
                      }}
                    />
                  </RowFieldWrapper>
                </RowInputs>
                <MaginTopSubtitle />
                <Subtitle>
                  {t('select_properties_description')}{' '}
                  <Tooltip
                    content={
                      <>
                        <TooltipContentItem>
                          {i18n.t('access_description_tooltip_one')}
                        </TooltipContentItem>
                        <TooltipContentItem>
                          <ul>
                            <li>{i18n.t('access_description_list_one')}</li>
                            <li>{i18n.t('access_description_list_two')}</li>
                            <li>{i18n.t('access_description_list_three')}</li>
                            <li>{i18n.t('access_description_list_four')}</li>
                          </ul>
                        </TooltipContentItem>
                        <TooltipContentItem>
                          {i18n.t('access_description_tooltip_two')}
                        </TooltipContentItem>
                        <TooltipContentItem>
                          {i18n.t('access_description_tooltip_three')}
                        </TooltipContentItem>
                      </>
                    }
                  />
                </Subtitle>
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
                <PropertiesButton
                  link
                  outlined
                  onClick={openSelectPropsModal}
                  label={
                    <>
                      <IconContainer>
                        <img src={addIcon} alt="Account" height={12} width={12} />
                      </IconContainer>
                      {t('select_properties')}
                    </>
                  }
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
                {!firstRoleSelect && userRole === 'reservations assigned only' && (
                  <div>
                    <MaginTopSubtitle />
                    <Subtitle>
                      {t('select_access')}{' '}
                      <Tooltip
                        content={
                          <>
                            <TooltipContentItem>
                              {i18n.t('select_properties_description_tooltip_one')}
                            </TooltipContentItem>
                            <TooltipContentItem>
                              {i18n.t('select_properties_description_tooltip_two')}
                            </TooltipContentItem>
                          </>
                        }
                      />
                    </Subtitle>
                    <Selectors
                      isTabType
                      selectorsFormNames={IdentityGuestSettingsOptions}
                      preloadedSelectorsData={String(false)}
                      disabled={false}
                      setIsSelectorsTouched={setIsSelectorsTouched}
                      radioValues={identityOptions}
                    />
                  </div>
                )}
              </form>
            </FormProvider>

            <SendInvitationTwoButtonsWrapper>
              {isLoading ? (
                <Loader height={40} width={40} />
              ) : (
                <>
                  <SendButton
                    onClick={formMethods.handleSubmit(onSubmit)}
                    label={t('send_invitation')}
                  />
                  <ModalButton secondary label={t('cancel')} onClick={history.goBack} />
                </>
              )}
            </SendInvitationTwoButtonsWrapper>
          </SectionContent>
        </>
      </Section>
    </>
  );
}

export {InviteUserTeam};
