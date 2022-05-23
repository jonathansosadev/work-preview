import React from 'react';
import {createMemoryHistory} from 'history';
import {render} from '@testing-library/react';
import {Router} from 'react-router-dom';
import {AuthContext} from '../context/auth';
import {WebsocketProvider} from '../context/websocket';
import WS from 'jest-websocket-mock';
import {WS_TEST_URL} from './constants';
import {UserProvider} from '../context/user';
import {User} from './types';

type Options = {
  location?: Partial<Location>;
  user?: Partial<User>;
};

function renderWithProviders(ui: React.ReactNode, {location, user}: Options = {}) {
  const history = createMemoryHistory();
  const ws = new WS(WS_TEST_URL);

  history.push({
    pathname: '/',
    ...location,
  });
  const defaultUser: Partial<User> = {
    name: 'Test',
    email: 'test@exaft.com',
    are_any_payments_activated: true,
    ...user,
  };

  const authContext = {
    logout: jest.fn(),
    isTokenValid: true,
    isLoading: false,
    login: jest.fn(),
    refreshAccount: jest.fn(),
    updateAccount: jest.fn(),
    accountDetails: defaultUser as User,
  };

  const utils = render(
    <Router history={history}>
      <AuthContext.Provider value={authContext}>
        <UserProvider>
          <WebsocketProvider>{ui}</WebsocketProvider>
        </UserProvider>
      </AuthContext.Provider>
    </Router>,
  );

  const rerenderWithProviders = (rerenderUi: React.ReactNode = ui) => {
    return utils.rerender(
      <Router history={history}>
        <AuthContext.Provider value={authContext}>
          <UserProvider>
            <WebsocketProvider>{rerenderUi}</WebsocketProvider>
          </UserProvider>
        </AuthContext.Provider>
      </Router>,
    );
  };

  return {
    ...utils,
    ws,
    history,
    rerenderWithProviders,
    authContext,
  };
}

export {renderWithProviders, WS_TEST_URL};
