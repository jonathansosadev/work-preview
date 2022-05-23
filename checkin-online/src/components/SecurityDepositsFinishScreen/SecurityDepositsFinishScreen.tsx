import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import checkIcon from '../../assets/check.svg';
import Header from '../Header';
import SubmitButton from '../SubmitButton';
import {DimensionsWrapper} from '../../styled/common';
import {Content, Title, CheckIcon} from './styled';

type LocationState = {
  wasPaymentSkipped?: boolean;
};

function SecurityDepositsFinishScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();

  const goToFinish = () => {
    if (location.state?.wasPaymentSkipped) {
      history.push('/', {wasPaymentSkipped: true});
      return;
    }

    history.push('/finish');
  };

  return (
    <div>
      <Header hideBackButton title={t('security_deposit')} />
      <DimensionsWrapper>
        <Content>
          <Title>{t('your_deposit_has_been_made')}</Title>
          <CheckIcon src={checkIcon} alt="Green checkmark" />
          <SubmitButton onClick={goToFinish} label={t('finish')} />
        </Content>
      </DimensionsWrapper>
    </div>
  );
}

export {SecurityDepositsFinishScreen};
