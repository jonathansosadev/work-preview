/**  * @jest-environment jsdom-sixteen  */
import React from 'react';
import userEvent from '@testing-library/user-event';
import {screen, waitFor, waitForElementToBeRemoved} from '@testing-library/react';
import {toast} from 'react-toastify';
import {rest} from 'msw';
import {server} from '../../../api/mocks/server';
import {renderWithProviders} from '../../../utils/test';
import api, {USER_TOKEN, getURL} from '../../../api';
import {LoginForm} from './LoginForm';

const token = 'test token';

afterEach(() => {
  localStorage.clear();
});

test('logins successfully', async () => {
  renderWithProviders(<LoginForm />);
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  const loginButton = screen.getByTestId(/login-btn/i);

  await userEvent.type(emailField, 'test@localhost.com');
  await userEvent.type(passwordField, 'qwerty');
  userEvent.click(loginButton);

  await waitForElementToBeRemoved(loginButton);
  expect(screen.getByTestId(/loader/i)).toBeInTheDocument();
  expect(emailField).toBeDisabled();
  expect(passwordField).toBeDisabled();

  await waitForElementToBeRemoved(screen.getByTestId(/loader/i));
  expect(localStorage.getItem(USER_TOKEN)).toEqual(JSON.stringify({token}));

  // Route switched
  await waitFor(() => expect(emailField).not.toBeInTheDocument());
  expect(passwordField).not.toBeInTheDocument();

  const fullPageSpinner = await screen.getByAltText('Loading app');
  expect(fullPageSpinner).toBeInTheDocument();
  await waitForElementToBeRemoved(fullPageSpinner);
});

test('handles login error', async () => {
  server.use(
    rest.post(getURL(api.auth.ENDPOINTS.auth()), (req, res, ctx) => {
      return res(
        ctx.status(400),
        ctx.json({non_field_errors: ['Unable to log in with provided credentials.']}),
      );
    }),
  );

  renderWithProviders(<LoginForm />);
  const emailField = screen.getByLabelText(/email/i);
  const passwordField = screen.getByLabelText(/password/i);
  const loginButton = screen.getByTestId(/login-btn/i);

  await userEvent.type(emailField, 'test@localhost.com');
  await userEvent.type(passwordField, 'qwrty');
  userEvent.click(loginButton);

  await waitForElementToBeRemoved(loginButton);
  expect(screen.getByTestId(/loader/i)).toBeInTheDocument();
  expect(emailField).toBeDisabled();
  expect(passwordField).toBeDisabled();

  await waitForElementToBeRemoved(screen.getByTestId(/loader/i));
  expect(emailField).not.toBeDisabled();
  expect(passwordField).not.toBeDisabled();
  expect(toast.error).toHaveBeenCalled();
});
