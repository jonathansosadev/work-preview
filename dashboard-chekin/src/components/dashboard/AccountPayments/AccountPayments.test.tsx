import React from 'react';
import {screen, waitForElementToBeRemoved} from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import WS from 'jest-websocket-mock';
import {waitFor} from '@testing-library/react';
import {renderWithProviders} from '../../../utils/test';
import {AccountPayments} from './AccountPayments';
import {WS_EVENT_TYPES} from '../../../utils/constants';
import {server} from '../../../api/mocks/server';
import {rest} from 'msw';
import api, {getURL} from '../../../api';
import {PAYMENTS_SETTINGS_ID} from '../../../api/mocks/handlers';

function sendAndGetAccountFillingLink(ws: WS) {
  const accountFillingLink = 'https://test.com';
  ws.send(
    JSON.stringify({
      event_type: WS_EVENT_TYPES.paymentsSettingsWaitForFilling,
      account_filling_link: accountFillingLink,
    }),
  );
  return accountFillingLink;
}

test('fetches and redirects to the Stripe filling link', async () => {
  const {ws} = renderWithProviders(<AccountPayments />);
  await ws.connected;

  const loader = screen.queryByLabelText('audio-loading');
  await waitForElementToBeRemoved(loader);

  const changePaymentSettingsButton = screen.getByRole('button', {
    name: /change_payment_settings/i,
  });
  userEvent.click(changePaymentSettingsButton);

  const connectStripeButton = screen.getByRole('button', {name: /connect stripe/i});
  expect(connectStripeButton).toBeInTheDocument();

  userEvent.click(connectStripeButton);
  expect(connectStripeButton).toBeDisabled();

  const locationSpy = jest.spyOn(window.location, 'assign');
  const accountFillingLink = sendAndGetAccountFillingLink(ws);
  expect(locationSpy).toHaveBeenCalledWith(accountFillingLink);
});

test('refreshes Stripe filling link and redirects to it', async () => {
  const {ws} = renderWithProviders(<AccountPayments />, {
    location: {
      search: '?is_need_to_refresh=1',
    },
  });
  await ws.connected;

  const redirectText = await screen.findByText('you_will_be_redirected');
  expect(redirectText).toBeInTheDocument();

  const locationSpy = jest.spyOn(window.location, 'assign');
  const accountFillingLink = sendAndGetAccountFillingLink(ws);
  expect(locationSpy).toHaveBeenCalledWith(accountFillingLink);
});

test('shows error on Stripe filling link refresh', async () => {
  const errorMessage = 'Server error';
  server.use(
    rest.post(getURL(api.paymentsSettings.ENDPOINTS.refresh()), (req, res, ctx) => {
      return res(ctx.status(400), ctx.json({message: errorMessage}));
    }),
  );

  const {ws} = renderWithProviders(<AccountPayments />, {
    location: {
      search: '?is_need_to_refresh=1',
    },
  });
  await ws.connected;

  const errorText = await screen.findByText(errorMessage, {exact: false});
  expect(errorText).toBeInTheDocument();
  const locationSpy = jest.spyOn(window.location, 'assign');
  expect(locationSpy).not.toHaveBeenCalled();
});

test('updates payments settings on Stripe connection success', async () => {
  const {ws} = renderWithProviders(<AccountPayments />, {
    location: {
      search: '?is_successfully_created=1',
    },
  });
  await ws.connected;

  await waitFor(() => {
    const successText = screen.getByText('stripe_account_created');
    return expect(successText).toBeInTheDocument();
  });
});

test('shows error on Stripe connection update failure', async () => {
  const errorMessage = 'Server error';
  server.use(
    rest.patch(
      getURL(api.paymentsSettings.ENDPOINTS.all(PAYMENTS_SETTINGS_ID)),
      (req, res, ctx) => {
        return res(ctx.status(500), ctx.json({message: errorMessage}));
      },
    ),
  );

  const {ws} = renderWithProviders(<AccountPayments />, {
    location: {
      search: '?is_successfully_created=1',
    },
  });
  await ws.connected;

  await waitFor(() => {
    const errorText = screen.getByText(errorMessage, {exact: false});
    return expect(errorText).toBeInTheDocument();
  });
});
