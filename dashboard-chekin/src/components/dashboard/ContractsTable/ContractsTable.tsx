import React from 'react';
import {useTable, Column, Row} from 'react-table';
import {useInfiniteQuery, useQuery, useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from 'react-infinite-scroll-hook';
import {format, isDate, set, isValid} from 'date-fns';
import api, {queryFetcher} from '../../../api';
import {
  useErrorToast,
  useModalControls,
  useCorrectOptionSelection,
  useIsMounted,
  useErrorModal,
  useStatus,
} from '../../../utils/hooks';
import {useWebsocket} from '../../../context/websocket';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {getGuestLeaderName} from '../../../utils/guestGroup';
import {
  SelectOption,
  Contract,
  QueryKey,
  ShortHousing,
  Paginated,
} from '../../../utils/types';
import {formatDate} from '../../../utils/date';
import {downloadFromLink, getSearchParamFromUrl, toastResponseError} from '../../../utils/common';
import {getShortHousingsAsOptions} from '../../../utils/housing';
import directDownloadIcon from '../../../assets/direct-download.svg';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import rubbishIcon from '../../../assets/rubbish.svg';
import deleteGuestIcon from '../../../assets/icon-delete-guest.svg';
import TableLoader from '../TableLoader';
import HeadingSelect from '../HeadingSelect';
import SearchDateModal from '../SearchDateModal';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import type {SearchDates} from '../SearchDateModal';
import SearchButton from '../SearchButton';
import TablePlaceholder, {EMPTY_TABLE_ROWS_NUMBER} from '../TablePlaceholder';
import {DateTableFilter} from '../TableFilter';
import {
  TableHeader,
  MissingDataText,
  TablePlaceholderWrapper,
  SmallButton,
  TableContentWrapper,
  HeadingSection,
} from '../../../styled/common';
import {
  TableWrapper,
  Heading,
  DownloadAllButton,
  ButtonLabelWrapper,
  ButtonsWrapper,
  DeleteButtonLabelIcon,
  DeleteButtonLabelText,
  DeleteContractButton,
} from './styled';

const REVERSE_ORDERING_PARAM = '-check_in_date';
const STORAGE_CONTRACTS_HOUSING_FILTER = 'contractsHousingFilter';
const STORAGE_CONTRACTS_CUSTOM_DATE_FILTER = 'contractsDateFilter';
const STORAGE_CONTRACTS_AVAILABLE_YEAR_FILTER = 'contractsAvailableYearFilter';

const DEFAULT_AVAILABLE_YEAR_OPTION = {
  value: String(new Date().getFullYear()),
  label: String(new Date().getFullYear()),
};

const COLUMNS_IDS = {
  propertyName: 'PROPERTY_NAME',
  registrationDate: 'REGISTRATION_DATE',
  deregistrationDate: 'DEREGISTRATION_DATE',
  guestLeaderName: 'GUEST_LEADER_NAME',
  documents: 'DOCUMENTS',
  delete: 'DELETE',
};

const HOUSING_PLACEHOLDER = {
  value: '',
  label: '...',
};

type Params = {
  housingId?: string | number;
  dates?: SearchDates;
  year?: string | number;
};

function fetchShortHousingsWithContractsEnabled() {
  return queryFetcher(
    api.housings.ENDPOINTS.all(
      `ordering=check_in_date&fields=id,name&is_contract_enabled=1&fields=id,name`,
    ),
  );
}

function fetchAvailableContractsYears({
  queryKey: [, housingId],
}: QueryKey<[string, string]>) {
  return queryFetcher(api.documents.ENDPOINTS.availableContractsYears(housingId));
}

function getAvailableYearsAsOptions(years?: number[]) {
  if (!years || !years.length) {
    return [];
  }
  return years.map((y) => {
    return {
      value: String(y),
      label: String(y),
    };
  });
}

function preloadHousingFilter() {
  const prevFilter = sessionStorage.getItem(STORAGE_CONTRACTS_HOUSING_FILTER);

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return HOUSING_PLACEHOLDER;
}

function preloadAvailableYearFilter() {
  const prevFilter = sessionStorage.getItem(STORAGE_CONTRACTS_AVAILABLE_YEAR_FILTER);

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return DEFAULT_AVAILABLE_YEAR_OPTION;
}

function preloadDateFilter(): SearchDates {
  const prevDates = sessionStorage.getItem(STORAGE_CONTRACTS_CUSTOM_DATE_FILTER);
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

function getParams({housingId = '', dates, year = ''}: Params) {
  const {from, to} = getDatesQueries(dates);
  const ordering = REVERSE_ORDERING_PARAM;

  return `ordering=${ordering}&housing=${housingId}&check_in_date_from=${from}&check_in_date_until=${to}&year=${year}`;
}

function ContractsTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const ws = useWebsocket();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const {
    setStatus: setDownloadAllStatus,
    isLoading: isGeneratingDownloadLink,
  } = useStatus();

  const {
    setStatus: setDeleteContractStatus,
    isLoading: isDeletingContract,
    isSuccess: isContractDeleted,
  } = useStatus();

  const {
    isOpen: isDateFilterModalOpen,
    closeModal: closeDateFilterModal,
    openModal: openDateFilterModal,
  } = useModalControls();

  const {
    openModal: openDeleteContractModal,
    closeModal: closeDeleteContractModal,
    isOpen: isDeleteContractModalOpen,
  } = useModalControls();
  const [year, setYear] = React.useState<string | number>(
    DEFAULT_AVAILABLE_YEAR_OPTION.value,
  );
  const [dateFilter, setDateFilter] = React.useState<SearchDates>(preloadDateFilter);
  const [housingFilter, setHousingFilter] = React.useState<SelectOption>(
    preloadHousingFilter,
  );
  const [availableYearFilter, setAvailableYearFilter] = React.useState<SelectOption>(
    preloadAvailableYearFilter,
  );
  const [contractIdToDelete, setContractIdToDelete] = React.useState('');

  const {
    data: shortHousings,
    error: shortHousingsError,
    status: shortHousingsStatus,
  } = useQuery<ShortHousing[]>(
    'shortHousingsWithContracts',
    fetchShortHousingsWithContractsEnabled,
  );
  useErrorToast(shortHousingsError, {
    notFoundMessage: t('errors.requested_housings_not_found'),
  });
  const shortHousingsOptions = React.useMemo(() => {
    return getShortHousingsAsOptions(shortHousings);
  }, [shortHousings]);
  useCorrectOptionSelection({
    array: shortHousingsOptions,
    option: housingFilter,
    handler: setHousingFilter,
  });

  const {
    data: availableYears,
    error: availableYearsError,
    status: availableYearStatus,
  } = useQuery<number[]>(
    ['availableContractsYears', housingFilter.value],
    fetchAvailableContractsYears,
    {
      enabled: Boolean(housingFilter?.value),
    },
  );
  useErrorToast(availableYearsError, {
    notFoundMessage: t('errors.available_years_not_found'),
  });
  const availableYearsOptions = React.useMemo(() => {
    return getAvailableYearsAsOptions(availableYears);
  }, [availableYears]);
  useCorrectOptionSelection({
    array: availableYearsOptions,
    option: availableYearFilter,
    handler: setAvailableYearFilter,
  });

  const params = getParams({
    housingId: housingFilter?.value,
    dates: dateFilter,
    year: availableYearFilter?.value,
  });
  const fetchContracts = ({pageParam = 1}) => {
    return queryFetcher(
      api.documents.ENDPOINTS.allContracts(`page=${pageParam}&${params}`),
    );
  };
  const {
    isFetchingNextPage,
    data,
    fetchNextPage,
    hasNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<Contract>>(['contracts', params], fetchContracts, {
    enabled: Boolean(housingFilter?.value),
    getNextPageParam: (lastGroup) => {
      if (lastGroup?.next) {
        return Number(getSearchParamFromUrl('page', lastGroup.next));
      }
      return false;
    },
  });
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_contracts_not_found'),
  });

  const infiniteRef = useInfiniteScroll<HTMLTableElement>({
    loading: status === 'loading' || isFetchingNextPage,
    hasNextPage: Boolean(hasNextPage),
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  const downloadAllContracts = React.useCallback(async () => {
    if (!housingFilter.value) {
      return;
    }

    const {error, data} = await api.documents.getDownloadAllContractsLink({
      housingId: housingFilter.value.toString(),
      year: year.toString(),
    });

    if (!isMounted.current) {
      return;
    }

    if (error) {
      displayError(error);
    }

    if (data?.link) {
      downloadFromLink(data.link);
    } else {
      displayError({message: 'Download link is missing.'});
    }
    setDownloadAllStatus('idle');
  }, [year, displayError, housingFilter.value, isMounted, setDownloadAllStatus]);

  React.useEffect(() => {
    if (ws.message?.event_type === WS_EVENT_TYPES.contractsArchiveGenerationFinished) {
      downloadAllContracts();
    }

    if (ws.message?.event_type === WS_EVENT_TYPES.contractsArchiveGenerationFailed) {
      displayError({message: 'Contract archive generation failed.'});
      setDownloadAllStatus('idle');
    }

    return () => ws.clearMessage();
  }, [ws, displayError, downloadAllContracts, setDownloadAllStatus]);

  const resetQuery = React.useCallback(() => {
    return queryClient.resetQueries('contracts');
  }, [queryClient]);

  const resetDateFilter = React.useCallback(() => {
    setDateFilter({from: null, to: null});
    sessionStorage.removeItem(STORAGE_CONTRACTS_CUSTOM_DATE_FILTER);
    resetQuery();
  }, [resetQuery]);

  const handleHousingSelect = React.useCallback(
    (option: SelectOption) => {
      setHousingFilter(option);
      sessionStorage.setItem(STORAGE_CONTRACTS_HOUSING_FILTER, JSON.stringify(option));
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: shortHousingsOptions,
    handler: handleHousingSelect,
    option: housingFilter,
    defaultOption: HOUSING_PLACEHOLDER,
  });

  const handleAvailableYearSelect = React.useCallback(
    (option: SelectOption) => {
      setAvailableYearFilter(option);
      sessionStorage.setItem(
        STORAGE_CONTRACTS_AVAILABLE_YEAR_FILTER,
        JSON.stringify(option),
      );
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: availableYearsOptions,
    handler: handleAvailableYearSelect,
    option: availableYearFilter,
    defaultOption: DEFAULT_AVAILABLE_YEAR_OPTION,
  });

  const submitSearchDateModalQuery = (dates: SearchDates) => {
    setDateFilter(dates);
    sessionStorage.setItem(STORAGE_CONTRACTS_CUSTOM_DATE_FILTER, JSON.stringify(dates));
    resetQuery();
  };

  const startArchiveGenerationTask = async () => {
    const selectedYearValue = availableYearFilter.value;
    setYear(selectedYearValue);
    setDownloadAllStatus('loading');
    const {error} = await api.documents.startArchiveGenerationTask({
      housing: housingFilter.value,
      is_force: true,
      year: selectedYearValue,
    });

    if (isMounted.current && error) {
      displayError(error);
    }
  };

  const deleteContract = async () => {
    setDeleteContractStatus('loading');
    const {error} = await api.documents.deleteContract(contractIdToDelete);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      toastResponseError(error);
      displayError(error);
      setDeleteContractStatus('idle');
      return;
    }
    setDeleteContractStatus('success');
    await resetQuery();
    closeDeleteContractModal();
  };

  const columns = React.useMemo<Column<Contract>[]>(() => {
    return [
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
        Cell: ({row}: {row: Row<Contract>}) => {
          const checkInDate = row.original.check_in_date;

          if (!checkInDate || !isValid(new Date(checkInDate))) {
            return null;
          }
          return formatDate(checkInDate);
        },
      },
      {
        id: COLUMNS_IDS.deregistrationDate,
        Header: <TableHeader>{t('check_out_date')}</TableHeader>,
        Cell: ({row}: {row: Row<Contract>}) => {
          const checkOutDate = row.original.data?.check_out_date;

          if (!checkOutDate || !isValid(new Date(checkOutDate))) {
            return null;
          }
          return formatDate(checkOutDate);
        },
      },
      {
        id: COLUMNS_IDS.guestLeaderName,
        Header: t('guest_leader_name') as string,
        Cell: ({row}: {row: Row<Contract>}) => {
          const guestGroup = row.original.data?.guest_group;
          const defaultLeaderName = row.original.data?.default_leader_full_name;

          return (
            defaultLeaderName ||
            getGuestLeaderName(guestGroup) || (
              <MissingDataText>[{t('name_missing')}]</MissingDataText>
            )
          );
        },
      },
      {
        id: COLUMNS_IDS.documents,
        Header: t('documents_text') as string,
        Cell: ({row}: {row: Row<Contract>}) => {
          const downloadLink = row.original.file;

          return (
            <SmallButton onClick={() => downloadFromLink(downloadLink)}>Pdf</SmallButton>
          );
        },
      },
      {
        id: COLUMNS_IDS.delete,
        Header: '',
        Cell: ({row}: {row: Row<Contract>}) => {
          return (
            <DeleteContractButton
              onClick={(e: React.SyntheticEvent) => {
                e.stopPropagation();
                openDeleteContractModal();
                setContractIdToDelete(row.original?.id);
              }}
              type="button"
            >
              <img src={rubbishIcon} alt="Rubbish" />
            </DeleteContractButton>
          );
        },
      },
    ];
  }, [
    t,
    dateFilter.from,
    dateFilter.to,
    resetDateFilter,
    openDateFilterModal,
    openDeleteContractModal,
  ]);

  const tableData = React.useMemo(() => {
    if (!data) {
      return [];
    }
    return data.pages
      ?.map((g) => {
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
    isInitiallyLoading ||
    isFetchingNextPage ||
    shortHousingsStatus === 'loading' ||
    availableYearStatus === 'loading';

  return (
    <TableContentWrapper>
      <Heading>
        <HeadingSection>
          <HeadingSelect
            isSearchable
            onChange={handleHousingSelect}
            options={shortHousingsOptions}
            value={housingFilter}
          />
          <HeadingSelect
            onChange={handleAvailableYearSelect}
            options={availableYearsOptions}
            value={availableYearFilter}
          />
        </HeadingSection>
        {Boolean(tableData?.length) && (
          <DownloadAllButton
            secondary
            onClick={startArchiveGenerationTask}
            disabled={isGeneratingDownloadLink}
            blinking={isGeneratingDownloadLink}
            label={
              <>
                <img src={directDownloadIcon} alt="Arrow with a line" />
                {isGeneratingDownloadLink ? `${t('generating')}...` : t('download_all')}
              </>
            }
          />
        )}
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
                <tr {...row.getRowProps()} style={{}}>
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
      {isDateFilterModalOpen && (
        <SearchDateModal
          open
          onClose={closeDateFilterModal}
          defaultEndDate={dateFilter.to}
          defaultStartDate={dateFilter.from}
          onSubmit={submitSearchDateModalQuery}
        />
      )}
      <ErrorModal />
      {isDeleteContractModalOpen && (
        <Modal
          open
          iconSrc={deleteGuestIcon}
          iconProps={{
            height: 95,
            width: 84,
          }}
          iconAlt="Guest in trash"
          title={t('are_you_sure')}
          text={
            isDeletingContract ? (
              <div>
                {t('deleting_document')}...
                <p />
                <div>{t('it_takes_seconds')}</div>
              </div>
            ) : isContractDeleted ? (
              t('successfully_deleted')
            ) : (
              t('all_info_associated_will_be_deleted')
            )
          }
        >
          <ButtonsWrapper>
            <ModalButton
              onClick={deleteContract}
              label={
                <ButtonLabelWrapper>
                  <DeleteButtonLabelIcon src={rubbishIcon} alt="Plus" />
                  <DeleteButtonLabelText>{t('delete_document')}</DeleteButtonLabelText>
                </ButtonLabelWrapper>
              }
            />
            <ModalButton
              secondary
              onClick={() => {
                closeDeleteContractModal();
                setContractIdToDelete('');
              }}
              label={t('cancel')}
            />
          </ButtonsWrapper>
        </Modal>
      )}
    </TableContentWrapper>
  );
}

export {ContractsTable};
