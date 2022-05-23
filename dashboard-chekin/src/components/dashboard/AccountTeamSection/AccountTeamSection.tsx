import React from 'react';
import {Trans, useTranslation} from 'react-i18next';
import {useQueryClient, useQuery} from 'react-query';
import {Link} from 'react-router-dom';
import i18n from '../../../i18n';
import api, {queryFetcher} from '../../../api';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useStatus,
} from '../../../utils/hooks';
import {User} from '../../../utils/types';
import {ACCOUNT_LINKS} from '../AccountSections';
import {toastResponseError} from '../../../utils/common';
import {getIsAccountCollaborator} from '../../../utils/user';
import editIcon from '../../../assets/edit-button.svg';
import rubbishIcon from '../../../assets/rubbish.svg';
import deleteCollaboratorIcon from '../../../assets/icon-delete-guest.svg';
import Loader from '../../common/Loader';
import Section from '../Section';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {
  MissingDataText,
  ModalTwoButtonsWrapper,
} from '../../../styled/common';
import {
  Title,
  Subtitle,
  ActionButton,
  ActionButtonsWrapper,
  CollaboratorsContainer,
  CollaboratorType,
  CollaboratorName,
  CollaboratorEmailCell,
  CollaboratorsLoaderWrapper,
  InviteButton,
} from './styled';

function fetchCollaborators() {
  return queryFetcher(api.users.ENDPOINTS.collaborators('active_only=false'));
}

function getCollaboratorTypeText(collaborator: User | null) {
  if (!collaborator?.is_active) {
    return null;
  }

  if (getIsAccountCollaborator(collaborator)) {
    return i18n.t('collaborator');
  }
  return i18n.t('manager');
}

function AccountTeamSection() {
  const {t} = useTranslation();
  const isMounted = useIsMounted();
  const {isLoading, setStatus} = useStatus();
  const {ErrorModal, displayError} = useErrorModal();
  const queryClient = useQueryClient();

  const {
    isOpen: isRemoveCollaboratorModalOpen,
    closeModal: closeRemoveCollaboratorModal,
    openModal: openRemoveCollaboratorModal,
  } = useModalControls();

  const [activeCollaborator, setActiveCollaborator] = React.useState<User | null>(null);

  const {data: collaborators, error, status} = useQuery<User[], string>(
    'collaborators',
    fetchCollaborators,
  );
  useErrorToast(error, {
    notFoundMessage:
      'Requested collaborators could not be found. Please contact support.',
  });

  const setActiveCollaboratorAndOpenRemoveModal = (collaborator: User) => {
    setActiveCollaborator(collaborator);
    openRemoveCollaboratorModal();
  };

  const resetActiveCollaboratorAndCloseRemoveModal = () => {
    setActiveCollaborator(null);
    closeRemoveCollaboratorModal();
  };

  const removeCollaborator = async () => {
    if (!activeCollaborator?.email) {
      displayError({message: 'Collaborator email is missing.'});
      return;
    }

    setStatus('loading');

    const {error} = await api.auth.removeCollaborator(activeCollaborator.email);
    if (!isMounted.current) {
      return;
    }

    if (error) {
      setStatus('idle');
      toastResponseError(error);
      return;
    }

    await queryClient.refetchQueries('collaborators');
    if (!isMounted.current) {
      return;
    }

    setStatus('idle');
    resetActiveCollaboratorAndCloseRemoveModal();
  };

  return (
    <>
      <Section
        title={t('users')}
        subtitle={t('users_description')}
        subtitleTooltip={
          <Trans i18nKey="users_description_tooltip">
            Available Roles:
            <p />
            <b>Owner</b>: They have full access to the platform, except edit or cancel
            the subscription or delete the account.
            <p />
            <b>Manager</b>: User with full access to the platform, except the subscription management and account deletion.
            <p />
            <b>Collaborator</b>: Same limitations as the super collaborator, with the exception that it only has access to the reservations specifically assigned to the user and no one else.
          </Trans>
        }
      >
        <>
          <Title>{Boolean(collaborators?.length) ? t('users') : t('no_users')}</Title>
          {status === 'loading' ? (
            <CollaboratorsLoaderWrapper>
              <Loader label={t('loading')} />
            </CollaboratorsLoaderWrapper>
          ) : Boolean(collaborators?.length) ? (
            <CollaboratorsContainer>
              {collaborators!.map((collaborator) => {
                return (
                  <React.Fragment key={collaborator.id}>
                    <CollaboratorName>
                      <div>
                        {collaborator.name}
                        <div>
                          <CollaboratorEmailCell href={`mailto:${collaborator.email}`}>
                            {collaborator.email}
                          </CollaboratorEmailCell>
                        </div>
                      </div>
                    </CollaboratorName>
                    <CollaboratorType>
                      {getCollaboratorTypeText(collaborator) || (
                        <MissingDataText>({t('invitation_sent')})</MissingDataText>
                      )}
                    </CollaboratorType>
                    <ActionButtonsWrapper>
                      {Boolean(getCollaboratorTypeText(collaborator)) && (
                        <Link
                          to={ACCOUNT_LINKS.edit}
                          onClick={() => {
                            localStorage.setItem('collaborator', JSON.stringify(collaborator));
                          }}>
                          <ActionButton
                            secondary
                            label={<img src={editIcon} alt="Pen" />}
                          />
                        </Link>
                      )}
                      <ActionButton
                        secondary
                        onClick={() =>
                          setActiveCollaboratorAndOpenRemoveModal(collaborator)
                        }
                        label={<img src={rubbishIcon} alt="Rubbish" />}
                      />
                    </ActionButtonsWrapper>
                  </React.Fragment>
                );
              })}
            </CollaboratorsContainer>
          ) : (
            <Subtitle>{t('no_users_description')}</Subtitle>
          )}
          <Link to={ACCOUNT_LINKS.invite}>
          <InviteButton
            label={
              <>
                {t('invite_user')}
              </>
            }
          />
          </Link>

        </>
      </Section>
      {isRemoveCollaboratorModalOpen && (
        <Modal
          closeOnDocumentClick
          closeOnEscape
          onClose={resetActiveCollaboratorAndCloseRemoveModal}
          iconSrc={deleteCollaboratorIcon}
          iconAlt="A person in the trash"
          iconProps={{
            height: 95,
            width: 84,
          }}
          title={t('are_you_sure')}
          text={
            <>
              {activeCollaborator?.name ? (
                <Trans
                  i18nKey="your_team_member_name_will_be_removed"
                  values={{name: activeCollaborator.name}}
                >
                  Your team member <b>Name</b> will be removed.
                </Trans>
              ) : (
                t('your_inactive_team_member_will_be_removed')
              )}
            </>
          }
        >
          <ModalTwoButtonsWrapper>
            {isLoading ? (
              <Loader height={40} width={40} />
            ) : (
              <>
                <ModalButton label={t('remove')} onClick={removeCollaborator} />
                <ModalButton
                  secondary
                  label={t('cancel')}
                  onClick={resetActiveCollaboratorAndCloseRemoveModal}
                />
              </>
            )}
          </ModalTwoButtonsWrapper>
        </Modal>
      )}
      <ErrorModal />
    </>
  );
}

export {AccountTeamSection};
