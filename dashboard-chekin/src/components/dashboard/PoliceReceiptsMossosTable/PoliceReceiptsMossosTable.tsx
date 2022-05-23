import React from 'react';
import {format, isValid} from 'date-fns';
import {useTranslation} from 'react-i18next';
import {Column, Row, useTable} from 'react-table';
import {useInfiniteScroll} from 'react-infinite-scroll-hook';
import {useQueryClient, useInfiniteQuery, useQuery} from 'react-query';
import {
  useCorrectOptionSelection,
  useErrorModal,
  useErrorToast,
  useStatus,
  useIsMounted,
} from '../../../utils/hooks';
import {Paginated, PoliceReceipt, SelectOption, ShortHousing} from '../../../utils/types';
import api, {queryFetcher} from '../../../api';
import {downloadFromLink, getSearchParamFromUrl} from '../../../utils/common';
import notFoundIcon from '../../../assets/notfound-icon.svg';
import directDownloadIcon from '../../../assets/direct-download.svg';
import HeadingSelect from '../HeadingSelect';
import Loader from '../../common/Loader';
import TablePlaceholder, {EMPTY_TABLE_ROWS_NUMBER} from '../TablePlaceholder';
import TableLoader from '../TableLoader';
import {
  TableHeader,
  TablePlaceholderWrapper,
  TableContentWrapper,
  SmallButton,
  HeadingSection,
} from '../../../styled/common';
import {Heading, DownloadAllButton, TableWrapper} from './styled';

const COLUMNS_IDS = {
  registrationDate: 'REGISTRATION_DATE',
  documents: 'DOCUMENTS',
};
const MOSSOS_POLICE = 'MOS';
const STORAGE_POLICE_RECEIPTS_MOSSOS_HOUSING_FILTER = 'policeReceiptsMossosHousingFilter';
const STORAGE_POLICE_RECEIPTS_MOSSOS_AVAILABLE_YEAR_FILTER =
  'policeReceiptsMossosAvailableYearFilter';
const HOUSING_PLACEHOLDER = {
  value: '',
  label: '...',
};
const DEFAULT_AVAILABLE_YEAR_OPTION = {
  value: String(new Date().getFullYear()),
  label: String(new Date().getFullYear()),
};

function fetchHousings() {
  return queryFetcher(
    api.housings.ENDPOINTS.all(`fields=id,name,country&police_type=MOS`),
  );
}

function fetchPoliceReceiptsYears(policeAccountId: string) {
  return queryFetcher(api.policeReceipts.ENDPOINTS.availableYears(policeAccountId));
}

function getParams(policeAccountId = '', year = '', type = '') {
  return `ordering=-protocol_date&police_account=${policeAccountId}&year=${year}&police_type=${type}`;
}

function getHousingsAsOptions(housings?: ShortHousing[]) {
  if (!housings) {
    return [];
  }

  return housings.map((h) => {
    return {
      value: h?.police_account_id || h?.id,
      label: h.name,
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
  const prevFilter = sessionStorage.getItem(
    STORAGE_POLICE_RECEIPTS_MOSSOS_HOUSING_FILTER,
  );

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return HOUSING_PLACEHOLDER;
}

function preloadAvailableYearFilter() {
  const prevFilter = sessionStorage.getItem(
    STORAGE_POLICE_RECEIPTS_MOSSOS_AVAILABLE_YEAR_FILTER,
  );

  if (prevFilter) {
    return JSON.parse(prevFilter);
  }
  return DEFAULT_AVAILABLE_YEAR_OPTION;
}

function PoliceReceiptsMossosTable() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const {ErrorModal, displayError} = useErrorModal();
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

  const {data: housings, error: housingsError, status: housingsStatus} = useQuery<
    ShortHousing[]
  >('shortMossosHousings', fetchHousings);
  useErrorToast(housingsError, {
    notFoundMessage: 'Requested housings could not be found. Please contact support.',
  });
  const mossosHousingsOptions = React.useMemo(() => {
    return getHousingsAsOptions(housings);
  }, [housings]);

  const {
    data: availableYears,
    error: availableYearsError,
    status: availableYearsStatus,
  } = useQuery<number[]>(
    ['availableMossosHousingsYears', housingFilter.value],
    () => fetchPoliceReceiptsYears(housingFilter.value.toString()),
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

  const params = getParams(
    housingFilter?.value.toString(),
    availableYearFilter?.value.toString(),
    MOSSOS_POLICE,
  );
  const fetchMosPoliceReceipts = ({pageParam = 1}) => {
    return queryFetcher(api.policeReceipts.ENDPOINTS.all(`page=${pageParam}&${params}`));
  };
  const {
    isFetchingNextPage,
    data,
    fetchNextPage,
    hasNextPage,
    error,
    status,
  } = useInfiniteQuery<Paginated<PoliceReceipt>>(
    ['mosPoliceReceipts', params],
    fetchMosPoliceReceipts,
    {
      enabled: Boolean(housingFilter?.value && housingFilter?.value),
      getNextPageParam: (lastGroup) => {
        if (lastGroup?.next) {
          return Number(getSearchParamFromUrl('page', lastGroup.next));
        }
        return false;
      },
    },
  );
  useErrorToast(error, {
    notFoundMessage:
      //todo: Move to errors translation
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
    queryClient.resetQueries('mosPoliceReceipts');
  }, [queryClient]);

  const handleHousingSelect = React.useCallback(
    async (option: SelectOption) => {
      setHousingFilter(option);

      sessionStorage.setItem(
        STORAGE_POLICE_RECEIPTS_MOSSOS_HOUSING_FILTER,
        JSON.stringify(option),
      );
      resetQuery();
    },
    [resetQuery],
  );
  useCorrectOptionSelection({
    array: mossosHousingsOptions,
    option: housingFilter,
    handler: handleHousingSelect,
    defaultOption: HOUSING_PLACEHOLDER,
  });

  const handleAvailableYearSelect = React.useCallback(
    (option: SelectOption) => {
      setAvailableYearFilter(option);
      sessionStorage.setItem(
        STORAGE_POLICE_RECEIPTS_MOSSOS_AVAILABLE_YEAR_FILTER,
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

  const downloadAllDocuments = async () => {
    setDownloadAllStatus('loading');

    const {data, error} = await api.policeReceipts.getDownloadAllLink(
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
      const {data, error} = await api.policeReceipts.getDownloadOneReceiptLink(id);

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
    housingsStatus === 'loading';

  return (
    <TableContentWrapper>
      <Heading>
        <HeadingSection>
          <HeadingSelect
            isSearchable
            onChange={handleHousingSelect}
            options={mossosHousingsOptions}
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

export {PoliceReceiptsMossosTable};
