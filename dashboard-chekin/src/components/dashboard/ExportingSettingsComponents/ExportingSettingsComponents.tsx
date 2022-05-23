import React from 'react';
import {useTranslation} from 'react-i18next';
import exportingIcon from '../../../assets/exporting_taxes.svg';
import blueCloseIcon from '../../../assets/close-blue.svg';
import closeIcon from '../../../assets/close.svg';
import Button from '../ModalButton';
import Modal from '../Modal';
import {
  ExportingIcon,
  RelativeWrapper,
  CloseIcon,
  ExportingText,
  ModalTitle,
  ModalButtonsWrapper,
  contentStyle,
} from './styled';

export enum ToastTypes {
  taxes = 'TAXES',
  contracts = 'CONTRACTS',
}

const toastText = {
  [ToastTypes.taxes]: {
    title: 'exporting_taxes',
  },
  [ToastTypes.contracts]: {
    title: 'exporting_contract_settings',
  },
};

type ToastContentProps = {
  onClose: () => void;
  type?: ToastTypes;
  total?: number;
  exported?: number;
  customText?: string;
  hideCloseButton?: boolean;
};

function ToastContent({
  onClose,
  exported,
  total,
  customText,
  type = ToastTypes.taxes,
  hideCloseButton,
}: ToastContentProps) {
  const {t} = useTranslation();
  const [isCloseButtonHovered, setIsCloseButtonHovered] = React.useState(false);

  const handleClose = () => {
    onClose();
    setIsCloseButtonHovered(false);
  };

  return (
    <RelativeWrapper>
      <ExportingIcon src={exportingIcon} alt="Exporting taxes" />
      <ExportingText>
        {customText || `${t(toastText[type].title)}... ${exported || 0}/${total || 0}`}
      </ExportingText>
      {!hideCloseButton && (
        <CloseIcon
          alt="Cross"
          onMouseOver={() => setIsCloseButtonHovered(true)}
          onMouseOut={() => setIsCloseButtonHovered(false)}
          src={isCloseButtonHovered ? blueCloseIcon : closeIcon}
          onClick={handleClose}
        />
      )}
    </RelativeWrapper>
  );
}

type ConfirmationModalProps = {
  open?: boolean;
  onClose?: () => void;
  onSubmit?: () => void;
};

function ConfirmationModal({open, onClose, onSubmit}: ConfirmationModalProps) {
  const {t} = useTranslation();
  return (
    <Modal open={open} contentStyle={contentStyle}>
      <ModalTitle>{t('would_you_like_to_stop_exporting')}</ModalTitle>
      <ModalButtonsWrapper>
        <Button label={t('yes')} onClick={onSubmit} />
        <Button secondary onClick={onClose} label={t('no_keep_exporting')} />
      </ModalButtonsWrapper>
    </Modal>
  );
}

export {ToastContent, ConfirmationModal};
