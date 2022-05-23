import React from 'react';
import {useTable, Column, Row} from 'react-table';
import {useInfiniteQuery, useQuery, useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import {useInfiniteScroll} from 'react-infinite-scroll-hook';
import {format, isValid} from 'date-fns';
import api, {queryFetcher} from '../../../api';
import {
  useErrorToast,
  useCorrectOptionSelection,
  useIsMounted,
  useErrorModal,
  useStatus,
} from '../../../utils/hooks';
import {SelectOption, StatReceipt, ShortHousing, Paginated} from '../../../utils/types';
import {downloadFromLink, getSearchParamFromUrl} from '../../../utils/common';
import directDownloadIcon from '../../../assets/direct-download.svg';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import TablePlaceholder, {EMPTY_TABLE_ROWS_NUMBER} from '../TablePlaceholder';
import TableLoader from '../TableLoader';
import HeadingSelect from '../HeadingSelect';
import Loader from '../../common/Loader';
import {
  TableHeader,
  TablePlaceholderWrapper,
  TableContentWrapper,
  HeadingSection,
  SmallButton,
} from '../../../styled/common';
import {TableWrapper, Heading, DownloadAllButton} from './styled';

const STORAGE_STAT_RECEIPTS_HOUSING_FILTER = 'statReceiptsHousingFilter';
const STORAGE_STAT_RECEIPTS_AVAILABLE_YEAR_FILTER = 'statReceiptsAvailableYearFilter';
const DEFAULT_AVAILABLE_YEAR_OPTION = {
  value: String(new Date().getFullYear()),
  label: String(new Date().getFullYear()),
};

const COLUMNS_IDS = {
  registrationDate: 'REGISTRATION_DATE',
  documents: 'DOCUMENTS',
};

const HOUSING_PLACEHOLDER = {
  value: '',
  label: '...',
};

function fetchHousings() {
  const params = 'fields=id,name,country&stat_type=DEID';
  return queryFetcher(api.housings.ENDPOINTS.all(params));
}

function fetchStatReceiptsYears(housingId: string) {
  return queryFetcher(api.statReceipts.ENDPOINTS.availableYears(housingId));
}

function getAvailableHousingsAsOptions(housings?: ShortHousing[]) {
  if (!housings?.length) {
    return [];
  }

  return housings.map((housing) => {
    return {
      value: housing.id,
      label: housing.name,
    };
  });
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
  const prevFilter = sessionStorage.getItem(STORAGE_STAT_RECEIPTS_HOUSING_FILTER);

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return HOUSING_PLACEHOLDER;
}

function preloadAvailableYearFilter() {
  const prevFilter = sessionStorage.getItem(STORAGE_STAT_RECEIPTS_AVAILABLE_YEAR_FILTER);

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return DEFAULT_AVAILABLE_YEAR_OPTION;
}

type Params = {
  housingAccountId?: string;
  year?: string;
};

function getParams({housingAccountId = '', year = ''}: Params) {
  return `ordering=-check_in_date,check_out_date,created_at&housing=${housingAccountId}&year=${year}&stat_type=DEID`;
}

function IDEVReceiptsTable() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const queryClient = useQueryClient();
  const {
    setStatus: setDownloadAllStatus,
    isLoading: isGeneratingDownloadLink,
  } = useStatus();

  const [housingFilter, setHousingFilter] = React.useState<SelectOption>(
    preloadHousingFilter,
  );
  const [availableYearFilter, setAvailableYearFilter] = React.useState<SelectOption>(
    preloadAvailableYearFilter,
  );

  const {
    data: statAccounts,
    error: statAccountsError,
    status: statAccountsStatus,
  } = useQuery<ShortHousing[]>('statAccounts', fetchHousings);
  useErrorToast(statAccountsError, {
    notFoundMessage:
      'Requested police accounts could not be found. Please contact support.',
  });
  const statAccountsOptions = React.useMemo(() => {
    return getAvailableHousingsAsOptions(statAccounts);
  }, [statAccounts]);

  const {
    data: availableYears,
    error: availableYearsError,
    status: availableYearsStatus,
  } = useQuery<number[]>(
    ['availableStatReceiptsYears', housingFilter.value],
    () => fetchStatReceiptsYears(housingFilter.value.toString()),
    {
      enabled: Boolean(housingFilter?.value),
    },
  );
  useErrorToast(availableYearsError, {
    notFoundMessage: 'Available years could not be found. Please contact support.',
  });
  const availableYearsOptions = React.useMemo(() => {
    return getAvailableYearsAsOptions(availableYears);
  }, [availableYears]);

  const params = getParams({
    housingAccountId: housingFilter?.value.toString(),
    year: availableYearFilter?.value.toString(),
  });
  const fetchStatReceipts = ({pageParam = 1}) => {
    return queryFetcher(api.statReceipts.ENDPOINTS.all(`page=${pageParam}&${params}`));
  };
  const {
    hasNextPage,
    isFetchingNextPage,
    data,
    fetchNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<StatReceipt>>(
    ['policeReceipts', params],
    fetchStatReceipts,
    {
      getNextPageParam: (lastGroup) => {
        if (lastGroup?.next) {
          return Number(getSearchParamFromUrl('page', lastGroup.next));
        }
        return false;
      },
      enabled: Boolean(housingFilter?.value),
    },
  );
  useErrorToast(error, {
    notFoundMessage:
      'Requested police receipts could not be found. Please contact support.',
  });

  const infiniteRef = useInfiniteScroll<HTMLTableElement>({
    loading: status === 'loading' || isFetchingNextPage,
    hasNextPage: Boolean(hasNextPage),
    onLoadMore: () => {
      fetchNextPage();
    },
  });

  const resetQuery = React.useCallback(() => {
    queryClient.resetQueries('policeReceipts');
  }, [queryClient]);

  const handleAvailableYearSelect = React.useCallback(
    (option: SelectOption) => {
      setAvailableYearFilter(option);
      sessionStorage.setItem(
        STORAGE_STAT_RECEIPTS_AVAILABLE_YEAR_FILTER,
        JSON.stringify(option),
      );
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: availableYearsOptions,
    option: availableYearFilter,
    handler: handleAvailableYearSelect,
    defaultOption: DEFAULT_AVAILABLE_YEAR_OPTION,
  });

  const handleHousingSelect = React.useCallback(
    (option: SelectOption) => {
      setHousingFilter(option);
      sessionStorage.setItem(
        STORAGE_STAT_RECEIPTS_HOUSING_FILTER,
        JSON.stringify(option),
      );
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: statAccountsOptions,
    option: housingFilter,
    handler: handleHousingSelect,
    defaultOption: HOUSING_PLACEHOLDER,
  });

  const downloadAllDocuments = async () => {
    setDownloadAllStatus('loading');

    const {data, error} = await api.statReceipts.getDownloadAllLink(
      housingFilter.value.toString(),
      availableYearFilter.value.toString(),
    );

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
  };

  const downloadOneDocument = React.useCallback(
    async (id: string) => {
      const {data, error} = await api.statReceipts.getDownloadOneReceiptLink(id);

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
    },
    [displayError, isMounted],
  );

  const columns = React.useMemo<Column<StatReceipt>[]>(() => {
    return [
      {
        id: COLUMNS_IDS.registrationDate,
        Header: <TableHeader>{t('check_in_date')}</TableHeader>,
        Cell: ({row}: {row: Row<StatReceipt>}) => {
          const checkInDate = row.original.date;

          if (!checkInDate || !isValid(new Date(checkInDate))) {
            return null;
          }
          return checkInDate && format(new Date(checkInDate), 'dd MMM yyyy');
        },
      },
      {
        id: COLUMNS_IDS.documents,
        Header: t('documents_text') as string,
        Cell: ({row}: {row: Row<StatReceipt>}) => {
          const [isLoading, setIsLoading] = React.useState(false);
          const id = row.original.id;

          const downloadReceipt = async () => {
            setIsLoading(true);
            await downloadOneDocument(id);
            setIsLoading(false);
          };

          return (
            <SmallButton
              blinkingBackwards={isLoading}
              disabled={isLoading}
              onClick={downloadReceipt}
            >
              {isLoading ? <Loader height={10} width={10} color="#385cf8" /> : `PDF`}
            </SmallButton>
          );
        },
      },
    ];
  }, [t, downloadOneDocument]);

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
    isInitiallyLoading ||
    isFetchingNextPage ||
    availableYearsStatus === 'loading' ||
    statAccountsStatus === 'loading';

  return (
    <TableContentWrapper>
      <Heading>
        <HeadingSection>
          <HeadingSelect
            onChange={handleHousingSelect}
            options={statAccountsOptions}
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
            onClick={downloadAllDocuments}
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
            label={isFetchingNextPage ? t('loading_more') : t('loading')}
          />
        )}
        <TablePlaceholderWrapper>
          <TablePlaceholder
            isInitiallyLoading={isInitiallyLoading}
            isLoaderVisible={isLoaderVisible}
            modalIconSrc={notFoundIcon}
            modalIconAlt="Sad face"
            modalTitle={`${t('not_found').toUpperCase()}...`}
            tableDataLength={tableData?.length}
          />
        </TablePlaceholderWrapper>
      </TableWrapper>
      <ErrorModal />
    </TableContentWrapper>
  );
}

export {IDEVReceiptsTable};
