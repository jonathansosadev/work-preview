import React from 'react';
import {useTranslation} from 'react-i18next';
import {useAuth} from '../../../context/auth';
import ModalButton from '../../dashboard/ModalButton';
import {Content, Title, Illustration, Text, ButtonWrapper} from './styled';

function ErrorBoundaryFallback() {
  const {t} = useTranslation();
  const {logout} = useAuth();

  const handleLogout = () => {
    logout();
    window.location.pathname = '/login';
  };

  return (
    <Content>
      <Illustration />
      <Title>{t('error_boundary_title')}</Title>
      <Text>{t('error_boundary_message')}</Text>
      <ButtonWrapper>
        <a href="/bookings">
          <ModalButton label={t('go_to_bookings')} />
        </a>
        <ModalButton secondary label={t('logout')} onClick={handleLogout} />
      </ButtonWrapper>
    </Content>
  );
}

export {ErrorBoundaryFallback};
