import React from 'react';
import {useQueryClient, useInfiniteQuery} from 'react-query';
import {useInfiniteScroll} from 'react-infinite-scroll-hook';
import {Column, Row, useTable} from 'react-table';
import {useTranslation} from 'react-i18next';
import {useHistory} from 'react-router-dom';
import {format, isDate, set} from 'date-fns';
import {toast} from 'react-toastify';
import {
  toastResponseError,
  getMenuOptions,
  MenuItemsType,
  getSearchParamFromUrl,
} from '../../../utils/common';
import {
  Paginated,
  valueof,
  ReservationStatusesDetails,
  SelectOption,
} from '../../../utils/types';
import {
  useErrorToast,
  useModalControls,
  useSubscriptionAskModal,
} from '../../../utils/hooks';
import {useAuth} from '../../../context/auth';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {getStatusesDescriptions} from '../../../utils/newStatuses';
import moreIcon from '../../../assets/icon-more.svg';
import moreIconActiveBlue from '../../../assets/icon-more-active-blue.svg';
import refreshIcon from '../../../assets/refresh.svg';
import addBookingIcon from '../../../assets/add-booking-icon.svg';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import newBookingIcon from 'assets/new-booking-icon.svg';
import HeadingSelect from '../HeadingSelect';
import SearchHousingsModal from '../SearchHousingsModal';
import SearchGuestLeaderModal from '../SearchGuestLeaderModal';
import SearchDateModal from '../SearchDateModal';
import SearchButton from '../SearchButton';
import TableLoader from '../TableLoader';
import IntegrationRefetchTokenTooltip from '../IntegrationRefetchTokenTooltip';
import TablePlaceholder, {EMPTY_TABLE_ROWS_NUMBER} from '../TablePlaceholder';
import TableFilter, {DateTableFilter} from '../TableFilter';
import Loader from '../../common/Loader';
import ImportCompleteModal from '../ImportCompleteModal';
import {formatDate} from '../../../utils/date';
import {SearchDates} from '../SearchDateModal';
import ModalButton from '../ModalButton';
import Button from '../Button';
import ReservationStatusTooltip from './ReservationStatusTooltip';
import ReservationFeaturesStatuses from './ReservationFeaturesStatuses';
import {
  CapitalizeWrapper,
  MissingDataText,
  TablePlaceholderWrapper,
  TableContentWrapper,
  HeadingSection,
} from '../../../styled/common';
import {
  Heading,
  ActionSection,
  TableHeader,
  TableWrapper,
  RefreshButtonLoaderWrapper,
  HeadingRefreshButton,
  ThreeDotsImg,
  HousingNameWrapper,
  GuestNameWrapper,
  TD,
  ReservationsHeaderItem,
  TBodyTr,
  GuestsCell,
} from './styled';

const STORAGE_RESERVATIONS_STATUS_FILTER = 'reservationsStatusFilter';
const STORAGE_RESERVATIONS_HOUSING_NAME_FILTER = 'reservationsHousingNameFilter';
const STORAGE_RESERVATIONS_EXACT_HOUSING_NAME_FILTER =
  'reservationsExactHousingNameFilter';
const STORAGE_RESERVATIONS_GUEST_FILTER = 'reservationsGuestFilter';
const STORAGE_RESERVATIONS_DATE_FILTER = 'reservationDateFilter';
const STORAGE_RESERVATIONS_CUSTOM_DATE_FILTER = 'reservationCustomDateFilter';

const WS_EVENT_RESERVATIONS_SYNC_TYPES_ARRAY = [
  'SYNC_RESERVATIONS_FINISHED',
  'SYNC_RESERVATIONS_STARTED',
];
const SYNC_IN_PROGRESS_STATUS = 'PRO';
const SYNC_SEN_STATUS = 'SEN';

const ORDERING_PARAM = 'check_in_date,check_out_date,created_at';
const REVERSE_ORDERING_PARAM = '-check_in_date,check_out_date,created_at';

