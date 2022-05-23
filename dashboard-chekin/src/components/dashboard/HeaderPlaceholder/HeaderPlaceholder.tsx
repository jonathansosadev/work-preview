import React from 'react';
import {useParams} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {LogoImage, LogoWrapper, Title, Wrapper} from './styled';
import chekinWhiteLogo from '../../../assets/chekin-logo-white.svg';
import {useUser} from '../../../context/user';
import {REPORT_TYPES} from '../../../utils/constants';

type ReportTypes = {
  [key: string]: string;
};

const MONTLY_REPORT_TYPES: ReportTypes = {
  [REPORT_TYPES.idev]: 'idev',
  [REPORT_TYPES.ajpes]: 'ajpes',
};

function HeaderPlaceholder() {
  const {monthReportType} = useParams<any>();
  const {t} = useTranslation();
  const user = useUser();
  const logo = user?.picture?.src || chekinWhiteLogo;

  return (
    <Wrapper>
      <LogoWrapper>
        <LogoImage src={logo} alt="logo" />
      </LogoWrapper>
      <Title>{t(MONTLY_REPORT_TYPES[monthReportType])}</Title>
    </Wrapper>
  );
}

export {HeaderPlaceholder};
