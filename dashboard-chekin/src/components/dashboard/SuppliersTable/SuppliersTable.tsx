import React from 'react';
import {useTranslation} from 'react-i18next';
import {Column, Row, useTable} from 'react-table';
import {useMutation, useQuery, useQueryClient} from 'react-query';
import {Supplier} from '../../../utils/upselling/types';
import {useModalControls} from '../../../utils/hooks';
import {toastResponseError} from '../../../utils/common';
import plusIconWhite from 'assets/plus-icon-white.svg';
import warningIcon from 'assets/warning-icon.svg';
import api from '../../../api';
import TableDeleteButton from '../TableDeleteButton';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import Loader from 'components/common/Loader';
import {
  TableWrapper,
  RowAddButton,
  StyledModalTwoButtonsWrapper,
  ContentWrapper,
  LoaderWrapper,
  StyledCupOfTeaPlaceholder,
} from './styled';

type SuppliersTableProps = {
  openSupplierDetailsModal: () => void;
  openSupplierModalAndSetSupplierId: (id: string) => void;
};

function SuppliersTable({
  openSupplierDetailsModal,
  openSupplierModalAndSetSupplierId,
}: SuppliersTableProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const {
    isOpen: isDeletionWarningModalOpen,
    closeModal: closeDeletionWarningModal,
    openModal: openDeletionWarningModal,
  } = useModalControls();
  const [deletionId, setDeletionId] = React.useState('');

  const {data: suppliers, isLoading: isLoadingSuppliers} = useQuery<Supplier[], any>(
    api.upselling.ENDPOINTS.suppliers(),
    {
      onError: (error) => {
        toastResponseError(error);
      },
    },
  );
  const hasSuppliers = Boolean(suppliers?.length) && !isLoadingSuppliers;

  const deleteSupplierMutation = useMutation<
    undefined,
    any,
    {id: string},
    {prevSuppliers: Supplier[]}
  >(({id}) => api.upselling.deleteSupplierMutation(id), {
    onMutate: async (payload) => {
      await queryClient.cancelQueries(api.upselling.ENDPOINTS.suppliers());

      const prevSuppliersList = queryClient.getQueryData<Supplier[]>(
        api.upselling.ENDPOINTS.suppliers(),
      );
      const optimisticSuppliers = prevSuppliersList?.filter((supplier) => {
        return supplier.id !== payload.id;
      });

      queryClient.setQueryData(api.upselling.ENDPOINTS.suppliers(), optimisticSuppliers);

      return {prevSuppliers: prevSuppliersList || []};
    },
    onError: (error, payload, context) => {
      if (context?.prevSuppliers) {
        queryClient.setQueryData(
          api.upselling.ENDPOINTS.suppliers(),
          context?.prevSuppliers,
        );
      }
      toastResponseError(error);
    },
    onSuccess: (_, payload) => {
      queryClient.removeQueries(api.upselling.ENDPOINTS.oneSupplier(payload.id));
    },
    onSettled: () => {
      queryClient.invalidateQueries(api.upselling.ENDPOINTS.suppliers());
    },
  });

  const setDeletionIdAndOpenWarningModal = React.useCallback(
    (id: string) => {
      setDeletionId(id);
      openDeletionWarningModal();
    },
    [openDeletionWarningModal],
  );

  const columns = React.useMemo<Column<Supplier>[]>(
    () => [
      {
        Header: t('name') as string,
        accessor: 'name',
      },
      {
        Header: t('email') as string,
        accessor: 'email',
      },
      {
        Header: t('phone') as string,
        accessor: 'phone_number',
      },
      {
        Header: '',
        accessor: 'id',
        Cell: ({row}: {row: Row<Supplier>}) => {
          if (!row.original.can_be_deleted) return null;
          return (
            <TableDeleteButton
              disabled={deleteSupplierMutation.isLoading}
              onClick={(event) => {
                event.stopPropagation();
                setDeletionIdAndOpenWarningModal(row.original?.id);
              }}
            />
          );
        },
      },
    ],
    [t, deleteSupplierMutation.isLoading, setDeletionIdAndOpenWarningModal],
  );

  const {getTableProps, getTableBodyProps, headerGroups, rows, prepareRow} = useTable<
    Supplier
  >({
    columns,
    data: suppliers || [],
  });

  const closeDeletionWarningModalAndResetDeletionId = () => {
    setDeletionId('');
    closeDeletionWarningModal();
  };

  const deleteSupplier = () => {
    if (deletionId) {
      deleteSupplierMutation.mutate({id: deletionId});
      closeDeletionWarningModal();
    } else {
      toastResponseError('Missing supplier deletion id');
    }
  };

  const loadTargetSupplierFromCache = (id: string) => {
    const targetSupplier = queryClient.getQueryData(
      api.upselling.ENDPOINTS.oneSupplier(id),
    );

    if (!targetSupplier) {
      const existingSupplier = suppliers?.find((supplier) => {
        return supplier.id === id;
      });

      if (existingSupplier) {
        queryClient.setQueryData<Supplier>(
          api.upselling.ENDPOINTS.oneSupplier(id),
          existingSupplier,
        );
      }
    }
  };

  const handleRowClick = (supplierId: string) => {
    loadTargetSupplierFromCache(supplierId);
    openSupplierModalAndSetSupplierId(supplierId);
  };

  return (
    <ContentWrapper>
      <Modal
        closeOnDocumentClick
        closeOnEscape
        open={isDeletionWarningModalOpen}
        onClose={closeDeletionWarningModalAndResetDeletionId}
        title={t('delete_supplier_question')}
        text={t('delete_supplier_description')}
        iconProps={{
          src: warningIcon,
          alt: '',
          height: 84,
          width: 84,
        }}
      >
        <StyledModalTwoButtonsWrapper>
          <ModalButton
            danger
            disabled={deleteSupplierMutation.isLoading}
            label={t('delete')}
            onClick={deleteSupplier}
          />
          <ModalButton
            secondary
            disabled={deleteSupplierMutation.isLoading}
            label={t('cancel')}
            onClick={closeDeletionWarningModalAndResetDeletionId}
          />
        </StyledModalTwoButtonsWrapper>
      </Modal>
      {isLoadingSuppliers && (
        <LoaderWrapper>
          <Loader label={t('loading')} />
        </LoaderWrapper>
      )}
      {!hasSuppliers && !isLoadingSuppliers && (
        <StyledCupOfTeaPlaceholder subtitle={t('there_are_no_suppliers')} />
      )}
      {hasSuppliers && (
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
              {rows.map((row) => {
                prepareRow(row);

                if (row.original.is_hide) return null;
                return (
                  <tr
                    {...row.getRowProps()}
                    onClick={() => handleRowClick(row?.original.id)}
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
              <tr>
                <td colSpan={3}>
                  <RowAddButton onClick={openSupplierDetailsModal}>
                    <img src={plusIconWhite} alt="Add supplier" height={13} width={13} />
                  </RowAddButton>
                </td>
              </tr>
            </tbody>
          </table>
        </TableWrapper>
      )}
    </ContentWrapper>
  );
}

export {SuppliersTable};