const RESERVATIONS_TABLE_MENU_OPTIONS: MenuItemsType = {
  importBooking: {
    label: i18n.t('import_booking'),
    value: '/bookings/import',
  },
  reservationReport: {
    label: i18n.t('download_booking_report'),
    value: '/bookings/reservation-report',
  },
  guestReport: {
    label: i18n.t('download_guest_report'),
    value: '/bookings/guest-report',
  },
};

enum RESERVATION_STATUSES {
  complete = 'COMPLETE',
  incomplete = 'INCOMPLETE',
  bookingUnpaid = 'BOOKING_UNPAID',
  policeError = 'POLICE_ERROR',
  statsError = 'STATS_ERROR',
  idVerificationFailed = 'ID_VERIFICATION_FAILED',
  all = 'ALL',
}

const RESERVATION_STATUSES_QUERY_KEYS = {
  [RESERVATION_STATUSES.complete]: 'complete',
  [RESERVATION_STATUSES.incomplete]: 'complete',
  [RESERVATION_STATUSES.bookingUnpaid]: 'booking_paid',
  [RESERVATION_STATUSES.policeError]: 'police',
  [RESERVATION_STATUSES.statsError]: 'stats',
  [RESERVATION_STATUSES.idVerificationFailed]: 'identity_verification',
  [RESERVATION_STATUSES.all]: '',
};

const RESERVATION_STATUSES_FILTERS: {
  [key in valueof<typeof RESERVATION_STATUSES>]: SelectOption<
    unknown,
    RESERVATION_STATUSES
  >;
} = {
  [RESERVATION_STATUSES.all]: {
    value: RESERVATION_STATUSES.all,
    label: i18n.t('all_statuses'),
  },
  [RESERVATION_STATUSES.incomplete]: {
    value: RESERVATION_STATUSES.incomplete,
    label: i18n.t('incompleted'),
  },
  [RESERVATION_STATUSES.complete]: {
    value: RESERVATION_STATUSES.complete,
    label: i18n.t('completed'),
  },
  [RESERVATION_STATUSES.bookingUnpaid]: {
    value: RESERVATION_STATUSES.bookingUnpaid,
    label: i18n.t('booking_unpaid'),
  },
  [RESERVATION_STATUSES.policeError]: {
    value: RESERVATION_STATUSES.policeError,
    label: i18n.t('police_error'),
  },
  [RESERVATION_STATUSES.statsError]: {
    value: RESERVATION_STATUSES.statsError,
    label: i18n.t('stats_error'),
  },
  [RESERVATION_STATUSES.idVerificationFailed]: {
    value: RESERVATION_STATUSES.idVerificationFailed,
    label: i18n.t('id_verification_failed'),
  },
};
const DEFAULT_RESERVATIONS_STATUS_FILTER =
  RESERVATION_STATUSES_FILTERS[RESERVATION_STATUSES.all];

type DateFilter = SelectOption & {
  from?: string | null;
  to?: string | null;
};

enum DATE_FILTERS_KEYS {
  upcoming = 'UPCOMING',
  past = 'PAST',
  custom = 'CUSTOM',
}

const DATE_FILTERS: {[key: string]: DateFilter} = {
  [DATE_FILTERS_KEYS.upcoming]: {
    value: DATE_FILTERS_KEYS.upcoming,
    label: i18n.t('upcoming'),
    from: String(new Date()),
  },
  [DATE_FILTERS_KEYS.past]: {
    value: DATE_FILTERS_KEYS.past,
    label: i18n.t('past'),
    to: String(new Date()),
  },
  [DATE_FILTERS_KEYS.custom]: {
    value: DATE_FILTERS_KEYS.custom,
    label: i18n.t('custom'),
  },
};
const DEFAULT_RESERVATIONS_DATE_FILTER = DATE_FILTERS[DATE_FILTERS_KEYS.upcoming];

