import React from 'react';
import {isIOS, isSafari, browserName} from 'react-device-detect';
import {useTranslation} from 'react-i18next';
import {useModalControls} from '../../../utils/hooks';
import errorIcon from '../../../assets/warning-icon.svg';
import ModalButton from '../ModalButton';
import Modal from '../Modal';
import {ButtonWrapper} from './styled';

const BROWSER_NAMES = {
  miBrowser: 'MIUI Browser',
};

function WebcamWarningModal() {
  const {t} = useTranslation();
  const {isOpen, closeModal, openModal} = useModalControls();
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
      zIndex={400}
      onClose={closeModal}
      open={isOpen}
      iconSrc={errorIcon}
      iconAlt="Scanner error"
      title={title}
      text={text}
    >
      <ButtonWrapper>
        <ModalButton label={t('ok')} onClick={closeModal} />
      </ButtonWrapper>
    </Modal>
  );
}

export {WebcamWarningModal};
