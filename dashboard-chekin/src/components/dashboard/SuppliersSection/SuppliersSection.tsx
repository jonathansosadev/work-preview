import React from 'react';
import {useTranslation} from 'react-i18next';
import plusIconDarkBlue from 'assets/plus-icon-dark-blue.svg';
import {useModalControls} from '../../../utils/hooks';
import SuppliersTable from '../SuppliersTable';
import SupplierDetailsModal from '../SupplierDetailsModal';
import {StyledUpsellingSection} from '../UpsellingSections';
import {AddButton, Subtitle} from './styled';

function SuppliersSection() {
  const {t} = useTranslation();
  const {
    isOpen: isSupplierDetailsModalOpen,
    openModal: openSupplierDetailsModal,
    closeModal: closeSupplierDetailsModal,
  } = useModalControls();
  const [activeSupplierId, setActiveSupplierId] = React.useState('');

  const openSupplierModalAndSetSupplierId = (id: string) => {
    setActiveSupplierId(id);
    openSupplierDetailsModal();
  };

  const closeSupplierModalAndResetSupplierId = () => {
    setActiveSupplierId('');
    closeSupplierDetailsModal();
  };

  return (
    <StyledUpsellingSection title={t('suppliers_list')}>
      {isSupplierDetailsModalOpen && (
        <SupplierDetailsModal
          open
          onClose={closeSupplierModalAndResetSupplierId}
          supplierId={activeSupplierId}
        />
      )}
      <Subtitle>
        {t('suppliers_list_description')}
        <AddButton onClick={openSupplierDetailsModal}>
          <img src={plusIconDarkBlue} alt="" height={13} width={13} />
          {t('add_supplier')}
        </AddButton>
      </Subtitle>
      <SuppliersTable
        openSupplierDetailsModal={openSupplierDetailsModal}
        openSupplierModalAndSetSupplierId={openSupplierModalAndSetSupplierId}
      />
    </StyledUpsellingSection>
  );
}

export {SuppliersSection};
