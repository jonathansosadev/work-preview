import React from 'react';
import {useHistory, useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {useQuery, useQueryClient} from 'react-query';
import {useForm} from 'react-hook-form';
import {Document, Page} from 'react-pdf';
import api, {queryFetcher} from '../../../api';
import {
  useErrorToast,
  useModalControls,
  useStatus,
  useErrorModal,
} from '../../../utils/hooks';
import {downloadFromLink} from '../../../utils/common';
import {useWebsocket} from '../../../context/websocket';
import {getShortHousingsAsOptions, fetchShortHousings} from '../../../utils/housing';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {STORAGE_ENTRY_FORMS_HOUSING_FILTER} from '../EntryFormsTable';
import plusIcon from '../../../assets/plus-blue.svg';
import directDownloadIcon from '../../../assets/direct-download-white.svg';
import guestbookIcon from '../../../assets/guestbook.svg';
import ModalButton from '../ModalButton';
import SearchButton from '../SearchButton';
import SearchHousingsModal from '../SearchHousingsModal';
import Modal from '../Modal';
import Loader from '../../common/Loader';
import {
  Guestbook,
  GuestbookSettings,
  ShortHousing,
  SelectOption,
} from '../../../utils/types';
import {InputController} from '../Input';
import {ContentWrapper} from '../../../styled/common';
import {
  GuestBookFormHeader,
  HeadingButton,
  Content,
  HousingListItem,
  HousingsListTitle,
  HousingsList,
  HousingListItemWrapper,
  HousingListItemsWrapper,
  ActionsSection,
  DownloadButton,
  ModalForm,
  ModalText,
  ModalTwoButtonsWrapper,
  PDFWrapper,
} from './styled';

const DEFAULT_GUESTBOOK_STARTING_NUMBER = 1;

function fetchGuestbooks(housingId: string) {
  return queryFetcher(api.documents.ENDPOINTS.allGuestbooks(`housing=${housingId}`));
}

function fetchGuestbooksSettings(housingId: string) {
  return queryFetcher(api.documents.ENDPOINTS.guestbookSettings(housingId));
}

enum FORM_NAMES {
  number = 'number',
}

type FormTypes = {
  [FORM_NAMES.number]: number;
};

type Params = {
  id: string;
};

function EntryFormsGuestbookView() {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const history = useHistory();
  const {id: housingId} = useParams<Params>();
  const ws = useWebsocket();
  const {ErrorModal, displayError} = useErrorModal();
  const {
    register,
    handleSubmit,
    getValues,
    reset,
    control,
    formState: {errors},
  } = useForm<FormTypes>({
    defaultValues: {
      [FORM_NAMES.number]: DEFAULT_GUESTBOOK_STARTING_NUMBER,
    },
  });

  const {setStatus, isLoading} = useStatus();
  const {isOpen, closeModal, openModal} = useModalControls();
  const {
    isOpen: isSearchHousingModalOpen,
    closeModal: closeSearchHousingModal,
    openModal: openSearchHousingModal,
  } = useModalControls();

  const {data: shortHousings, error: shortHousingsError} = useQuery<
    ShortHousing[],
    string
  >('shortHousings', fetchShortHousings);
  useErrorToast(shortHousingsError, {
    notFoundMessage: t('errors.requested_short_housings_not_found'),
  });

  const shortHousingsOptions = React.useMemo(() => {
    return getShortHousingsAsOptions(shortHousings);
  }, [shortHousings]);

  const {data: guestbookSettings, error: guestbookSettingsError} = useQuery<
    GuestbookSettings
  >(['guestbooksSettings', housingId], () => fetchGuestbooksSettings(housingId), {
    enabled: Boolean(housingId),
  });
  useErrorToast(guestbookSettingsError, {
    notFoundMessage: t('errors.requested_guest_books_not_found'),
  });

  React.useEffect(() => {
    if (guestbookSettings) {
      reset({[FORM_NAMES.number]: guestbookSettings.starting_num});
    }
  }, [guestbookSettings, reset]);

  const {
    data: guestbooks,
    error: guestbooksError,
    status: guestbooksStatus,
    refetch: refetchGuestbooks,
  } = useQuery<Guestbook[], [string, string]>(
    ['guestbooks', housingId],
    () => fetchGuestbooks(housingId),
    {
      refetchOnWindowFocus: false,
      enabled: Boolean(housingId),
    },
  );

  React.useEffect(() => {
    if (guestbooksError) {
      displayError(guestbooksError);
    }
  }, [displayError, guestbooksError]);

  const finishGuestbooksGeneration = React.useCallback(async () => {
    await refetchGuestbooks();
    setStatus('idle');
    closeModal();
  }, [closeModal, refetchGuestbooks, setStatus]);

  React.useEffect(() => {
    if (ws?.message?.event_type === WS_EVENT_TYPES.guestbookGenerationFailed) {
      displayError();
    }

    if (ws?.message.event_type === WS_EVENT_TYPES.guestbookGenerationFinished) {
      finishGuestbooksGeneration();
    }

    return () => {
      ws.clearMessage();
    };
  }, [displayError, finishGuestbooksGeneration, ws]);

  const changeActiveHousing = (housing: SelectOption) => {
    sessionStorage.setItem(STORAGE_ENTRY_FORMS_HOUSING_FILTER, JSON.stringify(housing));
    history.push(housing.value.toString());
  };

  const startGuestbookGeneration = async () => {
    const result = await api.documents.startGuestbookGenerationTask(housingId);

    if (result.error) {
      displayError(result.error);
      setStatus('idle');
    }
  };

  const onStartingNumberSubmit = async () => {
    setStatus('loading');
    const {error, data} = await api.documents.updateGuestbookSettings({
      housingId,
      startingNumber: getValues()[FORM_NAMES.number],
    });

    if (error) {
      displayError(error);
      setStatus('idle');
      return;
    }

    queryClient.setQueryData(['guestbooksSettings', housingId], data);
    await startGuestbookGeneration();
  };

  return (
    <>
      <ContentWrapper>
        <GuestBookFormHeader
          linkToBack="/documents/entry-form"
          title={t('guestbook')}
          action={
            <HeadingButton disabled={!guestbooks?.length} onClick={openModal}>
              <img src={plusIcon} alt="Plus" />
              {t('change_starting_number')}
            </HeadingButton>
          }
        />
        <Content>
          <HousingsList>
            <HousingsListTitle>
              {t('property_guestbook')}
              <SearchButton onClick={openSearchHousingModal} />
            </HousingsListTitle>
            <HousingListItemsWrapper>
              {shortHousingsOptions?.map((housing) => {
                return (
                  <HousingListItemWrapper key={housing?.value}>
                    <HousingListItem
                      disabled={!housing?.value}
                      onClick={() => changeActiveHousing(housing)}
                      active={housing?.value === housingId}
                    >
                      {housing?.label}
                    </HousingListItem>
                  </HousingListItemWrapper>
                );
              })}
            </HousingListItemsWrapper>
          </HousingsList>
          <PDFWrapper>
            {!housingId && t('please_select_property')}
            {housingId &&
              guestbooksStatus === 'success' &&
              (Boolean(guestbooks?.length)
                ? guestbooks!.map((book) => {
                    return (
                      <React.Fragment key={book.file}>
                        <Document
                          loading={<Loader height={40} width={40} label={t('loading')} />}
                          file={book.file}
                          error={t('pdf_loading_error')}
                        >
                          <Page pageNumber={book.pages_num} />
                        </Document>
                      </React.Fragment>
                    );
                  })
                : `${t('nothing_found')}.`)}
            {guestbooksStatus === 'loading' && (
              <Loader height={40} width={40} label={t('loading')} />
            )}
          </PDFWrapper>
          <ActionsSection>
            {Boolean(guestbooks?.length) ? (
              guestbooks!.map((book, i) => {
                const bookNumber = i + 1;
                return (
                  <div key={book.file}>
                    <DownloadButton
                      onClick={() => downloadFromLink(book.file)}
                      label={
                        <>
                          <img src={directDownloadIcon} alt="Down arrow" />
                          {t('download')}{' '}
                          {bookNumber < 10 ? `0${bookNumber}` : bookNumber}
                        </>
                      }
                    />
                  </div>
                );
              })
            ) : (
              <DownloadButton
                disabled
                label={
                  <>
                    <img src={directDownloadIcon} alt="Down arrow" />
                    {t('download')}
                  </>
                }
              />
            )}
          </ActionsSection>
        </Content>
      </ContentWrapper>
      {isOpen && (
        <Modal
          open
          onClose={closeModal}
          iconSrc={guestbookIcon}
          iconProps={{height: 78, width: 84}}
          iconAlt="Book with a feather"
          title={t('select_starting_number')}
        >
          <ModalForm onSubmit={handleSubmit(onStartingNumberSubmit)}>
            <ModalText>
              {t('by_default_guestbooks_start_with_number', {
                number: DEFAULT_GUESTBOOK_STARTING_NUMBER,
              })}
            </ModalText>
            <InputController
              disabled={isLoading}
              {...register(FORM_NAMES.number, {
                required: t('required') as string,
                min: {
                  value: DEFAULT_GUESTBOOK_STARTING_NUMBER,
                  message: t('min_number_is', {
                    number: DEFAULT_GUESTBOOK_STARTING_NUMBER,
                  }) as string,
                },
              })}
              control={control}
              error={errors[FORM_NAMES.number]?.message}
              label={t('number')}
              placeholder={t('enter_number')}
              type="number"
            />
            <ModalTwoButtonsWrapper>
              {isLoading ? (
                <Loader label={t('updating_this_can_take_a_while')} />
              ) : (
                <>
                  <ModalButton type="submit" label={t('update')} />
                  <ModalButton secondary onClick={closeModal} label={t('cancel')} />
                </>
              )}
            </ModalTwoButtonsWrapper>
          </ModalForm>
        </Modal>
      )}
      <ErrorModal />
      {isSearchHousingModalOpen && (
        <SearchHousingsModal
          strictOptions
          open
          onClose={closeSearchHousingModal}
          onSubmit={changeActiveHousing}
        />
      )}
    </>
  );
}

export {EntryFormsGuestbookView};
