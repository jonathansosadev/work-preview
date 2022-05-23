import React from 'react';
import {useTranslation} from 'react-i18next';
import warningIcon from '../../../assets/warning-icon.svg';
import Modal from '../../Modal';
import {ButtonModal, Description} from './styled';

type ReservationNotFoundModalProps = {
  open: boolean;
  onNext: () => void;
};

function ReservationNotFoundModal({open, onNext}: ReservationNotFoundModalProps) {
  const {t} = useTranslation();

  return (
    <Modal
      open={open}
      title={t('provide_more_details')}
      text={<Description>{t('provide_more_details_description')}</Description>}
      iconSrc={warningIcon}
    >
      <ButtonModal onClick={onNext} label={t('ok')} />
    </Modal>
  );
}

export {ReservationNotFoundModal};
