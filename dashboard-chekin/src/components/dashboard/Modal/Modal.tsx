import React, {ImgHTMLAttributes} from 'react';
import ModalPopup from 'reactjs-popup';
import {ReactEntity} from '../../../utils/types';
import xIcon from '../../../assets/x_blue.svg';
import {
  defaultOverlayStyle,
  defaultContentStyle,
  Wrapper,
  IconWrapper,
  Title,
  Text,
  CloseButton,
} from './styled';

type ModalProps = {
  className?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  closeOnDocumentClick?: boolean;
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
  iconProps?: ImgHTMLAttributes<HTMLImageElement>;
  withCloseButton?: boolean;
};

const defaultProps: ModalProps = {
  open: true,
  closeOnDocumentClick: false,
  closeOnEscape: false,
  zIndex: 100,
  iconSrc: '',
  iconAlt: '',
  title: '',
  text: '',
  children: null,
  lockScroll: true,
  contentStyle: undefined,
  overlayStyle: undefined,
  iconProps: {width: 84},
  withCloseButton: false,
};

function Modal({
  className,
  open,
  onClose,
  children,
  closeOnDocumentClick,
  closeOnEscape,
  zIndex,
  iconAlt,
  iconSrc,
  title,
  text,
  lockScroll,
  contentStyle,
  overlayStyle,
  iconProps,
  withCloseButton,
  ...props
}: ModalProps) {
  return (
    <Wrapper zIndex={zIndex}>
      <ModalPopup
        open={open}
        onClose={onClose}
        closeOnDocumentClick={closeOnDocumentClick}
        closeOnEscape={closeOnEscape}
        overlayStyle={overlayStyle || defaultOverlayStyle}
        contentStyle={contentStyle || defaultContentStyle}
        lockScroll={lockScroll}
        className={className}
        {...props}
      >
        <>
          {withCloseButton && (
            <CloseButton type="button" onClick={onClose}>
              <img src={xIcon} alt="Close modal" />
            </CloseButton>
          )}
          {(iconSrc || iconProps?.src) && (
            <IconWrapper>
              <img src={iconSrc} alt={iconAlt} {...iconProps} />
            </IconWrapper>
          )}
          {title && <Title>{title}</Title>}
          {text && <Text>{text}</Text>}
          {children}
        </>
      </ModalPopup>
    </Wrapper>
  );
}

Modal.defaultProps = defaultProps;
export {Modal};
