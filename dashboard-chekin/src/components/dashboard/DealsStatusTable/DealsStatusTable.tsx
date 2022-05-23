import React from 'react';
import moment from 'moment';
import {useMutation, useQueryClient} from 'react-query';
import {Column, useTable} from 'react-table';
import {useTranslation} from 'react-i18next';
import api from '../../../api';
import {ErrorType} from '../../../utils/common';
import {DEAL_STATUSES} from '../../../utils/upselling';
import {Deal} from '../../../utils/upselling/types';
import {useErrorModal, useIsMounted, useModalControls} from '../../../utils/hooks';
import {DEAL_FILTERS} from '../DealsStatusSection/DealsStatusSection';
import warningIcon from '../../../assets/warning-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import TableButton from '../TableButton';
import {
  StyledModalTwoButtonsWrapper,
  TableWrapper,
  TableButtonsWrapper,
  Td,
  Th,
} from './styled';

enum ColumnsIds {
  deal,
  property,
  guest,
  date,
  supplier,
  buttons,
}

type DealsStatusTableProps = {
  filter: DEAL_FILTERS;
  deals: Deal[] | undefined;
  getDealsQueryKey: (status?: string) => string;
};

function DealsStatusTable({filter, deals, getDealsQueryKey}: DealsStatusTableProps) {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {displayError} = useErrorModal();
  const queryClient = useQueryClient();
  const {
    isOpen: isUpdateDealStatusModalOpen,
    openModal: openDealStatusUpdateModal,
    closeModal: closeDealStatusUpdateModal,
  } = useModalControls();
  const [dealId, setDealId] = React.useState('');
  const [dealUpdateStatus, setDealUpdateStatus] = React.useState<DEAL_STATUSES | null>(
    null,
  );

  const dealsQueryKey = getDealsQueryKey();
  const dealUpdateStatusMutation = useMutation<
    Deal,
    ErrorType,
    {id: string; status: DEAL_STATUSES},
    {prevDeals: Deal[]}
  >((payload) => api.upselling.updateDealMutation(payload), {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(dealsQueryKey);
      const prevDeals = queryClient.getQueryData<Deal[]>(dealsQueryKey);
      const optimisticDeals = prevDeals?.filter((deal) => deal.id !== payload.id);

      queryClient.setQueryData(dealsQueryKey, optimisticDeals);
      closeDealStatusUpdateModal();

      return {prevDeals: prevDeals || []};
    },
    onError: (error, payload, context) => {
      if (error && isMounted.current) {
        queryClient.setQueryData(dealsQueryKey, context?.prevDeals);
        displayError(error);
      }
    },
    onSuccess: () => {
      const inactiveStatusFilters = Object.values(DEAL_FILTERS).filter((deal) => {
        return deal !== filter;
      });
      inactiveStatusFilters.forEach((status) => {
        const queryKey = getDealsQueryKey(status.toUpperCase());
        queryClient.refetchQueries(queryKey);
      });

      setDealId('');
    },
    onSettled: () => {
      queryClient.invalidateQueries(dealsQueryKey);
    },
  });

  const confirmDealApprove = () => {
    if (!dealUpdateStatus) return;
    dealUpdateStatusMutation.mutate({id: dealId, status: dealUpdateStatus});
  };

  const handleDealUpdate = React.useCallback(
    (id: string, status: DEAL_STATUSES) => {
      setDealId(id);
      setDealUpdateStatus(status);
      openDealStatusUpdateModal();
    },
    [openDealStatusUpdateModal],
  );

  const columns = React.useMemo<Column<Deal>[]>(
    () => [
      {
        Header: t('deal') as string,
        accessor: (deal) => deal.offer.title,
        id: String(ColumnsIds.deal),
      },
      {
        Header: t('property') as string,
        accessor: 'core_housing_name',
        id: String(ColumnsIds.property),
      },
      {
        Header: t('guest') as string,
        accessor: 'core_guest_name',
        id: String(ColumnsIds.guest),
        Cell: ({row, value}) => {
          const numberOfPeople = row.original.number_of_people;

          if (numberOfPeople > 1) {
            return (
              <div>
                {value} <b>(+{numberOfPeople - 1})</b>
              </div>
            );
          }
          return value;
        },
      },
      {
        Header: t('date') as string,
        accessor: 'requested_for_date',
        Cell: (cell) => {
          if (cell.value) {
            return moment(cell.value).format('DD/MM/YY');
          }

          return '';
        },
        id: String(ColumnsIds.date),
      },
      {
        Header: t('supplier') as string,
        accessor: (deal) => {
          return deal.offer?.supplier_name;
        },
        Cell: ({value}: {value: string | undefined}) => {
          return value || t('internal');
        },
        id: String(ColumnsIds.supplier),
      },
      {
        Header: '',
        accessor: 'id',
        Cell: (cell) => {
          return (
            <TableButtonsWrapper>
              <TableButton
                onClick={() => handleDealUpdate(cell.value, DEAL_STATUSES.approved)}
                label={t('approve')}
              />
              <TableButton
                onClick={() => handleDealUpdate(cell.value, DEAL_STATUSES.rejected)}
                danger
                label={t('reject')}
              />
            </TableButtonsWrapper>
          );
        },
        id: String(ColumnsIds.buttons),
      },
    ],
    [t, handleDealUpdate],
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
    data: deals || [],
  });

  React.useLayoutEffect(
    function setDealStatusChangeButtonsVisibility() {
      if (filter !== DEAL_FILTERS.requested) {
        setHiddenColumns([String(ColumnsIds.buttons)]);
      } else {
        setHiddenColumns([]);
      }
    },
    [filter, setHiddenColumns],
  );

  return (
    <TableWrapper>
      <table {...getTableProps()} style={{}}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} style={{}}>
              {headerGroup.headers.map((column) => {
                return (
                  <Th {...column.getHeaderProps()} style={{}}>
                    {column.render('Header')}
                  </Th>
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
                    <Td {...cell.getCellProps()} style={{}}>
                      {cell.render('Cell')}
                    </Td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      <Modal
        open={isUpdateDealStatusModalOpen}
        title={t('confirm')}
        text={
          dealUpdateStatus === DEAL_STATUSES.approved
            ? t('approve_deal_question')
            : t('reject_deal_question')
        }
        iconProps={{
          src: warningIcon,
          alt: '',
          height: 84,
          width: 84,
        }}
      >
        <StyledModalTwoButtonsWrapper>
          <ModalButton
            disabled={false}
            label={
              dealUpdateStatus === DEAL_STATUSES.approved ? t('approve') : t('reject')
            }
            onClick={confirmDealApprove}
          />
          <ModalButton
            disabled={false}
            label={t('cancel')}
            onClick={closeDealStatusUpdateModal}
            secondary
          />
        </StyledModalTwoButtonsWrapper>
      </Modal>
    </TableWrapper>
  );
}

export {DealsStatusTable};
