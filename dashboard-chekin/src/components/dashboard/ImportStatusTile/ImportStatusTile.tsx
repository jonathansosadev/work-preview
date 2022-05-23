import React from 'react';
import {useTranslation} from 'react-i18next';
import {useWebsocket} from '../../../context/websocket';
import {useAuth} from '../../../context/auth';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {useModalControls} from '../../../utils/hooks';
import importBookingsIcon from '../../../assets/importing-bookings-icon.svg';
import importingHousingsIcon from '../../../assets/importing-housings.svg';
import closeIcon from '../../../assets/x_blue.svg';
import congratsIcon from '../../../assets/welcome-icon.svg';
import importIcon from '../../../assets/import-icon.svg';
import groupIcon from '../../../assets/group.svg';
import bookingIcon from '../../../assets/bookings-people-icon.svg';
import welcomeImageOne from '../../../assets/image-1-welcome.png';
import welcomeImageOne2x from '../../../assets/image-1-welcome@2x.png';
import welcomeImageTwo from '../../../assets/image-2-welcome.png';
import welcomeImageTwo2x from '../../../assets/image-2-welcome@2x.png';
import relaxImage from '../../../assets/relax-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {
  ImportStatusTileContainer,
  ImportStatusImg,
  ImportStatusText,
  CloseButton,
  CloseButtonImg,
  ButtonsWrapper,
  Wrapper,
  Title,
  SubTitle,
  ImportedHousingsImage,
  TwoColumnsWrapper,
  ImportText,
  ImportColumn,
  CongratsImage,
  WelcomeColumn,
  WelcomeText,
  RelaxImage,
  FinalTitle,
  List,
  ListWrapper,
  SkipButton,
} from './styled';

export const WS_REFRESH_ACCOUNT_EVENT_TYPES = [
  WS_EVENT_TYPES.reservationCreated,
  WS_EVENT_TYPES.reservationRemoved,
  WS_EVENT_TYPES.housingCreated,
  WS_EVENT_TYPES.housingRemoved,
  WS_EVENT_TYPES.syncReservationsFinished,
];

const IMPORT_FINISHED_STATUS = 'IMPORT_FINISHED';
const SYNC_TASK_SENT_STATUS = 'SYNC_TASK_SENT';

