import React from 'react';
import {useTranslation} from 'react-i18next';
import {useHistory, useLocation} from 'react-router-dom';
import {useComputedReservationDetails} from '../../context/computedReservationDetails';
import checkIcon from '../../assets/check.svg';
import Header from '../Header';
import SubmitButton from '../SubmitButton';
import {DimensionsWrapper} from '../../styled/common';
import {Content, Title, CheckIcon} from './styled';

type LocationState = {
  wasPaymentSkipped?: boolean;
};

function PaymentsFinishScreen() {
  const {t} = useTranslation();
  const history = useHistory();
  const location = useLocation<LocationState>();
  const {hasDeposits} = useComputedReservationDetails();

  const goToFinish = () => {
    if (hasDeposits) {
      history.push('/deposits/payment', location.state);
      return;
    }

    if (location.state?.wasPaymentSkipped) {
      history.push('/', {wasPaymentSkipped: true});
      return;
    }

    history.push('/finish');
  };

  return (
    <div>
      <Header hideBackButton title={t('payment_successful')} />
      <DimensionsWrapper>
        <Content>
          <Title>{t('you_payment_has_been_made')}</Title>
          <CheckIcon src={checkIcon} alt="Green checkmark" />
          <SubmitButton
            onClick={goToFinish}
            label={hasDeposits ? t('continue') : t('finish')}
          />
        </Content>
      </DimensionsWrapper>
    </div>
  );
}

export {PaymentsFinishScreen};
