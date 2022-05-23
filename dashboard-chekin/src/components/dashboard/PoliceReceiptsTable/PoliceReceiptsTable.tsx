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
import {
  SelectOption,
  PoliceAccount,
  PoliceReceipt,
  Paginated,
} from '../../../utils/types';
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
  SmallButton,
} from '../../../styled/common';
import {TableWrapper, Heading, DownloadAllButton, HeadingSection} from './styled';

const STORAGE_POLICE_RECEIPTS_HOUSING_FILTER = 'policeReceiptsHousingFilter';
const STORAGE_POLICE_RECEIPTS_AVAILABLE_YEAR_FILTER = 'policeReceiptsAvailableYearFilter';
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

function fetchPoliceAccounts() {
  return queryFetcher(api.policeAccount.ENDPOINTS.all());
}

function fetchPoliceReceiptsYears(policeAccountId: string) {
  return queryFetcher(
    api.italianPoliceReceipts.ENDPOINTS.availableYears(policeAccountId),
  );
}

function getPoliceAccountsAsOptions(policeAccounts?: PoliceAccount[]) {
  if (!policeAccounts?.length) {
    return [];
  }

  return policeAccounts.map((p) => {
    return {
      value: p.id,
      label: p.username,
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
  const prevFilter = sessionStorage.getItem(STORAGE_POLICE_RECEIPTS_HOUSING_FILTER);

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return HOUSING_PLACEHOLDER;
}

function preloadAvailableYearFilter() {
  const prevFilter = sessionStorage.getItem(
    STORAGE_POLICE_RECEIPTS_AVAILABLE_YEAR_FILTER,
  );

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return DEFAULT_AVAILABLE_YEAR_OPTION;
}

type Params = {
  policeAccountId?: string;
  year?: string;
};

function getParams({policeAccountId = '', year = ''}: Params) {
  return `ordering=-protocol_date&police_account=${policeAccountId}&year=${year}`;
}

function PoliceReceiptsTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
  const {
    setStatus: setDownloadAllStatus,
    isLoading: isGeneratingDownloadLink,
  } = useStatus();

  const [policeAccountFilter, setPoliceAccountFilter] = React.useState<SelectOption>(
    preloadHousingFilter,
  );
  const [availableYearFilter, setAvailableYearFilter] = React.useState<SelectOption>(
    preloadAvailableYearFilter,
  );

  const {
    data: policeAccounts,
    error: policeAccountsError,
    status: policeAccountsStatus,
  } = useQuery<PoliceAccount[]>('policeAccounts', fetchPoliceAccounts);
  useErrorToast(policeAccountsError, {
    notFoundMessage: t('errors.requested_police_accounts_not_found'),
  });
  const policeAccountsOptions = React.useMemo(() => {
    return getPoliceAccountsAsOptions(policeAccounts);
  }, [policeAccounts]);

  const {
    data: availableYears,
    error: availableYearsError,
    status: availableYearsStatus,
  } = useQuery<number[]>(
    ['availablePoliceReceiptsYears', policeAccountFilter.value],
    () => fetchPoliceReceiptsYears(policeAccountFilter.value.toString()),
    {
      enabled: Boolean(policeAccountFilter?.value),
    },
  );
  useErrorToast(availableYearsError, {
    notFoundMessage: t('errors.available_years_not_found'),
  });
  const availableYearsOptions = React.useMemo(() => {
    return getAvailableYearsAsOptions(availableYears);
  }, [availableYears]);

  const params = getParams({
    policeAccountId: policeAccountFilter?.value.toString(),
    year: availableYearFilter?.value.toString(),
  });
  const fetchPoliceReceipts = ({pageParam = 1}) => {
    return queryFetcher(
      api.italianPoliceReceipts.ENDPOINTS.all(`page=${pageParam}&${params}`),
    );
  };
  const {
    isFetchingNextPage,
    data,
    fetchNextPage,
    hasNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<PoliceReceipt>>(
    ['policeReceipts', params],
    fetchPoliceReceipts,
    {
      enabled: Boolean(policeAccountFilter?.value),
      getNextPageParam: (lastGroup) => {
        if (lastGroup?.next) {
          return Number(getSearchParamFromUrl('page', lastGroup.next));
        }
        return false;
      },
    },
  );
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_police_receipts_not_found'),
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
        STORAGE_POLICE_RECEIPTS_AVAILABLE_YEAR_FILTER,
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
      setPoliceAccountFilter(option);
      sessionStorage.setItem(
        STORAGE_POLICE_RECEIPTS_HOUSING_FILTER,
        JSON.stringify(option),
      );
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: policeAccountsOptions,
    option: policeAccountFilter,
    handler: handleHousingSelect,
    defaultOption: HOUSING_PLACEHOLDER,
  });

  const downloadAllDocuments = async () => {
    setDownloadAllStatus('loading');

    const {data, error} = await api.italianPoliceReceipts.getDownloadAllLink({
      policeAccountId: policeAccountFilter.value.toString(),
      year: availableYearFilter.value.toString(),
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
  };

  const downloadOneDocument = React.useCallback(
    async (id: string) => {
      const {data, error} = await api.italianPoliceReceipts.getDownloadOneLink(id);

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

  const columns = React.useMemo<Column<PoliceReceipt>[]>(() => {
    return [
      {
        id: COLUMNS_IDS.registrationDate,
        Header: <TableHeader>{t('check_in_date')}</TableHeader>,
        Cell: ({row}: {row: Row<PoliceReceipt>}) => {
          const checkInDate = row.original.protocol_date;

          if (!checkInDate || !isValid(new Date(checkInDate))) {
            return null;
          }
          return checkInDate && format(new Date(checkInDate), 'dd MMM yyyy');
        },
      },
      {
        id: COLUMNS_IDS.documents,
        Header: t('documents_text') as string,
        Cell: ({row}: {row: Row<PoliceReceipt>}) => {
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
              {isLoading ? <Loader height={10} width={10} color="#385cf8" /> : `ZIP`}
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
    return data.pages
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
    policeAccountsStatus === 'loading';

  return (
    <TableContentWrapper>
      <Heading>
        <HeadingSection>
          <HeadingSelect
            isSearchable
            onChange={handleHousingSelect}
            options={policeAccountsOptions}
            value={policeAccountFilter}
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
      <ErrorModal />
    </TableContentWrapper>
  );
}

export {PoliceReceiptsTable};