function ImportStatusTile() {
  const {t} = useTranslation();
  const ws = useWebsocket();
  const {accountDetails, updateAccount, refreshAccount} = useAuth();
  const {
    isOpen: canShowImportStatusModal,
    closeModal: disableCanShowImportStatusModal,
  } = useModalControls(true);
  const {
    openModal: openWelcomeModal,
    closeModal: closeWelcomeModal,
    isOpen: isWelcomeModalOpen,
  } = useModalControls();
  const [currentStep, setCurrentStep] = React.useState(1);

  const isWaitUntilImportStartModalVisible =
    canShowImportStatusModal && accountDetails?.import_status === SYNC_TASK_SENT_STATUS;

  const isImportStatusModalVisible =
    canShowImportStatusModal &&
    Boolean(accountDetails?.count_of_housings_to_import) &&
    accountDetails?.show_importation_and_welcome_pop_ups &&
    !accountDetails?.show_buttons_mapping &&
    accountDetails?.import_status !== IMPORT_FINISHED_STATUS;

  const getIsImportCompleted = React.useCallback(() => {
    return (
      accountDetails?.import_status !== IMPORT_FINISHED_STATUS &&
      accountDetails?.housings_quantity === accountDetails?.count_of_housings_to_import &&
      accountDetails?.reservations_quantity ===
        accountDetails?.count_of_reservations_to_import &&
      accountDetails?.housings_quantity
    );
  }, [accountDetails]);

  const getShouldShowWelcomeModal = React.useCallback(() => {
    return (
      accountDetails?.import_status === IMPORT_FINISHED_STATUS &&
      accountDetails?.show_importation_and_welcome_pop_ups &&
      !accountDetails?.has_seen_dashboard_instruction
    );
  }, [accountDetails]);

  React.useEffect(() => {
    const isImportCompleted = getIsImportCompleted();
    const shouldShowWelcomeModal = getShouldShowWelcomeModal();

    if (isImportCompleted) {
      updateAccount({import_status: IMPORT_FINISHED_STATUS});
    }

    if (shouldShowWelcomeModal) {
      openWelcomeModal();
    }
  }, [
    updateAccount,
    accountDetails,
    openWelcomeModal,
    getIsImportCompleted,
    getShouldShowWelcomeModal,
  ]);

  React.useEffect(() => {
    if (WS_REFRESH_ACCOUNT_EVENT_TYPES.includes(ws.message?.event_type)) {
      refreshAccount();
    }

    return () => {
      ws.clearMessage();
    };
  }, [refreshAccount, ws]);

  const updateAccountAndCloseWelcomeModal = () => {
    updateAccount({has_seen_dashboard_instruction: true});
    closeWelcomeModal();
  };

  const incrementStep = () => {
    setCurrentStep((step) => {
      return step + 1;
    });
  };

  const decrementStep = () => {
    setCurrentStep((step) => {
      return step - 1;
    });
  };

  return (
    <>
      {isWaitUntilImportStartModalVisible && (
        <ImportStatusTileContainer>
          <CloseButton onClick={disableCanShowImportStatusModal}>
            <CloseButtonImg alt="X" src={closeIcon} />
          </CloseButton>
          <ImportStatusText>{t('import_will_start_soon')}</ImportStatusText>
        </ImportStatusTileContainer>
      )}
      {isImportStatusModalVisible && (
        <>
          <ImportStatusTileContainer>
            <CloseButton onClick={disableCanShowImportStatusModal}>
              <CloseButtonImg alt="X" src={closeIcon} />
            </CloseButton>
            <ImportStatusImg src={importingHousingsIcon} alt="Houses" />
            <ImportStatusText>
              Importing {accountDetails?.housings_quantity} of{' '}
              {accountDetails?.count_of_housings_to_import}
            </ImportStatusText>
            <ImportStatusImg src={importBookingsIcon} alt="Guests" />
            <ImportStatusText>
              Importing {accountDetails?.reservations_quantity} of{' '}
              {accountDetails?.count_of_reservations_to_import}
            </ImportStatusText>
          </ImportStatusTileContainer>
        </>
      )}
      {isWelcomeModalOpen && (
        <Modal>
          <Wrapper>
            {currentStep === 1 && (
              <>
                <ImportedHousingsImage src={importIcon} alt="Housings with arrow" />
                <Title>{t('import_completed')}</Title>
                <SubTitle>{t('well_done_exclamation')}</SubTitle>
                <TwoColumnsWrapper>
                  <ImportColumn>
                    <img src={groupIcon} alt="Housings group" />
                    <ImportText>
                      <b>
                        {accountDetails?.housings_quantity}{' '}
                        {t('properties_were_successfully_imported')}
                      </b>
                      <br />
                      {t('we_import_properties_from_all_countries')}
                    </ImportText>
                  </ImportColumn>
                  <ImportColumn>
                    <img src={bookingIcon} alt="Guest group" />
                    <ImportText>
                      <b>
                        {accountDetails?.reservations_quantity}{' '}
                        {t('reservations_were_successfully_imported')}
                      </b>
                      <br />
                      {t('we_import_only_reservations_with_a_check_in')}
                    </ImportText>
                  </ImportColumn>
                </TwoColumnsWrapper>
                <ModalButton label={t('next')} onClick={incrementStep} />
              </>
            )}
            {currentStep === 2 && (
              <>
                <SkipButton onClick={updateAccountAndCloseWelcomeModal}>
                  {t('skip')}
                </SkipButton>
                <CongratsImage src={congratsIcon} alt="Popping box" />
                <Title>{t('welcome')}!</Title>
                <SubTitle>{t('lets_get_you_step')}</SubTitle>
                <TwoColumnsWrapper>
                  <WelcomeColumn>
                    <img
                      src={welcomeImageOne}
                      srcSet={`${welcomeImageOne} 1x, ${welcomeImageOne2x} 2x`}
                      alt="Properties guide"
                    />
                    <WelcomeText>
                      <b>1/</b> {t('go_to_properties_on_the_dashboard')}
                    </WelcomeText>
                  </WelcomeColumn>
                  <WelcomeColumn>
                    <img
                      src={welcomeImageTwo}
                      srcSet={`${welcomeImageTwo} 1x, ${welcomeImageTwo2x} 2x`}
                      alt="Police guide"
                    />
                    <WelcomeText>
                      <b>2/</b> {t('for_each_property')}:
                      <br />
                      <span>- {t('connect_to_the_relevant')}</span>
                      <br />
                      <span>- {t('add_your_username')}</span>
                    </WelcomeText>
                  </WelcomeColumn>
                </TwoColumnsWrapper>
                <ModalButton label={t('next')} onClick={incrementStep} />
              </>
            )}
            {currentStep === 3 && (
              <>
                <RelaxImage src={relaxImage} alt="Relaxing man" />
                <FinalTitle>{t('and_thats_it_exclamation')}</FinalTitle>
                <SubTitle>{t('now_sit_back_and_relax')}.</SubTitle>
                <ListWrapper>
                  <List>
                    <li>{t('every_guest_gets_a_registration')}</li>
                    <li>{t('every_completed_form_goes')}</li>
                  </List>
                </ListWrapper>
                <ButtonsWrapper>
                  <ModalButton
                    label={t('finish')}
                    onClick={updateAccountAndCloseWelcomeModal}
                  />
                  <ModalButton label={t('back')} onClick={decrementStep} secondary />
                </ButtonsWrapper>
              </>
            )}
          </Wrapper>
        </Modal>
      )}
    </>
  );
}

export {ImportStatusTile};
