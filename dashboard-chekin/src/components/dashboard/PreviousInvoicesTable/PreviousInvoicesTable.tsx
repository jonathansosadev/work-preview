import React from 'react';
import {useTable, Column} from 'react-table';
import {useTranslation} from 'react-i18next';
import {useQueryClient, useQuery} from 'react-query';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {useWebsocket} from '../../../context/websocket';
import {useErrorToast} from '../../../utils/hooks';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import Loader from '../../common/Loader';
import Section from '../Section';
import {
  TableWrapper,
  NoInvoicesText,
  LoaderWrapper,
  PDFButton,
  ButtonLabelIcon,
} from './styled';
import {useComputedDetails} from '../../../context/computedDetails';
import directDownloadImg from '../../../assets/direct-download.svg';

const PAGE_SIZE = 3;

type TableData = {
  created: number;
  amount_due: number;
  invoice_pdf: string;
  id: string;
};

function fetchPreviousInvoices() {
  return queryFetcher(api.payments.ENDPOINTS.invoices(`limit=${PAGE_SIZE}`));
}

function PreviousInvoicesTable() {
  const {t} = useTranslation();
  const {currencyLabel} = useComputedDetails();
  const queryClient = useQueryClient();
  const tableWrapperRef = React.useRef<HTMLTableElement>(null);
  const ws = useWebsocket();
  const {
    data: fetchedPreviousInvoices,
    error: fetchedPreviousInvoicesError,
    status,
  } = useQuery('previousInvoices', fetchPreviousInvoices, {
    refetchOnWindowFocus: false,
  });
  useErrorToast(fetchedPreviousInvoicesError, {
    notFoundMessage: t('errors.requested_invoices_not_found'),
  });

  const isLoading = status === 'loading';

  const invoices: Array<any> = React.useMemo(() => {
    if (!fetchedPreviousInvoices || !Array.isArray(fetchedPreviousInvoices)) {
      return [];
    }
    return fetchedPreviousInvoices;
  }, [fetchedPreviousInvoices]);

  React.useEffect(() => {
    if (ws.message?.event_type === WS_EVENT_TYPES.subscriptionUpdated) {
      queryClient.refetchQueries('previousInvoices');
    }

    return () => ws.clearMessage();
  }, [ws, queryClient]);

  const columns = React.useMemo<Column<TableData>[]>(
    () => [
      {
        Header: i18n.t('date') as string,
        accessor: 'created',
        Cell: ({value}) => {
          if (invoices[0]?.account_country === 'US') {
            const date = new Date(value * 1000).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
            return <>{date}</>;
          }
          const date = new Date(value * 1000).toLocaleDateString('ja-JP');
          return <>{date}</>;
        },
      },
      {
        Header: i18n.t('total_cost') as string,
        accessor: 'amount_due',
        Cell: ({value}) => {
          return (
            <>
              {(value / 100).toFixed(2)} {currencyLabel}
            </>
          );
        },
      },
      {
        Header: '',
        accessor: 'invoice_pdf',
        Cell: ({value}) => {
          return (
            <>
              <a href={value} rel="noopener noreferrer" target="_blank">
                <PDFButton>
                  <ButtonLabelIcon src={directDownloadImg} />
                  PDF
                </PDFButton>
              </a>
            </>
          );
        },
      },
    ],
    [currencyLabel, invoices],
  );

  const tableData = React.useMemo(() => {
    return invoices
      ?.map((g) => {
        return g;
      })
      .flat();
  }, [invoices]);
  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable({
    columns,
    data: tableData,
  });

  return (
    <Section title={t('previous_invoices')}>
      {isLoading ? (
        <LoaderWrapper>
          <Loader width={30} height={30} />
        </LoaderWrapper>
      ) : (
        <TableWrapper ref={tableWrapperRef}>
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
              {!rows.length && (
                <tr>
                  <NoInvoicesText>{t('no_previous_invoices')}</NoInvoicesText>
                </tr>
              )}
            </tbody>
          </table>
        </TableWrapper>
      )}
    </Section>
  );
}

export {PreviousInvoicesTable};
