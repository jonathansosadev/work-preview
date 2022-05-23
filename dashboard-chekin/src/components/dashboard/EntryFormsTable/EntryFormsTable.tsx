import React from 'react';
import {useTable, Column, Row} from 'react-table';
import {useInfiniteQuery, useQuery, useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from 'react-infinite-scroll-hook';
import {format, isDate, set} from 'date-fns';
import {useHistory, Link} from 'react-router-dom';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import useFetchGuestGroup from '../../../hooks/useFetchGuestGroup';
import {
  useErrorToast,
  useModalControls,
  useCorrectOptionSelection,
} from '../../../utils/hooks';
import {getGuestLeaderName} from '../../../utils/guestGroup';
import {
  SelectOption,
  LightReservation,
  Housing,
  Paginated,
  ShortHousing,
} from '../../../utils/types';
import {
  getShortHousingsAsOptions,
  getName,
  fetchShortHousings,
} from '../../../utils/housing';
import {getSearchParamFromUrl} from '../../../utils/common';
import type {SearchDates} from '../SearchDateModal';
import {formatDate} from '../../../utils/date';
import contactIcon from '../../../assets/contact.svg';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import TableLoader from '../TableLoader';
import HeadingSelect from '../HeadingSelect';
import SearchHousingsModal from '../SearchHousingsModal';
import SearchDateModal from '../SearchDateModal';
import SearchButton from '../SearchButton';
import TablePlaceholder, {EMPTY_TABLE_ROWS_NUMBER} from '../TablePlaceholder';
import Loader from '../../common/Loader';
import {DateTableFilter} from '../TableFilter';
import {
  TableHeader,
  MissingDataText,
  TablePlaceholderWrapper,
  TableContentWrapper,
} from '../../../styled/common';
import {
  TableWrapper,
  DocsLinkButton,
  Heading,
  EntryFormsButton,
  HeadingButtonsWrapper,
} from './styled';

export const STORAGE_ENTRY_FORMS_HOUSING_FILTER = 'entryFormsHousingFilter';
const STORAGE_ENTRY_FORMS_CUSTOM_DATE_FILTER = 'entryFormsDateFilter';

const COLUMNS_IDS = {
  propertyName: 'PROPERTY_NAME',
  registrationDate: 'REGISTRATION_DATE',
  guestLeaderName: 'GUEST_LEADER_NAME',
  documents: 'DOCUMENTS',
};

const ALL_HOUSINGS_OPTION = {
  value: '',
  label: i18n.t('all_properties'),
};

type Params = {
  housingId?: string;
  dates?: SearchDates;
};

function preloadHousingFilter() {
  const prevFilter = sessionStorage.getItem(STORAGE_ENTRY_FORMS_HOUSING_FILTER);

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return ALL_HOUSINGS_OPTION;
}

function preloadDateFilter(): SearchDates {
  const prevDates = sessionStorage.getItem(STORAGE_ENTRY_FORMS_CUSTOM_DATE_FILTER);
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

function getDatesQueries(dates?: SearchDates) {
  if (!dates) {
    return {
      from: '',
      to: '',
    };
  }

  const endOfDayStartDate =
    dates.from &&
    set(new Date(dates.from), {
      hours: 0,
      minutes: 0,
      seconds: 0,
    });
  const endOfDayEndDate =
    dates.to &&
    set(new Date(dates.to), {
      hours: 23,
      minutes: 59,
      seconds: 59,
    });
  const formattedStartDate = endOfDayStartDate
    ? format(endOfDayStartDate, "yyyy-MM-dd'T'HH:mm:ss")
    : '';
  const formattedEndDate = endOfDayEndDate
    ? format(endOfDayEndDate, "yyyy-MM-dd'T'HH:mm:ss")
    : '';

  return {
    from: formattedStartDate,
    to: formattedEndDate,
  };
}

function getParams({housingId = '', dates}: Params) {
  const {from, to} = getDatesQueries(dates);

  return `ordering=-check_in_date,check_out_date,created_at&has_guests=true&housing=${housingId}&check_in_date_from=${from}&check_in_date_until=${to}&are_documents_stored=true`;
}

function EntryFormsTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const {
    isOpen: isHousingFilterModalOpen,
    closeModal: closeHousingFilterModal,
    openModal: openHousingFilterModal,
  } = useModalControls();
  const {
    isOpen: isDateFilterModalOpen,
    closeModal: closeDateFilterModal,
    openModal: openDateFilterModal,
  } = useModalControls();

  const [dateFilter, setDateFilter] = React.useState<SearchDates>(preloadDateFilter);
  const [housingFilter, setHousingFilter] = React.useState<SelectOption>(
    preloadHousingFilter,
  );

  const params = getParams({
    housingId: housingFilter?.value.toString(),
    dates: dateFilter,
  });
  const fetchReservations = ({pageParam = 1}) => {
    return queryFetcher(api.reservations.ENDPOINTS.light(`page=${pageParam}&${params}`));
  };
  const {
    isFetchingNextPage,
    data,
    fetchNextPage,
    hasNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<LightReservation>>(
    [`entryForms`, params],
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
    notFoundMessage: 'Requested entry forms could not be found. Please contact support.',
  });

  const infiniteRef = useInfiniteScroll<HTMLTableElement>({
    loading: status === 'loading' || isFetchingNextPage,
    hasNextPage: Boolean(hasNextPage),
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  const {
    data: shortHousings,
    error: shortHousingsError,
    status: shortHousingsStatus,
  } = useQuery<ShortHousing[]>('shortHousings', fetchShortHousings);
  useErrorToast(shortHousingsError, {
    notFoundMessage: t('errors.requested_short_housings_not_found'),
  });
  const shortHousingsOptions = React.useMemo(() => {
    return [ALL_HOUSINGS_OPTION, ...getShortHousingsAsOptions(shortHousings)];
  }, [shortHousings]);

  const resetQuery = React.useCallback(() => {
    queryClient.resetQueries('entryForms');
  }, [queryClient]);

  const resetDateFilter = React.useCallback(() => {
    setDateFilter({from: null, to: null});
    sessionStorage.removeItem(STORAGE_ENTRY_FORMS_CUSTOM_DATE_FILTER);
    resetQuery();
  }, [resetQuery]);

  const goToReservationEntryForms = React.useCallback(
    (id: string) => {
      history.push(`/documents/entry-form/view/${id}`);
    },
    [history],
  );

  const handleHousingSelect = React.useCallback(
    (option: SelectOption) => {
      setHousingFilter(option);
      sessionStorage.setItem(STORAGE_ENTRY_FORMS_HOUSING_FILTER, JSON.stringify(option));
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: shortHousingsOptions,
    option: housingFilter,
    handler: handleHousingSelect,
    defaultOption: ALL_HOUSINGS_OPTION,
  });

  const submitSearchDateModalQuery = (dates: SearchDates) => {
    setDateFilter(dates);
    sessionStorage.setItem(STORAGE_ENTRY_FORMS_CUSTOM_DATE_FILTER, JSON.stringify(dates));
    resetQuery();
  };

  const columns = React.useMemo<Column<LightReservation>[]>(() => {
    return [
      {
        id: COLUMNS_IDS.propertyName,
        Header: (
          <TableHeader>
            {t('property_name') as string}
            <SearchButton onClick={openHousingFilterModal} />
          </TableHeader>
        ),
        Cell: ({row}: {row: Row<LightReservation>}) => {
          const reservation = row.original;
          return <HousingNameCell reservation={reservation} />;
        },
      },
      {
        id: COLUMNS_IDS.registrationDate,
        Header: (
          <TableHeader>
            {dateFilter.from || dateFilter.to ? (
              <DateTableFilter onRemove={resetDateFilter}>
                {isDate(dateFilter.from) ? format(dateFilter.from!, 'd/M/yy') : '*'}
                {` ${t('to')} `}
                {isDate(dateFilter.to) ? format(dateFilter.to!, 'd/M/yy') : '*'}
                {` `}
              </DateTableFilter>
            ) : (
              t('check_in_date')
            )}
            <SearchButton onClick={openDateFilterModal} />
          </TableHeader>
        ),
        Cell: ({row}: {row: Row<LightReservation>}) => {
          const checkInDate = row.original.check_in_date;

          if (!checkInDate) {
            return null;
          }
          return formatDate(checkInDate);
        },
      },
      {
        id: COLUMNS_IDS.guestLeaderName,
        Header: t('guest_leader_name') as string,
        Cell: ({row}: {row: Row<LightReservation>}) => {
          const reservation = row.original;

          return <GuestNameCell reservation={reservation} />;
        },
      },
      {
        id: COLUMNS_IDS.documents,
        Header: t('documents_text') as string,
        Cell: ({row}: {row: Row<LightReservation>}) => {
          const reservationId = row.original.id;
          return (
            <DocsLinkButton onClick={() => goToReservationEntryForms(reservationId)}>
              {t('view_docs')}
            </DocsLinkButton>
          );
        },
      },
    ];
  }, [
    t,
    openHousingFilterModal,
    dateFilter.from,
    dateFilter.to,
    resetDateFilter,
    openDateFilterModal,
    goToReservationEntryForms,
  ]);

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
  const isLoaderVisible =
    isInitiallyLoading || isFetchingNextPage || shortHousingsStatus === 'loading';

  return (
    <TableContentWrapper>
      <Heading>
        <HeadingSelect
          isSearchable
          onChange={handleHousingSelect}
          options={shortHousingsOptions}
          value={housingFilter}
        />
        <HeadingButtonsWrapper>
          <Link to={`/documents/entry-form/guestbook/${housingFilter?.value}`}>
            <EntryFormsButton
              secondary
              label={
                <>
                  <img src={contactIcon} alt="Contact" />
                  {t('guestbook')}
                </>
              }
            />
          </Link>
        </HeadingButtonsWrapper>
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
              return (
                <tr
                  {...row.getRowProps()}
                  onClick={() => {
                    const reservationId = row.original.id;
                    goToReservationEntryForms(reservationId);
                  }}
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
            isInitiallyLoading={isInitiallyLoading}
            isLoaderVisible={isLoaderVisible}
            modalIconSrc={notFoundIcon}
            modalIconAlt="Sad face"
            modalIconProps={{height: 31, width: 31}}
            modalTitle={`${t('not_found').toUpperCase()}...`}
            tableDataLength={tableData?.length}
          />
        </TablePlaceholderWrapper>
      </TableWrapper>
      {isHousingFilterModalOpen && (
        <SearchHousingsModal
          strictOptions
          open
          onClose={closeHousingFilterModal}
          onSubmit={handleHousingSelect}
        />
      )}
      {isDateFilterModalOpen && (
        <SearchDateModal
          open
          onClose={closeDateFilterModal}
          defaultEndDate={dateFilter.to}
          defaultStartDate={dateFilter.from}
          onSubmit={submitSearchDateModalQuery}
        />
      )}
    </TableContentWrapper>
  );
}

function fetchHousing(id = '') {
  return queryFetcher(api.housings.ENDPOINTS.one(id));
}

type HousingNameCellProps = {
  reservation: LightReservation;
};

function HousingNameCell({reservation}: HousingNameCellProps) {
  const {t} = useTranslation();
  const housingId = reservation?.housing_id;
  const {data: housing, status: housingStatus, error: housingError} = useQuery<
    Housing,
    [string, string]
  >(['housing', housingId], () => fetchHousing(housingId), {
    refetchOnWindowFocus: false,
    enabled: Boolean(housingId),
  });
  useErrorToast(housingError, {
    notFoundMessage: t('errors.requested_housing_not_found'),
  });

  if (housingStatus === 'loading') {
    return <Loader />;
  }

  return <>{getName(housing)}</>;
}

type GuestNameCellProps = {
  reservation: LightReservation;
};

function GuestNameCell({reservation}: GuestNameCellProps) {
  const {t} = useTranslation();
  const guestGroupId = reservation?.guest_group_id;

  const {data: guestGroup, status: guestGroupStatus} = useFetchGuestGroup({
    guestGroupId,
    enabled: Boolean(guestGroupId),
    refetchOnWindowFocus: false,
  });

  const name = getGuestLeaderName(guestGroup) || reservation.default_leader_full_name;

  if (guestGroupStatus === 'loading') {
    return <Loader />;
  }

  return <>{name || <MissingDataText>[{t('name_missing')}]</MissingDataText>}</>;
}

export {EntryFormsTable};
