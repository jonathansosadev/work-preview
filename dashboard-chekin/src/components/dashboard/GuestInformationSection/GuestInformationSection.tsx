import React from 'react';
import moment from 'moment/moment';
import {useTranslation} from 'react-i18next';
import {useFormContext} from 'react-hook-form';
import {Column, Row, useTable} from 'react-table';
import {useHistory} from 'react-router-dom';
import {useQueryClient, useQuery, useMutation} from 'react-query';
import {toast} from 'react-toastify';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import {toastResponseError} from '../../../utils/common';
import {
  getCountryCode,
  getTimezone,
  getChecksVerificationType,
} from '../../../utils/housing';
import {
  getCalculatedNumberOfGuests,
  getStatTypeIfStatActive,
} from '../../../utils/reservations';
import {getDocumentPhotos} from '../../../utils/guest';
import {
  Guest,
  GuestGroup,
  Housing,
  LightReservation,
  Reservation,
  StatusDetails,
  ReactEntity,
} from '../../../utils/types';
import {getDisplayStatuses, STATUS_TYPES} from '../../../utils/statuses';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import {getGroupMembersNumber, getGuestLeader} from '../../../utils/guestGroup';
import api, {queryFetcher} from '../../../api';
import {FORM_NAMES} from '../ReservationInfoSection';
import {getTimezoneDate} from '../../../utils/date';
import {
  COUNTRIES_WITH_POLICE,
  COUNTRIES_WITH_STAT,
  GUEST_PLACEHOLDER_ID,
  STAT_TYPES_WITHOUT_CHECK_OUT,
  COUNTRY_CODES,
  MIN_MEMBERS_NUMBER,
  COUNTRIES_WITH_POLICE_NOT_ALLOWED_SEND_ONE_GUEST,
  QUERY_CACHE_KEYS,
} from '../../../utils/constants';
import rubbishIcon from '../../../assets/rubbish.svg';
import errorIcon from '../../../assets/error.svg';
import deleteGuestIcon from '../../../assets/icon-delete-guest.svg';
import greenCheck from '../../../assets/check-green.svg';
import ModalButton from '../ModalButton';
import Section from '../Section';
import Switch from '../Switch';
import Modal from '../Modal';
import Tooltip from '../Tooltip';
import IdentityVerificationModal from '../IdentityVerificationModal';
import {
  CapitalizeWrapper,
  ResolveButton as BaseResolveButton,
} from '../../../styled/common';
import {
  ButtonLabelWrapper,
  ButtonsWrapper,
  Content,
  DeleteButtonLabelIcon,
  DeleteButtonLabelText,
  DeleteGuestButton,
  DeleteGuestButtonContainer,
  GuestName,
  GuestTableLoader,
  ResolveButton,
  RowErrorIcon,
  StatusDisplay,
  TableWrapper,
  StatusTooltip,
  StatusCellContainer,
  StatusText,
  StatusTitle,
  GuestTableLoaderWrapper,
  ErrorText,
  RowSuccessIcon,
  ResendEmailButtonStyled,
} from './styled';

const defaultNumberOfGuests = 1;

const registerGoalOptions = {
  stat: 'stata',
  police: 'police',
};

const registerStatusOptions = {
  NEW: 'NEW',
  RESTART: 'RESTART',
  SCHEDULED: 'SCHEDULED',
  PROGRESS: 'PROGRESS',
  COMPLETE: 'COMPLETE',
  ERROR: 'ERROR',
  NOT_USED: 'NOT_USED',
  MANUAL: 'MANUAL',
  NO_LOGIN_CRED: 'NO_LOGIN_CRED',
  NOT_ENOUGH_DATA: 'NOT_ENOUGH_DATA',
};

const columnsIds = {
  policeStatusIn: STATUS_TYPES.policeCheckIn,
  policeStatusOut: STATUS_TYPES.policeCheckOut,
  statStatusIn: STATUS_TYPES.statsCheckIn,
  statStatusOut: STATUS_TYPES.statsCheckOut,
  biomatchStatus: STATUS_TYPES.selfCheckIn,
  guestDelete: 'GUEST_DELETE',
  name: 'NAME',
};

const registerTypeOptions = {
  policeStatusIn: columnsIds.policeStatusIn,
  policeStatusOut: columnsIds.policeStatusOut,
  statStatusIn: columnsIds.statStatusIn,
  statStatusOut: columnsIds.statStatusOut,
  biomatchStatus: columnsIds.biomatchStatus,
};

