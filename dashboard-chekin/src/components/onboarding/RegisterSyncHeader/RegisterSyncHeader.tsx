import React from 'react';
import {useTranslation} from 'react-i18next';
import RegisterButtonSearchMenu from '../RegisterButtonSearchMenu';
import {Title, BoldText, LowerCaseWrapper} from './styled';
import {LinkOption} from '../../../utils/types';

type RegisterSyncHeaderProps = {
  syncOptions: Array<LinkOption>;
  children?: React.ReactNode;
};

const defaultProps: RegisterSyncHeaderProps = {
  syncOptions: [],
};

function RegisterSyncHeader({children, syncOptions}: RegisterSyncHeaderProps) {
  const {t} = useTranslation();

  return (
    <Title>
      {t('sync_your')}
      {` `}
      <BoldText>{children}</BoldText>
      {` `}
      <LowerCaseWrapper>{t('account')}</LowerCaseWrapper>
      <RegisterButtonSearchMenu options={syncOptions} />
    </Title>
  );
}

RegisterSyncHeader.defaultProps = defaultProps;
export {RegisterSyncHeader};
