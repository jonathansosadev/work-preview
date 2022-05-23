import React from 'react';
import {useTranslation} from 'react-i18next';
import iconRotate from '../../../assets/icon-rotate.svg';
import Modal from '../Modal';
import {Wrapper, overlayStyle} from './styled';

function RotateScreenModal() {
  const {t} = useTranslation();

  return (
    <Wrapper>
      <Modal
        overlayStyle={overlayStyle}
        iconSrc={iconRotate}
        iconAlt="Rotate mobile"
        title={t('rotate_your_device')}
        text={t('please_rotate_to_landscape')}
      />
    </Wrapper>
  );
}

export {RotateScreenModal};
