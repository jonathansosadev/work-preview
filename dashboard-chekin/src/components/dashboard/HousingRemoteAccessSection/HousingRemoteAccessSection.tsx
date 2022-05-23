import React, {Dispatch, SetStateAction} from 'react';
import TextareaAutosize from 'react-textarea-autosize';
import {useForm} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {
  useErrorModal,
  useModalControls,
  useStatus,
  useIsMounted,
  useIsFormTouched,
} from '../../../utils/hooks';
import api, {queryFetcher} from '../../../api';
import {Lock, LockUser, Room, SelectOption, TempLock} from '../../../utils/types';
import {useSubscription} from '../../../context/subscription';
import {toastResponseError} from '../../../utils/common';
import {
  LOCK_ACCESS_TYPES,
  LOCK_ACCOUNT_NAMES_OPTIONS,
  LOCK_TYPES_OPTIONS,
  LOCK_VENDORS,
  SUBSCRIPTION_PRODUCT_TYPES,
  HOURS_OPTIONS,
} from '../../../utils/constants';
import {buildReminderOptionsRemoteAccess} from '../../../utils/emailReminders';
import deleteIcon from '../../../assets/delete-icon.svg';
import rubbishIcon from '../../../assets/rubbish.svg';
import Section from '../Section';
import Switch, {useSwitchSectionActive} from '../Switch';
import Select from '../Select';
import NewDoorModal from '../NewDoorModal';
import Loader from '../../common/Loader';
import Pagination from '../Pagination';
import Selectors from '../Selectors';
import LockErrorSection from './LockErrorSection';
import SectionTag, {SectionTagColors} from '../SectionTag';
import SubscriptionAndProviderModal from './SubscriptionAndProviderModal';
import {FieldsGridLayout} from 'styled/common';
import {
  AccountSelectWrapper,
  AccountWrapper,
  AddButton,
  DeleteButton,
  Content,
  LocksLoaderWrapper,
  LocksSubHeader,
  LockWrapper,
  NoLocksMessage,
  PaginationContent,
  WrappedTooltip,
  InstructionSubsection,
  DoorTitle,
  DoorType,
  DoorFooter,
  FlexRow,
  SectionStyled,
  LocksItems,
  Subtitle,
  TextareaStyled,
  TimingSubsection,
  AddAccountButton,
} from './styled';

enum FormNames {
  instructions = 'instructions',
  sendingHour = 'sendingHour',
}

const vendorsWithoutKeysAdding: string[] = [];
const pageSize = 9;

function fetchLockUsers() {
  return queryFetcher(api.locks.ENDPOINTS.lockUsers());
}

function fetchLocks(housingId: string, userId: string, params = '') {
  return queryFetcher(
    api.locks.ENDPOINTS.locks(null, `housing=${housingId}&user_id=${userId}${params}`),
  );
}

function getLockUsersAsOptions(
  users?: LockUser[],
  onDeleteAccount?: (accountId: string) => void,
  isDeleteLoading?: boolean,
) {
  if (!users) {
    return [];
  }

  return users.map((user) => {
    const vendorLabel =
      LOCK_ACCOUNT_NAMES_OPTIONS[user.vendor as keyof typeof LOCK_ACCOUNT_NAMES_OPTIONS]
        ?.label;
    const userLabel = user.account_name || user.username;

    const handleDelete = () => onDeleteAccount?.(user.id);

    return {
      label: `${userLabel} (${vendorLabel})`,
      value: user.id,
      data: user,
      iconButton: {
        iconUrl: rubbishIcon,
        onClickIcon: handleDelete,
        disabled: isDeleteLoading,
      },
    };
  });
}

type CreateLock = {
  lock: TempLock;
  housingId: string;
  housingRooms: Room[];
};

type HousingRemoteAccessSectionProps = {
  rooms: Room[];
  setIsSectionTouched: Dispatch<SetStateAction<boolean>>;
  identityVerificationSettings: {isActive: boolean; allGuests: boolean};
  isTaxesSectionActive: boolean;
  isBookingPaymentsSectionActive: boolean;
  isSecurityDepositSectionActive: boolean;
  disabled?: boolean;
  housing?: any;
  setIsSubmitDisabled?: Dispatch<SetStateAction<boolean>>;
};

const defaultProps: Partial<HousingRemoteAccessSectionProps> = {
  disabled: false,
};

