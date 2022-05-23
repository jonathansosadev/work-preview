import React from 'react';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useQuery} from 'react-query';
import {formatDate} from '../../../utils/date';
import {toast} from 'react-toastify';
import api, {queryFetcher} from '../../../api';
import {
  useErrorModal,
  useErrorToast,
  useIsMounted,
  useModalControls,
  useScrollToTop,
  useStatus,
} from '../../../utils/hooks';
import {addSupportEmailToMessage, downloadFromLink, toastResponseError} from '../../../utils/common';
import {COUNTRY_CODES, FAMILY_GROUP_TYPE, WS_EVENT_TYPES} from '../../../utils/constants';
import {getCountryCode, getName} from '../../../utils/housing';
import {EntryForm} from '../../../utils/types';
import directDownloadIcon from '../../../assets/direct-download.svg';
import FormHeader from '../FormHeader';
import Loader from '../../common/Loader';
import {ContentWrapper, MissingDataText, SmallButton} from '../../../styled/common';
import {
  Title,
  Subtitle,
  DownloadAllButton,
  SubSubtitle,
  GuestsTitle,
  GuestsWrapper,
  Layout,
  Cell,
  GuestName,
  BottomButtonWrapper,
  MissingGuestsText,
  LoaderWrapper,
  DeleteEntryFormButton,
  ButtonLabelWrapper,
  ButtonsWrapper,
  DeleteButtonLabelIcon,
  DeleteButtonLabelText,
  RowErrorIcon
} from './styled';

import {useWebsocket} from '../../../context/websocket';
import rubbishIcon from '../../../assets/rubbish.svg';
import Modal from '../Modal';
import deleteGuestIcon from '../../../assets/icon-delete-guest.svg';
import ModalButton from '../ModalButton';
import errorIcon from '../../../assets/error.svg';
import {PDF_STATUS} from '../../../utils/constants';

function fetchEntryForms(reservationId = '') {
  const params = `reservation=${reservationId}`;
  return queryFetcher(api.documents.ENDPOINTS.entryForms(params));
}

function getLatestAustrianGuestLeaderEntryForm(entryForms?: EntryForm[]) {
  const reservation = entryForms![0]?.data;
  const guestLeaderId = reservation?.guest_group?.leader_id;

  if (!guestLeaderId) {
    return [];
  }

  const leaderEntryForm = entryForms!.find((doc) => {
    return doc?.guest === guestLeaderId;
  });

  return leaderEntryForm ? [leaderEntryForm] : [];
}

function getLatestEntryForms(entryForms?: EntryForm[]) {
  if (!entryForms?.length) {
    return [];
  }

  const reservation = entryForms![0]?.data;
  const groupType = reservation?.guest_group?.type;
  const countryCode = getCountryCode(reservation?.housing);

  if (groupType === FAMILY_GROUP_TYPE && countryCode === COUNTRY_CODES.austria) {
    return getLatestAustrianGuestLeaderEntryForm(entryForms);
  }

  const latestGuestDocs: {[key: string]: EntryForm} = {};

  entryForms.forEach((doc) => {
    if (!latestGuestDocs[doc.guest]) {
      latestGuestDocs[doc.guest] = doc;
    }
  });

  return Object.values(latestGuestDocs);
}

