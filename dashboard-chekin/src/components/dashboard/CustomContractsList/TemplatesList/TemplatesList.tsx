import React from 'react';
import * as Sentry from '@sentry/react';
import {Link, useHistory} from 'react-router-dom';
import {Trans, useTranslation} from 'react-i18next';
import useCustomContractsFetch from '../useCustomContractsFetch';
import {ACCOUNT_LINKS} from '../../AccountSections';
import {useUser} from '../../../../context/user';
import {useErrorModal, useModalControls} from '../../../../utils/hooks';
import DeleteConfirmationModal from '../../DeleteConfirmationModal';
import {
  Container,
  GridSingleItemStyled,
  NewTemplateLink,
  Subtitle,
  TemplateListLoader,
} from './styled';

type TemplatesListProps = {
  housingId?: string;
};
function TemplatesList({housingId}: TemplatesListProps) {
  const user = useUser();
  const history = useHistory();
  const {displayError} = useErrorModal();
  const {t} = useTranslation();
  const [customContractDeletionId, setCustomContractDeletionId] = React.useState('');

  const {
    isOpen: isDeletionModalOpen,
    closeModal: closeDeletionModal,
    openModal: openDeletionModal,
  } = useModalControls();

  const {
    customContracts,
    updateCustomContract,
    deleteCustomDocument,
    isLoadingCustomContracts,
    isLoadingDeleteCustomDocument,
  } = useCustomContractsFetch(housingId);

  const handleClick = (id: string) => () => {
    const link = `${ACCOUNT_LINKS.customContracts}/${id}`;
    history.push(link);
  };

  const deleteCustomContract = () => {
    if (!customContractDeletionId) {
      Sentry.captureMessage(
        `Unable to get custom contract deletion id of user: ${user?.id}`,
      );
      displayError(t('unable_get_custom_contract_deletion_id'));
      return;
    }

    deleteCustomDocument(customContractDeletionId);
  };

  const handleDeletionModalClose = () => {
    setCustomContractDeletionId('');
    closeDeletionModal();
  };

  const deleteCustomContractAndCloseDeletionModal = () => {
    deleteCustomContract();
    handleDeletionModalClose();
  };

  const openModalDeletion = (id: string) => (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    setCustomContractDeletionId(id);
    openDeletionModal();
  };

  const handleChangeActive = (id: string) => (
    active: boolean,
    event: React.MouseEvent<HTMLDivElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    updateCustomContract({id, is_active: active});
  };

  if (isLoadingCustomContracts) return <TemplateListLoader height={50} width={50} />;
  return (
    <>
      {!customContracts?.length ? (
        <Subtitle>
          <Trans i18nKey="you_have_no_templates">
            You have no templates. Let’s{' '}
            <Link to={ACCOUNT_LINKS.newCustomContract}>
              <NewTemplateLink>create your first template.</NewTemplateLink>
            </Link>
          </Trans>
        </Subtitle>
      ) : (
        <Container>
          {customContracts?.map((contract) => (
            <GridSingleItemStyled
              key={contract.id}
              name={contract.name}
              active={contract.is_active}
              onClick={handleClick(contract.id)}
              onActiveSwitch={handleChangeActive(contract.id)}
              onDelete={openModalDeletion(contract.id)}
            />
          ))}
        </Container>
      )}
      <DeleteConfirmationModal
        title={`${t('delete_template')}?`}
        text={t('all_information_will_be_deleted')}
        deleteButtonLabel={
          isLoadingDeleteCustomDocument ? `${t('deleting')}...` : t('delete_template')
        }
        isOpen={isDeletionModalOpen}
        onDelete={deleteCustomContractAndCloseDeletionModal}
        onClose={handleDeletionModalClose}
        areButtonsShown={!isLoadingDeleteCustomDocument}
      />
    </>
  );
}

export {TemplatesList};