const timeoutCloseModal = 1200;

function fetchHousing(id = '') {
  return queryFetcher(api.housings.ENDPOINTS.one(id));
}

type GuestInformationSectionProps = {
  disabled: boolean;
  goToGuestEdit: (guestId?: string) => void;
  reservation?: LightReservation;
  isEditing?: boolean;
};

const defaultProps: Partial<GuestInformationSectionProps> = {
  isEditing: false,
  reservation: undefined,
};

function checkIsItalianLeaderWithMembers(
  housing?: Housing,
  guestGroup?: GuestGroup,
  guestId?: string,
) {
  if (!housing || !guestGroup || !guestId) {
    return;
  }
  const housingCountry = getCountryCode(housing);
  const guestLeader = getGuestLeader(guestGroup);

  return (
    guestLeader?.id === guestId &&
    getGroupMembersNumber(guestGroup) > MIN_MEMBERS_NUMBER &&
    housingCountry === COUNTRY_CODES.italy
  );
}

function GuestInformationSection({
  disabled,
  isEditing,
  reservation,
  goToGuestEdit,
}: GuestInformationSectionProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {watch, setValue} = useFormContext();
  const isMounted = useIsMounted();
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout>>();
  const {ErrorModal, displayError} = useErrorModal();
  const history = useHistory();
  const {isLoading, setStatus} = useStatus();
  const {
    openModal: openDeleteGuestModal,
    closeModal: closeDeleteGuestModal,
    isOpen: isDeleteGuestModalOpen,
  } = useModalControls();
  const {
    openModal: openReviewGuestModal,
    closeModal: closeReviewGuestModal,
    isOpen: isReviewGuestModalOpen,
  } = useModalControls();
  const {
    ErrorModal: FutureWarningModal,
    displayError: displayFutureWarningModal,
  } = useErrorModal();
  const [activeGuest, setActiveGuest] = React.useState<Guest | null>(null);
  const [isSectionActive, setIsSectionActive] = React.useState(false);
  const [guestIdToDelete, setGuestIdToDelete] = React.useState('');
  const [checkInDateFormat, setCheckInDateFormat] = React.useState('');
  const [tableData, setTableData] = React.useState<Guest[]>([]);

  const housingId = reservation?.housing_id;
  const {data: housing, status: housingStatus, error: housingError} = useQuery<
    Housing,
    [string, string]
  >(['housing', housingId], () => fetchHousing(housingId!), {
    enabled: Boolean(housingId),
    refetchOnWindowFocus: false,
  });
  useErrorToast(housingError, {
    notFoundMessage: t('errors.requested_housings_not_found'),
  });

  const getDisplayStatusesAsHiddenColumns = React.useCallback((displayStatuses: string[]) => {
    const statusColumns = [
      columnsIds.statStatusOut,
      columnsIds.statStatusIn,
      columnsIds.policeStatusIn,
      columnsIds.policeStatusOut,
      columnsIds.biomatchStatus,
    ];

    let columns = displayStatuses;

    if( !housing?.is_stat_registration_enabled ) {
      columns = columns.filter((column) => !(column === STATUS_TYPES.statsCheckIn || column === STATUS_TYPES.statsCheckOut));
    }

    if( !housing?.is_auto_police_registration_enabled ) {
      columns = columns.filter((column) => !(column === STATUS_TYPES.policeCheckIn || column === STATUS_TYPES.policeCheckOut));
    }

    return statusColumns.filter((column) => {
      return !columns.includes(column);
    });
  }, [housing]);

  const isBiomatchOnlyLeadGuest = Boolean(!housing?.is_biometric_match_for_all_enabled);

  const {
    isDocumentAndSelfie,
    isDocumentAndSelfieOptional,
    isOnlyOfficialDocument,
  } = React.useMemo(() => getChecksVerificationType(housing), [housing]);

  const guestGroupId = reservation?.guest_group_id;
  const {
    data: guestGroup,
    refetch: refetchGuestGroup,
    status: guestGroupStatus,
  } = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
  });

  const getApproveGuestBiomatchPayload = () => {
    const verificationType = isDocumentAndSelfie ? 'biomatch_passed' : 'document_passed';
    return {
      [verificationType]: true,
      reservation_id: reservation?.id,
    } as Partial<Guest>;
  };

  const approveGuestBiomatchMutation = useMutation<unknown, Error>(
    () => api.guests.patchByIdQuery(activeGuest!.id, getApproveGuestBiomatchPayload()),
    {
      onSuccess: () => {
        queryClient.refetchQueries(reservation?.id);
        timeoutRef.current = setTimeout(() => {
          handleCloseReviewPhotos();
          approveGuestBiomatchMutation.reset();
        }, timeoutCloseModal);
      },
      onError: (error) => {
        if (!isMounted.current) {
          return;
        }
        if (error) {
          displayError(error);
          return;
        }
      },
      onSettled: () => {
        queryClient.invalidateQueries(QUERY_CACHE_KEYS.guestGroup);
      },
    },
  );

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const hiddenColumns = React.useMemo(() => {
    if (!housing || !guestGroup) {
      return [];
    }

    const displayStatuses = getDisplayStatuses({
      ...reservation,
      housing,
      guest_group: guestGroup,
    } as Reservation);

    return getDisplayStatusesAsHiddenColumns(displayStatuses);
  }, [guestGroup, housing, reservation, getDisplayStatusesAsHiddenColumns]);

  const numberOfGuests = watch(FORM_NAMES.number_of_guests);
  const children = watch(FORM_NAMES.children);
  const guestsNumber = getCalculatedNumberOfGuests(Number(numberOfGuests), children);

  const getGuestsPlaceholders = React.useCallback((number: number) => {
    const emptyGuests = [];
    for (let i = 0; i < number; i++) {
      emptyGuests.push({id: GUEST_PLACEHOLDER_ID} as any);
    }
    return emptyGuests;
  }, []);

  React.useEffect(
    function updateTableDataOnGuestNumberChange() {
      if (!isEditing) {
        return;
      }
      const guestMembers = guestGroup?.members || [];
      let tableData = [...guestMembers];

      if (guestsNumber > guestMembers.length) {
        const diff = guestsNumber - guestMembers.length;
        const guestPlaceholders = getGuestsPlaceholders(diff);

        tableData = [...tableData, ...guestPlaceholders];
      }

      setTableData(tableData);
    },
    [getGuestsPlaceholders, guestGroup, guestsNumber, isEditing],
  );

  const resendCheckInPoliceRegistration = React.useCallback(
    async (reservation_id: string, guest_id: string) => {
      const {error} = await api.reservations.sendGuestToRegistration(
        reservation_id,
        guest_id,
      );
      if (error) {
        toastResponseError(error);
        return;
      }
      await queryClient.refetchQueries([QUERY_CACHE_KEYS.guestGroup, guestGroupId]);
      toast.success(t('guest_sent'));
    },
    [t, guestGroupId, queryClient],
  );

  const doResendGuestAction = React.useCallback(
    async (reservation_id: string, guest_id: string) => {
      const timeZone = getTimezone(housing);
      const checkInDate = getTimezoneDate(reservation!.check_in_date, timeZone);
      const currentDate = getTimezoneDate(moment(), timeZone);
      if (checkInDate.isSameOrBefore(currentDate, 'date')) {
        await resendCheckInPoliceRegistration(reservation_id, guest_id);
        return;
      }
      await setCheckInDateFormat(checkInDate.format('DD/MM/YYYY'));
      displayFutureWarningModal();
    },
    [resendCheckInPoliceRegistration, housing, displayFutureWarningModal, reservation],
  );

  const toggleIsSectionActive = () => {
    setIsSectionActive((prevState) => {
      if (!prevState && !numberOfGuests) {
        setValue(FORM_NAMES.number_of_guests, defaultNumberOfGuests);
      }
      return !prevState;
    });
  };

  const handleOpenReviewPhotos = React.useCallback(
    (guest: Guest) => {
      openReviewGuestModal();
      setActiveGuest(guest);
    },
    [openReviewGuestModal],
  );

  const handleCloseReviewPhotos = () => {
    closeReviewGuestModal();
    setActiveGuest(null);
  };

  const goToOneHousing = React.useCallback(
    (id?: string) => {
      if (!id) {
        toast.warn('Housing id is missing');
      }
      history.push(`/properties/${id}`);
    },
    [history],
  );

  const removeDeletedGuestFromGuestGroup = async () => {
    const {data: guestGroup} = await refetchGuestGroup();

    if (guestGroup) {
      queryClient.setQueryData<GuestGroup>(
        [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
        guestGroup,
      );
    } else {
      queryClient.setQueryData<GuestGroup>(
        [QUERY_CACHE_KEYS.guestGroup, guestGroupId],
        (oldData?: any) => {
          if (!oldData) {
            return oldData;
          }

          if (guestGroup) {
            return {
              manuallyUpdated: true,
              ...oldData,
              guest_group: guestGroup,
            };
          }

          const newMembers = oldData?.members?.filter((m: any) => {
            return m.id !== guestIdToDelete;
          });

          return {
            ...oldData,
            members: newMembers,
          };
        },
      );
    }

    //ts problems ANY
    queryClient.setQueryData(reservation!.id, (oldData?: any) => {
      if (!oldData) {
        return oldData;
      }

      return {
        manuallyUpdated: true,
        ...oldData,
      };
    });
  };

  const handleDeleteGuestSuccess = () => {
    setStatus('success');
    closeDeleteGuestModal();
    setGuestIdToDelete('');
    toast.success(t('guest_successfully_deleted'));
  };

  const deleteGuest = async () => {
    setStatus('loading');
    const {error} = await api.guests.deleteById(guestIdToDelete);

    if (error) {
      setStatus('idle');
      closeDeleteGuestModal();
      displayError(error);
      return;
    }

    await removeDeletedGuestFromGuestGroup();
    handleDeleteGuestSuccess();
  };

  const getAreCredentialsCompleted = React.useCallback(
    (codes: Array<string>, account: any) => {
      const country = getCountryCode(housing);
      return Boolean(country && codes.includes(country) && account);
    },
    [housing],
  );

  const renderStatusInfo = React.useCallback(
    (guest: Guest | undefined, registerType: string) => {
      if (!guest || guest.id === GUEST_PLACEHOLDER_ID) {
        return null;
      }

      const statType = getStatTypeIfStatActive(housing);

      let countryCodesForRegister: string[] = [];
      let accountToCheck = null;

      let statusMessage: JSX.Element | string | undefined = '';
      let statusButton: JSX.Element | null = null;

      let statusDetails: JSX.Element | string = '';
      let statusTitle: JSX.Element | string = '';

      let dubaiError = false;

      const setStatusInfo = (status: StatusDetails) => {
        const isError = status?.code === registerStatusOptions.ERROR;
        const isItalyPolice = getCountryCode(housing) === COUNTRY_CODES.italy;

        if (isError && !isItalyPolice) {
          if (
            getCountryCode(housing) === COUNTRY_CODES.uae &&
            registerType === registerTypeOptions.policeStatusOut
          ) {
            dubaiError = true;
          }

          statusButton = (
            <ResolveButton
              onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                resendCheckInPoliceRegistration(reservation!.id, guest?.id);
              }}
              type="button"
            >
              ({t('retry')})
            </ResolveButton>
          );
        }

        if (status?.label && status?.meaning) {
          statusTitle = status.label;

          if (isError && status?.details) {
            statusDetails = (
              <>
                <ErrorText>{status.details}</ErrorText>
                <p />
                {status.meaning}
              </>
            );
          } else {
            statusDetails = status.meaning;
          }
        }

        statusMessage = (
          <>
            {statusTitle}
            {isError && <RowErrorIcon src={errorIcon} alt="Error" />}
          </>
        );
      };

      const registerGoal = [
        registerTypeOptions.statStatusIn,
        registerTypeOptions.statStatusOut,
      ].includes(registerType as any)
        ? registerGoalOptions.stat
        : registerGoalOptions.police;

      if (registerGoal === registerGoalOptions.stat) {
        countryCodesForRegister = COUNTRIES_WITH_STAT;
        accountToCheck = housing?.stat_account;
      }

      if (registerGoal === registerGoalOptions.police) {
        countryCodesForRegister = COUNTRIES_WITH_POLICE;
        accountToCheck = housing?.police_account;
      }

      const areCredentialsCompleted = getAreCredentialsCompleted(
        countryCodesForRegister,
        accountToCheck,
      );

      if (!areCredentialsCompleted) {
        statusTitle = t('error_reason');
        statusDetails = t('your_property_not_connected_to_police');

        statusMessage = (
          <>
            {t('credentials_missing')}
            <RowErrorIcon src={errorIcon} alt="Error" />
          </>
        );
        statusButton = (
          <ResolveButton
            onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              goToOneHousing(housing?.id);
            }}
            type="button"
          >
            ({t('add_credentials')})
          </ResolveButton>
        );
      } else {
        if (registerType === registerTypeOptions.policeStatusIn) {
          const policeStatusIn = guest?.statuses?.police?.in;
          const country = getCountryCode(housing);
          setStatusInfo(policeStatusIn);

          if (
            [registerStatusOptions.NEW, registerStatusOptions.ERROR].includes(
              policeStatusIn?.code || '',
            ) &&
            !COUNTRIES_WITH_POLICE_NOT_ALLOWED_SEND_ONE_GUEST.includes(country)
          ) {
            if (
              getCountryCode(housing) === COUNTRY_CODES.uae &&
              registerType === registerTypeOptions.policeStatusOut
            ) {
              dubaiError = true;
            }

            statusButton = (
              <ResolveButton
                onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  doResendGuestAction(reservation!.id, guest?.id);
                }}
                type="button"
              >
                ({t('send_manually')})
              </ResolveButton>
            );
          }
        }

        if (registerType === registerTypeOptions.policeStatusOut) {
          const policeStatusOut = guest?.statuses?.police?.out;
          setStatusInfo(policeStatusOut);
        }

        if (registerType === registerTypeOptions.statStatusIn) {
          const statStatusIn = guest?.statuses?.statistics?.in;
          setStatusInfo(statStatusIn);
        }

        if (
          !STAT_TYPES_WITHOUT_CHECK_OUT.includes(statType) &&
          registerType === registerTypeOptions.statStatusOut
        ) {
          const statStatusOut = guest?.statuses?.statistics?.out;
          setStatusInfo(statStatusOut);
        }
      }

      return (
        <StatusCell tooltipTitle={statusTitle} tooltipDetails={statusDetails}>
          <div>
            <StatusDisplay>{statusMessage}</StatusDisplay>
            {dubaiError ? null : statusButton}
          </div>
        </StatusCell>
      );
    },
    [
      doResendGuestAction,
      resendCheckInPoliceRegistration,
      getAreCredentialsCompleted,
      goToOneHousing,
      housing,
      reservation,
      t,
    ],
  );

  const renderBiomatchStatus = React.useCallback(
    (guest: Guest) => {
      const leader = getGuestLeader(guestGroup);
      const isLeader = leader?.id === guest.id;
      if (!guest || guest.id === GUEST_PLACEHOLDER_ID) {
        return null;
      }
      if (isBiomatchOnlyLeadGuest && !isLeader) {
        return null;
      }
      const isNotBiomatchPhotos =
        isDocumentAndSelfie && (!guest.biomatch_doc || !guest.biomatch_selfie);
      const isNotDocumentPhotos = isOnlyOfficialDocument && !getDocumentPhotos(guest);
      const isBiomatchPassed = isDocumentAndSelfie && guest.biomatch_passed;
      const isDocumentPassed = isOnlyOfficialDocument && guest.document_passed;

      if (isBiomatchPassed || isDocumentPassed) {
        return (
          <GuestName>
            <CapitalizeWrapper>
              {isDocumentPassed ? t('completed') : t('approved')}
              <RowSuccessIcon src={greenCheck} alt="Approved" />
              <BaseResolveButton
                onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  handleOpenReviewPhotos(guest);
                }}
                type="button"
              >
                ({t('view_photos')})
              </BaseResolveButton>
            </CapitalizeWrapper>
          </GuestName>
        );
      }

      if (isNotBiomatchPhotos || isNotDocumentPhotos) {
        if (isDocumentAndSelfieOptional) {
          return (
            <GuestName pale>
              <CapitalizeWrapper>
                {t('pending')}
                <ResendEmailButtonStyled
                  reservation={reservation}
                  label={`(${t('resend_identity_verification')})`}
                />
              </CapitalizeWrapper>
            </GuestName>
          );
        }
        return <GuestName pale>{t('pending')}</GuestName>;
      }

      return (
        <GuestName pale>
          {t('failed')}
          <RowErrorIcon src={errorIcon} alt="Error" />
          <BaseResolveButton
            onClick={(e: React.SyntheticEvent<HTMLButtonElement>) => {
              e.stopPropagation();
              handleOpenReviewPhotos(guest);
            }}
            type="button"
          >
            ({t('review')})
          </BaseResolveButton>
        </GuestName>
      );
    },
    [
      guestGroup,
      handleOpenReviewPhotos,
      isBiomatchOnlyLeadGuest,
      isDocumentAndSelfie,
      isDocumentAndSelfieOptional,
      isOnlyOfficialDocument,
      reservation,
      t,
    ],
  );

  const columns = React.useMemo<Column<Guest>[]>(
    () => [
      {
        id: columnsIds.name,
        Header: t('guest_name') as string,
        accessor: 'full_name',
        Cell: ({value}) => {
          if (value) {
            return (
              <GuestName>
                <CapitalizeWrapper>{value.toLowerCase()}</CapitalizeWrapper>
              </GuestName>
            );
          }

          return <GuestName pale>[{t('name_missing')}]</GuestName>;
        },
      },
      {
        id: columnsIds.biomatchStatus,
        Header: t('identity_verification') as string,
        accessor: 'biomatch_passed',
        Cell: ({row}: {row: Row<Guest>}) => {
          return renderBiomatchStatus(row.original);
        },
      },
      {
        id: columnsIds.policeStatusIn,
        Header: t('police_status_in') as string,
        Cell: ({row}: {row: Row<Guest>}) => {
          return renderStatusInfo(row.original, registerTypeOptions.policeStatusIn);
        },
      },
      {
        id: columnsIds.policeStatusOut,
        Header: t('police_status_out') as string,
        Cell: ({row}: {row: Row<Guest>}) => {
          return renderStatusInfo(row.original, registerTypeOptions.policeStatusOut);
        },
      },
      {
        id: columnsIds.statStatusIn,
        Header: t('stats_in') as string,
        Cell: ({row}: {row: Row<Guest>}) => {
          return renderStatusInfo(row.original, registerTypeOptions.statStatusIn);
        },
      },
      {
        id: columnsIds.statStatusOut,
        Header: t('stats_out') as string,
        Cell: ({row}: {row: Row<Guest>}) => {
          return renderStatusInfo(row.original, registerTypeOptions.statStatusOut);
        },
      },
      {
        id: columnsIds.guestDelete,
        Cell: ({row}: {row: Row<Guest>}) => {
          if (row.original.id === GUEST_PLACEHOLDER_ID) {
            return null;
          }

          const hasItalianLeaderWithGuestMembers = checkIsItalianLeaderWithMembers(
            housing,
            guestGroup,
            row.original.id,
          );
          const leader = getGuestLeader(guestGroup);
          const isLeader = leader?.id === row.original.id;
          const isDeletingDisabled = hasItalianLeaderWithGuestMembers && isLeader;

          return (
            <DeleteGuestButtonContainer>
              <Tooltip
                isMouseOver={isDeletingDisabled}
                content={isDeletingDisabled && t('why_i_cant_delete_guest_leader')}
                trigger={
                  <DeleteGuestButton
                    disabled={disabled || hasItalianLeaderWithGuestMembers}
                    onClick={(e: React.SyntheticEvent) => {
                      e.stopPropagation();
                      openDeleteGuestModal();
                      setGuestIdToDelete(row.original?.id);
                    }}
                    type="button"
                  >
                    <img src={rubbishIcon} alt="Rubbish" />
                  </DeleteGuestButton>
                }
              />
            </DeleteGuestButtonContainer>
          );
        },
      },
    ],
    [
      t,
      renderBiomatchStatus,
      renderStatusInfo,
      housing,
      guestGroup,
      disabled,
      openDeleteGuestModal,
    ],
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setHiddenColumns,
  } = useTable({
    columns,
    data: tableData,
    initialState: {
      hiddenColumns,
    },
  });

  React.useEffect(() => {
    setHiddenColumns(hiddenColumns);
  }, [hiddenColumns, setHiddenColumns]);

  return (
    <>
      <Section title={t('guest_information')}>
        <Content>
          {!isEditing && (
            <Switch
              label={t('add_guest_info_now')}
              onChange={toggleIsSectionActive}
              checked={isSectionActive}
              disabled={disabled}
            />
          )}
          {(isEditing || isSectionActive) && (
            <TableWrapper>
              <table {...getTableProps()} style={{}}>
                <thead>
                  {headerGroups.map((headerGroup) => (
                    <tr {...headerGroup.getHeaderGroupProps()} style={{}}>
                      {headerGroup.headers.map((column) => {
                        return (
                          <th {...column.getHeaderProps()} style={{}}>
                            {column.render('Header')}
                          </th>
                        );
                      })}
                    </tr>
                  ))}
                </thead>
                <tbody {...getTableBodyProps()} style={{}}>
                  {!reservation ||
                  guestGroupStatus === 'loading' ||
                  housingStatus === 'loading' ? (
                    <GuestTableLoaderWrapper>
                      <td colSpan={10}>
                        <GuestTableLoader hideBorder label={t('loading')} />
                      </td>
                    </GuestTableLoaderWrapper>
                  ) : (
                    rows.map((row) => {
                      prepareRow(row);
                      return (
                        <tr
                          {...row.getRowProps()}
                          onClick={() => goToGuestEdit(row.original.id)}
                          style={{}}
                        >
                          {row.cells.map((cell) => {
                            return (
                              <td {...cell.getCellProps()} style={{}}>
                                {cell.render('Cell')}
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </TableWrapper>
          )}
        </Content>
      </Section>
      {isDeleteGuestModalOpen && (
        <Modal
          open
          iconSrc={deleteGuestIcon}
          iconAlt="Guest in trash"
          iconProps={{
            height: 95,
            width: 84,
          }}
          title={t('are_you_sure')}
          text={
            isLoading ? (
              <div>
                {t('deleting_guest')}...
                <p />
                <div>{t('it_takes_seconds')}</div>
              </div>
            ) : (
              t('all_info_associated_will_be_deleted')
            )
          }
        >
          {!isLoading && (
            <ButtonsWrapper>
              <ModalButton
                onClick={deleteGuest}
                label={
                  <ButtonLabelWrapper>
                    <DeleteButtonLabelIcon src={rubbishIcon} alt="Plus" />
                    <DeleteButtonLabelText>{t('delete_guest')}</DeleteButtonLabelText>
                  </ButtonLabelWrapper>
                }
              />
              <ModalButton
                secondary
                onClick={() => {
                  closeDeleteGuestModal();
                  setGuestIdToDelete('');
                }}
                label={t('cancel')}
              />
            </ButtonsWrapper>
          )}
        </Modal>
      )}
      {activeGuest && reservation && (
        <IdentityVerificationModal
          isOpen={isReviewGuestModalOpen}
          isDocumentAndSelfie={isDocumentAndSelfie}
          isOnlyOfficialDocument={isOnlyOfficialDocument}
          onClose={handleCloseReviewPhotos}
          onClickApprove={approveGuestBiomatchMutation.mutate}
          isLoading={approveGuestBiomatchMutation.isLoading}
          isSuccessApproved={approveGuestBiomatchMutation.isSuccess}
          reservation={reservation}
          guest={activeGuest}
          timeoutApproveRef={timeoutRef}
        />
      )}
      <FutureWarningModal
        title={t('warning')}
        message={t('check_in_date_is_on', {date: checkInDateFormat})}
      />
      <ErrorModal />
      <FutureWarningModal
        title={t('warning')}
        message={t('check_in_date_is_on', {date: checkInDateFormat})}
      />
    </>
  );
}

type StatusDetailsProps = {
  children: React.ReactElement | JSX.Element | null;
  tooltipDetails: ReactEntity;
  tooltipTitle: ReactEntity;
};
function StatusCell({tooltipDetails, tooltipTitle, children}: StatusDetailsProps) {
  const [isTooltipOpen, setIsTooltipOpen] = React.useState(false);

  return (
    <StatusCellContainer>
      <div
        onMouseOver={() => setIsTooltipOpen(true)}
        onMouseLeave={() => setIsTooltipOpen(false)}
      >
        {children}
        {tooltipDetails && tooltipTitle && (
          <StatusTooltip
            onClick={(e) => e.stopPropagation()}
            onMouseOver={(e) => e.stopPropagation()}
            open={isTooltipOpen}
          >
            <StatusTitle>{tooltipTitle}</StatusTitle>
            <StatusText>{tooltipDetails}</StatusText>
          </StatusTooltip>
        )}
      </div>
    </StatusCellContainer>
  );
}

GuestInformationSection.defaultProps = defaultProps;
const MemoizedGuestInformationSection = React.memo(GuestInformationSection);
export {MemoizedGuestInformationSection};
