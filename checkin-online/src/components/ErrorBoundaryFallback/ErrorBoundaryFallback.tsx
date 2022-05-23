import React from 'react';
import {useTranslation} from 'react-i18next';
import likeIcon from '../../assets/like.svg';
import Button from '../Button';
import {Content, Title, Illustration, Text, ButtonWrapper} from './styled';

function ErrorBoundaryFallback() {
  const {t} = useTranslation();

  return (
    <Content>
      <Illustration />
      <Title>{t('error_boundary_title')}</Title>
      <Text>{t('error_boundary_message')}</Text>
      <ButtonWrapper>
        <a href="/">
          <Button label={t('ok')} icon={<img src={likeIcon} alt="Like" />} />
        </a>
      </ButtonWrapper>
    </Content>
  );
}

export {ErrorBoundaryFallback};
