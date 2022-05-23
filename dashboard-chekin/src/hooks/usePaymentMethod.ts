import {useQuery} from 'react-query';
import api from '../api';
import {useSubscription} from '../context/subscription';

function usePaymentMethod() {
  const {isCustomTrial} = useSubscription();

  const queryResult = useQuery<any, string>(
    'paymentMethod',
    api.payments.fetchPaymentMethod,
    {
      enabled: !isCustomTrial,
      refetchOnWindowFocus: false,
    },
  );

  const hasPaymentMethod =
    Boolean(queryResult.data?.card) || Boolean(queryResult.data?.sepa_debit);

  return {...queryResult, hasPaymentMethod};
}

export {usePaymentMethod};
