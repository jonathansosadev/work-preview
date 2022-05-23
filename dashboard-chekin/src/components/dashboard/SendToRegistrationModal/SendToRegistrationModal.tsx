import React from 'react';
import {useQueryClient} from 'react-query';
import {useTranslation} from 'react-i18next';
import {useIsMounted, useStatus} from '../../../utils/hooks';
import {STATUS_TYPES} from '../../../utils/statuses';
import {QUERY_CACHE_KEYS, STAT_TYPES} from '../../../utils/constants';
import {valueof} from '../../../utils/types';
import {
  forceSendToPoliceCheckIn,
  forceSendToPoliceCheckOut,
  forceSendToRegistration,
  sendToRegistration,
} from '../../../api/reservations';
import warningIcon from '../../../assets/warning-icon.svg';
import Modal from '../Modal';
import ModalButton from '../ModalButton';
import {ModalTwoButtonsWrapper} from '../../../styled/common';

const PoliceActionTypes = [STATUS_TYPES.policeCheckIn, STATUS_TYPES.policeCheckOut];

type YouHaveMadeChangesModalProps = {
  handleModalCancel: () => void;
  actionType: STATUS_TYPES;
  shouldShowWarning: boolean;
  reservationId: string;
  guestGroupId: string;
  statType?: valueof<typeof STAT_TYPES>;
};

const defaultProps: YouHaveMadeChangesModalProps = {
  handleModalCancel: () => {},
  actionType: STATUS_TYPES.policeCheckIn,
  shouldShowWarning: false,
  reservationId: '',
  guestGroupId: '',
};

function SendToRegistrationModal({
  handleModalCancel,
  actionType,
  shouldShowWarning,
  reservationId,
  guestGroupId,
  statType,
}: YouHaveMadeChangesModalProps) {
  const {t} = useTranslation();
  const queryClient = useQueryClient();
  const isMounted = useIsMounted();
  const {isLoading, setStatus} = useStatus();

  const getModalContent = () => {
    if (shouldShowWarning && PoliceActionTypes.includes(actionType)) {
      return {
        title: t('warning_police_message_title'),
        text: t('warning_police_message'),
      };
    }
    return {title: t('warning'), text: t('default_registration_message')};
  };

  const sendReservationToRegistration = async () => {
    setStatus('loading');
    switch (actionType) {
      case STATUS_TYPES.policeCheckIn:
        await forceSendToPoliceCheckIn(reservationId);
        break;
      case STATUS_TYPES.policeCheckOut:
        await forceSendToPoliceCheckOut(reservationId);
        break;
      case STATUS_TYPES.statsCheckIn:
        if (statType === STAT_TYPES.lazioRadar) {
          await forceSendToRegistration(reservationId);
        } else {
          await sendToRegistration(reservationId);
        }
        break;
    }

    if (isMounted.current) {
      await queryClient.refetchQueries([QUERY_CACHE_KEYS.guestGroup, guestGroupId]);
      setStatus('idle');
      handleModalCancel();
    }
  };

  const handleModalSend = () => {
    sendReservationToRegistration();
  };

  return (
    <Modal
      open
      iconSrc={warningIcon}
      iconAlt="Warning"
      iconProps={{
        height: 84,
        width: 84,
      }}
      title={getModalContent().title}
      text={getModalContent().text}
    >
      <ModalTwoButtonsWrapper>
        <ModalButton onClick={handleModalSend} label={t('send')} disabled={isLoading} />
        <ModalButton secondary onClick={handleModalCancel} label={t('cancel')} />
      </ModalTwoButtonsWrapper>
    </Modal>
  );
}

SendToRegistrationModal.defaultProps = defaultProps;
export {SendToRegistrationModal};
