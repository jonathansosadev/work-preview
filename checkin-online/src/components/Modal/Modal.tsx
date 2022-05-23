import React, {ImgHTMLAttributes} from 'react';
import ModalPopup, {Props} from 'reactjs-popup';
import xIcon from '../../assets/x_blue.svg';
import {
  overlayStyle,
  contentStyle,
  Wrapper,
  IconWrapper,
  Title,
  Text,
  CloseButton,
} from './styled';

type ModalProps = Omit<Props, 'children'> & {
  children?: React.ReactNode;
  zIndex?: number;
  iconSrc?: string;
  iconAlt?: string;
  title?: string | React.ReactNode | JSX.Element;
  text?: string | React.ReactNode | JSX.Element;
  iconProps?: ImgHTMLAttributes<HTMLImageElement>;
  withCloseButton?: boolean;
};

const defaultProps = {
  open: false,
  closeOnDocumentClick: false,
  closeOnEscape: false,
  zIndex: 100,
  iconSrc: '',
  iconAlt: undefined,
  title: '',
  text: '',
  children: null,
  lockScroll: true,
  iconProps: {},
  withCloseButton: false,
};

function Modal({
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
        overlayStyle={overlayStyle}
        contentStyle={contentStyle}
        lockScroll={lockScroll}
        {...props}
      >
        <>
          {withCloseButton && (
            <CloseButton onClick={onClose}>
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
