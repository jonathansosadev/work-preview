import React from 'react';
import ModalPopup from 'reactjs-popup';
import {ReactEntity} from '../../../utils/types';
import crossIcon from '../../../assets/x_bold.svg';
import {
  overlayStyle,
  CloseIcon,
  ContentWrapper,
  Wrapper,
  CloseIconWrapper,
} from './styled';

type ModalProps = {
  children?: React.ReactNode;
  onClose?: () => void;
  closeOnDocumentClick?: boolean;
  hideCloseButton?: boolean;
  closeOnEscape?: boolean;
  open?: boolean;
  zIndex?: number;
  iconSrc?: string;
  iconAlt?: string;
  title?: ReactEntity;
  text?: ReactEntity;
  lockScroll?: boolean;
  contentStyle?: React.CSSProperties;
  overlayStyle?: React.CSSProperties;
};

const defaultProps = {
  open: true,
  closeOnDocumentClick: false,
  closeOnEscape: false,
  hideCloseButton: false,
  zIndex: 100,
  iconSrc: '',
  iconAlt: undefined,
  title: '',
  text: '',
  children: null,
  lockScroll: true,
  contentStyle: undefined,
  overlayStyle: undefined,
};

function Modal({
  open,
  onClose,
  children,
  closeOnDocumentClick,
  closeOnEscape,
  hideCloseButton,
  zIndex,
  contentStyle,
  lockScroll,
}: ModalProps) {
  return (
    <Wrapper zIndex={zIndex}>
      <ModalPopup
        open={open}
        onClose={onClose}
        closeOnDocumentClick={closeOnDocumentClick}
        closeOnEscape={closeOnEscape}
        overlayStyle={overlayStyle}
        contentStyle={contentStyle}
        lockScroll={lockScroll}
      >
        <>
          {!hideCloseButton && (
            <CloseIconWrapper onClick={onClose}>
              <CloseIcon alt="Cross" src={crossIcon} />
            </CloseIconWrapper>
          )}
          <ContentWrapper>{children}</ContentWrapper>
        </>
      </ModalPopup>
    </Wrapper>
  );
}

Modal.defaultProps = defaultProps;
export {Modal};
