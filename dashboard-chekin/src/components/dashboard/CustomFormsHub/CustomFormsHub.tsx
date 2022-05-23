import React from 'react';
import {Link} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useQueryClient, useQuery} from 'react-query';
import {useUser} from '../../../context/user';
import api, {queryFetcher} from '../../../api';
import removeIcon from '../../../assets/remove.svg';
import warningIcon from '../../../assets/warning-icon.svg';
import Section from '../Section';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import Loader from '../../common/Loader';
import {CustomForm} from '../../../utils/types';
import {ACCOUNT_LINKS} from '../AccountSections';
import {ModalTwoButtonsWrapper} from '../../../styled/common';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useScrollToTop,
  useStatus,
} from '../../../utils/hooks';
import {
  AddButton,
  FormsHeader,
  FormName,
  FormItem,
  DeleteFormButton,
  LoaderWrapper,
  AddFormLink,
  FormItemsContainer,
} from './styled';

function fetchCustomForms(userId = '') {
  return queryFetcher(api.guestCustomForm.ENDPOINTS.customForm(`user_id=${userId}`));
}

function CustomFormsHub() {
  useScrollToTop();
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const queryClient = useQueryClient();
  const user = useUser();
  const {setStatus, isLoading} = useStatus();
  const {displayError, ErrorModal} = useErrorModal();
  const {
    isOpen: isDeletionModalOpen,
    closeModal: closeDeletionModal,
    openModal: openDeletionModal,
  } = useModalControls();

  const [formIdToDelete, setFormIdToDelete] = React.useState('');

  const managerId = user?.manager;
  const {
    data: customForms,
    error: customFormsError,
    status: customFormsStatus,
  } = useQuery<CustomForm[]>('customForms', () => fetchCustomForms(managerId));
  useErrorToast(customFormsError, {
    notFoundMessage: 'Requested CustomForms could not be found. Please contact support.',
  });

  const deleteForm = async () => {
    setStatus('loading');

    const {error} = await api.guestCustomForm.deleteCustomField(formIdToDelete);
    if (!isMounted.current) {
      return;
    }

    setStatus('idle');

    if (error) {
      displayError(error);
      closeDeletionModal();
      return;
    }

    queryClient.setQueryData<CustomForm[]>('customForms', (data) => {
      if (!data) {
        return [];
      }

      return data.filter((form) => form.id !== formIdToDelete);
    });
    setFormIdToDelete('');
    closeDeletionModal();
  };

  const setFormToDeleteAndOpenModal = (id: string) => {
    setFormIdToDelete(id);
    openDeletionModal();
  };

  return (
    <Section title={t('custom_forms')} subtitle={t('you_can_customize_online_checkin')}>
      <AddFormLink to={ACCOUNT_LINKS.newCustomForm}>
        <AddButton label={t('add_custom_form')} />
      </AddFormLink>
      {customFormsStatus === 'loading' ? (
        <LoaderWrapper>
          <Loader label={t('loading')} />
        </LoaderWrapper>
      ) : (
        Boolean(customForms?.length) && (
          <div>
            <FormsHeader>{t('my_forms')}</FormsHeader>
            <FormItemsContainer>
              {customForms?.map((field) => {
                return (
                  <FormItem key={field.id}>
                    <Link to={`/account/online-checkin/custom-forms/${field.id}`}>
                      <FormName>{field.name}</FormName>
                    </Link>
                    <DeleteFormButton
                      onClick={() => setFormToDeleteAndOpenModal(field.id)}
                    >
                      <img src={removeIcon} alt="Cross" />
                    </DeleteFormButton>
                  </FormItem>
                );
              })}
            </FormItemsContainer>
          </div>
        )
      )}
      <Modal
        open={isDeletionModalOpen}
        onClose={closeDeletionModal}
        title={t('delete_form')}
        text={t('all_information_will_be_deleted')}
        iconSrc={warningIcon}
        iconAlt="Warning"
        iconProps={{
          height: 84,
          width: 84,
        }}
      >
        <ModalTwoButtonsWrapper>
          <ModalButton disabled={isLoading} label={t('delete')} onClick={deleteForm} />
          <ModalButton
            disabled={isLoading}
            secondary
            label={t('cancel')}
            onClick={closeDeletionModal}
          />
        </ModalTwoButtonsWrapper>
      </Modal>
      <ErrorModal />
    </Section>
  );
}

export {CustomFormsHub};
