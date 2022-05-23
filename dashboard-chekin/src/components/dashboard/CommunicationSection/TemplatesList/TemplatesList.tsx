import React from 'react';
import {useTranslation, Trans} from 'react-i18next';
import {useQuery} from 'react-query';
import {Link} from 'react-router-dom';
import api from '../../../../api';
import Loader from '../../../common/Loader';
import {ACCOUNT_LINKS} from '../../AccountSections';
import {CustomEmailsPayload} from '../../CustomEmail';
import {useModalControls, useAsyncOperation} from '../../../../utils/hooks';
import {RemoveButton} from '../../../../styled/buttons';
import DeleteConfirmationModal from '../../DeleteConfirmationModal';
import {TemplatesListItem} from './TemplatesListItem';
import {ListContainer, Subtitle, NewTemplateLink} from './styled';

export type CustomEmail = CustomEmailsPayload & {
  id: string;
};

function TemplatesList() {
  const {t} = useTranslation();
  const {asyncOperation, isLoading: isDeleting} = useAsyncOperation();
  const [emailToDeleteId, setEmailToDeleteId] = React.useState('');
  const {
    isOpen: isDeletionModalOpen,
    closeModal: closeDeletionModal,
    openModal: openDeletionModal,
  } = useModalControls();
  const {
    data: customEmails,
    status: customEmailsStatus,
    refetch: refetchCustomEmails,
  } = useQuery<CustomEmail[], string>('customEmails', api.customEmails.fetchCustomEmails);

  const isCustomEmailsLoading = customEmailsStatus === 'loading';

  const startDeletionCustomEmail = (id: string) => {
    openDeletionModal();
    setEmailToDeleteId(id);
  };

  const deleteCustomEmail = async () => {
    await asyncOperation(() => api.customEmails.deleteCustomEmail(emailToDeleteId), {
      onSuccess: refetchCustomEmails,
    });

    closeDeletionModal();
  };

  return isCustomEmailsLoading ? (
    <Loader height={40} width={40} />
  ) : (
    <>
      {!customEmails?.length ? (
        <Subtitle>
          <Trans i18nKey="you_have_no_templates">
            You have no templates. Let’s{' '}
            <Link to={ACCOUNT_LINKS.newCustomEmail}>
              <NewTemplateLink>create your first template.</NewTemplateLink>
            </Link>
          </Trans>
        </Subtitle>
      ) : (
        <ListContainer>
          {customEmails.map((item: any) => (
            <TemplatesListItem
              key={item.id}
              customEmailItem={item}
              removeButton={
                <RemoveButton onClick={() => startDeletionCustomEmail(item.id)} />
              }
            />
          ))}
        </ListContainer>
      )}
      <DeleteConfirmationModal
        title={`${t('delete_template')}?`}
        text={t('all_information_will_be_deleted')}
        deleteButtonLabel={isDeleting ? `${t('deleting')}...` : t('delete_template')}
        isOpen={isDeletionModalOpen}
        onClose={closeDeletionModal}
        onDelete={deleteCustomEmail}
        areButtonsShown={!isDeleting}
      />
    </>
  );
}

export {TemplatesList};
