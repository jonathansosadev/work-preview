import React from 'react';
import {isIOS, isSafari, browserName} from 'react-device-detect';
import {useTranslation} from 'react-i18next';
import {useModalControls} from '../../utils/hooks';
import {useReservation} from '../../context/reservation';
import errorIcon from '../../assets/scanning_doc_error.svg';
import likeIcon from '../../assets/like.svg';
import Button from '../Button';
import Modal from '../Modal';
import {ButtonWrapper, CopyLinkButtonStyled} from './styled';

const BROWSER_NAMES = {
  miBrowser: 'MIUI Browser',
};

function WebcamWarningModal() {
  const {t} = useTranslation();
  const {isOpen, closeModal, openModal} = useModalControls(false);
  const {data: reservationDetails} = useReservation();
  const checkinOnlineLink = reservationDetails?.signup_form_link;
  const [title] = React.useState(t('compatibility_error'));
  const [text, setText] = React.useState(t('please_try_a_different_browser'));

  React.useEffect(() => {
    if (browserName.toLowerCase() === BROWSER_NAMES.miBrowser.toLowerCase()) {
      openModal();
    }

    if (isIOS && !isSafari) {
      setText(t('please_try_safari'));
      openModal();
    }
  }, [openModal, t]);

  return (
    <Modal
      closeOnDocumentClick
      closeOnEscape
      onClose={closeModal}
      open={isOpen}
      iconSrc={errorIcon}
      iconAlt="Scanner error"
      title={title}
      text={
        <>
          <div>{text}</div>
          {checkinOnlineLink && <CopyLinkButtonStyled link={checkinOnlineLink} />}
        </>
      }
    >
      <ButtonWrapper>
        <Button
          icon={<img src={likeIcon} alt="Like" />}
          label={t('ok')}
          onClick={closeModal}
        />
      </ButtonWrapper>
    </Modal>
  );
}

export {WebcamWarningModal};
