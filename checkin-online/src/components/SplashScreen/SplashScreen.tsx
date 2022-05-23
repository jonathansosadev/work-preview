import React from 'react';
import {useTranslation} from 'react-i18next';
import chekinImageLogoWhite from '../../assets/chekin-imago-white.svg';
import {Wrapper, Logo, LogoLabel} from './styled';

type SplashScreenProps = {
  children: React.ReactNode | JSX.Element;
  visible: boolean;
};

const defaultProps: SplashScreenProps = {
  children: null,
  visible: false,
};

function SplashScreen({children, visible}: SplashScreenProps) {
  const {t} = useTranslation();
  return (
    <>
      <Wrapper visible={visible}>
        <Logo src={chekinImageLogoWhite} alt="Chekin" />
        <LogoLabel>{t('online_checkin')}</LogoLabel>
      </Wrapper>
      {children}
    </>
  );
}

SplashScreen.defaultProps = defaultProps;
export {SplashScreen};
