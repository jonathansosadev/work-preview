import React, {DetailedHTMLProps, ImgHTMLAttributes} from 'react';

import {useModalControls} from 'utils/hooks';
import {ReactEntity} from 'utils/types';
import xIcon from '../../../assets/x_blue.svg';
import {BannerContainer, ImageWrapper, CloseButton, Text, Button} from './styled';

type BannerProps = {
  onClose: () => void;
  onButtonClick: () => void;
  isOpen?: boolean;
  imageSrc?: string;
  imageProps?: DetailedHTMLProps<ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>;
  text?: ReactEntity;
  buttonText?: string;
};

const defaultProps: BannerProps = {
  onClose: () => {},
  onButtonClick: () => {},
  imageSrc: '',
  text: '',
  buttonText: 'OK',
};

function Banner({
  imageSrc,
  imageProps,
  text,
  buttonText,
  isOpen,
  onClose,
  onButtonClick,
}: BannerProps) {
  const {isOpen: open, closeModal, openModal} = useModalControls(isOpen);

  React.useEffect(
    function openIfPropOpen() {
      if (isOpen) openModal();
    },
    [isOpen, openModal],
  );

  const handleSubmit = () => {
    closeModal();
    onButtonClick();
  };
  const handleClose = () => {
    closeModal();
    onClose();
  };

  if (!open) return null;
  return (
    <BannerContainer>
      <CloseButton type="button" onClick={handleClose}>
        <img src={xIcon} alt="Close modal" />
      </CloseButton>
      {imageSrc && (
        <ImageWrapper>
          <img {...imageProps} src={imageSrc} alt="bannerImage" />
        </ImageWrapper>
      )}
      {text && <Text>{text}</Text>}
      <Button onClick={handleSubmit} label={buttonText} />
    </BannerContainer>
  );
}

Banner.defaultProps = defaultProps;
export {Banner};
