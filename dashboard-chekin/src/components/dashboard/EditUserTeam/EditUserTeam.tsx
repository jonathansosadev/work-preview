import React from 'react';
import {useTranslation} from 'react-i18next';
import {useQueryClient, useQuery} from 'react-query';
import {useHistory} from 'react-router-dom';
import {useForm, Controller, FormProvider} from 'react-hook-form';
import {toast} from 'react-toastify';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import {SelectOption} from '../../../utils/types';
import {COLLABORATOR_GROUPS, PATTERNS} from '../../../utils/constants';
import {toastResponseError} from '../../../utils/common';
import {Housing} from '../../../utils/types';
import {fetchHousings} from '../../../api/housings';
import {useHousingsSelectCheckboxes} from '../HousingsSelectCheckboxes';
import addIcon from '../../../assets/plus-icon-white.svg';
import Loader from '../../common/Loader';
import Section from '../Section';
import Select from '../Select';
import ModalButton from '../ModalButton';
import Selectors from '../Selectors';
import SelectPropsModal from '../SelectPropsModal';
import Tooltip from '../Tooltip';
import {InputController} from '../Input';
import {
  Subtitle,
  SendInvitationTwoButtonsWrapper,
  RowInputs,
  RowFieldWrapper,
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

function getCollaborator() {
  const rawCollaborator = localStorage?.getItem('collaborator');

  if (rawCollaborator !== null) {
    return JSON.parse(rawCollaborator);
  }
}

function fetchPropertyPermission() {
  return queryFetcher(
    api.users.ENDPOINTS.propertyPermission(getCollaborator().property_permission),
  );
}

function fetchReservationPermission() {
  return queryFetcher(
    api.users.ENDPOINTS.reservationPermission(getCollaborator().reservation_permission),
  );
}

function EditUserTeam() {
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
  const [access, setAccess] = React.useState(false);

  const {
    isOpen: isSelectPropsModalOpen,
    openModal: openSelectPropsModal,
    closeModal: closeSelectPropsModal,
  } = useModalControls();

  const {data: propertyPermission, error: propertyPermissionError} = useQuery(
    'propertyPermission',
    fetchPropertyPermission,
  );
  useErrorToast(propertyPermissionError, {
    notFoundMessage:
      'Requested property permission could not be found. Please contact support.',
  });

  const {data: reservationPermission, error: reservationPermissionError} = useQuery(
    'reservationPermission',
    fetchReservationPermission,
  );
  useErrorToast(reservationPermissionError, {
    notFoundMessage:
      'Requested reservation permission could not be found. Please contact support.',
  });

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
  } = useHousingsSelectCheckboxes(housingsOptions, propertyPermission?.assigned_entities);

  React.useEffect(
    function handleInitialData() {
      if (propertyPermission && reservationPermission && housingsOptions) {
        const chosenHousings = propertyPermission.assigned_entities
          .map((housingId: string) => {
            return housingsOptions.find((housing) => housing.value === housingId) || null;
          })
          .filter((housing: Housing) => {
            return housing !== null;
          });

        if (
          getCollaborator().groups.filter(
            (group: Record<string, unknown>) =>
              group.name === COLLABORATOR_GROUPS.manager,
          ).length > 0
        ) {
          formMethods.setValue(FormNames.accountType, accountTypesOptions[0]);
          setFirstRoleSelect(false);
          setUserRole(COLLABORATOR_GROUPS.manager);
        }

        if (
          getCollaborator().groups.filter(
            (group: Record<string, unknown>) =>
              group.name === COLLABORATOR_GROUPS.collaborator,
          ).length > 0
        ) {
          formMethods.setValue(FormNames.accountType, accountTypesOptions[1]);
          setFirstRoleSelect(false);
          setUserRole(COLLABORATOR_GROUPS.collaborator);
          setAccess(reservationPermission.has_access_to_all);
        }

        formMethods.setValue(FormNames.email, getCollaborator().email);
        setSelectedHousings(chosenHousings as SelectedHousing[]);
        setIsInitialSelectedHousingsSet(true);
      }
    },
    [
      checkboxes,
      isInitialSelectedHousingsSet,
      housingsOptions,
      getSelectedHousingsCheckboxes,
      formMethods,
      propertyPermission,
      reservationPermission,
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
  };

  const updateCollaborator = async (payload: any) => {
    setStatus('loading');

    const {error} = await api.auth.updateCollaborator(payload);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('idle');
      toastResponseError(error);
      return;
    }

    await queryClient.refetchQueries('collaborators');
    await queryClient.refetchQueries('reservationPermission');
    await queryClient.refetchQueries('propertyPermission');

    setStatus('idle');
    localStorage.removeItem('collaborator');
    toast.success(t('updated_collaborator'));
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

    updateCollaborator(payload);
  };

  const [, setIsSelectorsTouched] = React.useState(false);

  return (
    <>
      <Section
        title={<HeaderSection clickToBack={history.goBack} title={t('edit_user')} />}
      >
        <>
          <SectionContent>
            <MaginTopSubtitle />
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
                      tooltip={<Tooltip content={t('email_tooltip')} />}
                      type="email"
                      error={errors[FormNames.email]?.message}
                      readOnly
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
                      preloadedSelectorsData={String(access)}
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
                    label={t('save')}
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

export {EditUserTeam};