function preloadStatusFilter() {
  const prevStatus = sessionStorage.getItem(
    STORAGE_RESERVATIONS_STATUS_FILTER,
  ) as RESERVATION_STATUSES;
  if (prevStatus && RESERVATION_STATUSES_FILTERS[prevStatus]) {
    return RESERVATION_STATUSES_FILTERS[prevStatus];
  }

  sessionStorage.setItem(
    STORAGE_RESERVATIONS_STATUS_FILTER,
    String(DEFAULT_RESERVATIONS_STATUS_FILTER.value),
  );
  return DEFAULT_RESERVATIONS_STATUS_FILTER;
}

function preloadDateFilter() {
  const prevFilter = sessionStorage.getItem(STORAGE_RESERVATIONS_DATE_FILTER);
  if (prevFilter && DATE_FILTERS[prevFilter]) {
    return DATE_FILTERS[prevFilter];
  }

  sessionStorage.setItem(
    STORAGE_RESERVATIONS_DATE_FILTER,
    String(DEFAULT_RESERVATIONS_DATE_FILTER.value),
  );
  return DEFAULT_RESERVATIONS_DATE_FILTER;
}

function preloadNameFilter() {
  const prevName = sessionStorage.getItem(STORAGE_RESERVATIONS_HOUSING_NAME_FILTER);
  return prevName || '';
}

function preloadExactNameFilter() {
  const prevName = sessionStorage.getItem(STORAGE_RESERVATIONS_EXACT_HOUSING_NAME_FILTER);
  return prevName || '';
}

function preloadGuestFilter() {
  const prevName = sessionStorage.getItem(STORAGE_RESERVATIONS_GUEST_FILTER);
  return prevName || '';
}

function preloadCustomDateFilter(): SearchDates {
  const prevDates = sessionStorage.getItem(STORAGE_RESERVATIONS_CUSTOM_DATE_FILTER);
  if (!prevDates) {
    return {from: null, to: null};
  }

  const dates = JSON.parse(prevDates);
  const fromDate = dates.from && new Date(dates.from);
  const toDate = dates.to && new Date(dates.to);

  return {
    from: isDate(fromDate) ? fromDate : null,
    to: isDate(toDate) ? new Date(toDate) : null,
  };
}

type Params = {
  page?: number;
  status?: SelectOption<unknown, RESERVATION_STATUSES>;
  name?: string;
  dates?: DateFilter;
  customDates?: SearchDates;
  guestName?: string;
  exactName?: string;
};

function getStatusQuery(option: SelectOption<unknown, RESERVATION_STATUSES>) {
  const statusValue = option.value;
  if (statusValue === RESERVATION_STATUSES.all) {
    return ``;
  }
  return `${RESERVATION_STATUSES_QUERY_KEYS[statusValue]}=${statusValue}`;
}

type DatesParams = Pick<Params, 'customDates' | 'dates'>;

