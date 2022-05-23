import React from 'react';
import {useQuery} from 'react-query';
import api, {queryFetcher} from '../../../api';
import ibanIcon from '../../../assets/iban-icon.png';
import {Container, Icon, DotsGroup, LastFour} from './styled';
import {useErrorToast} from '../../../utils/hooks';

function fetchPaymentMethod() {
  return queryFetcher(api.payments.ENDPOINTS.paymentMethod());
}

function IbanPlaceholder() {
  const {data: paymentMethod, error: paymentMethodError} = useQuery<
    any,
    string
  >('paymentMethod', fetchPaymentMethod, {
    refetchOnWindowFocus: false,
    suspense: true,
  });
  useErrorToast(paymentMethodError);

  const lastFourCardNumber = paymentMethod?.sepa_debit?.last4;

  return (
    <Container>
      <Icon src={ibanIcon} alt="Card" />
      <DotsGroup>●●●●●●●●●●●●●●●●</DotsGroup>
      <LastFour>{lastFourCardNumber}</LastFour>
    </Container>
  );
}

export {IbanPlaceholder};
