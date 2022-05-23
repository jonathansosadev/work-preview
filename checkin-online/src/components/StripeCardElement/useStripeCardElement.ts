import React from 'react';
import * as Sentry from '@sentry/react';
import {CardElement, useElements, useStripe} from '@stripe/react-stripe-js';
import {StripeCardElementChangeEvent} from '@stripe/stripe-js';
import {StripeCardElementProps} from './StripeCardElement';

function useStripeCardElement(onError: (error: any) => void) {
  const elements = useElements();
  const stripe = useStripe();
  const [disabled, setDisabled] = React.useState(true);
  const [error, setError] = React.useState('');

  const confirmPaymentIntent = React.useCallback(
    async (clientSecret: string) => {
      if (!stripe) {
        setError('Unable to confirm card payment. Stripe instance is missing.');
        Sentry.captureMessage(
          'Unable to confirm card payment. Stripe instance is missing.',
        );
        return;
      }

      const cardElement = elements?.getElement(CardElement);
      if (!cardElement) {
        setError('Unable to confirm card payment. Card element is missing.');
        Sentry.captureMessage('Unable to confirm card payment. Card element is missing.');
        return;
      }

      setError('');
      const payload = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (payload.error) {
        onError(payload.error);
      }

      return payload;
    },
    [elements, onError, stripe],
  );

  const confirmDepositPaymentIntent = React.useCallback(
    async (clientSecret: string) => {
      if (!stripe) {
        setError('Unable to make a deposit by card. Stripe instance is missing.');
        Sentry.captureMessage(
          'Unable to make a deposit by card. Stripe instance is missing.',
        );
        return;
      }

      const cardElement = elements?.getElement(CardElement);
      if (!cardElement) {
        setError('Unable to make a deposit by card. Card element is missing.');
        Sentry.captureMessage(
          'Unable to make a deposit by card. Card element is missing.',
        );
        return;
      }

      setError('');
      const payload = await stripe.confirmCardSetup(clientSecret, {
        payment_method: {
          card: cardElement,
        },
      });

      if (payload.error) {
        onError(payload.error);
      }

      return payload;
    },
    [elements, onError, stripe],
  );

  const handleCardChange = (event: StripeCardElementChangeEvent) => {
    setDisabled(event.empty);
    setError(event.error?.message || '');
  };

  // Spread these props to the <StripeCardElement /> component.
  const cardProps: StripeCardElementProps = {
    error,
    onChange: handleCardChange,
  };

  return {
    confirmDepositPaymentIntent,
    confirmPaymentIntent,
    disabled,
    cardProps,
  };
}

export {useStripeCardElement};