function getDatesQueries({
  customDates = {from: null, to: null},
  dates = DEFAULT_RESERVATIONS_DATE_FILTER,
}: DatesParams) {
  const startDate = customDates.from || dates.from;
  const endDate = customDates.to || dates.to;
  const startOfDayStartDate =
    startDate &&
    set(new Date(startDate), {
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  const endOfDayEndDate =
    endDate &&
    set(new Date(endDate), {
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  const formattedStartDate = startOfDayStartDate
    ? format(startOfDayStartDate, "yyyy-MM-dd'T'HH:mm:ss")
    : '';
  const formattedEndDate = endOfDayEndDate
    ? format(endOfDayEndDate, "yyyy-MM-dd'T'HH:mm:ss")
    : '';

  return {
    from: formattedStartDate,
    to: formattedEndDate,
  };
}

function getOrderingQuery({
  customDates = {from: null, to: null},
  dates = DEFAULT_RESERVATIONS_DATE_FILTER,
}: DatesParams) {
  const isNotDefaultDates =
    customDates.from ||
    customDates.to ||
    dates.value !== DEFAULT_RESERVATIONS_DATE_FILTER.value;

  if (isNotDefaultDates) {
    return REVERSE_ORDERING_PARAM;
  }
  return ORDERING_PARAM;
}

function getNameQuery(name = '', exactName = '') {
  if (exactName) {
    return `exact_name=${encodeURIComponent(exactName)}`;
  }

  return `search=${encodeURIComponent(name)}`;
}

function getReservationsParams({
  name = '',
  exactName = '',
  guestName = '',
  status = DEFAULT_RESERVATIONS_STATUS_FILTER,
  dates = DEFAULT_RESERVATIONS_DATE_FILTER,
  customDates = {from: null, to: null},
}: Params) {
  const {from, to} = getDatesQueries({customDates, dates});
  const orderingQuery = getOrderingQuery({customDates, dates});
  const statusQuery = getStatusQuery(status);
  const nameQuery = getNameQuery(name, exactName);

  return `ordering=${orderingQuery}&${statusQuery}&${nameQuery}&guest_name=${guestName}&check_in_date_from=${from}&check_in_date_until=${to}&is_housing_deactivated=true`;
}

function ReservationsTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const ws = useWebsocket();
  const history = useHistory();
  const {accountDetails: user} = useAuth();
  const {SubscriptionAskModal, tryToAskSubscription} = useSubscriptionAskModal();
  const {
    isOpen: isSearchHousingsModalOpen,
    openModal: openSearchHousingsModal,
    closeModal: closeSearchHousingsModal,
  } = useModalControls();
  const {
    isOpen: isSearchGuestModalOpen,
    openModal: openSearchGuestModal,
    closeModal: closeSearchGuestModal,
  } = useModalControls();
  const {
    isOpen: isSearchCustomDateModalOpen,
    openModal: openSearchCustomDateModal,
    closeModal: closeSearchCustomDateModal,
  } = useModalControls();

  const [housingFilter, setHousingFilter] = React.useState(preloadNameFilter);
  const [exactHousingFilter, setExactHousingFilter] = React.useState(
    preloadExactNameFilter,
  );
  const [guestFilter, setGuestFilter] = React.useState(preloadGuestFilter);
  const [customDateFilter, setCustomDateFilter] = React.useState<SearchDates>(
    preloadCustomDateFilter,
  );
  const [statusFilter, setStatusFilter] = React.useState(preloadStatusFilter);
  const [dateFilter, setDateFilter] = React.useState(preloadDateFilter);
  const [isRefreshDisabled, setIsRefreshDisabled] = React.useState(false);
  const [syncTask, setSyncTask] = React.useState<any>();
  const [integrationUser, setIntegrationUser] = React.useState<any>();

  const reservationsParams = getReservationsParams({
    status: statusFilter,
    name: housingFilter,
    exactName: exactHousingFilter,
    dates: dateFilter,
    customDates: customDateFilter,
    guestName: guestFilter,
  });
  const fetchReservations = ({pageParam = 1}) => {
    return queryFetcher(
      api.reservations.ENDPOINTS.reservationsFeaturesStatuses(
        `page=${pageParam}&${reservationsParams}`,
      ),
    );
  };
  const {
    isFetchingNextPage,
    data,
    fetchNextPage,
    hasNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<ReservationStatusesDetails>>(
    ['reservations', reservationsParams],
    fetchReservations,
    {
      getNextPageParam: (lastGroup) => {
        if (lastGroup?.next) {
          return Number(getSearchParamFromUrl('page', lastGroup.next));
        }
        return false;
      },
    },
  );
  useErrorToast(error, {
    notFoundMessage: 'Requested bookings could not be found. Please contact support.',
  });

  const infiniteRef = useInfiniteScroll<HTMLTableElement>({
    loading: isFetchingNextPage || status === 'loading',
    hasNextPage: Boolean(hasNextPage),
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  React.useEffect(() => {
    const hasSeenPropertiesPage = user && !user.has_seen_properties_page;

    if (hasSeenPropertiesPage) {
      history.push('/properties');
    }
  }, [user, history]);

  const getSyncReservationsTasks = React.useCallback(async () => {
    if (!user?.show_buttons_refresh_reservations) {
      return;
    }

    setIsRefreshDisabled(true);
    const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
    const {data, error} = await api.reservations.getSyncTasks(integrationUrl, user?.id);

    if (data) {
      setSyncTask((data.length && data[0]) || null);
    }

    if (error) {
      toastResponseError(error);
    }

    setIsRefreshDisabled(false);
  }, [user]);

  const getIntegrationUser = React.useCallback(async () => {
    if (user?.have_manually_refresh_token_possibility) {
      setIsRefreshDisabled(true);
      const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
      const {data} = await api.users.getIntegrationUser(integrationUrl, user?.id);
      if (data) {
        setIntegrationUser(data);
      }
      setIsRefreshDisabled(false);
    }
  }, [user]);

  React.useEffect(() => {
    getSyncReservationsTasks();
  }, [user, getSyncReservationsTasks]);

  React.useEffect(() => {
    getIntegrationUser();
  }, [user, getIntegrationUser]);

  React.useEffect(() => {
    async function handleWebsocketEvents() {
      if (WS_EVENT_RESERVATIONS_SYNC_TYPES_ARRAY.includes(ws.message?.event_type)) {
        await getSyncReservationsTasks();
      }

      if (
        ws.message.event_type === WS_EVENT_TYPES.reservationCreated ||
        ws.message.event_type === WS_EVENT_TYPES.reservationRemoved
      ) {
        queryClient.refetchQueries('reservations');
      }
    }

    handleWebsocketEvents();

    return () => {
      ws.clearMessage();
    };
  }, [ws, ws.message, getSyncReservationsTasks, queryClient]);

  const sendRefreshReservationsTasks = async () => {
    setIsRefreshDisabled(true);
    const integrationUrl = user?.origin.toLocaleLowerCase().replace('_', '-');
    const {data, error} = await api.reservations.sendSyncTask(integrationUrl, user?.id);
    if (error) {
      toastResponseError(error);
    }
    if (data) {
      toast.success(t('sync_task_sent'));
      await getSyncReservationsTasks();
    }
    setIsRefreshDisabled(false);
  };

  const goToReservationsAdd = () => {
    if (tryToAskSubscription()) {
      return;
    }

    history.push('/bookings/add');
  };

  const goToReservationsEdit = (row: Row<ReservationStatusesDetails>) => {
    if (tryToAskSubscription()) {
      return;
    }

    const reservationDetails = row.original;
    const reservationId = reservationDetails?.id;

    if (reservationId) {
      history.push(`/bookings/${reservationId}`);
    }
  };

  const handleReservationItemClick = (value: string) => {
    if (value === RESERVATIONS_TABLE_MENU_OPTIONS.importBooking.value) {
      if (tryToAskSubscription()) {
        return;
      }
    }

    history.push(value);
  };

  const getMenuItemsConditionally = () => {
    const copyMenuItems = {...RESERVATIONS_TABLE_MENU_OPTIONS};

    if (!user?.show_button_import_reservations) {
      delete copyMenuItems.importBooking;
    }

    return copyMenuItems;
  };

  const resetQuery = React.useCallback(() => {
    queryClient.resetQueries('reservations');
  }, [queryClient]);

  const resetHousingFilter = React.useCallback(() => {
    setHousingFilter('');
    setExactHousingFilter('');
    sessionStorage.removeItem(STORAGE_RESERVATIONS_HOUSING_NAME_FILTER);
    sessionStorage.removeItem(STORAGE_RESERVATIONS_EXACT_HOUSING_NAME_FILTER);
    resetQuery();
  }, [resetQuery]);

  const resetGuestFilter = React.useCallback(() => {
    setGuestFilter('');
    sessionStorage.removeItem(STORAGE_RESERVATIONS_GUEST_FILTER);
    resetQuery();
  }, [resetQuery]);

  const resetCustomDateFilter = React.useCallback(() => {
    setCustomDateFilter({from: null, to: null});
    sessionStorage.removeItem(STORAGE_RESERVATIONS_CUSTOM_DATE_FILTER);

    setDateFilter(DEFAULT_RESERVATIONS_DATE_FILTER);
    sessionStorage.setItem(
      STORAGE_RESERVATIONS_DATE_FILTER,
      String(DEFAULT_RESERVATIONS_DATE_FILTER.value),
    );

    resetQuery();
  }, [resetQuery]);

  const handleStatusChange = (status: SelectOption<unknown, any>) => {
    setStatusFilter(status);
    sessionStorage.setItem(STORAGE_RESERVATIONS_STATUS_FILTER, String(status.value));
  };

  const handleDateFilterChange = (filter: DateFilter) => {
    setCustomDateFilter({from: null, to: null});
    sessionStorage.removeItem(STORAGE_RESERVATIONS_CUSTOM_DATE_FILTER);

    if (filter.value === DATE_FILTERS_KEYS.custom) {
      openSearchCustomDateModal();
      return;
    }

    setDateFilter(filter);
    sessionStorage.setItem(STORAGE_RESERVATIONS_DATE_FILTER, String(filter.value));
  };

  const submitSearchDateModalQuery = (dates: SearchDates) => {
    const customDateFilterOption = DATE_FILTERS[DATE_FILTERS_KEYS.custom];
    setDateFilter(customDateFilterOption);
    sessionStorage.setItem(
      STORAGE_RESERVATIONS_DATE_FILTER,
      String(customDateFilterOption.value),
    );

    setCustomDateFilter(dates);
    sessionStorage.setItem(
      STORAGE_RESERVATIONS_CUSTOM_DATE_FILTER,
      JSON.stringify(dates),
    );
  };

  const submitSearchHousingsModalQuery = (option: SelectOption) => {
    const filter = String(option.label);
    const isExact = Boolean(option.value);

    if (isExact) {
      setExactHousingFilter(filter);
      setHousingFilter('');
      sessionStorage.setItem(STORAGE_RESERVATIONS_EXACT_HOUSING_NAME_FILTER, filter);
      sessionStorage.removeItem(STORAGE_RESERVATIONS_HOUSING_NAME_FILTER);
    } else {
      setHousingFilter(filter);
      setExactHousingFilter('');
      sessionStorage.setItem(STORAGE_RESERVATIONS_HOUSING_NAME_FILTER, filter);
      sessionStorage.removeItem(STORAGE_RESERVATIONS_EXACT_HOUSING_NAME_FILTER);
    }
  };

  const submitSearchGuestModalQuery = (option: SelectOption) => {
    setGuestFilter(String(option.value));
    sessionStorage.setItem(STORAGE_RESERVATIONS_GUEST_FILTER, String(option.value));
  };

  const housingSearchFilter = exactHousingFilter || housingFilter;

  const columns = React.useMemo<Column<ReservationStatusesDetails>[]>(
    () => [
      {
        Header: (
          <TableHeader>
            {housingSearchFilter ? (
              <TableFilter onRemove={resetHousingFilter}>
                {housingSearchFilter}
              </TableFilter>
            ) : (
              (t('property_name') as string)
            )}
            <SearchButton onClick={openSearchHousingsModal} />
          </TableHeader>
        ),
        accessor: 'housing_name',
        Cell: ({value}) => <HousingNameWrapper>{value}</HousingNameWrapper>,
      },
      {
        Header: (
          <TableHeader>
            {guestFilter ? (
              <TableFilter onRemove={resetGuestFilter}>{guestFilter}</TableFilter>
            ) : (
              (t('guest_leader_name') as string)
            )}
            <SearchButton onClick={openSearchGuestModal} />
          </TableHeader>
        ),
        accessor: 'guest_leader_name',
        Cell: ({value}) => {
          if (value) {
            return (
              <CapitalizeWrapper>
                <GuestNameWrapper>{value}</GuestNameWrapper>
              </CapitalizeWrapper>
            );
          }

          return (
            <CapitalizeWrapper>
              <MissingDataText>[{t('name_missing')}]</MissingDataText>
            </CapitalizeWrapper>
          );
        },
      },
      {
        Header: (
          <TableHeader>
            {customDateFilter.to || customDateFilter.from ? (
              <DateTableFilter onRemove={resetCustomDateFilter}>
                {isDate(customDateFilter.from)
                  ? format(customDateFilter.from!, 'd/M/yy')
                  : '*'}
                {` ${t('to')} `}
                {isDate(customDateFilter.to)
                  ? format(customDateFilter.to!, 'd/M/yy')
                  : '*'}
                {` `}
              </DateTableFilter>
            ) : (
              (t('check_in_date') as string)
            )}
            <SearchButton onClick={openSearchCustomDateModal} />
          </TableHeader>
        ),
        accessor: 'check_in_date',
        Cell: ({value}) => formatDate(value),
      },
      {
        Header: <TableHeader>{t('number_of_guests') as string}</TableHeader>,
        accessor: 'guests',
        Cell: ({value}) => <GuestsCell>{value}</GuestsCell>,
      },
      {
        Header: (
          <TableHeader>
            {t('booking_status') as string} <ReservationStatusTooltip />
          </TableHeader>
        ),
        accessor: 'status_complete',
        Cell: ({value, row}) => {
          return (
            <TableStatusCell status={value} reservationDetailsStatuses={row.original} />
          );
        },
      },
    ],
    [
      openSearchGuestModal,
      openSearchHousingsModal,
      openSearchCustomDateModal,
      t,
      housingSearchFilter,
      resetHousingFilter,
      guestFilter,
      resetGuestFilter,
      customDateFilter.to,
      customDateFilter.from,
      resetCustomDateFilter,
    ],
  );
  const tableData = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data?.pages
      .map((g) => {
        return g?.results || [];
      })
      .flat();
  }, [data]);
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data: tableData,
  });

  const isInitiallyLoading = status === 'loading';
  const isLoaderVisible = isInitiallyLoading || isFetchingNextPage;
  const isAnyFilterApplied = Boolean(
    housingFilter ||
      guestFilter ||
      statusFilter?.value !== RESERVATION_STATUSES.all ||
      dateFilter?.value !== DATE_FILTERS_KEYS.upcoming,
  );

  return (
    <>
      <TableContentWrapper>
        <Heading>
          <HeadingSection>
            <HeadingSelect
              onChange={handleDateFilterChange}
              options={Object.values(DATE_FILTERS)}
              value={dateFilter}
            />
            <HeadingSelect
              onChange={handleStatusChange}
              options={Object.values(RESERVATION_STATUSES_FILTERS)}
              widthList={210}
              value={statusFilter}
            />
          </HeadingSection>
          <ActionSection>
            <ReservationsHeaderItem
              onMenuItemClick={handleReservationItemClick}
              menuOptions={getMenuOptions(getMenuItemsConditionally())}
            >
              {(active) => (
                <ThreeDotsImg
                  src={active ? moreIconActiveBlue : moreIcon}
                  alt="Bookings menu"
                />
              )}
            </ReservationsHeaderItem>
            {user?.show_buttons_add_edit_delete_reservations && (
              <Button
                onClick={goToReservationsAdd}
                icon={<img src={newBookingIcon} alt="" height={25} width={29} />}
                label={t('new_booking')}
              />
            )}
            {user?.show_buttons_refresh_reservations && (
              <HeadingRefreshButton
                onClick={sendRefreshReservationsTasks}
                disabled={
                  isRefreshDisabled ||
                  (syncTask &&
                    [SYNC_IN_PROGRESS_STATUS, SYNC_SEN_STATUS].includes(syncTask?.status))
                }
              >
                <img src={refreshIcon} alt="Refresh" />
                {syncTask &&
                  ![SYNC_IN_PROGRESS_STATUS, SYNC_SEN_STATUS].includes(
                    syncTask?.status,
                  ) &&
                  !isRefreshDisabled &&
                  t('refresh')}

                {(isRefreshDisabled ||
                  (syncTask &&
                    [SYNC_IN_PROGRESS_STATUS, SYNC_SEN_STATUS].includes(
                      syncTask?.status,
                    ))) && (
                  <RefreshButtonLoaderWrapper>
                    <Loader height={20} />
                  </RefreshButtonLoaderWrapper>
                )}
              </HeadingRefreshButton>
            )}
          </ActionSection>
        </Heading>
        <TableWrapper hasLastRowBorder={tableData?.length < EMPTY_TABLE_ROWS_NUMBER}>
          <table ref={infiniteRef} {...getTableProps()} style={{}}>
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
              {rows.map((row) => {
                prepareRow(row);
                const isCompleteReservation = row.original.status_complete === 'COMPLETE';
                return (
                  <TBodyTr
                    {...row.getRowProps()}
                    onClick={() => goToReservationsEdit(row)}
                    isComplete={isCompleteReservation}
                    style={{}}
                  >
                    {row.cells.map((cell) => {
                      return (
                        <TD {...cell.getCellProps()} style={{}}>
                          {cell.render('Cell')}
                        </TD>
                      );
                    })}
                  </TBodyTr>
                );
              })}
            </tbody>
          </table>
          {isLoaderVisible && (
            <TableLoader
              hideBorder
              label={data?.pages.length ? t('loading_more') : t('loading')}
            />
          )}
          <TablePlaceholderWrapper>
            <TablePlaceholder
              hidden={isAnyFilterApplied}
              isLoaderVisible={isLoaderVisible}
              isInitiallyLoading={isInitiallyLoading}
              modalIconSrc={addBookingIcon}
              modalIconProps={{height: 58, width: 56}}
              tableDataLength={tableData?.length}
              modalIconAlt="Guest group"
              modalText={t('second_thing_add_booking')}
            >
              <ModalButton label={t('add_a_new_booking')} onClick={goToReservationsAdd} />
            </TablePlaceholder>
          </TablePlaceholderWrapper>
          <TablePlaceholderWrapper>
            <TablePlaceholder
              hidden={!isAnyFilterApplied}
              isInitiallyLoading={isInitiallyLoading}
              isLoaderVisible={isLoaderVisible}
              modalIconSrc={notFoundIcon}
              modalIconProps={{height: 31, width: 31}}
              modalIconAlt="Sad face"
              modalText={t('no_bookings_match_the_filters')}
              modalTitle={`${t('not_found').toUpperCase()}...`}
              tableDataLength={tableData?.length}
            />
          </TablePlaceholderWrapper>
        </TableWrapper>
      </TableContentWrapper>
      <SearchHousingsModal
        open={isSearchHousingsModalOpen}
        onClose={closeSearchHousingsModal}
        onSubmit={submitSearchHousingsModalQuery}
      />
      <SearchGuestLeaderModal
        open={isSearchGuestModalOpen}
        onClose={closeSearchGuestModal}
        onSubmit={submitSearchGuestModalQuery}
      />
      <SearchDateModal
        open={isSearchCustomDateModalOpen}
        onClose={closeSearchCustomDateModal}
        onSubmit={submitSearchDateModalQuery}
        defaultStartDate={customDateFilter.from}
        defaultEndDate={customDateFilter.to}
      />
      <SubscriptionAskModal />
      <ImportCompleteModal />
      {integrationUser?.need_refetch_token && <IntegrationRefetchTokenTooltip />}
    </>
  );
}

type StatusCellProps = {
  status: 'COMPLETE' | 'INCOMPLETE';
  reservationDetailsStatuses: ReservationStatusesDetails;
};
function TableStatusCell({status, reservationDetailsStatuses}: StatusCellProps) {
  const statusDescriptions = getStatusesDescriptions(reservationDetailsStatuses);

  return (
    <ReservationFeaturesStatuses
      reservationStatus={status}
      featuresStatuses={statusDescriptions}
    />
  );
}

export {ReservationsTable};