const HousingRemoteAccessSection = React.forwardRef(
  (
    {
      disabled,
      housing,
      setIsSectionTouched,
      isTaxesSectionActive,
      isBookingPaymentsSectionActive,
      rooms,
      setIsSubmitDisabled,
      identityVerificationSettings,
      isSecurityDepositSectionActive,
    }: HousingRemoteAccessSectionProps,
    ref,
  ) => {
    const {t} = useTranslation();
    const queryClient = useQueryClient();
    const {
      register,
      watch,
      getValues,
      setValue,
      formState: {errors},
    } = useForm<{
      [FormNames.instructions]: string;
      [FormNames.sendingHour]: number;
    }>();
    const {isRemoteAccessActive, isTrialMode, isHotelSubscription} = useSubscription();
    const {ErrorModal, displayError} = useErrorModal();
    const isMounted = useIsMounted();
    const [isSelectorsTouched, setIsSelectorsTouched] = React.useState(false);
    const [account, setAccount] = React.useState<SelectOption<LockUser> | null>(null);
    const [sendingHour, setSendingHour] = React.useState<SelectOption<string> | null>(null);
    const [currentPage, setCurrentPage] = React.useState(0);
    const [currentPrivateLocksPage, setCurrentPrivateLocksPage] = React.useState(0);
    const [tempLocks, setTempLocks] = React.useState<TempLock[]>([]);
    const [isExternalLockError, setExternalLockError] = React.useState(false);
    const [isAnyError, setIsAnyError] = React.useState(false);
    const [customInstructionsValue, setCustomInstructionsValue] = React.useState('');
    const {isFormTouched, setUntouchedValues} = useIsFormTouched({
      watch,
      displayFields: {
        [FormNames.instructions]: true,
        [FormNames.sendingHour]: true,
      },
    });

    const isUpdatingHousing = Boolean(housing?.id);
    const isPaymentsActive =
      isTaxesSectionActive ||
      isBookingPaymentsSectionActive ||
      isSecurityDepositSectionActive;
    const lockReminderOptions = React.useMemo(() => {
      return buildReminderOptionsRemoteAccess({
        isIdentityVerificationActive: identityVerificationSettings.isActive,
        isIdentityVerificationAllGuests: identityVerificationSettings.allGuests,
        isPaymentsActive,
      });
    }, [
      identityVerificationSettings.allGuests,
      identityVerificationSettings.isActive,
      isPaymentsActive,
    ]);

    const accountVendor = account?.data?.vendor || '';

    const {
      isOpen: isSubscriptionAndProviderModalOpen,
      openModal: openSubscriptionAndProviderModal,
      closeModal: closeSubscriptionAndProviderModal,
    } = useModalControls();
    const {
      isOpen: isNewDoorModalOpen,
      openModal: openNewDoorModal,
      closeModal: closeNewDoorModal,
    } = useModalControls();
    const {
      isOpen: isNewPrivateDoorModalOpen,
      openModal: openNewPrivateDoorModal,
      closeModal: closeNewPrivateDoorModal,
    } = useModalControls();

    const lockUsersQueryKey = 'lockUsers';

    const {data: lockUsers, error: lockUsersError, status: lockUsersStatus} = useQuery<
      LockUser[],
      string
    >(lockUsersQueryKey, fetchLockUsers);

    const areCommonLocksEnabled = Boolean(housing?.id && account);
    const {
      data: locks,
      error: locksError,
      status: locksStatus,
      refetch: refetchLocks,
    } = useQuery<Lock[]>(
      ['locks', housing?.id, account?.value, `&access_type=${LOCK_ACCESS_TYPES.common}`],
      ({queryKey}) => fetchLocks(queryKey[1], queryKey[2], queryKey[3]),
      {
        enabled: areCommonLocksEnabled,
      },
    );

    const arePrivateLocksEnabled = Boolean(isHotelSubscription && housing?.id && account);
    const {
      data: privateLocks,
      error: privateLocksError,
      status: privateLocksStatus,
      refetch: refetchPrivateLocks,
    } = useQuery<Lock[]>(
      ['locks', housing?.id, account?.value, `&access_type=${LOCK_ACCESS_TYPES.private}`],
      ({queryKey}) => fetchLocks(queryKey[1], queryKey[2], queryKey[3]),
      {
        enabled: arePrivateLocksEnabled,
      },
    );

    React.useEffect(
      function handleIsAnyError() {
        const anyError = Boolean(
          lockUsersError || locksError || privateLocksError || isExternalLockError,
        );

        setIsAnyError(anyError);
      },
      [lockUsersError, locksError, privateLocksError, isExternalLockError],
    );

    const commonTempLocks = React.useMemo(() => {
      return tempLocks.filter((lock) => {
        return lock.access_type === LOCK_ACCESS_TYPES.common;
      });
    }, [tempLocks]);
    const privateTempLocks = React.useMemo(() => {
      return tempLocks.filter((lock) => {
        return lock.access_type === LOCK_ACCESS_TYPES.private;
      });
    }, [tempLocks]);
    const allLocks = React.useMemo(() => {
      return [...(locks || []), ...(privateLocks || []), ...tempLocks];
    }, [locks, privateLocks, tempLocks]);

    const locksCount = React.useMemo(() => {
      const locksNumber = locks?.length || 0;
      const tempLocksNumber = commonTempLocks?.length || 0;

      return locksNumber + tempLocksNumber;
    }, [commonTempLocks, locks]);
    const privateLocksCount = React.useMemo(() => {
      const locksNumber = privateLocks?.length || 0;
      const tempLocksNumber = privateTempLocks?.length || 0;

      return locksNumber + tempLocksNumber;
    }, [privateLocks, privateTempLocks]);

    const deleteLockUserMutation = useMutation<
      LockUser,
      Error,
      string,
      {prevLockUsers: LockUser[]}
    >((lockUserId) => api.locks.deleteLockUserFetcher(lockUserId), {
      onMutate: async (lockUserId) => {
        await queryClient.cancelQueries(lockUsersQueryKey);
        const prevLockUsers = queryClient.getQueryData<LockUser[]>(lockUsersQueryKey);
        const optimisticDeals = prevLockUsers?.filter((lock) => lock.id !== lockUserId);
        queryClient.setQueryData(lockUsersQueryKey, optimisticDeals);

        return {prevLockUsers: prevLockUsers || []};
      },
      onSuccess: () => {
        setIsAnyError(false);
        setAccount(null);
      },
      onError: (error, _, context) => {
        if (!isMounted.current) {
          return;
        }
        queryClient.setQueryData(lockUsersQueryKey, context?.prevLockUsers);

        if (error) {
          toastResponseError(error);
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(lockUsersQueryKey);
      },
    });

    const lockUsersOptions = React.useMemo(() => {
      return getLockUsersAsOptions(lockUsers, deleteLockUserMutation.mutate);
    }, [deleteLockUserMutation.mutate, lockUsers]);

    const [isAnySelectorActive, setIsAnySelectorActive] = React.useState(false);

    const isLoading = locksStatus === 'loading' || privateLocksStatus === 'loading';

    const preloadedSectionActive = Boolean(housing?.is_smart_lock_enabled);

    const {
      isSectionActive,
      toggleIsSectionActive,
      setIsSectionActive,
      isSectionActiveTouched,
    } = useSwitchSectionActive(preloadedSectionActive);

    React.useImperativeHandle(ref, () => {
      return {
        tempLocks,
        lockUser: account,
        active: isSectionActive,
        instructions: getValues(FormNames.instructions),
        sendingHour: getValues(FormNames.sendingHour),
        clearTempLocks: () => setTempLocks([]),
      };
    });

    React.useEffect(
      function handleSubmitDisable() {
        if (!setIsSubmitDisabled) {
          return;
        }

        const shouldEnableSubmit =
          (locksCount > 0 || privateLocksCount > 0) && isAnySelectorActive;

        if (shouldEnableSubmit || !isSectionActive) {
          setIsSubmitDisabled(false);
        } else {
          setIsSubmitDisabled(true);
        }
      },
      [
        isSectionActive,
        setIsSubmitDisabled,
        locksCount,
        privateLocksCount,
        isAnySelectorActive,
      ],
    );

    React.useEffect(
      function handleIsSectionTouched() {
        setIsSectionTouched(isSectionActiveTouched || isSelectorsTouched);
      },
      [setIsSectionTouched, isSectionActiveTouched, isSelectorsTouched],
    );

    React.useEffect(() => {
      if (housing && arePrivateLocksEnabled) {
        setTempLocks([]);
        refetchPrivateLocks();
      }
    }, [housing, refetchPrivateLocks, arePrivateLocksEnabled]);

    React.useEffect(() => {
      if (lockUsersOptions?.length && !account) {
        const defaultAccount = lockUsersOptions[0];
        setAccount(defaultAccount);
      }
    }, [lockUsersOptions, account]);

    const closeDoorModals = () => {
      closeNewDoorModal();
      closeNewPrivateDoorModal();
    };

    const setSectionTouched = React.useCallback(() => {
      if (setIsSectionTouched) {
        setIsSectionTouched(true);
      }
    }, [setIsSectionTouched]);

    const toggleSectionActive = () => {
      if (
        !isSectionActive &&
        !isRemoteAccessActive &&
        !(isTrialMode && lockUsers?.length)
      ) {
        openSubscriptionAndProviderModal();
        return;
      }

      toggleIsSectionActive();
    };

    const handleAddAccountClick = () => {
      openSubscriptionAndProviderModal();
    };

    const handleAccountNameChange = (accountName: SelectOption) => {
      setAccount(accountName);
      setCurrentPage(0);
      setCurrentPrivateLocksPage(0);
      setTempLocks([]);
      setExternalLockError(false);
      setSectionTouched();
    };

    const textAreaRef = React.useRef<TextareaAutosize | null>();
    const sendingHourRef = React.useRef<HTMLDivElement | null>();

    const {
      ref: instructionsRegisterRef,
      onChange: instructionsOnChange,
      ...instructionsRegister
    } = register(FormNames.instructions, {
      required: `${t('required')}`,
    });

    const {
      ref: sendingHourRegisterRef,
    } = register(FormNames.sendingHour, {
      required: `${t('required')}`,
    });

    const handleCustomInstructionsChange = (
      event: React.ChangeEvent<HTMLTextAreaElement>,
    ) => {
      const value = event.target.value;
      setCustomInstructionsValue(value);
      instructionsOnChange(event);
    };

    const CustomInstructions = (
      <InstructionSubsection
        title={t('email_settings')}
        subtitle={<Subtitle>{t('email_settings_subtitle')}</Subtitle>}
      >
        <TextareaStyled
          ref={(textareaRef) => {
            textAreaRef.current = textareaRef;
            instructionsRegisterRef((textareaRef as unknown) as HTMLTextAreaElement);
          }}
          {...instructionsRegister}
          defaultValue={customInstructionsValue}
          onChange={handleCustomInstructionsChange}
          placeholder={t('instructions_placeholder')}
          label={t('enter_instructions')}
          name={FormNames.instructions}
          error={errors[FormNames.instructions]?.message}
          disabled={disabled}
        />
      </InstructionSubsection>
    );

    React.useEffect(
      function preloadInstructions() {
        if (!isLoading && housing) {
          const instructions = housing.self_check_in_instructions;
          const queryHourspromisse = api.locks.getSendingHours();

          queryHourspromisse.then((response) => {
            if (response.data.length === 1) {
              const sendindHour = response.data[0].hour_of_sending_keys;
              setValue(FormNames.instructions, instructions);
              setValue(FormNames.sendingHour, sendindHour);
              setCustomInstructionsValue(instructions);
              setSendingHour({label: `${sendindHour}:00`, value: sendindHour})
              setUntouchedValues({
                [FormNames.instructions]: instructions,
                [FormNames.sendingHour]: sendindHour,
              });
            } else {
              setValue(FormNames.instructions, instructions);
              setCustomInstructionsValue(instructions);
              setUntouchedValues({
                [FormNames.instructions]: instructions,
              });
            }
          }).catch((error) => {
            toastResponseError(error);
            setValue(FormNames.instructions, instructions);
            setCustomInstructionsValue(instructions);
            setUntouchedValues({
              [FormNames.instructions]: instructions,
            });
          });
        }
      },
      [housing, setValue, isLoading, setUntouchedValues],
    );

    React.useEffect(
      function handleIsInstructionsTouched() {
        if (setIsSectionTouched) {
          setIsSectionTouched(isFormTouched);
        }
      },
      [isFormTouched, setIsSectionTouched],
    );

    const getCurrentPageLocks = React.useCallback(
      (typeLocks?: Lock[], tempTypeLocks?: TempLock[], page = 0) => {
        if (!typeLocks?.length && !tempTypeLocks?.length) {
          return [];
        }

        if (!typeLocks?.length && tempTypeLocks?.length) {
          return tempTypeLocks.slice(page * pageSize, (page + 1) * pageSize);
        }

        if (typeLocks?.length && !tempTypeLocks?.length) {
          return typeLocks.slice(page * pageSize, (page + 1) * pageSize);
        }

        return [...typeLocks!, ...tempTypeLocks!].slice(
          page * pageSize,
          (page + 1) * pageSize,
        );
      },
      [],
    );

    const getCurrentPageCommonLocks = React.useCallback(() => {
      return getCurrentPageLocks(locks, commonTempLocks, currentPage);
    }, [commonTempLocks, currentPage, getCurrentPageLocks, locks]);

    const getCurrentPagePrivateLocks = React.useCallback(() => {
      return getCurrentPageLocks(privateLocks, privateTempLocks, currentPrivateLocksPage);
    }, [currentPrivateLocksPage, getCurrentPageLocks, privateLocks, privateTempLocks]);

    const createLockMutation = useMutation<Lock, Error, TempLock>(
      (payload) => api.locks.createLockMutation(payload),
      {
        onSuccess: (data) => {
          const isCommonType = data.access_type === LOCK_ACCESS_TYPES.common;
          isCommonType ? refetchLocks() : refetchPrivateLocks();
        },
        onError: (error) => {
          if (!isMounted.current) {
            return;
          }
          if (error) {
            displayError(error);
          }
        },
        onSettled: () => {
          closeDoorModals();
        },
      },
    );

    const createLock = ({lock, housingId, housingRooms = []}: CreateLock) => {
      if (!isSectionActive || !lock || !account) {
        return;
      }

      const isLockAssignedToAJustCreatedRoom =
        lock.access_type === LOCK_ACCESS_TYPES.private && !lock?.room_id;
      const payload = {
        ...lock,
        housing: housingId,
      };

      if (isLockAssignedToAJustCreatedRoom) {
        const lockRoom = housingRooms.find((room) => {
          return room?.number === lock?.room_number;
        });

        if (!lockRoom?.id) {
          return;
        }

        payload.room_id = lockRoom.id;
      }

      return createLockMutation.mutate(payload);
    };

    const saveLock = (lock: TempLock) => {
      if (isUpdatingHousing) {
        return createLock({lock, housingId: housing.id, housingRooms: housing.rooms});
      }

      setTempLocks((prevState) => {
        return [...prevState, lock];
      });
      closeDoorModals();
      setSectionTouched();
    };

    const privateLocksSection = React.useMemo(() => {
      if (!isHotelSubscription) {
        return null;
      }

      const PrivateLocksWrapper = ({children}: {children: React.ReactNode}) => (
        <SectionStyled
          title={
            <>
              {t('private_access')}{' '}
              <WrappedTooltip
                content={
                  <LocksSubHeader>
                    {t('private_access_first_description')}
                    <p />
                    {t('private_access_second_description')}
                  </LocksSubHeader>
                }
              />
            </>
          }
        >
          {children}
        </SectionStyled>
      );

      const AddPrivateDoorBtn = (
        <AddButton
          disabled={disabled || isLoading}
          label={t('add_a_private_door')}
          type="button"
          onClick={openNewPrivateDoorModal}
        />
      );

      if (!isLoading && !privateLocks?.length && !privateTempLocks.length) {
        return (
          <PrivateLocksWrapper>
            <NoLocksMessage>
              <div>{t('no_doors')}</div>
            </NoLocksMessage>
            {AddPrivateDoorBtn}
          </PrivateLocksWrapper>
        );
      }

      return (
        <PrivateLocksWrapper>
          <LocksItems>
            <FieldsGridLayout>
              {getCurrentPagePrivateLocks()?.map((lock, index) => {
                return (
                  <LockItem
                    setSectionTouched={setSectionTouched}
                    key={index}
                    lock={lock}
                    canRefetch={arePrivateLocksEnabled}
                    refetch={refetchPrivateLocks}
                    tempLocks={privateTempLocks}
                    setTempLocks={setTempLocks}
                  />
                );
              })}
            </FieldsGridLayout>
            {privateLocksCount >= pageSize && (
              <PaginationContent hasPagination={privateLocksCount > pageSize}>
                {privateLocksCount > pageSize && (
                  <Pagination
                    onPageChange={setCurrentPrivateLocksPage}
                    pages={Math.ceil(Number(privateLocksCount) / pageSize)}
                    page={currentPrivateLocksPage}
                  />
                )}
              </PaginationContent>
            )}
          </LocksItems>
          {AddPrivateDoorBtn}
        </PrivateLocksWrapper>
      );
    }, [
      setSectionTouched,
      arePrivateLocksEnabled,
      privateTempLocks,
      refetchPrivateLocks,
      currentPrivateLocksPage,
      disabled,
      getCurrentPagePrivateLocks,
      isHotelSubscription,
      isLoading,
      openNewPrivateDoorModal,
      privateLocks,
      privateLocksCount,
      t,
    ]);

    return (
      <>
        <Section
          title={
            <>
              {t('remote_access')}
              <SectionTag color={SectionTagColors.BLUE} label={t('premium')} />
            </>
          }
          subtitle={<Subtitle>{t('remote_access_subtitle')}</Subtitle>}
        >
          <Switch
            checked={isSectionActive}
            onChange={toggleSectionActive}
            label={t('activate_remote_access')}
            disabled={disabled || lockUsersStatus === 'loading'}
          />
          {isSectionActive && (
            <Content>
              <AccountWrapper>
                <AccountSelectWrapper>
                  <Select
                    loading={lockUsersStatus === 'loading'}
                    label={t('account_name')}
                    options={lockUsersOptions}
                    onChange={handleAccountNameChange}
                    value={account}
                    disabled={disabled}
                    placeholder={t('select_your_account')}
                  />
                </AccountSelectWrapper>
                {!disabled && (
                  <AddAccountButton
                    secondary
                    disabled={disabled}
                    type="button"
                    onClick={handleAddAccountClick}
                    label={t('add_account')}
                  />
                )}
              </AccountWrapper>

              {account &&
                (isAnyError ? (
                  <LockErrorSection
                    account={account}
                    deleteLockUserMutation={deleteLockUserMutation}
                  />
                ) : (
                  <SectionStyled
                    title={isHotelSubscription ? t('common_access') : t('doors')}
                  >
                    {vendorsWithoutKeysAdding.includes(accountVendor) ? (
                      <NoLocksMessage>
                        <div>{t('doors_unavailable_for_vendor')}</div>
                      </NoLocksMessage>
                    ) : (
                      <div>
                        {isLoading ? (
                          <LocksLoaderWrapper>
                            <Loader height={45} width={45} label={t('loading')} />
                          </LocksLoaderWrapper>
                        ) : (
                          Boolean(locksCount) && (
                            <LocksItems>
                              <FieldsGridLayout>
                                {getCurrentPageCommonLocks()?.map((lock, index) => {
                                  return (
                                    <LockItem
                                      setSectionTouched={setSectionTouched}
                                      key={index}
                                      lock={lock}
                                      canRefetch={areCommonLocksEnabled}
                                      refetch={refetchLocks}
                                      tempLocks={commonTempLocks}
                                      setTempLocks={setTempLocks}
                                    />
                                  );
                                })}
                              </FieldsGridLayout>
                              {locksCount >= pageSize && (
                                <PaginationContent hasPagination={locksCount > pageSize}>
                                  {locksCount > pageSize && (
                                    <Pagination
                                      onPageChange={setCurrentPage}
                                      pages={Math.ceil(Number(locksCount) / pageSize)}
                                      page={currentPage}
                                    />
                                  )}
                                </PaginationContent>
                              )}
                            </LocksItems>
                          )
                        )}
                        {!isLoading && !locks?.length && !commonTempLocks.length && (
                          <div>
                            <NoLocksMessage>
                              <div>{t('no_doors')}</div>
                            </NoLocksMessage>
                          </div>
                        )}
                        <AddButton
                          disabled={disabled || isLoading}
                          type="button"
                          label={t('add_door')}
                          onClick={openNewDoorModal}
                        />
                        {privateLocksSection}
                        {CustomInstructions}
                        <TimingSubsection title={t('select_timings')}>
                          <Selectors
                            selectorsFormNames={lockReminderOptions}
                            preloadedSelectorsData={housing}
                            isSectionActive={isSectionActive}
                            disabled={disabled}
                            setIsSelectorsTouched={setIsSelectorsTouched}
                            setIsAnySelectorActive={setIsAnySelectorActive}
                          />
                        </TimingSubsection>
                        <TimingSubsection title={t('sending_time')}>
                          <Select
                            ref={(hourRef: any) => {
                              sendingHourRef.current = hourRef
                              sendingHourRegisterRef(hourRef);
                            }}
                            options={HOURS_OPTIONS}
                            onChange={(hour: SelectOption<string, string>) => {
                              setSendingHour(hour);
                              setValue(FormNames.sendingHour, parseInt(hour.value))
                            }}
                            value={sendingHour}
                            disabled={disabled}
                            placeholder={t('sending_hour')}
                          />
                        </TimingSubsection>
                      </div>
                    )}
                  </SectionStyled>
                ))}
            </Content>
          )}
        </Section>
        <SubscriptionAndProviderModal
          open={isSubscriptionAndProviderModalOpen}
          onClose={closeSubscriptionAndProviderModal}
          setSectionTouched={setSectionTouched}
          setIsSectionActive={setIsSectionActive}
          isSectionActive={isSectionActive}
          subscriptionProductType={SUBSCRIPTION_PRODUCT_TYPES.remoteAccess}
          subtitle={t('remote_access_premium_feature_subtitle')}
        />
        {isNewDoorModalOpen && !isExternalLockError && (
          <NewDoorModal
            open
            allLocks={allLocks}
            housingId={housing?.id}
            user={account}
            onSaveLock={saveLock}
            onClose={closeNewDoorModal}
            accessType={LOCK_ACCESS_TYPES.common}
            setExternalLockError={setExternalLockError}
            isLoading={createLockMutation.isLoading}
          />
        )}
        {isNewPrivateDoorModalOpen && (
          <NewDoorModal
            open
            allLocks={allLocks}
            housingId={housing?.id}
            user={account}
            rooms={rooms}
            onSaveLock={saveLock}
            onClose={closeNewPrivateDoorModal}
            accessType={LOCK_ACCESS_TYPES.private}
            isLoading={createLockMutation.isLoading}
          />
        )}
        <ErrorModal />
      </>
    );
  },
);

type LockItemProps = {
  lock: Lock | TempLock;
  refetch: any;
  setTempLocks: Dispatch<SetStateAction<TempLock[]>>;
  tempLocks: TempLock[];
  canRefetch: boolean;
  setSectionTouched: () => void;
};

function LockItem({
  lock,
  refetch,
  canRefetch,
  tempLocks,
  setTempLocks,
  setSectionTouched,
}: LockItemProps) {
  const {t} = useTranslation();
  const {isLoading, setStatus} = useStatus();
  const isMounted = useIsMounted();
  const lockType =
    LOCK_TYPES_OPTIONS[lock.type as keyof typeof LOCK_TYPES_OPTIONS]?.label || '';
  const isLockBox = LOCK_VENDORS.manualBox === lock.vendor || !lock.external_id;

  const deleteFromTempLocks = () => {
    if (!setTempLocks) {
      return;
    }

    setTempLocks((prevTempLocks) => {
      return prevTempLocks.filter((prevTempLock) => {
        return prevTempLock !== lock;
      });
    });
  };

  const deleteFromLocks = async () => {
    setStatus('loading');
    const {data, error} = await api.locks.deleteLock(lock.id);

    if (!isMounted.current) return;

    if (data) {
      if (canRefetch) {
        refetch();
      }
      setSectionTouched();
      setStatus('success');
    }

    if (error) {
      toastResponseError(error);
      setStatus('error');
    }
  };

  const deleteLock = () => {
    const isTempLock = tempLocks?.some((tempLock) => tempLock === lock);

    if (isTempLock) {
      deleteFromTempLocks();
    } else {
      deleteFromLocks();
    }
  };

  return (
    <LockWrapper>
      <DoorTitle>{lock.name}</DoorTitle>
      <FlexRow>
        {!isLockBox && <DoorType>{lockType}</DoorType>}
        <DeleteButton type="button" onClick={deleteLock} disabled={isLoading}>
          <img src={deleteIcon} alt="Delete" />
        </DeleteButton>
      </FlexRow>
      <DoorFooter>
        {isLockBox
          ? `${t('access_code')}: ${lock.access_code || ''}`
          : `External Id: ${lock.external_id || ''}`}
      </DoorFooter>
    </LockWrapper>
  );
}

HousingRemoteAccessSection.defaultProps = defaultProps;
export {HousingRemoteAccessSection};
