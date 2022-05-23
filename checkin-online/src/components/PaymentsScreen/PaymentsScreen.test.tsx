/**  * @jest-environment jsdom-sixteen  */
import React from 'react';
import {screen} from '@testing-library/react';
import {Elements} from '@stripe/react-stripe-js';
import {PaymentsScreen} from './PaymentsScreen';
import {mockSWR, renderWithProviders} from '../../utils/test';
import api from '../../api';
import {PAYMENT_PROVIDERS} from '../../utils/constants';

test(`renders payment provider's payment form`, async () => {
  mockSWR();
  const {rerenderWithProviders} = renderWithProviders(
    <Elements stripe={new Promise(jest.fn())}>
      <PaymentsScreen />
    </Elements>,
  );

  const allProviders = Object.values(PAYMENT_PROVIDERS);

  for await (let provider of allProviders) {
    mockSWR([
      {
        url: api.paymentsSettings.ENDPOINTS.all(),
        response: {
          data: {
            id: 1,
            status: 'VALID',
            provider,
          },
        },
      },
    ]);
    rerenderWithProviders();

    const providerForm = await screen.findByTestId(`${provider.toLowerCase()}-form`);
    expect(providerForm).toBeInTheDocument();
  }
});
