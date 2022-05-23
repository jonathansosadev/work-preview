import React from 'react';
import {useQuery} from 'react-query';
import api, {queryFetcher} from '../../../api';
import {PaymentMethod} from '../../../utils/types';
import creditCardIcon from '../../../assets/credit-card-icon.svg';
import {Container, Icon, DotsGroup, LastFour, ExpirationDate} from './styled';
import {useErrorToast} from '../../../utils/hooks';

function fetchPaymentMethod() {
  return queryFetcher(api.payments.ENDPOINTS.paymentMethod());
}

function CardPlaceholder() {
  const {data: paymentMethod, error: paymentMethodError} = useQuery<
    PaymentMethod,
    string
  >('paymentMethod', fetchPaymentMethod, {
    refetchOnWindowFocus: false,
    suspense: true,
  });
  useErrorToast(paymentMethodError);

  const lastFourCardNumber = paymentMethod?.card?.last4;
  const expirationMonth = paymentMethod?.card?.exp_month || 0;
  const expirationYear = paymentMethod?.card?.exp_year || '';

  return (
    <Container>
      <Icon src={creditCardIcon} alt="Card" />
      <DotsGroup>●●●●</DotsGroup>
      <DotsGroup>●●●●</DotsGroup>
      <DotsGroup>●●●●</DotsGroup>
      <LastFour>{lastFourCardNumber}</LastFour>
      <ExpirationDate>
        {expirationMonth < 10 ? `0${expirationMonth}` : expirationMonth}/
        {String(expirationYear).slice(2)}
      </ExpirationDate>
      <DotsGroup>●●●</DotsGroup>
    </Container>
  );
}

export {CardPlaceholder};
