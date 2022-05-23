import React from 'react';
import {StripeCardElementOptions} from '@stripe/stripe-js';
import {CardElement, CardElementProps} from '@stripe/react-stripe-js';
import {CardElementWrapper, Wrapper, Error} from './styled';

const cardElementOptions: StripeCardElementOptions = {
  style: {
    base: {
      color: '#161643',
      fontFamily: 'ProximaNova-Medium, sans-serif',
      fontSize: '16px',
      '::placeholder': {
        color: 'rgb(173,173,204)',
      },
    },
    invalid: {
      color: '#ff2467',
    },
  },
};

export type StripeCardElementProps = CardElementProps & {
  error: string;
};

function StripeCardElement({className, error, ...props}: StripeCardElementProps) {
  return (
    <Wrapper className={className}>
      <CardElementWrapper>
        <CardElement options={cardElementOptions} {...props} />
      </CardElementWrapper>
      <Error>{error}</Error>
    </Wrapper>
  );
}

export {StripeCardElement};