function ReservationEntryForms() {
  useScrollToTop();
  const {t} = useTranslation();
  const {id} = useParams<{id: string}>();
  const isMounted = useIsMounted();
  const {isLoading, setStatus} = useStatus();
  const {displayError, ErrorModal} = useErrorModal();
  const ws = useWebsocket();

  const {
    setStatus: setDeleteEntryFormStatus,
    isLoading: isDeletingEntryForm,
    isSuccess: isEntryFormDeleted,
  } = useStatus();

  const [entryFormIdToDelete, setEntryFormIdToDelete] = React.useState('');

  const {
    openModal: openDeleteEntryFormModal,
    closeModal: closeDeleteEntryFormModal,
    isOpen: isDeleteEntryFormModalOpen,
  } = useModalControls();

  const {data: entryForms, error, status} = useQuery<EntryForm[]>(
    ['entryForms', id],
    () => fetchEntryForms(id),
    {},
  );
  useErrorToast(error, {
    notFoundMessage: t('errors.requested_entry_forms_not_found'),
  });

  const latestEntryForms = React.useMemo(() => {
    return getLatestEntryForms(entryForms);
  }, [entryForms]);

  const reservationId = entryForms?.[0]?.data.id!;

  const downloadEntryFormsArchive = React.useCallback(async () => {
    const result = await api.documents.downloadEntryFormsArchive(reservationId);

    if (result.error) {
      displayError(result.error);
    }

    if (result.data?.link) {
      downloadFromLink(result.data.link);
    } else {
      displayError(t('download_link_not_found'));
    }

    setStatus('idle');
  }, [displayError, reservationId, setStatus, t]);

  React.useEffect(() => {
    if (ws.message?.event_type === WS_EVENT_TYPES.entryFormsArchiveGenerationFinished) {
      downloadEntryFormsArchive();
    }

    if (ws.message?.event_type === WS_EVENT_TYPES.entryFormsArchiveGenerationFailed) {
      setStatus('idle');
      displayError();
    }

    return () => {
      ws.clearMessage();
    };
  }, [displayError, downloadEntryFormsArchive, setStatus, ws]);

  const housing = entryForms?.[0]?.data?.housing;
  const checkInDate = entryForms?.[0]?.data?.check_in_date;

  const downloadEntryForm = (file?: string, status?: string, statusDetails?: string) => {
    if (!file) {
      toast.error(
        addSupportEmailToMessage(statusDetails),
      );
      return;
    }

    downloadFromLink(file);
  };

  const deleteEntryForm = async () => {
    setDeleteEntryFormStatus('loading');
    const {error} = await api.documents.deleteEntryForm(entryFormIdToDelete);

    if (!isMounted.current) {
      return;
    }

    if (error) {
      toastResponseError(error);
      displayError(error);
      setDeleteEntryFormStatus('idle');
      return;
    }
    setDeleteEntryFormStatus('success');
    closeDeleteEntryFormModal();
  };

  const getReservationTaskPayload = () => {
    return {
      reservation: reservationId,
      is_force: true,
    };
  };

  const startArchiveGenerationTask = async () => {
    setStatus('loading');
    const payload = getReservationTaskPayload();
    const result = await api.documents.startEntryFormsGenerationTask(payload);

    if (!isMounted.current) {
      return;
    }

    if (result.error) {
      setStatus('idle');
      displayError(result.error);
    }
  };

  return (
    <ContentWrapper>
      <ErrorModal />
      <FormHeader
        linkToBack="/documents/entry-form"
        title={
          housing && (
            <>
              <Title>{t('all_guests_documents')}</Title>
              <Subtitle>{getName(housing)}</Subtitle>
              <SubSubtitle>{checkInDate && formatDate(checkInDate)}</SubSubtitle>
            </>
          )
        }
        action={
          <DownloadAllButton
            secondary
            disabled={Boolean(!entryForms?.length)}
            blinking={isLoading}
            onClick={startArchiveGenerationTask}
            label={
              <>
                <img src={directDownloadIcon} alt="Arrow with a line" />
                {t('download_all')}
              </>
            }
          />
        }
      />
      {status === 'loading' ? (
        <LoaderWrapper>
          <Loader height={45} width={45} />
        </LoaderWrapper>
      ) : (
        <GuestsWrapper>
          {Boolean(latestEntryForms?.length) ? (
            <>
              <GuestsTitle>{t('guests')}</GuestsTitle>
              <Layout>
                {latestEntryForms?.map((d: any) => {
                  const fullName = d?.data?.guest?.full_name;
                  const downloadLink = d?.file;
                  const entryFormId = d?.id;
                  const statusEntryForm = d?.status;
                  const statusDetails = d?.status_details;

                  return (
                    <div key={d?.id}>
                      <Cell>
                        <GuestName>
                          {fullName || (
                            <MissingDataText>[{t('name_missing')}]</MissingDataText>
                          )}
                        </GuestName>
                        <SmallButton
                          disabled={(statusEntryForm === PDF_STATUS.complete || statusEntryForm === PDF_STATUS.error) ? false : true}
                          onClick={() => downloadEntryForm(downloadLink, statusEntryForm, statusDetails)}
                        >
                          <div>
                          {(statusEntryForm === PDF_STATUS.error) ? <RowErrorIcon src={errorIcon} alt="Error" /> : null}
                          {(statusEntryForm === PDF_STATUS.inProgress) ? <Loader height={18} width={18} /> : null}
                          {(downloadLink && statusEntryForm === PDF_STATUS.complete) ? 'Pdf' : <Loader height={18} width={18} />}
                          {(statusEntryForm === PDF_STATUS.new) ? <Loader height={18} width={18} /> : null}
                          </div>
                        </SmallButton>
                        <DeleteEntryFormButton
                          onClick={(e: React.SyntheticEvent) => {
                            e.stopPropagation();
                            openDeleteEntryFormModal();
                            setEntryFormIdToDelete(entryFormId);
                          }}
                          type="button"
                        >
                          <img src={rubbishIcon} alt="Rubbish" />
                        </DeleteEntryFormButton>
                      </Cell>
                    </div>
                  );
                })}
              </Layout>
            </>
          ) : (
            <MissingGuestsText>{t('empty')}</MissingGuestsText>
          )}
        </GuestsWrapper>
      )}
      <BottomButtonWrapper shifted={latestEntryForms?.length > 3}>
        {Boolean(entryForms?.length) && (
          <DownloadAllButton
            secondary
            blinking={isLoading}
            onClick={startArchiveGenerationTask}
            label={
              <>
                <img src={directDownloadIcon} alt="Arrow with a line" />
                {t('download_all')}
              </>
            }
          />
        )}
      </BottomButtonWrapper>
      {isDeleteEntryFormModalOpen && (
        <Modal
          open
          iconSrc={deleteGuestIcon}
          iconProps={{
            height: 95,
            width: 84,
          }}
          iconAlt="Guest in trash"
          title={t('are_you_sure')}
          text={
            isDeletingEntryForm ? (
              <div>
                {t('deleting_document')}...
                <p />
                <div>{t('it_takes_seconds')}</div>
              </div>
            ) : isEntryFormDeleted ? (
              t('successfully_deleted')
            ) : (
              t('all_info_associated_will_be_deleted')
            )
          }
          zIndex={100}
        >
          <ButtonsWrapper>
            <ModalButton
              onClick={deleteEntryForm}
              label={
                <ButtonLabelWrapper>
                  <DeleteButtonLabelIcon src={rubbishIcon} alt="Plus" />
                  <DeleteButtonLabelText>{t('delete_document')}</DeleteButtonLabelText>
                </ButtonLabelWrapper>
              }
            />
            <ModalButton
              secondary
              onClick={() => {
                closeDeleteEntryFormModal();
                setEntryFormIdToDelete('');
              }}
              label={t('cancel')}
            />
          </ButtonsWrapper>
        </Modal>
      )}
    </ContentWrapper>
  );
}

export {ReservationEntryForms};
